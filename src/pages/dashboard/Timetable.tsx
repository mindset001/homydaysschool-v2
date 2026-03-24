import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getAllTimetables } from '../../services/api/calls/getApis';
import { saveTimetable } from '../../services/api/calls/postApis';
import { deleteTimetable } from '../../services/api/calls/deleteApis';
import useClasses from '../../hooks/useClasses';
import Loader from '../../shared/Loader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;
const ACADEMIC_YEARS = ['2025/2026', '2026/2027', '2027/2028', '2028/2029'] as const;

type TimeSlot = { key: PeriodKey | null; label: string; isBreak?: boolean };

const TIME_SLOTS: TimeSlot[] = [
  { key: 'first_period',  label: '8:20 – 9:00 am' },
  { key: 'second_period', label: '9:00 – 9:40 am' },
  { key: 'third_period',  label: '9:40 – 10:20 am' },
  { key: null,            label: '10:20 – 10:50 am', isBreak: true },
  { key: 'fourth_period', label: '10:50 – 11:30 am' },
  { key: 'fifth_period',  label: '11:30 – 12:10 pm' },
  { key: 'six_period',    label: '12:10 – 12:50 pm' },
  { key: null,            label: '12:50 – 1:00 pm', isBreak: true },
  { key: 'eight_period',  label: '1:00 – 1:40 pm' },
  { key: 'nineth_period', label: '1:40 – 2:20 pm' },
];

type PeriodKey = 'first_period' | 'second_period' | 'third_period' | 'fourth_period' |
  'fifth_period' | 'six_period' | 'eight_period' | 'nineth_period' | 'tenth_period';

type DaySchedule = Record<PeriodKey, string> & { day: string };
type GridState = Record<string, Record<PeriodKey, string>>;

const emptyGrid = (): GridState =>
  Object.fromEntries(DAYS.map((day) => [day, {
    first_period: '', second_period: '', third_period: '',
    fourth_period: '', fifth_period: '', six_period: '',
    eight_period: '', nineth_period: '', tenth_period: '',
  }]));

const scheduleToGrid = (schedule: DaySchedule[]): GridState => {
  const grid = emptyGrid();
  schedule.forEach((s) => {
    if (grid[s.day]) {
      grid[s.day] = {
        first_period:  s.first_period  || '',
        second_period: s.second_period || '',
        third_period:  s.third_period  || '',
        fourth_period: s.fourth_period || '',
        fifth_period:  s.fifth_period  || '',
        six_period:    s.six_period    || '',
        eight_period:  s.eight_period  || '',
        nineth_period: s.nineth_period || '',
        tenth_period:  s.tenth_period  || '',
      };
    }
  });
  return grid;
};

const gridToSchedule = (grid: GridState): DaySchedule[] =>
  DAYS.map((day) => ({ day, ...grid[day] }));

const Timetable: React.FC = () => {
  const queryClient = useQueryClient();
  const { classNameData, isClassLoading } = useClasses();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string>('First Term');
  const [selectedYear, setSelectedYear] = useState<string>('2025/2026');
  const [grid, setGrid] = useState<GridState>(emptyGrid());
  const [viewMode, setViewMode] = useState<'edit' | 'list'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: timetablesRaw, isLoading: isTimetablesLoading } = useQuery({
    queryKey: ['timetables'],
    queryFn: () => getAllTimetables(),
  });

  const timetables: any[] = timetablesRaw?.data?.data ?? [];

  const existingTimetable = timetables.find(
    (t) => t.id === selectedClassId && t.term === selectedTerm && t.academicYear === selectedYear
  );

  useEffect(() => {
    if (existingTimetable?.timetable?.length > 0) {
      setGrid(scheduleToGrid(existingTimetable.timetable));
    } else {
      setGrid(emptyGrid());
    }
  }, [selectedClassId, selectedTerm, selectedYear, existingTimetable?.timetableId]);

  const saveMutation = useMutation({
    mutationFn: saveTimetable,
    onSuccess: () => {
      toast.success('Timetable saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setViewMode('list');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save timetable');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimetable,
    onSuccess: () => {
      toast.success('Timetable deleted');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete timetable');
      setDeletingId(null);
    },
  });

  const handleCellChange = (day: string, periodKey: PeriodKey, value: string) => {
    setGrid((prev) => ({ ...prev, [day]: { ...prev[day], [periodKey]: value } }));
  };

  const handleSave = () => {
    if (!selectedClassId) { toast.error('Please select a class'); return; }
    saveMutation.mutate({ classId: selectedClassId, term: selectedTerm, academicYear: selectedYear, schedule: gridToSchedule(grid) });
  };

  const handleEdit = (t: any) => {
    setSelectedClassId(t.id);
    setSelectedClassName(t.name);
    setSelectedTerm(t.term);
    setSelectedYear(t.academicYear);
    setViewMode('edit');
  };

  const handleNewTimetable = () => {
    setSelectedClassId('');
    setSelectedClassName('');
    setSelectedTerm('First Term');
    setSelectedYear('2025/2026');
    setGrid(emptyGrid());
    setViewMode('edit');
  };

  if (isClassLoading || isTimetablesLoading) return <Loader />;

  return (
    <div className="p-4 md:p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Timetable Management</h1>
        {viewMode === 'list' ? (
          <button onClick={handleNewTimetable} className="px-4 py-2 bg-clr1 text-white text-sm rounded-lg hover:bg-[#046a71] transition">
            + New Timetable
          </button>
        ) : (
          <button onClick={() => setViewMode('list')} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition">
            ← Back to List
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {timetables.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No timetables yet. Click <strong>"+ New Timetable"</strong> to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {timetables.map((t) => (
                <div key={t.timetableId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div>
                    <p className="text-[16px] font-semibold text-gray-800">{t.name}</p>
                    <p className="text-[12px] text-clr1 mt-1">{t.term} &bull; {t.academicYear}</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleEdit(t)} className="flex-1 py-1.5 text-sm bg-clr1 text-white rounded-lg hover:bg-[#046a71] transition">Edit</button>
                    <button onClick={() => setDeletingId(t.timetableId)} className="flex-1 py-1.5 text-sm border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {deletingId && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <p className="text-gray-800 font-semibold mb-2">Delete Timetable?</p>
                <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeletingId(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => deleteMutation.mutate(deletingId)} disabled={deleteMutation.isPending} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* EDIT VIEW */}
      {viewMode === 'edit' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-[#f0fafb] border border-[#046A7E33] rounded-xl p-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  const cls = classNameData.find((c: any) => c.id === e.target.value);
                  setSelectedClassId(e.target.value);
                  setSelectedClassName(cls?.name || '');
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-clr1"
              >
                <option value="">Select a class</option>
                {classNameData.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">Term</label>
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-clr1">
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">Academic Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-clr1">
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {selectedClassId ? (
            <>
              <p className="text-[13px] text-gray-500 mb-3">
                Editing: <span className="font-semibold text-gray-800">{selectedClassName}</span> — {selectedTerm}, {selectedYear}
                {existingTimetable && <span className="ml-2 text-clr1 text-[11px]">(existing — will be updated)</span>}
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm mb-6">
                <table className="w-full text-[12px] min-w-[700px]">
                  <thead className="bg-clr1 text-white">
                    <tr>
                      <th className="text-left px-3 py-3 font-semibold w-36">Time</th>
                      {DAYS.map((day) => <th key={day} className="text-center px-2 py-3 font-semibold">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot, i) =>
                      slot.isBreak ? (
                        <tr key={i} className="bg-gray-50">
                          <td className="px-3 py-2 text-gray-400 text-[11px] italic font-medium">{slot.label}</td>
                          {DAYS.map((day) => <td key={day} className="px-2 py-2 text-center text-gray-400 font-semibold text-[11px]">BREAK</td>)}
                        </tr>
                      ) : (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fdfd]'}>
                          <td className="px-3 py-2 text-gray-500 text-[11px] whitespace-nowrap">{slot.label}</td>
                          {DAYS.map((day) => (
                            <td key={day} className="px-1 py-1">
                              <input
                                type="text"
                                value={grid[day]?.[slot.key as PeriodKey] ?? ''}
                                onChange={(e) => handleCellChange(day, slot.key as PeriodKey, e.target.value)}
                                placeholder="Subject"
                                className="w-full border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-clr1 bg-white"
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saveMutation.isPending} className="px-6 py-2 bg-clr1 text-white text-sm rounded-lg hover:bg-[#046a71] transition disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : existingTimetable ? 'Update Timetable' : 'Save Timetable'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 text-sm">Select a class above to start editing its timetable.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timetable;