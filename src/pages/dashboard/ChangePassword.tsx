import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePassword } from "../../services/api/calls/postApis";
import ShowPasswordSVG from "../../components/svg/ShowPasswordSVG";
import HidePasswordSVG from "../../components/svg/HidePasswordSVG";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
      navigate(-1);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to change password.";
      if (msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("current")) {
        setErrors((prev) => ({ ...prev, currentPassword: "Current password is incorrect" }));
      } else {
        toast.error(msg);
      }
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!currentPassword) e.currentPassword = "Current password is required";
    if (!newPassword) {
      e.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      e.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      e.newPassword = "Must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      e.newPassword = "Must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      e.newPassword = "Must contain at least one special character";
    }
    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate({ currentPassword, newPassword });
  };

  const fieldClass = (key: string) =>
    `w-full border-2 rounded-[15px] py-[10px] pl-4 pr-12 text-sm outline-none font-Poppins transition-colors ${
      errors[key]
        ? "border-[#FF2E2E] focus:border-[#FF2E2E]"
        : "border-[#05878F] focus:border-[#05878F]"
    }`;

  return (
    <div className="min-h-screen flex items-start justify-center p-4 md:p-10 bg-gray-50 font-Poppins">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#05878F] hover:underline mb-6 flex items-center gap-1"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold font-Lora text-gray-900 mb-1">Change Password</h1>
        <p className="text-sm text-gray-500 mb-8">Update your password. Make sure it is strong and unique.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-Lora">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: "" })); }}
                className={fieldClass("currentPassword")}
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <HidePasswordSVG /> : <ShowPasswordSVG />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-[#FF2E2E] text-xs font-semibold font-Lora">{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-Lora">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })); }}
                className={fieldClass("newPassword")}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <HidePasswordSVG /> : <ShowPasswordSVG />}
              </button>
            </div>
            {errors.newPassword && <p className="text-[#FF2E2E] text-xs font-semibold font-Lora">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-Lora">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                className={fieldClass("confirmPassword")}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <HidePasswordSVG /> : <ShowPasswordSVG />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[#FF2E2E] text-xs font-semibold font-Lora">{errors.confirmPassword}</p>}
          </div>

          <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 -mt-2">
            <li>At least 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
            <li>At least one special character (e.g. @, #, !)</li>
          </ul>

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#05878F] hover:bg-[#046a71] text-white font-bold font-Lora py-3 rounded-[15px] transition-colors disabled:opacity-60 mt-2"
          >
            {isPending ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
