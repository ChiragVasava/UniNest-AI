'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, TextArea, Select } from '@/components/ui/FormField';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';
import axios from 'axios';
import { studentAPI } from '@/lib/api';
import type { Student } from '@/lib/types';

export default function StudentProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const currentYear = new Date().getFullYear();

  const normalizeBatch = (value: unknown) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : currentYear;
  };

  const normalizeCgpa = (value: unknown) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    phone: '',
    department: '',
    batch: new Date().getFullYear(),
    cgpa: 0,
    bio: '',
    skills: '',
  });

  const fetchStudentProfile = async () => {
    try {
      const response = await studentAPI.getProfile();
      if (response.data?.data) {
        setStudent(response.data.data);
        setFormData({
          firstName: response.data.data.firstName || '',
          lastName: response.data.data.lastName || '',
          rollNumber: response.data.data.rollNumber || '',
          phone: response.data.data.phone || '',
          department: response.data.data.department || '',
          batch: normalizeBatch(response.data.data.batch),
          cgpa: normalizeCgpa(response.data.data.cgpa),
          bio: response.data.data.bio || '',
          skills: Array.isArray(response.data.data.skills)
            ? response.data.data.skills.join(', ')
            : response.data.data.skills || '',
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

  // Fetch existing student profile
  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await studentAPI.getProfile();
        if (!active || !response.data?.data) return;

        setStudent(response.data.data);
        setFormData({
          firstName: response.data.data.firstName || '',
          lastName: response.data.data.lastName || '',
          rollNumber: response.data.data.rollNumber || '',
          phone: response.data.data.phone || '',
          department: response.data.data.department || '',
          batch: normalizeBatch(response.data.data.batch),
          cgpa: normalizeCgpa(response.data.data.cgpa),
          bio: response.data.data.bio || '',
          skills: Array.isArray(response.data.data.skills)
            ? response.data.data.skills.join(', ')
            : response.data.data.skills || '',
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

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    } else {
      const rollRegex = /^[A-Za-z]{0,2}\d{2}[A-Za-z]{2,3}\d{3,4}$/;
      const numericRegex = /^\d+$/;
      if (!rollRegex.test(formData.rollNumber) && !numericRegex.test(formData.rollNumber)) {
        errors.rollNumber = 'Invalid roll number format. Use BTYYCSE### or numeric PRN.';
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.department.trim()) errors.department = 'Department is required';

    if (formData.cgpa < 0 || formData.cgpa > 10) {
      errors.cgpa = 'CGPA must be between 0 and 10';
    }

    if (formData.batch < 2015 || formData.batch > new Date().getFullYear()) {
      errors.batch = 'Invalid batch year';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'batch'
          ? value === ''
            ? prev.batch
            : normalizeBatch(value)
          : name === 'cgpa'
            ? value === ''
              ? 0
              : normalizeCgpa(value)
            : value,
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

      const createPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        department: formData.department,
        batch: formData.batch,
        cgpa: formData.cgpa,
      };

      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        department: formData.department,
        batch: formData.batch,
        cgpa: formData.cgpa,
      };

      if (student?.id) {
        // Update existing profile
        await studentAPI.updateProfile(student.id, updatePayload);
        setSuccess('Profile updated successfully!');
      } else {
        // Create new profile
        await studentAPI.create(createPayload);
        setSuccess('Profile created successfully!');
        await fetchStudentProfile();
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

  const departments = [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Electrical', label: 'Electrical Engineering' },
  ];

  const batchYears = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

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
          <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>
          <p className="text-slate-600 mt-2">
            {student ? 'Manage your professional profile' : 'Create your profile to get started'}
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {/* Profile Card */}
        <Card>
          {student && !isEditing && (
            <>
              {/* View Mode */}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-slate-600 mt-1">{student.rollNumber}</p>
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
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-600">Roll Number</p>
                      <p className="font-medium text-slate-900">
                        {student.rollNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium text-slate-900">
                        {student.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-600">Department</p>
                      <p className="font-medium text-slate-900">
                        {student.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Batch</p>
                      <p className="font-medium text-slate-900">
                        {student.batch}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">CGPA</p>
                      <p className="font-medium text-slate-900">
                        {student.cgpa.toFixed(2)}/10
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {student.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      About
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {student.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {student.skills && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Skills
                    </h3>
                    <p className="text-slate-700">{student.skills}</p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Edit/Create Mode */}
          {isEditing || !student ? (
            <>
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-900">
                  {student ? 'Edit Profile' : 'Create Your Profile'}
                </h2>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Name Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      required
                      error={validationErrors.firstName}
                    >
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        error={!!validationErrors.firstName}
                      />
                    </FormField>
                    <FormField
                      label="Last Name"
                      required
                      error={validationErrors.lastName}
                    >
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        error={!!validationErrors.lastName}
                      />
                    </FormField>
                  </div>

                  {/* Contact Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Roll Number"
                      required
                      error={validationErrors.rollNumber}
                      hint="Format: BTYYCSE### or Numeric PRN"
                    >
                      <Input
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="BT20CSE001 or 10-digit PRN"
                        error={!!validationErrors.rollNumber}
                      />
                    </FormField>
                    <FormField
                      label="Phone Number"
                      required
                      error={validationErrors.phone}
                    >
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        error={!!validationErrors.phone}
                      />
                    </FormField>
                  </div>

                  {/* Academic Section */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="Department"
                      required
                      error={validationErrors.department}
                    >
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        options={departments}
                        error={!!validationErrors.department}
                      />
                    </FormField>
                    <FormField
                      label="Batch"
                      required
                      error={validationErrors.batch}
                    >
                      <Select
                        name="batch"
                        value={formData.batch.toString()}
                        onChange={handleChange}
                        options={batchYears}
                        error={!!validationErrors.batch}
                      />
                    </FormField>
                    <FormField
                      label="CGPA"
                      required
                      error={validationErrors.cgpa}
                      hint="0-10"
                    >
                      <Input
                        name="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={handleChange}
                        error={!!validationErrors.cgpa}
                      />
                    </FormField>
                  </div>

                  {/* Bio */}
                  <FormField label="Bio" hint="Tell us about yourself (max 500 chars)">
                    <TextArea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Write a brief bio about yourself..."
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </FormField>

                  {/* Skills */}
                  <FormField
                    label="Skills"
                    hint="Comma-separated (e.g., JavaScript, React, Node.js)"
                  >
                    <TextArea
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="Enter your skills separated by commas..."
                      rows={3}
                    />
                  </FormField>
                </CardContent>

                <CardFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (student) {
                        setFormData({
                          firstName: student.firstName,
                          lastName: student.lastName,
                          rollNumber: student.rollNumber,
                          phone: student.phone,
                          department: student.department,
                              batch: normalizeBatch(student.batch),
                              cgpa: normalizeCgpa(student.cgpa),
                          bio: student.bio || '',
                          skills: Array.isArray(student.skills)
                            ? student.skills.join(', ')
                            : '',
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="bg-black text-white">
                    {student ? 'Update Profile' : 'Create Profile'}
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
