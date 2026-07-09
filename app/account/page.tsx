"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Package, Heart, MapPin, Phone, BadgePercent, Save } from "lucide-react";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { countries, citiesByCountry } from "@/lib/cities";

export default function AccountPage() {
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "SY",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      country: user.country || "SY",
      city: user.city || "",
    });
  }, [user]);

  if (!isLoggedIn || !user) return null;

  const availableCities = form.country ? citiesByCountry[form.country] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.phone.trim()) {
      setError("الاسم ورقم الهاتف مطلوبان");
      return;
    }

    setSaving(true);

    try {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("ecommerce-auth-token") : null;
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          country: form.country || null,
          city: form.city || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر تحديث البيانات");
        return;
      }

      updateUser(data.user);
      setSuccess("تم تحديث بيانات الحساب بنجاح");
    } catch {
      setError("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-gray-light">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-pink p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={36} />
            </div>
            <h1 className="text-2xl font-bold font-tajawal">{user.name}</h1>
            {user.phone && (
              <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
                <Phone size={14} />
                {user.phone}
              </p>
            )}
          </div>

          <div className="border-b border-gray-100 p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800 font-tajawal">البيانات الشخصية</h2>
              <p className="text-sm text-gray-500 font-tajawal mt-1">
                يمكنك تعديل الاسم ورقم الهاتف والدولة والمدينة. تسجيل الدخول يبقى باستخدام الاسم الثابت skynova مع رقم هاتفك.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-tajawal">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 font-tajawal">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 font-tajawal">
                  الاسم
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 font-tajawal">
                  رقم الهاتف
                </label>
                <div className="phone-input-wrapper" dir="ltr">
                  <PhoneInput
                    defaultCountry="SY"
                    value={form.phone}
                    onChange={(value) => setForm((prev) => ({ ...prev, phone: value || "" }))}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-gray-200 focus-within:border-pink focus-within:ring-2 focus-within:ring-pink/20 overflow-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 font-tajawal">
                  الدولة
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value, city: "" }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 font-tajawal">
                  المدينة
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20"
                >
                  <option value="">اختر المدينة</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 font-bold text-white transition-colors hover:bg-pink-dark disabled:cursor-not-allowed disabled:opacity-60 font-tajawal"
                >
                  <Save size={18} />
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>

          {/* Menu */}
          <div className="p-6 grid gap-3">
            <Link
              href="/account/orders"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right"
            >
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">طلباتي</h3>
                <p className="text-sm text-gray-400 font-tajawal">عرض سجل الطلبات</p>
              </div>
            </Link>

            <Link
              href="/affiliate/dashboard"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right"
            >
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <BadgePercent size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">الأفلييت</h3>
                <p className="text-sm text-gray-400 font-tajawal">تسجيل الدخول وإدارة حساب الأفلييت</p>
              </div>
            </Link>

            <a href="/wishlist" className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right">
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">المفضلة</h3>
                <p className="text-sm text-gray-400 font-tajawal">المنتجات المحفوظة</p>
              </div>
            </a>

            <a className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right">
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">عناويني</h3>
                <p className="text-sm text-gray-400 font-tajawal">إدارة عناوين التوصيل</p>
              </div>
            </a>

            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors border border-red-100 text-red-500 text-right mt-2"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="font-medium font-tajawal">تسجيل الخروج</h3>
                <p className="text-sm text-red-400 font-tajawal">الخروج من الحساب</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
