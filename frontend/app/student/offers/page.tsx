'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { offerAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface Offer {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';
  salary: number;
  joinDate?: string;
  expiresAt?: string;
  counterOfferText?: string;
  counterSalary?: number;
  offerDetails?: Record<string, unknown>;
  drive: {
    title: string;
    company: string;
    description?: string;
    jobDescription?: string;
    companyAddress?: string;
  };
}

function getOfferMeta(offer: Offer) {
  const details = offer.offerDetails || {};
  return {
    role: (details.role as string) || (details.position as string) || offer.drive.title,
    department: (details.department as string) || 'Not specified',
    location: (details.location as string) || offer.drive.companyAddress || 'Not specified',
    description:
      (details.description as string) ||
      (details.project as string) ||
      offer.drive.description ||
      offer.drive.jobDescription ||
      'No extra description provided.',
  };
}

interface CounterModalState {
  offerId: string;
  originalSalary: number;
}

export default function StudentOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  // Counter-offer modal state
  const [counterModal, setCounterModal] = useState<CounterModalState | null>(null);
  const [counterText, setCounterText] = useState('');
  const [counterSalary, setCounterSalary] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await offerAPI.getMyOffers();
      setOffers(res.data?.data?.offers || []);
    } catch {
      setError('Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitialOffers = async () => {
      try {
        const res = await offerAPI.getMyOffers();
        if (active) setOffers(res.data?.data?.offers || []);
      } catch {
        if (active) setError('Failed to load offers.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadInitialOffers();
    return () => { active = false; };
  }, []);

  const takeAction = async (action: 'accept' | 'reject', id: string) => {
    try {
      setError('');
      setSuccess('');
      setActingId(id);
      if (action === 'accept') {
        await offerAPI.accept(id);
        setSuccess('Offer accepted successfully.');
      } else {
        await offerAPI.reject(id);
        setSuccess('Offer rejected.');
      }
      await fetchOffers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to update offer.');
    } finally {
      setActingId(null);
    }
  };

  const openCounterModal = (offer: Offer) => {
    setCounterModal({ offerId: offer.id, originalSalary: offer.salary });
    setCounterText('');
    setCounterSalary(String(offer.salary));
    setError('');
    setSuccess('');
  };

  const submitCounter = async () => {
    if (!counterModal) return;
    if (!counterText.trim()) { setError('Please enter a negotiation message.'); return; }
    const salaryNum = parseFloat(counterSalary);
    if (isNaN(salaryNum) || salaryNum <= 0) { setError('Please enter a valid counter salary amount.'); return; }

    setSubmittingCounter(true);
    setError('');
    try {
      await offerAPI.counter(counterModal.offerId, counterText.trim(), salaryNum);
      setSuccess(`Counter offer submitted — proposed ₹${salaryNum.toLocaleString()} LPA.`);
      setCounterModal(null);
      await fetchOffers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to submit counter offer.');
    } finally {
      setSubmittingCounter(false);
    }
  };

  const showAuditTrail = async (id: string) => {
    try {
      const res = await offerAPI.getAuditTrail(id);
      const entries = (res.data?.data || []) as Array<{ action: string; createdAt: string; note?: string }>;
      if (!entries.length) { setSuccess('No audit events recorded yet.'); return; }
      const summary = entries
        .map((e) => `${new Date(e.createdAt).toLocaleString()} - ${e.action}${e.note ? `: ${e.note}` : ''}`)
        .join('\n');
      window.alert(summary);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to load audit trail.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">My Offers</h1>
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {/* ── Counter-Offer Modal ── */}
        {counterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Submit Counter Offer</h2>
              <p className="text-sm text-slate-500">
                Original offer:{' '}
                <span className="font-semibold text-slate-800">
                  ₹{counterModal.originalSalary.toLocaleString()} LPA
                </span>
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Counter Salary (LPA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={counterSalary}
                  onChange={(e) => setCounterSalary(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="e.g. 14"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Negotiation Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={counterText}
                  onChange={(e) => setCounterText(e.target.value)}
                  maxLength={500}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                  placeholder="Explain why you are requesting this amount..."
                />
                <p className="text-xs text-slate-400 text-right">{counterText.length}/500</p>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setCounterModal(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCounter}
                  disabled={submittingCounter}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {submittingCounter ? 'Submitting…' : 'Submit Counter'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading && <div className="text-slate-600">Loading offers...</div>}
          {offers.length === 0 && !loading && <div className="text-slate-600">No offers yet.</div>}
          {offers.map((o) => (
            <Card key={o.id}>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{getOfferMeta(o).role}</h3>
                    <p className="text-sm text-slate-600">{o.drive.company}</p>
                    <p className="text-sm text-slate-700 mt-1">
                      ₹{o.salary.toLocaleString()} LPA
                      {o.joinDate ? ` • Joining: ${new Date(o.joinDate).toLocaleDateString()}` : ''}
                      {o.expiresAt ? ` • Expires: ${new Date(o.expiresAt).toLocaleDateString()}` : ''}
                    </p>
                    {/* Show counter salary if present */}
                    {o.counterSalary != null && (
                      <p className="text-xs font-semibold text-amber-700 mt-1">
                        Counter Offer: ₹{o.counterSalary.toLocaleString()} LPA
                        {o.counterOfferText ? ` — "${o.counterOfferText}"` : ''}
                      </p>
                    )}
                    {o.counterOfferText && o.counterSalary == null && (
                      <p className="text-xs text-amber-700 mt-1">Counter note: {o.counterOfferText}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <StatusBadge status={o.status} />
                    {o.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          isLoading={actingId === o.id}
                          onClick={() => takeAction('accept', o.id)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={actingId === o.id}
                          onClick={() => takeAction('reject', o.id)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCounterModal(o)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Counter
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => showAuditTrail(o.id)}>
                      Audit Trail
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-500">Position</p>
                    <p className="font-medium text-slate-900">{getOfferMeta(o).role}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{getOfferMeta(o).department}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">{getOfferMeta(o).location}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-slate-500">Description</p>
                    <p className="font-medium text-slate-900">{getOfferMeta(o).description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
