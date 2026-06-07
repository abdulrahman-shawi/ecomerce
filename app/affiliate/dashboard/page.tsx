"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAffiliateDashboard,
  getAffiliateLinks,
  createAffiliateLink,
  getAffiliateCommissions,
} from "@/server/affiliate";
import type { AffiliateUser } from "@/server/affiliate";
import {
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Plus,
  LogOut,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";

interface DashboardData {
  totalClicks: number;
  totalConversions: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  linksCount: number;
  links: any[];
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AffiliateUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("affiliate-user");
    if (!stored) {
      router.push("/affiliate/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    const [dash, linksData, comms] = await Promise.all([
      getAffiliateDashboard(user.id),
      getAffiliateLinks(user.id),
      getAffiliateCommissions(user.id),
    ]);
    setDashboard(dash);
    setLinks(linksData);
    setCommissions(comms);
    setLoading(false);
  };

  const handleCreateLink = async () => {
    if (!user || !selectedProduct) return;
    const result = await createAffiliateLink(user.id, parseInt(selectedProduct));
    if (result.success) {
      setShowCreateModal(false);
      setSelectedProduct("");
      loadDashboard();
    }
  };

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/ref/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate-user");
    localStorage.removeItem("affiliate-token");
    router.push("/affiliate/login");
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="text-pink font-tajawal">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-light font-tajawal">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-dark">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-pink transition-colors flex items-center gap-1"
            >
              <ExternalLink size={16} />
              المتجر
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<MousePointerClick size={20} />}
              label="النقرات"
              value={dashboard.totalClicks}
              color="blue"
            />
            <StatCard
              icon={<ShoppingCart size={20} />}
              label="التحويلات"
              value={dashboard.totalConversions}
              color="green"
            />
            <StatCard
              icon={<DollarSign size={20} />}
              label="إجمالي العمولات"
              value={`$${dashboard.totalCommissions}`}
              color="pink"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="معلقة"
              value={`$${dashboard.pendingCommissions}`}
              color="orange"
            />
          </div>
        )}

        {/* Links Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-dark flex items-center gap-2">
              <LinkIcon size={20} className="text-pink" />
              روابطي
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-pink text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-dark transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              رابط جديد
            </button>
          </div>

          {links.length === 0 ? (
            <p className="text-gray-400 text-center py-8">لا توجد روابط بعد. أنشئ رابطك الأول!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-right py-3 px-2">المنتج</th>
                    <th className="text-right py-3 px-2">الكود</th>
                    <th className="text-right py-3 px-2">النقرات</th>
                    <th className="text-right py-3 px-2">التحويلات</th>
                    <th className="text-right py-3 px-2">النسبة</th>
                    <th className="text-right py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">{link.product?.name ?? "—"}</td>
                      <td className="py-3 px-2 font-mono text-xs">{link.uniqueCode}</td>
                      <td className="py-3 px-2">{link.clicks}</td>
                      <td className="py-3 px-2">{link.conversions}</td>
                      <td className="py-3 px-2">{link.commissionRate}%</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleCopy(link.uniqueCode)}
                          className="text-pink hover:bg-pink-50 p-2 rounded-lg transition-colors"
                          title="نسخ الرابط"
                        >
                          {copiedCode === link.uniqueCode ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-dark mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-pink" />
            العمولات
          </h2>

          {commissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">لا توجد عمولات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-right py-3 px-2">الطلب</th>
                    <th className="text-right py-3 px-2">المنتج</th>
                    <th className="text-right py-3 px-2">المبلغ</th>
                    <th className="text-right py-3 px-2">الحالة</th>
                    <th className="text-right py-3 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">{c.order?.orderNumber ?? "—"}</td>
                      <td className="py-3 px-2">{c.affiliateLink?.product?.name ?? "—"}</td>
                      <td className="py-3 px-2 font-bold">${c.amount}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-dark mb-4">إنشاء رابط جديد</h3>
            <ProductSelector onSelect={setSelectedProduct} selected={selectedProduct} />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!selectedProduct}
                className="flex-1 py-2.5 bg-pink text-white rounded-xl font-medium hover:bg-pink-dark transition-colors disabled:opacity-50"
              >
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "green" | "pink" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    pink: "bg-pink-50 text-pink",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-dark">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-600",
    PAID: "bg-green-50 text-green-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  const labels: Record<string, string> = {
    PENDING: "معلقة",
    PAID: "مدفوعة",
    CANCELLED: "ملغاة",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status] ?? "bg-gray-50 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function ProductSelector({
  onSelect,
  selected,
}: {
  onSelect: (id: string) => void;
  selected: string;
}) {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/active")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">جاري تحميل المنتجات...</p>;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">اختر المنتج</label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink"
      >
        <option value="">اختر منتجاً...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
