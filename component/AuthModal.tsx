"use client";

import { useState } from "react";
import { X, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORE_LOGIN_NAME = "skynova";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  if (!isOpen) return null;

  const resetFields = () => {
    setError("");
    setLoginName("");
    setLoginPhone("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginName || !loginPhone) {
      setError("الرجاء إدخال الاسم ورقم الهاتف");
      return;
    }
    setLoading(true);
    const result = await login(STORE_LOGIN_NAME, loginPhone, loginName);
    setLoading(false);
    if (result.success) {
      resetFields();
      onClose();
      router.push("/account");
    } else {
      setError(result.error || "الاسم أو رقم الهاتف غير صحيح");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="border-b border-gray-100 px-6 py-5 text-center md:px-8">
          <h2 className="font-tajawal text-lg font-bold text-gray-dark">تسجيل الدخول</h2>
          <p className="mt-1 text-sm text-gray-500 font-tajawal">
            اسم المستخدم ثابت لهذا الحساب: {STORE_LOGIN_NAME}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-tajawal text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                الاسم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full h-11 pr-10 pl-4 border border-gray-200 rounded-xl focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
                  placeholder="أدخل اسمك"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={STORE_LOGIN_NAME}
                  readOnly
                  className="w-full h-11 pr-10 pl-4 border border-gray-200 rounded-xl bg-gray-50 text-sm font-tajawal text-gray-500"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">
                رقم الهاتف
              </label>
              <div className="phone-input-wrapper" dir="ltr">
                <PhoneInput
                  defaultCountry="SY"
                  value={loginPhone}
                  onChange={(value) => setLoginPhone(value || "")}
                  placeholder="Enter phone number"
                  className="w-full h-11 border border-gray-200 rounded-xl focus-within:border-pink focus-within:ring-1 focus-within:ring-pink text-sm font-tajawal overflow-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-pink text-white rounded-full font-medium text-sm hover:bg-pink-dark transition-colors font-tajawal disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "جاري المتابعة..." : "دخول أو إنشاء حساب"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
