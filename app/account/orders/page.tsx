"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/lib/currency";
import { getOrdersForAccount } from "@/server/orders";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import { Package, ArrowLeft, Calendar, Truck, CreditCard, MapPin, Phone } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: number;
    name: string;
    images: { url: string }[];
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  shippingPrice: number | null;
  paymentMethod: string;
  country: string | null;
  city: string | null;
  fullAddress: string | null;
  receiverName: string | null;
  receiverPhone: string[];
  createdAt: Date;
  items: OrderItem[];
  shipping: { name: string; price: number } | null;
}

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { user, isLoggedIn } = useAuth();
  const { siteCurrency, usdToTryRate } = useSettings();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    if (user?.name) {
      getOrdersForAccount(user.name, user.phone)
        .then((data) => setOrders(data as unknown as Order[]))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user) return null;

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-gray-light">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-pink transition-colors font-tajawal"
          >
            <ArrowLeft size={18} />
            العودة للحساب
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-pink p-6 md:p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal">طلباتي</h1>
                <p className="text-white/80 text-sm font-tajawal">
                  سجل الطلبات الخاص بك
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-tajawal">جاري تحميل الطلبات...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-tajawal text-lg mb-2">
                  لا توجد طلبات حالياً
                </p>
                <p className="text-gray-400 font-tajawal text-sm mb-6">
                  ابدأ التسوق الآن واطلب منتجاتك المفضلة
                </p>
                <Link
                  href="/"
                  className="inline-block bg-pink text-white px-6 py-2.5 rounded-full font-medium hover:bg-pink-dark transition-colors font-tajawal"
                >
                  تصفح المنتجات
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-dark font-tajawal">
                          طلب #{order.orderNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium font-tajawal ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 flex items-center gap-1 font-tajawal">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 items-center"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {item.product.images[0]?.url ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-dark text-sm font-tajawal truncate">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-400 font-tajawal">
                                الكمية: {item.quantity}
                              </p>
                              <p className="text-pink-dark font-bold text-sm font-tajawal">
                                {formatPrice(item.price, siteCurrency, usdToTryRate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Details */}
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-500 font-tajawal">
                            <CreditCard size={16} className="text-pink" />
                            <span>طريقة الدفع:</span>
                            <span className="text-gray-dark">{order.paymentMethod}</span>
                          </div>
                          {order.shipping && (
                            <div className="flex items-center gap-2 text-gray-500 font-tajawal">
                              <Truck size={16} className="text-pink" />
                              <span>الشحن:</span>
                              <span className="text-gray-dark">{order.shipping.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {order.city && (
                            <div className="flex items-center gap-2 text-gray-500 font-tajawal">
                              <MapPin size={16} className="text-pink" />
                              <span>العنوان:</span>
                              <span className="text-gray-dark">
                                {order.country} - {order.city}
                              </span>
                            </div>
                          )}
                          {order.receiverPhone.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-500 font-tajawal">
                              <Phone size={16} className="text-pink" />
                              <span>الهاتف:</span>
                              <span className="text-gray-dark">{order.receiverPhone[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-gray-600 font-tajawal">الإجمالي:</span>
                        <span className="text-xl font-bold text-pink-dark font-tajawal">
                          {formatPrice(order.finalAmount, siteCurrency, usdToTryRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
