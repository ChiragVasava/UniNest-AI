'use client';

import React, { useEffect, useState } from 'react';
import { universityAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface SubDepartment {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  subDepartments: SubDepartment[];
}

interface ClassObj {
  id: string;
  name: string;
  batch: number;
}

export default function UniversityHierarchyPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedSubDeptId, setSelectedSubDeptId] = useState('');
  const [classesMap, setClassesMap] = useState<Record<string, ClassObj[]>>({});

  // Forms state
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const [subDeptName, setSubDeptName] = useState('');
  const [subDeptCode, setSubDeptCode] = useState('');

  const [className, setClassName] = useState('');
  const [classBatch, setClassBatch] = useState(new Date().getFullYear().toString());

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHierarchy = async () => {
    try {
      const res = await universityAPI.getDepartments();
      const depts = res.data.data || [];
      setDepartments(depts);
      if (depts.length > 0 && !selectedDeptId) {
        setSelectedDeptId(depts[0].id);
      }
    } catch (err) {
      setError('Failed to load structural hierarchy.');
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  // Fetch classes for selected sub-department when selected
  const fetchClassesForSubDept = async (subDeptId: string) => {
    try {
      const res = await universityAPI.getClasses(subDeptId);
      setClassesMap(prev => ({
        ...prev,
        [subDeptId]: res.data.data || []
      }));
    } catch (err) {
      // ignore
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await universityAPI.createDepartment(deptName, deptCode);
      setSuccess('Department registered successfully!');
      setDeptName('');
      setDeptCode('');
      fetchHierarchy();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(msg || 'Failed to create department.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await universityAPI.createSubDepartment(selectedDeptId, subDeptName, subDeptCode);
      setSuccess('Sub-department registered successfully!');
      setSubDeptName('');
      setSubDeptCode('');
      fetchHierarchy();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(msg || 'Failed to create sub-department.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubDeptId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await universityAPI.createClass(selectedSubDeptId, className, parseInt(classBatch));
      setSuccess('Class division registered successfully!');
      setClassName('');
      fetchHierarchy();
      fetchClassesForSubDept(selectedSubDeptId);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(msg || 'Failed to create class division.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Messages */}
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Grid of entry forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Department */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-extrabold text-md text-white">Create Department</h4>
          <form onSubmit={handleCreateDept} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Faculty of Technology"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Abbreviation / Code</label>
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="e.g. FTE"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Create Sub-Department */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-extrabold text-md text-white">Create Sub-Department</h4>
          <form onSubmit={handleCreateSubDept} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Parent Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={subDeptName}
                onChange={(e) => setSubDeptName(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Code</label>
              <input
                type="text"
                value={subDeptCode}
                onChange={(e) => setSubDeptCode(e.target.value)}
                placeholder="e.g. CSE"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || departments.length === 0}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Add Sub-Department
            </button>
          </form>
        </div>

        {/* Create Class */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-extrabold text-md text-white">Create Class Division</h4>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Sub-Department</label>
              <select
                value={selectedSubDeptId}
                onChange={(e) => {
                  setSelectedSubDeptId(e.target.value);
                  fetchClassesForSubDept(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Sub-Dept --</option>
                {departments.flatMap((dept) =>
                  dept.subDepartments.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {dept.code} ➔ {sub.name} ({sub.code})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Class Code / Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. BE-IV-CSE-A"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Graduation Batch Year</label>
              <input
                type="number"
                value={classBatch}
                onChange={(e) => setClassBatch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !selectedSubDeptId}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Add Class
            </button>
          </form>
        </div>

      </div>

      {/* Visual Tree list hierarchy */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
        <h3 className="font-extrabold text-lg text-white mb-6">University Structural Hierarchy</h3>
        
        {departments.length === 0 ? (
          <p className="text-sm text-slate-500">No organizational structure defined. Add departments to start.</p>
        ) : (
          <div className="space-y-6">
            {departments.map((dept) => (
              <div key={dept.id} className="border-l-2 border-slate-800 pl-4 space-y-4">
                {/* Department Node */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-blue-400">🏛️ {dept.name}</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                    {dept.code}
                  </span>
                </div>

                {/* Sub-departments Loop */}
                {dept.subDepartments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic pl-6">No sub-departments registered.</p>
                ) : (
                  <div className="pl-6 space-y-4">
                    {dept.subDepartments.map((sub) => (
                      <div key={sub.id} className="border-l border-slate-800 pl-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-indigo-300">📁 {sub.name}</span>
                          <span className="text-[10px] bg-slate-850 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                            {sub.code}
                          </span>
                          <button
                            onClick={() => fetchClassesForSubDept(sub.id)}
                            className="text-[10px] font-bold text-blue-400 hover:underline"
                          >
                            Show Classes
                          </button>
                        </div>

                        {/* Classes Loop */}
                        <div className="pl-6 flex flex-wrap gap-2">
                          {classesMap[sub.id]?.length === 0 && (
                            <span className="text-[10px] text-slate-500 italic">No class divisions.</span>
                          )}
                          {classesMap[sub.id]?.map((cl) => (
                            <span
                              key={cl.id}
                              className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg flex items-center gap-1.5"
                            >
                              🎓 <span className="font-semibold">{cl.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Batch {cl.batch}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
