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

export default function StudentOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

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
        if (active) {
          setOffers(res.data?.data?.offers || []);
        }
      } catch {
        if (active) {
          setError('Failed to load offers.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialOffers();

    return () => {
      active = false;
    };
  }, []);

  const takeAction = async (action: 'accept' | 'reject' | 'counter', id: string) => {
    try {
      setError('');
      setSuccess('');
      setActingId(id);

      if (action === 'accept') {
        await offerAPI.accept(id);
        setSuccess('Offer accepted successfully.');
      } else if (action === 'reject') {
        await offerAPI.reject(id);
        setSuccess('Offer rejected.');
      } else {
        const text = window.prompt('Enter your counter-offer message:');
        if (!text) return;
        await offerAPI.counter(id, text);
        setSuccess('Counter-offer submitted.');
      }

      await fetchOffers();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to update offer.');
    } finally {
      setActingId(null);
    }
  };

  const showAuditTrail = async (id: string) => {
    try {
      const res = await offerAPI.getAuditTrail(id);
      const entries = (res.data?.data || []) as Array<{ action: string; createdAt: string; note?: string }>;
      if (!entries.length) {
        setSuccess('No audit events recorded yet.');
        return;
      }
      const summary = entries
        .map((e) => `${new Date(e.createdAt).toLocaleString()} - ${e.action}${e.note ? `: ${e.note}` : ''}`)
        .join('\n');
      window.alert(summary);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
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
        <div className="space-y-4">
          {loading && <div className="text-slate-600">Loading offers...</div>}
          {offers.length === 0 && <div className="text-slate-600">No offers yet.</div>}
          {offers.map((o) => (
            <Card key={o.id}>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{getOfferMeta(o).role}</h3>
                    <p className="text-sm text-slate-600">{o.drive.company}</p>
                    <p className="text-sm text-slate-700 mt-1">
                      ₹{o.salary.toLocaleString()}
                      {o.joinDate ? ` • Joining: ${new Date(o.joinDate).toLocaleDateString()}` : ''}
                      {o.expiresAt ? ` • Expires: ${new Date(o.expiresAt).toLocaleDateString()}` : ''}
                    </p>
                    {o.counterOfferText && <p className="text-xs text-amber-700 mt-1">Counter: {o.counterOfferText}</p>}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <StatusBadge status={o.status} />
                    {o.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" isLoading={actingId === o.id} onClick={() => takeAction('accept', o.id)} className="bg-black text-white hover:bg-gray-800"  >
                          Accept
                        </Button>
                        <Button size="sm" variant="danger" isLoading={actingId === o.id} onClick={() => takeAction('reject', o.id)} className="bg-black text-white hover:bg-gray-800">
                          Reject
                        </Button>
                        <Button size="sm" variant="outline" isLoading={actingId === o.id} onClick={() => takeAction('counter', o.id)} className="bg-black text-white hover:bg-gray-800">
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
