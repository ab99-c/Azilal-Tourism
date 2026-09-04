import { useMemo, useState } from "react";
import { BarChart3, Building2, Car, ChevronLeft, ClipboardList, LayoutDashboard, LockKeyhole, LogOut, Mail, MessageSquare, RefreshCw, ShieldCheck, Utensils } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { openLocalAuth } from "@/components/LocalAuthDialog";
import ContactMessagesPanel from "@/components/ContactMessagesPanel";
import AdminPasswordSetup from "@/components/AdminPasswordSetup";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

type Section = "overview" | "messages" | "listings" | "bookings";
type BookingFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const sectionLabels: Record<Section, string> = {
  overview: "نظرة عامة",
  messages: "رسائل التواصل",
  listings: "الإعلانات والخدمات",
  bookings: "الحجوزات",
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const isAdmin = user?.role === "admin";
  const enabled = isAdmin;

  const metrics = trpc.dashboard.metrics.useQuery(undefined, { enabled, retry: false });
  const bookings = trpc.dashboard.myBookings.useQuery(undefined, { enabled, retry: false });
  const hotels = trpc.dashboard.myHotels.useQuery(undefined, { enabled, retry: false });
  const restaurants = trpc.dashboard.myRestaurants.useQuery(undefined, { enabled, retry: false });
  const cafes = trpc.dashboard.myCafes.useQuery(undefined, { enabled, retry: false });
  const cars = trpc.dashboard.myCars.useQuery(undefined, { enabled, retry: false });
  const messages = trpc.contact.adminList.useQuery(undefined, { enabled, retry: false });
  const updateStatus = trpc.contact.updateStatus.useMutation();
  const replyMessage = trpc.contact.reply.useMutation();

  const filteredBookings = useMemo(() => {
    const rows = bookings.data ?? [];
    return bookingFilter === "all" ? rows : rows.filter((booking) => booking.status === bookingFilter);
  }, [bookings.data, bookingFilter]);

  if (loading) {
    return <main className="min-h-screen bg-[#09251a] p-6 text-white"><div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center"><RefreshCw className="me-3 h-5 w-5 animate-spin text-[#d5b85a]" />جارٍ التحقق من صلاحيات الإدارة...</div></main>;
  }

  if (!user) {
    return <main className="min-h-screen bg-[#09251a] p-6 text-white" dir="rtl"><div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"><section className="w-full rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl"><LockKeyhole className="mx-auto mb-4 h-12 w-12 text-[#d5b85a]" /><h1 className="text-2xl font-bold">دخول لوحة الإدارة</h1><p className="mt-3 text-white/70">يجب تسجيل الدخول أولاً للوصول إلى لوحة الإدارة.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button className="bg-[#d5b85a] text-[#09251a] hover:bg-[#ead37c]" onClick={startLogin}>الدخول عبر Google</Button><Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={openLocalAuth}>الدخول بالبريد</Button></div></section></div></main>;
  }

  if (!isAdmin) {
    return <main className="min-h-screen bg-[#09251a] p-6 text-white" dir="rtl"><div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"><section className="w-full rounded-3xl border border-red-300/20 bg-white/10 p-8 text-center shadow-2xl"><ShieldCheck className="mx-auto mb-4 h-12 w-12 text-red-300" /><h1 className="text-2xl font-bold">الوصول غير مسموح</h1><p className="mt-3 text-white/70">هذه الصفحة مخصصة لحسابات الإدارة فقط.</p><Button variant="outline" className="mt-6 border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => void logout()}>تسجيل الخروج</Button></section></div></main>;
  }

  const reloadAll = () => { void Promise.all([metrics.refetch(), bookings.refetch(), hotels.refetch(), restaurants.refetch(), cafes.refetch(), cars.refetch(), messages.refetch()]); };
  const navItems: { id: Section; icon: typeof LayoutDashboard }[] = [
    { id: "overview", icon: LayoutDashboard }, { id: "messages", icon: MessageSquare }, { id: "listings", icon: Building2 }, { id: "bookings", icon: ClipboardList },
  ];
  const listingGroups = [
    { label: "الفنادق", icon: Building2, rows: hotels.data ?? [] }, { label: "المطاعم", icon: Utensils, rows: restaurants.data ?? [] }, { label: "المقاهي", icon: Mail, rows: cafes.data ?? [] }, { label: "السيارات", icon: Car, rows: cars.data ?? [] },
  ];

  return <main className="min-h-screen bg-[#09251a] text-white" dir="rtl"><div className="flex min-h-screen flex-col md:flex-row"><aside className="w-full border-b border-white/10 bg-[#0d3324] p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-l"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-[#d5b85a]">ADRAR</p><h1 className="text-xl font-bold">لوحة الإدارة</h1></div><ShieldCheck className="h-7 w-7 text-[#d5b85a]" /></div><nav className="mt-8 grid grid-cols-2 gap-2 md:block md:space-y-2">{navItems.map(({ id, icon: Icon }) => <button key={id} type="button" onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm transition-colors ${section === id ? "bg-[#d5b85a] font-bold text-[#09251a]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}><Icon className="h-4 w-4" />{sectionLabels[id]}</button>)}</nav><div className="mt-8"><AdminPasswordSetup /></div><div className="mt-8 flex gap-2 md:block"><Button variant="outline" className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10 md:mb-2 md:w-full" onClick={reloadAll}><RefreshCw className="me-2 h-4 w-4" />تحديث</Button><Button variant="outline" className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10 md:w-full" onClick={() => void logout()}><LogOut className="me-2 h-4 w-4" />خروج</Button></div></aside><section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-[#d5b85a]">مساحة آمنة للمدير</p><h2 className="text-3xl font-black">{sectionLabels[section]}</h2></div><div className="flex items-center gap-2 text-sm text-white/60"><ShieldCheck className="h-4 w-4 text-emerald-300" />{user.name || user.email}</div></header>{section === "overview" && <Overview metrics={metrics.data} onMessages={() => setSection("messages")} />}{section === "messages" && <ContactMessagesPanel messages={messages.data ?? []} isLoading={messages.isLoading} isUpdating={updateStatus.isPending || replyMessage.isPending} lang="ar" onStatusChange={async (id, status) => { await updateStatus.mutateAsync({ id, status }); await messages.refetch(); }} onReply={async (id, reply) => { await replyMessage.mutateAsync({ id, reply }); await messages.refetch(); }} />}{section === "listings" && <Listings groups={listingGroups} />}{section === "bookings" && <Bookings rows={filteredBookings} filter={bookingFilter} setFilter={setBookingFilter} isLoading={bookings.isLoading} />}</section></div></main>;
}

function Overview({ metrics, onMessages }: { metrics?: { total: number; pending: number; confirmed: number; completed: number; cancelled: number }; onMessages: () => void }) {
  const cards = [{ label: "إجمالي الحجوزات", value: metrics?.total ?? 0, color: "text-[#d5b85a]" }, { label: "قيد الانتظار", value: metrics?.pending ?? 0, color: "text-amber-300" }, { label: "مؤكدة", value: metrics?.confirmed ?? 0, color: "text-sky-300" }, { label: "مكتملة", value: metrics?.completed ?? 0, color: "text-emerald-300" }, { label: "ملغاة", value: metrics?.cancelled ?? 0, color: "text-red-300" }];
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-white/10 bg-white/10 p-5"><BarChart3 className={`h-5 w-5 ${card.color}`} /><p className="mt-5 text-sm text-white/60">{card.label}</p><p className={`mt-1 text-3xl font-black ${card.color}`}>{card.value}</p></div>)}</div><button type="button" onClick={onMessages} className="flex w-full items-center justify-between rounded-2xl border border-[#d5b85a]/30 bg-[#d5b85a]/10 p-5 text-right hover:bg-[#d5b85a]/15"><span><span className="block font-bold">رسائل الزوار</span><span className="mt-1 block text-sm text-white/60">افتح صندوق التواصل لمراجعة الرسائل والردود المحفوظة.</span></span><ChevronLeft className="h-5 w-5 text-[#d5b85a]" /></button></div>;
}

function Listings({ groups }: { groups: { label: string; icon: typeof Building2; rows: unknown[] }[] }) { return <div className="grid gap-5 md:grid-cols-2">{groups.map(({ label, icon: Icon, rows }) => <section key={label} className="rounded-2xl border border-white/10 bg-white/10 p-5"><div className="flex items-center justify-between"><h3 className="font-bold">{label}</h3><span className="rounded-full bg-white/10 px-3 py-1 text-sm text-[#d5b85a]">{rows.length}</span></div><div className="mt-4 space-y-2">{rows.slice(0, 8).map((row: any) => <div key={row.id} className="flex items-center gap-3 rounded-xl bg-[#09251a]/50 px-3 py-2 text-sm"><Icon className="h-4 w-4 text-[#d5b85a]" /><span className="truncate">{row.nameAr || row.name || row.modelAr || `#${row.id}`}</span></div>)}{rows.length === 0 && <p className="py-5 text-sm text-white/50">لا توجد بيانات.</p>}</div></section>)}</div>; }

function Bookings({ rows, filter, setFilter, isLoading }: { rows: any[]; filter: BookingFilter; setFilter: (value: BookingFilter) => void; isLoading: boolean }) { const filters: { value: BookingFilter; label: string }[] = [{ value: "all", label: "الكل" }, { value: "pending", label: "قيد الانتظار" }, { value: "confirmed", label: "مؤكدة" }, { value: "completed", label: "مكتملة" }, { value: "cancelled", label: "ملغاة" }]; return <section className="rounded-2xl border border-white/10 bg-white/10 p-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">الحجوزات</h3><p className="mt-1 text-sm text-white/60">{isLoading ? "جارٍ التحميل..." : `${rows.length} حجز`}</p></div><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full px-3 py-1.5 text-xs ${filter === item.value ? "bg-[#d5b85a] font-bold text-[#09251a]" : "bg-white/10 text-white/70"}`}>{item.label}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-right text-sm"><thead className="text-white/50"><tr><th className="p-3">الخدمة</th><th className="p-3">الضيف</th><th className="p-3">النوع</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-white/10"><td className="p-3">{row.itemName}</td><td className="p-3">{row.guestName}</td><td className="p-3">{row.type}</td><td className="p-3">{row.status}</td><td className="p-3 text-white/60">{new Date(row.createdAt).toLocaleString("ar-MA")}</td></tr>)}</tbody></table>{!isLoading && rows.length === 0 && <p className="py-10 text-center text-white/50">لا توجد حجوزات بهذه الحالة.</p>}</div></section>; }
