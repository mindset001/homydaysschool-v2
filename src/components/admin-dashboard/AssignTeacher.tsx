import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getStaffs } from '../../services/api/calls/getApis';
import { assignTeacher } from '../../services/api/calls/postApis';
import { showSuccessToast, showErrorToast } from '../../shared/ToastNotification';

interface Props {
  classId: string | number;
  onClose: () => void;
  onAssigned?: () => void;
}

const AssignTeacher: React.FC<Props> = ({ classId, onClose, onAssigned }) => {
  const queryClient = useQueryClient();
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getStaffs()
      .then((res: any) => {
        if (!mounted) return;
        setStaffs(res.data?.staff || res.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setStaffs([]);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async () => {
    if (!selected) return setError('Please select a teacher');
    setLoading(true);
    setError(null);
    try {
      await assignTeacher(classId, selected);
      // Invalidate both "class" and "classes" query keys to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["class"] });
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      showSuccessToast('Teacher assigned successfully');
      onAssigned && onAssigned();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to assign teacher';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Assign Teacher</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Teacher</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">-- Select --</option>
            {staffs.map((s: any) => {
              const user = s.userId || s;
              const firstName = user.firstName || '';
              const lastName = user.lastName || '';
              const email = user.email || '';
              return (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {firstName} {lastName} ({email})
                </option>
              );
            })}
          </select>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTeacher;
