import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyReviewsForWard } from "../../services/api/calls/getApis";
import useGuardianWard from "../../hooks/useGuardianWard";

function weekLabel(mondayIso: string): string {
  const mon = new Date(mondayIso);
  const fri = new Date(mondayIso);
  fri.setDate(fri.getDate() + 4);
  return `Week of ${mon.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${fri.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`;
}

const WeeklyReviewsGuardian: React.FC = () => {
  const { guardianWard, isGuardianWardLoading } = useGuardianWard();
  const wards = guardianWard?.students ?? [];
  const [selectedWardIdx, setSelectedWardIdx] = useState(0);

  const ward = wards[selectedWardIdx];

  const { data, isLoading } = useQuery({
    queryKey: ["weeklyReviewsWard", ward?.id],
    queryFn: () => getWeeklyReviewsForWard(ward!.id),
    enabled: !!ward?.id,
    staleTime: 2 * 60 * 1000,
  });
  const reviews: any[] = data?.data?.reviews ?? [];

  return (
    <div className="p-3 sm:p-6 font-Poppins">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#F97316]">Weekly Reviews</h1>
        {wards.length > 1 && (
          <select
            value={selectedWardIdx}
            onChange={(e) => setSelectedWardIdx(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            {wards.map((w, i) => (
              <option key={w.id} value={i}>{w.firstName} {w.lastName}</option>
            ))}
          </select>
        )}
      </div>

      {ward && (
        <p className="text-sm text-gray-500 mb-4">
          Showing updates for <span className="font-semibold text-gray-700">{ward.firstName} {ward.lastName}</span> · Class <span className="font-semibold text-[#F97316]">{ward.studentClass}</span>
        </p>
      )}

      {(isLoading || isGuardianWardLoading) ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : !ward ? (
        <p className="text-sm text-gray-400">No child linked to your account.</p>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          No weekly reviews have been posted yet for {ward.firstName}'s class.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="mb-3">
                <p className="font-semibold text-gray-800">{weekLabel(r.weekOf)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  By {r.author?.firstName} {r.author?.lastName} · {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Class-wide message */}
              <div className="bg-[#F97316]/5 rounded-xl p-4 mb-3">
                <p className="text-xs font-medium text-[#F97316] mb-1">Class Update</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.message}</p>
              </div>

              {/* Personal note for this child */}
              {r.myNote && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-medium text-amber-700 mb-1">Note for {ward.firstName}</p>
                  <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{r.myNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyReviewsGuardian;
