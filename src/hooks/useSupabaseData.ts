import { useCallback, useEffect, useState } from 'react';
import * as products from '../services/products';
import * as dealer from '../services/dealer';
import * as engagement from '../services/engagement';
import * as salesman from '../services/salesman';
import * as admin from '../services/admin';

function useAsync<T>(fetcher: () => Promise<T>, initial: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => reload(), [reload]);

  return { data, loading, error, reload };
}

export const useProducts = () => useAsync(products.listProducts, []);
export const useMyOrders = () => useAsync(dealer.listMyOrders, []);
export const useOrder = (orderId: string) =>
  useAsync(() => dealer.getOrder(orderId), null as dealer.OrderWithItems | null, [orderId]);
export const useMyLedger = () => useAsync(dealer.listMyLedger, []);
export const useChallenges = () => useAsync(engagement.listChallenges, []);
export const useMyChallengeProgress = () => useAsync(engagement.listMyChallengeProgress, []);
export const useBadges = () => useAsync(engagement.listBadges, []);
export const useMyUnlockedBadges = () => useAsync(engagement.listMyUnlockedBadges, []);
export const useScratchCardTemplates = () => useAsync(engagement.listScratchCardTemplates, []);
export const useMyScratchCards = () => useAsync(engagement.listMyScratchCards, []);
export const useMyScratchCardsJoined = () => useAsync(engagement.ensureMyScratchCards, []);
export const useMyRedemptions = () => useAsync(engagement.listMyRedemptions, []);
export const useMyReferrals = () => useAsync(engagement.listMyReferrals, []);
export const useLeaderboard = () => useAsync(() => engagement.listLeaderboard(), []);
export const useMyBeatPlan = () => useAsync(salesman.listMyBeatPlan, []);
export const useMyMonthlyAchieved = () => useAsync(salesman.getMyMonthlyAchieved, 0);
export const useTodaysDcr = () => useAsync(salesman.listTodaysDcrEntries, []);
export const useApplicators = () => useAsync(admin.listApplicators, []);
export const usePendingDealerApprovals = () => useAsync(admin.listPendingDealerApprovals, []);
export const usePendingRedemptions = () => useAsync(admin.listPendingRedemptions, []);
export const useFraudFlags = () => useAsync(admin.listFraudFlags, []);
export const useKpiSummary = () => useAsync(admin.getKpiSummary, { scansToday: 0, gmvThisMonth: 0 });
