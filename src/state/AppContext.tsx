import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth';
import * as profileService from '../services/profile';
import * as engagementService from '../services/engagement';
import * as adminService from '../services/admin';

export type Role = 'mason' | 'dealer' | 'salesman';

export type KycStatus = 'unverified' | 'pending' | 'verified';

export type DealerVerificationStatus = 'pending' | 'verified';

export type ScanActivity = {
  id: string;
  productName: string;
  points: number;
  scannedAt: string;
};

export type DealerBusinessDetails = {
  shopName: string;
  gstNumber: string;
  address: string;
  bankUpi: string;
  hasShopPhoto: boolean;
  outstanding: number;
  creditLimit: number;
  dueDate: string;
};

export type RedemptionStatus = 'pending' | 'approved' | 'rejected';

export type RedemptionRequest = {
  id: string;
  applicantName: string;
  amount: number;
  upiId: string;
  status: RedemptionStatus;
  requestedAt: string;
};

// PRD rule: under 200 pts auto-approves instantly; 200+ needs admin review
// within a 4h SLA — shared between the Wallet screen (decides what to show
// the user) and the Admin queue (decides what needs a human). Enforced for
// real in services/engagement.ts + services/admin.ts.
export const REDEMPTION_AUTO_APPROVE_CEILING = 200;

type AppState = {
  isAuthenticated: boolean;
  sessionLoading: boolean;
  onboardingComplete: boolean;
  pendingMobileNumber: string;
  mobileNumber: string;
  fullName: string;
  city: string;
  language: string;
  role: Role | null;
  kycStatus: KycStatus;
  loyaltyTier: string;
  points: number;
  runs: number;
  scanHistory: ScanActivity[];
  dealerBusiness: DealerBusinessDetails;
  dealerVerificationStatus: DealerVerificationStatus;
  employeeCode: string;
  referralCode: string;
  redemptionRequests: RedemptionRequest[];
  isAdminAuthenticated: boolean;
};

type AppContextValue = AppState & {
  sendOtp: (mobileNumber: string) => Promise<void>;
  verifyOtp: (token: string) => Promise<void>;
  setRole: (r: Role) => Promise<void>;
  setBasicDetails: (v: { fullName: string; city: string; language: string }) => Promise<void>;
  setDealerBusiness: (v: DealerBusinessDetails) => Promise<void>;
  setEmployeeCode: (v: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setKycStatus: (s: KycStatus) => Promise<void>;
  addScan: (activity: { productId?: string; productName: string; points: number }) => Promise<void>;
  redeemPoints: (amount: number, upiId: string) => Promise<void>;
  addRuns: (amount: number) => Promise<void>;
  approveDealerVerification: (dealerId?: string) => Promise<void>;
  decideRedemption: (id: string, decision: 'approved' | 'rejected') => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const initialState: AppState = {
  isAuthenticated: false,
  sessionLoading: true,
  onboardingComplete: false,
  pendingMobileNumber: '',
  mobileNumber: '',
  fullName: '',
  city: '',
  language: '',
  role: null,
  kycStatus: 'unverified',
  loyaltyTier: 'Bronze',
  points: 0,
  runs: 0,
  scanHistory: [],
  dealerBusiness: { shopName: '', gstNumber: '', address: '', bankUpi: '', hasShopPhoto: false, outstanding: 0, creditLimit: 0, dueDate: '' },
  dealerVerificationStatus: 'pending',
  employeeCode: '',
  referralCode: '',
  redemptionRequests: [],
  isAdminAuthenticated: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const hydrateFromProfile = useCallback(async () => {
    const profile = await profileService.getMyProfile();
    if (!profile) {
      setState((s) => ({ ...s, isAuthenticated: true, sessionLoading: false }));
      return;
    }

    const [dealerBusiness, scans, redemptions] = await Promise.all([
      profile.role === 'dealer' ? profileService.getMyDealerBusiness() : Promise.resolve(null),
      engagementService.listMyScans(),
      engagementService.listMyRedemptions(),
    ]);

    setState((s) => ({
      ...s,
      isAuthenticated: true,
      sessionLoading: false,
      onboardingComplete: profile.onboarding_complete,
      mobileNumber: profile.mobile_number ?? '',
      fullName: profile.full_name,
      city: profile.city,
      language: profile.language,
      role: (profile.role as Role) ?? null,
      kycStatus: profile.kyc_status as KycStatus,
      loyaltyTier: profile.loyalty_tier,
      points: profile.points,
      runs: profile.runs,
      employeeCode: profile.employee_code ?? '',
      referralCode: profile.referral_code ?? '',
      scanHistory: scans.map((sc) => ({
        id: sc.id,
        productName: sc.qr_code ?? 'GoMax product',
        points: sc.points,
        scannedAt: new Date(sc.scanned_at).toLocaleString(),
      })),
      dealerBusiness: dealerBusiness
        ? {
            shopName: dealerBusiness.shop_name,
            gstNumber: dealerBusiness.gst_number ?? '',
            address: dealerBusiness.address ?? '',
            bankUpi: dealerBusiness.bank_upi ?? '',
            hasShopPhoto: !!dealerBusiness.shop_photo_url,
            outstanding: Number(dealerBusiness.outstanding),
            creditLimit: Number(dealerBusiness.credit_limit),
            dueDate: dealerBusiness.due_date ?? '',
          }
        : s.dealerBusiness,
      dealerVerificationStatus: (dealerBusiness?.verification_status as DealerVerificationStatus) ?? 'pending',
      redemptionRequests: redemptions.map((r) => ({
        id: r.id,
        applicantName: profile.full_name || 'GoMax User',
        amount: r.amount,
        upiId: r.upi_id,
        status: r.status as RedemptionStatus,
        requestedAt: new Date(r.requested_at).toLocaleString(),
      })),
    }));
  }, []);

  useEffect(() => {
    let mounted = true;
    authService.getSession().then((session) => {
      if (!mounted) return;
      if (session) hydrateFromProfile();
      else setState((s) => ({ ...s, sessionLoading: false }));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) hydrateFromProfile();
      else setState((s) => ({ ...initialState, sessionLoading: false }));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrateFromProfile]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,

      sendOtp: async (mobileNumber) => {
        await authService.sendOtp(mobileNumber);
        setState((s) => ({ ...s, pendingMobileNumber: mobileNumber }));
      },

      verifyOtp: async (token) => {
        await authService.verifyOtp(state.pendingMobileNumber, token);
        await hydrateFromProfile();
      },

      setRole: async (role) => {
        setState((s) => ({ ...s, role }));
        await profileService.updateMyProfile({ role });
      },

      setBasicDetails: async (v) => {
        setState((s) => ({ ...s, ...v }));
        await profileService.updateMyProfile(v);
      },

      setDealerBusiness: async (dealerBusiness) => {
        setState((s) => ({ ...s, dealerBusiness }));
        await profileService.upsertMyDealerBusiness({
          shop_name: dealerBusiness.shopName,
          gst_number: dealerBusiness.gstNumber,
          address: dealerBusiness.address,
          bank_upi: dealerBusiness.bankUpi,
          shop_photo_url: dealerBusiness.hasShopPhoto ? 'pending-upload' : null,
        });
      },

      setEmployeeCode: async (employeeCode) => {
        setState((s) => ({ ...s, employeeCode }));
        await profileService.updateMyProfile({ employee_code: employeeCode });
      },

      completeOnboarding: async () => {
        setState((s) => ({ ...s, onboardingComplete: true }));
        await profileService.updateMyProfile({ onboarding_complete: true });
      },

      setKycStatus: async (kycStatus) => {
        setState((s) => ({ ...s, kycStatus }));
        await profileService.updateMyProfile({ kyc_status: kycStatus });
      },

      addScan: async (activity) => {
        const scan = await engagementService.recordScan({
          productId: activity.productId,
          qrCode: activity.productName,
          points: activity.points,
        });
        setState((s) => ({
          ...s,
          points: s.points + activity.points,
          scanHistory: [
            { id: scan.id, productName: activity.productName, points: activity.points, scannedAt: 'Just now' },
            ...s.scanHistory,
          ],
        }));
      },

      redeemPoints: async (amount, upiId) => {
        const request = await engagementService.redeemPoints(amount, upiId);
        setState((s) => ({
          ...s,
          points: Math.max(0, s.points - amount),
          redemptionRequests: [
            {
              id: request.id,
              applicantName: s.fullName || 'GoMax User',
              amount: request.amount,
              upiId: request.upi_id,
              status: request.status as RedemptionStatus,
              requestedAt: 'Just now',
            },
            ...s.redemptionRequests,
          ],
        }));
      },

      addRuns: async (amount) => {
        setState((s) => ({ ...s, runs: s.runs + amount }));
        const profile = await profileService.getMyProfile();
        await profileService.updateMyProfile({ runs: (profile?.runs ?? 0) + amount });
      },

      approveDealerVerification: async (dealerId) => {
        const { data: auth } = await supabase.auth.getUser();
        const targetId = dealerId ?? auth.user?.id;
        if (!targetId) return;
        await adminService.approveDealer(targetId);
        if (!dealerId || dealerId === auth.user?.id) {
          setState((s) => ({ ...s, dealerVerificationStatus: 'verified' }));
        }
      },

      decideRedemption: async (id, decision) => {
        await adminService.decideRedemption(id, decision);
        setState((s) => ({
          ...s,
          redemptionRequests: s.redemptionRequests.map((r) => (r.id === id ? { ...r, status: decision } : r)),
        }));
      },

      adminLogin: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const profile = await profileService.getMyProfile();
        if (profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('This account does not have admin access.');
        }
        setState((s) => ({ ...s, isAdminAuthenticated: true }));
      },

      adminLogout: async () => {
        await supabase.auth.signOut();
        setState((s) => ({ ...s, isAdminAuthenticated: false }));
      },

      logout: async () => {
        await authService.signOut();
        setState({ ...initialState, sessionLoading: false });
      },

      refreshProfile: hydrateFromProfile,
    }),
    [state, hydrateFromProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
