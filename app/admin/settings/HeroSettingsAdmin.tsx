"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getGeneralSettings, updateGeneralSettings, type GeneralSettings } from "@/server/settings";

const currencies = ["USD", "TRY", "SYP"];

export default function HeroSettingsAdmin() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGeneralSettings();
      setSettings(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل تحميل الإعدادات" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (field: keyof GeneralSettings, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("siteName", settings.siteName);
    fd.set("companyEmail", settings.companyEmail || "");
    fd.set("companyPhone", settings.companyPhone || "");
    fd.set("siteCurrency", settings.siteCurrency);
    fd.set("usdToTryRate", String(settings.usdToTryRate));
    fd.set("facebookUrl", settings.facebookUrl || "");
    fd.set("instagramUrl", settings.instagramUrl || "");
    fd.set("primaryColor", settings.primaryColor);
    fd.set("secondaryColor", settings.secondaryColor);
    fd.set("topBannerText", settings.topBannerText || "");
    if (logoFile) fd.set("logo", logoFile);

    const result = await updateGeneralSettings(fd);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح" });
      setLogoFile(null);
      await load();
    } else {
      setMessage({ type: "error", text: result.error || "حدث خطأ" });
    }
  };

  if (loading) return <p className="p-6">جاري التحميل...</p>;
  if (!settings) return <p className="p-6">فشل تحميل الإعدادات</p>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-6 font-tajawal">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">الإعدادات العامة</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">اسم الموقع</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">نص البانر العلوي</label>
            <input
              type="text"
              value={settings.topBannerText}
              onChange={(e) => handleChange("topBannerText", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
            />
            <p className="text-xs text-gray-400 mt-1">اتركه فارغاً لإخفاء البانر العلوي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange("companyEmail", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={(e) => handleChange("companyPhone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">العملة</label>
              <select
                value={settings.siteCurrency}
                onChange={(e) => handleChange("siteCurrency", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">سعر الصرف (USD إلى TRY)</label>
              <input
                type="number"
                step="0.01"
                value={settings.usdToTryRate}
                onChange={(e) => handleChange("usdToTryRate", parseFloat(e.target.value || "0"))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اللون الأساسي</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-12 h-10 rounded border p-1"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">اللون الثانوي</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-12 h-10 rounded border p-1"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">اللوغو</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-pink file:text-white"
            />
            {settings.logo && !logoFile && (
              <div className="mt-2 relative w-40 h-14">
                <Image src={settings.logo} alt="logo" fill className="object-contain" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">رابط فيسبوك</label>
              <input
                type="text"
                value={settings.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">رابط إنستغرام</label>
              <input
                type="text"
                value={settings.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-pink hover:bg-pink-dark text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </form>
      </div>
    </div>
  );
}
