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
  redeemPoints: (amount: number) => void;
  addRuns: (amount: number) => void;
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
      redeemPoints: (amount) => setState((s) => ({ ...s, points: Math.max(0, s.points - amount) })),
      addRuns: (amount) => setState((s) => ({ ...s, runs: s.runs + amount })),
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
