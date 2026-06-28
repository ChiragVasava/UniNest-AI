'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, TextArea } from '@/components/ui/FormField';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';
import { driveAPI } from '@/lib/api';

interface DriveItem {
  id: string;
  title: string;
  description?: string;
  salary?: number;
  cgpaCutoff?: number;
  interviewFormat?: string;
  eligibleDepartments?: string[];
  eligibleBatches?: number[];
}

const initialForm = {
  title: '',
  description: '',
  salary: '',
  cgpaCutoff: '',
  interviewFormat: '',
  eligibleDepartments: '',
  eligibleBatches: '',
};

export default function CompanyDrivesPage() {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const loadDrives = async () => {
    try {
      setLoading(true);
      const response = await driveAPI.getMyDrives();
      setDrives(response.data?.data?.drives || []);
    } catch {
      setError('Failed to load your drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        const response = await driveAPI.getMyDrives();
        if (!active) return;
        setDrives(response.data?.data?.drives || []);
      } catch {
        if (active) setError('Failed to load your drives.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await driveAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        salary: formData.salary ? Number(formData.salary) : undefined,
        cgpaCutoff: formData.cgpaCutoff ? Number(formData.cgpaCutoff) : undefined,
        interviewFormat: formData.interviewFormat.trim(),
        eligibleDepartments: formData.eligibleDepartments
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        eligibleBatches: formData.eligibleBatches
          .split(',')
          .map((item) => Number(item.trim()))
          .filter((item) => !Number.isNaN(item)),
      });

      setSuccess('Drive created successfully.');
      setFormData(initialForm);
      await loadDrives();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(message || 'Failed to create drive.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDrive = async (id: string) => {
    if (!window.confirm('Delete this drive?')) return;

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');
      await driveAPI.delete(id);
      setSuccess('Drive deleted successfully.');
      await loadDrives();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(message || 'Failed to delete drive.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Drives</h1>
          <p className="text-slate-600 mt-1">Create and manage your recruitment drives.</p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">Create Drive</h2>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <FormField label="Title" required>
                <Input name="title" value={formData.title} onChange={handleChange} placeholder="SDE Intern 2026" required />
              </FormField>
              <FormField label="Description" required>
                <TextArea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the role and hiring process" required />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Salary / CTC">
                  <Input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="1200000" />
                </FormField>
                <FormField label="CGPA Cutoff">
                  <Input name="cgpaCutoff" type="number" step="0.01" value={formData.cgpaCutoff} onChange={handleChange} placeholder="7.0" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Interview Format">
                  <Input name="interviewFormat" value={formData.interviewFormat} onChange={handleChange} placeholder="Online / Onsite / Hybrid" />
                </FormField>
                <FormField label="Eligible Batches" hint="Comma-separated years, e.g. 2024, 2025">
                  <Input name="eligibleBatches" value={formData.eligibleBatches} onChange={handleChange} placeholder="2024, 2025" />
                </FormField>
              </div>
              <FormField label="Eligible Departments" hint="Comma-separated names">
                <Input name="eligibleDepartments" value={formData.eligibleDepartments} onChange={handleChange} placeholder="Computer Science, Electronics" />
              </FormField>
            </CardContent>
            <CardFooter>
              <Button type="submit" isLoading={saving} className="bg-black text-white">
                Create Drive
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-4">
          {loading && <div className="text-slate-600">Loading drives...</div>}
          {!loading && drives.length === 0 && (
            <div className="text-slate-600">No drives created yet.</div>
          )}

          {drives.map((drive) => (
            <Card key={drive.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{drive.title}</h3>
                  {drive.description && <p className="text-sm text-slate-600 mt-1">{drive.description}</p>}
                  <p className="text-sm text-slate-700 mt-2">
                    {drive.salary ? `₹${drive.salary.toLocaleString()}` : 'Salary not disclosed'}
                    {drive.cgpaCutoff !== undefined ? ` • CGPA ${drive.cgpaCutoff}` : ''}
                    {drive.interviewFormat ? ` • ${drive.interviewFormat}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {drive.eligibleDepartments?.length
                      ? `Departments: ${drive.eligibleDepartments.join(', ')}`
                      : 'All departments'}
                    {drive.eligibleBatches?.length
                      ? ` • Batches: ${drive.eligibleBatches.join(', ')}`
                      : ''}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={deletingId === drive.id}
                  onClick={() => deleteDrive(drive.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}