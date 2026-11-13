import { api, errorText } from './client';

export async function validateUpi(upi: string) {
  if (!/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) return { ok: false as const, error: 'Check the UPI ID' };
  try {
    const r = await api<{ name: string; matchesPan: boolean }>('/me/kyc/upi/check', { method: 'POST', body: { upiId: upi.trim() } });
    return { ok: true as const, name: r.name, matches: r.matchesPan };
  } catch (e) {
    return { ok: false as const, error: errorText(e) };
  }
}

/** Saves the UPI on the account. Throws ApiError if the name doesn't match PAN. */
export const saveUpi = (upi: string) => api<{ id: string; name: string }>('/me/kyc/upi', { method: 'PUT', body: { upiId: upi.trim() } });
