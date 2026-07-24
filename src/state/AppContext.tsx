import React, { createContext, useContext, useMemo, useState } from 'react';

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
// within a 4h SLA — this constant is shared between the Wallet screen (which
// decides what to show the user) and the Admin queue (which decides what
// needs a human).
export const REDEMPTION_AUTO_APPROVE_CEILING = 200;

type AppState = {
  isAuthenticated: boolean;
  onboardingComplete: boolean;
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
  redemptionRequests: RedemptionRequest[];
  isAdminAuthenticated: boolean;
};

type AppContextValue = AppState & {
  setMobileNumber: (v: string) => void;
  setRole: (r: Role) => void;
  setBasicDetails: (v: { fullName: string; city: string; language: string }) => void;
  setDealerBusiness: (v: DealerBusinessDetails) => void;
  setEmployeeCode: (v: string) => void;
  completeOnboarding: () => void;
  setKycStatus: (s: KycStatus) => void;
  addScan: (activity: Omit<ScanActivity, 'id' | 'scannedAt'>) => void;
  redeemPoints: (amount: number, upiId: string) => void;
  addRuns: (amount: number) => void;
  approveDealerVerification: () => void;
  decideRedemption: (id: string, decision: 'approved' | 'rejected') => void;
  adminLogin: () => void;
  adminLogout: () => void;
  logout: () => void;
};

const initialState: AppState = {
  isAuthenticated: false,
  onboardingComplete: false,
  mobileNumber: '',
  fullName: '',
  city: '',
  language: '',
  role: null,
  kycStatus: 'unverified',
  loyaltyTier: 'Bronze',
  points: 245,
  runs: 80,
  scanHistory: [
    { id: '1', productName: 'GoMax Tile Adhesive 20kg', points: 25, scannedAt: 'Today, 10:14 AM' },
    { id: '2', productName: 'GoMax Waterproofing 5kg', points: 15, scannedAt: 'Yesterday, 4:02 PM' },
  ],
  dealerBusiness: { shopName: '', gstNumber: '', address: '', bankUpi: '', hasShopPhoto: false },
  dealerVerificationStatus: 'pending',
  employeeCode: '',
  redemptionRequests: [],
  isAdminAuthenticated: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setMobileNumber: (v) => setState((s) => ({ ...s, mobileNumber: v, isAuthenticated: true })),
      setRole: (r) => setState((s) => ({ ...s, role: r })),
      setBasicDetails: (v) => setState((s) => ({ ...s, ...v })),
      setDealerBusiness: (dealerBusiness) => setState((s) => ({ ...s, dealerBusiness })),
      setEmployeeCode: (employeeCode) => setState((s) => ({ ...s, employeeCode })),
      completeOnboarding: () => setState((s) => ({ ...s, onboardingComplete: true })),
      setKycStatus: (kycStatus) => setState((s) => ({ ...s, kycStatus })),
      addScan: (activity) =>
        setState((s) => ({
          ...s,
          points: s.points + activity.points,
          scanHistory: [
            { ...activity, id: String(Date.now()), scannedAt: 'Just now' },
            ...s.scanHistory,
          ],
        })),
      redeemPoints: (amount, upiId) =>
        setState((s) => {
          const autoApproved = amount < REDEMPTION_AUTO_APPROVE_CEILING;
          const request: RedemptionRequest = {
            id: String(Date.now()),
            applicantName: s.fullName || 'GoMax User',
            amount,
            upiId,
            status: autoApproved ? 'approved' : 'pending',
            requestedAt: 'Just now',
          };
          return {
            ...s,
            points: Math.max(0, s.points - amount),
            redemptionRequests: [request, ...s.redemptionRequests],
          };
        }),
      addRuns: (amount) => setState((s) => ({ ...s, runs: s.runs + amount })),
      approveDealerVerification: () => setState((s) => ({ ...s, dealerVerificationStatus: 'verified' })),
      decideRedemption: (id, decision) =>
        setState((s) => ({
          ...s,
          redemptionRequests: s.redemptionRequests.map((r) => (r.id === id ? { ...r, status: decision } : r)),
        })),
      adminLogin: () => setState((s) => ({ ...s, isAdminAuthenticated: true })),
      adminLogout: () => setState((s) => ({ ...s, isAdminAuthenticated: false })),
      logout: () => setState(initialState),
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
