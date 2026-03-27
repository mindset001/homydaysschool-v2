import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../../services/api/apiClient';
import { ISession } from '../../hooks/useActiveSession';

// ─── API helpers ────────────────────────────────────────────────
const fetchAllSessions = async (): Promise<ISession[]> => {
  const res = await apiClient.get('academic-sessions');
  return res.data?.data ?? [];
};
const apiCreate = (data: object) => apiClient.post('academic-sessions', data);
const apiActivate = (id: string) => apiClient.patch(`academic-sessions/${id}/activate`);
const apiUpdate = (id: string, data: object) => apiClient.put(`academic-sessions/${id}`, data);
const apiDelete = (id: string) => apiClient.delete(`academic-sessions/${id}`);

// ─── Constants ───────────────────────────────────────────────────
const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - 1 + i;
  return `${y}/${y + 1}`;
});

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Types ──────────────────────────────────────────────────────
interface FormState {
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  setActive: boolean;
}

const DEFAULT_FORM: FormState = {
  academicYear: YEARS[1],
  term: 'First Term',
  startDate: '',
  endDate: '',
  setActive: false,
};

// ─── Component ──────────────────────────────────────────────────
const AcademicSessionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState<ISession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ISession | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const { data: sessions = [], isLoading } = useQuery<ISession[]>({
    queryKey: ['allAcademicSessions'],
    queryFn: fetchAllSessions,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['allAcademicSessions'] });
    queryClient.invalidateQueries({ queryKey: ['activeAcademicSession'] });
  };

  const createMutation = useMutation({
    mutationFn: () => apiCreate(form),
    onSuccess: () => { toast.success('Session created'); invalidate(); setShowCreate(false); setForm(DEFAULT_FORM); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create session'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiActivate(id),
    onSuccess: () => { toast.success('Session set as active'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to activate session'),
  });

  const updateMutation = useMutation({
    mutationFn: () => apiUpdate(editSession!._id, {
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    }),
    onSuccess: () => { toast.success('Session updated'); invalidate(); setEditSession(null); setForm(DEFAULT_FORM); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update session'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => { toast.success('Session deleted'); invalidate(); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete session'),
  });

  const openEdit = (s: ISession) => {
    setEditSession(s);
    setForm({
      ...DEFAULT_FORM,
      startDate: s.startDate ? s.startDate.slice(0, 10) : '',
      endDate: s.endDate ? s.endDate.slice(0, 10) : '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ── Sort: active first, then by year desc, then term order
  const termOrder = { 'First Term': 1, 'Second Term': 2, 'Third Term': 3 };
  const sorted = [...sessions].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
    return (termOrder[a.term] ?? 0) - (termOrder[b.term] ?? 0);
  });

  return (
    <div className="p-4 md:p-6 font-Poppins max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Academic Session Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage academic sessions. The active session is shown across the platform.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm(DEFAULT_FORM); }}
          className="bg-[#05878F] hover:bg-[#046a71] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Session
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">No sessions yet.</p>
          <p className="text-sm">Create your first academic session above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <div
              key={s._id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                s.isActive
                  ? 'border-[#05878F] bg-[#ECFEFF]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    s.isActive ? 'bg-[#05878F]' : 'bg-gray-300'
                  }`}
                />
                <div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">
                    {s.term} &mdash; {s.academicYear}
                    {s.isActive && (
                      <span className="ml-2 inline-block bg-[#05878F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {fmt(s.startDate)} → {fmt(s.endDate)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {!s.isActive && (
                  <button
                    onClick={() => activateMutation.mutate(s._id)}
                    disabled={activateMutation.isPending}
                    className="text-xs font-semibold text-[#05878F] border border-[#05878F] px-3 py-1.5 rounded-lg hover:bg-[#ECFEFF] transition-colors"
                  >
                    Set Active
                  </button>
                )}
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs font-semibold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Dates
                </button>
                {!s.isActive && (
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal title="New Academic Session" onClose={() => setShowCreate(false)}>
          <SessionForm
            form={form}
            onChange={handleFormChange}
            years={YEARS}
            terms={TERMS}
            showTermYear
            showActive
          />
          <ModalFooter
            onCancel={() => setShowCreate(false)}
            onConfirm={() => createMutation.mutate()}
            loading={createMutation.isPending}
            confirmLabel="Create Session"
          />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editSession && (
        <Modal
          title={`Edit — ${editSession.term}, ${editSession.academicYear}`}
          onClose={() => setEditSession(null)}
        >
          <SessionForm form={form} onChange={handleFormChange} years={YEARS} terms={TERMS} />
          <ModalFooter
            onCancel={() => setEditSession(null)}
            onConfirm={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            confirmLabel="Save Changes"
          />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal title="Delete Session" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <strong>{deleteTarget.term} — {deleteTarget.academicYear}</strong>?
            This action cannot be undone.
          </p>
          <ModalFooter
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            loading={deleteMutation.isPending}
            confirmLabel="Delete"
            danger
          />
        </Modal>
      )}
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

interface SessionFormProps {
  form: FormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  years: string[];
  terms: readonly string[];
  showTermYear?: boolean;
  showActive?: boolean;
}

const SessionForm: React.FC<SessionFormProps> = ({
  form, onChange, years, terms, showTermYear = false, showActive = false,
}) => (
  <div className="space-y-4 mb-5">
    {showTermYear && (
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Academic Year</span>
          <select
            name="academicYear"
            value={form.academicYear}
            onChange={onChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Term</span>
          <select
            name="term"
            value={form.term}
            onChange={onChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
          >
            {terms.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
    )}
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</span>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</span>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={onChange}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
        />
      </label>
    </div>
    {showActive && (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="setActive"
          checked={form.setActive}
          onChange={onChange}
          className="accent-[#05878F] w-4 h-4"
        />
        <span className="text-sm text-gray-700">Set as active session immediately</span>
      </label>
    )}
  </div>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-800 text-base">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>
      {children}
    </div>
  </div>
);

interface FooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  confirmLabel: string;
  danger?: boolean;
}

const ModalFooter: React.FC<FooterProps> = ({ onCancel, onConfirm, loading, confirmLabel, danger }) => (
  <div className="flex justify-end gap-3 pt-2">
    <button
      onClick={onCancel}
      className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className={`text-sm font-semibold text-white px-5 py-2 rounded-lg disabled:opacity-50 transition-colors ${
        danger
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-[#05878F] hover:bg-[#046a71]'
      }`}
    >
      {loading ? 'Please wait…' : confirmLabel}
    </button>
  </div>
);

export default AcademicSessionPage;
