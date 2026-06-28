'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, TextArea } from '@/components/ui/FormField';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';
import axios from 'axios';
import { companyAPI } from '@/lib/api';
import type { Company } from '@/lib/types';

export default function CompanyProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    registrationId: '',
    companyName: '',
    sector: '',
    website: '',
    address: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
  });

  const fetchCompanyProfile = async () => {
    try {
      const response = await companyAPI.getProfile();
      if (response.data?.data) {
        setCompany(response.data.data);
        setFormData({
          registrationId: response.data.data.registrationId || '',
          companyName: response.data.data.companyName || '',
          sector: response.data.data.sector || '',
          website: response.data.data.website || '',
          address: response.data.data.address || '',
          contactPerson: response.data.data.contactPerson || '',
          contactEmail: response.data.data.contactEmail || '',
          contactPhone: response.data.data.contactPhone || '',
          description: response.data.data.description || '',
        });
      }
    } catch (err: unknown) {
        // Profile doesn't exist yet - that's okay for new users
        if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
          setError('Failed to load profile');
        }
      } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing company profile
  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await companyAPI.getProfile();
        if (!active || !response.data?.data) return;

        setCompany(response.data.data);
        setFormData({
          registrationId: response.data.data.registrationId || '',
          companyName: response.data.data.companyName || '',
          sector: response.data.data.sector || '',
          website: response.data.data.website || '',
          address: response.data.data.address || '',
          contactPerson: response.data.data.contactPerson || '',
          contactEmail: response.data.data.contactEmail || '',
          contactPhone: response.data.data.contactPhone || '',
          description: response.data.data.description || '',
        });
      } catch (err: unknown) {
        if (!axios.isAxiosError(err) || err.response?.status !== 404) {
          if (active) setError('Failed to load profile');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.registrationId.trim())
      errors.registrationId = 'Registration ID is required';
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.sector.trim()) errors.sector = 'Sector is required';
    if (!formData.website.trim()) {
      errors.website = 'Website is required';
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Website must be a valid URL (http://... or https://...)';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.contactPerson.trim())
      errors.contactPerson = 'Contact person name is required';
    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Contact phone is required';
    } else if (!/^\d{10}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      errors.contactPhone = 'Phone number must be 10 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');

      const payload = {
        registrationId: formData.registrationId,
        companyName: formData.companyName,
        sector: formData.sector,
        website: formData.website,
        address: formData.address,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      };

      if (company?.id) {
        // Update existing profile
        await companyAPI.updateProfile(company.id, payload);
        setSuccess('Profile updated successfully!');
      } else {
        // Create new profile
        await companyAPI.create(payload);
        setSuccess('Profile created successfully!');
        await fetchCompanyProfile();
      }

      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
          <p className="text-slate-600 mt-2">
            {company ? 'Manage your company information' : 'Set up your company profile to get started'}
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {/* Profile Card */}
        <Card>
          {company && !isEditing && (
            <>
              {/* View Mode */}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {company.companyName}
                    </h2>
                    <p className="text-slate-600 mt-1">{company.registrationId}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-600">Sector</p>
                      <p className="font-medium text-slate-900">
                        {company.sector}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Website</p>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:text-primary-700 underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium text-slate-900">
                      {company.address}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-600">Contact Person</p>
                      <p className="font-medium text-slate-900">
                        {company.contactPerson}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <a
                        href={`mailto:${company.contactEmail}`}
                        className="font-medium text-primary-600 hover:text-primary-700 underline"
                      >
                        {company.contactEmail}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <a
                        href={`tel:${company.contactPhone}`}
                        className="font-medium text-primary-600 hover:text-primary-700 underline"
                      >
                        {company.contactPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      About Company
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Edit/Create Mode */}
          {isEditing || !company ? (
            <>
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-900">
                  {company ? 'Edit Company Profile' : 'Create Company Profile'}
                </h2>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Registration & Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Registration ID"
                      required
                      error={validationErrors.registrationId}
                    >
                      <Input
                        name="registrationId"
                        value={formData.registrationId}
                        onChange={handleChange}
                        placeholder="REG001"
                        error={!!validationErrors.registrationId}
                        disabled={!!company}
                      />
                    </FormField>
                    <FormField
                      label="Company Name"
                      required
                      error={validationErrors.companyName}
                    >
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="TechCorp Inc."
                        error={!!validationErrors.companyName}
                      />
                    </FormField>
                  </div>

                  {/* Sector & Website */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Sector"
                      required
                      error={validationErrors.sector}
                    >
                      <Input
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        placeholder="Information Technology"
                        error={!!validationErrors.sector}
                      />
                    </FormField>
                    <FormField
                      label="Website"
                      required
                      error={validationErrors.website}
                    >
                      <Input
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        error={!!validationErrors.website}
                      />
                    </FormField>
                  </div>

                  {/* Address */}
                  <FormField
                    label="Address"
                    required
                    error={validationErrors.address}
                  >
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Business Street, City, State"
                      error={!!validationErrors.address}
                    />
                  </FormField>

                  {/* Contact Person */}
                  <FormField
                    label="Contact Person"
                    required
                    error={validationErrors.contactPerson}
                  >
                    <Input
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="John Smith"
                      error={!!validationErrors.contactPerson}
                    />
                  </FormField>

                  {/* Contact Email & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Contact Email"
                      required
                      error={validationErrors.contactEmail}
                    >
                      <Input
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="contact@company.com"
                        error={!!validationErrors.contactEmail}
                      />
                    </FormField>
                    <FormField
                      label="Contact Phone"
                      required
                      error={validationErrors.contactPhone}
                    >
                      <Input
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        error={!!validationErrors.contactPhone}
                      />
                    </FormField>
                  </div>

                  {/* Description */}
                  <FormField
                    label="Company Description"
                    hint="Tell us about your company (max 1000 chars)"
                  >
                    <TextArea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write a brief description about your company..."
                      maxLength={1000}
                      rows={5}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.description.length}/1000 characters
                    </p>
                  </FormField>
                </CardContent>

                <CardFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (company) {
                        setFormData({
                          registrationId: company.registrationId,
                          companyName: company.companyName,
                          sector: company.sector,
                          website: company.website || '',
                          address: company.address || '',
                          contactPerson: company.contactPerson || '',
                          contactEmail: company.contactEmail || '',
                          contactPhone: company.contactPhone || '',
                          description: company.description || '',
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="bg-black text-white">
                    {company ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
