"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  type HeroSlideItem,
} from "@/server/hero-slides";

const emptySlide: Partial<HeroSlideItem> = {
  title: "",
  subtitle: "",
  image: "",
  buttonText: "",
  buttonLink: "",
  sortOrder: 0,
  isActive: true,
};

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HeroSlideItem | null>(null);
  const [form, setForm] = useState<Partial<HeroSlideItem>>(emptySlide);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllHeroSlides();
      setSlides(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "فشل تحميل السلايدرات" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const resetForm = () => {
    setForm(emptySlide);
    setImageFile(null);
    setEditing(null);
  };

  const handleEdit = (slide: HeroSlideItem) => {
    setEditing(slide);
    setForm({ ...slide });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const fd = new FormData();
    if (form.title) fd.set("title", form.title);
    if (form.subtitle) fd.set("subtitle", form.subtitle);
    if (form.buttonText) fd.set("buttonText", form.buttonText);
    if (form.buttonLink) fd.set("buttonLink", form.buttonLink);
    fd.set("sortOrder", String(form.sortOrder ?? 0));
    fd.set("isActive", form.isActive ? "true" : "false");
    if (imageFile) fd.set("image", imageFile);

    let result;
    if (editing) {
      result = await updateHeroSlide(editing.id, fd);
    } else {
      if (!imageFile) {
        setMessage({ type: "error", text: "يرجى اختيار صورة للسلايدر" });
        return;
      }
      result = await createHeroSlide(fd);
    }

    if (result.success) {
      setMessage({ type: "success", text: editing ? "تم تحديث السلايدر" : "تم إنشاء السلايدر" });
      resetForm();
      await loadSlides();
    } else {
      setMessage({ type: "error", text: result.error || "حدث خطأ" });
    }
  };

  const handleDelete = async (slide: HeroSlideItem) => {
    if (!confirm("هل أنت متأكد من حذف هذا السلايدر؟")) return;
    setMessage(null);
    const result = await deleteHeroSlide(slide.id);
    if (result.success) {
      setMessage({ type: "success", text: "تم حذف السلايدر" });
      if (editing?.id === slide.id) resetForm();
      await loadSlides();
    } else {
      setMessage({ type: "error", text: result.error || "حدث خطأ" });
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-6 font-tajawal">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة سلايدر الصفحة الرئيسية</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editing ? "تعديل سلايدر" : "إضافة سلايدر جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">العنوان</label>
              <input
                type="text"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">العنوان الفرعي</label>
              <input
                type="text"
                value={form.subtitle ?? ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">نص الزر</label>
              <input
                type="text"
                value={form.buttonText ?? ""}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">رابط الزر</label>
              <input
                type="text"
                value={form.buttonLink ?? ""}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ترتيب العرض</label>
              <input
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value || "0", 10) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink"
              />
            </div>

            <div className="flex items-center gap-2 h-full pt-6">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-5 h-5 text-pink focus:ring-pink rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-600">نشط</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                الصورة {editing ? "(اتركها فارغة للاحتفاظ بالصورة الحالية)" : ""}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-pink file:text-white"
              />
              {editing && !imageFile && (
                <div className="mt-2 relative w-40 h-24 rounded overflow-hidden">
                  <Image src={editing.image} alt="current" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-pink hover:bg-pink-dark text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {editing ? "حفظ التعديلات" : "إضافة السلايدر"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-700 p-6 border-b">السلايدرات</h2>
          {loading ? (
            <p className="p-6 text-gray-500">جاري التحميل...</p>
          ) : slides.length === 0 ? (
            <p className="p-6 text-gray-500">لا توجد سلايدرات بعد.</p>
          ) : (
            <table className="w-full text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm text-gray-600">الصورة</th>
                  <th className="px-4 py-3 text-sm text-gray-600">العنوان</th>
                  <th className="px-4 py-3 text-sm text-gray-600">الترتيب</th>
                  <th className="px-4 py-3 text-sm text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-sm text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr key={slide.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="relative w-24 h-14 rounded overflow-hidden">
                        <Image src={slide.image} alt={slide.title || ""} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{slide.title}</div>
                      <div className="text-gray-400 text-xs">{slide.subtitle}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{slide.sortOrder}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          slide.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {slide.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(slide)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
