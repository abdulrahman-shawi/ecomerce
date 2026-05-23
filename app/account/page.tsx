"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Mail, LogOut, Package, Heart, MapPin, Phone } from "lucide-react";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";

export default function AccountPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

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
            <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
              <Mail size={14} />
              {user.email}
            </p>
            {user.phone && (
              <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
                <Phone size={14} />
                {user.phone}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="p-6 grid gap-3">
            <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right">
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">طلباتي</h3>
                <p className="text-sm text-gray-400 font-tajawal">عرض سجل الطلبات</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right">
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">المفضلة</h3>
                <p className="text-sm text-gray-400 font-tajawal">المنتجات المحفوظة</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-right">
              <div className="w-10 h-10 bg-pink/10 rounded-full flex items-center justify-center text-pink">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 font-tajawal">عناويني</h3>
                <p className="text-sm text-gray-400 font-tajawal">إدارة عناوين التوصيل</p>
              </div>
            </button>

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
