import { FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminPasswordSetup() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = trpc.auth.setLocalPassword.useMutation({
    onSuccess: () => {
      setPassword("");
      setConfirm("");
      setError(null);
      setMessage("تم إنشاء كلمة مرور الدخول للإدارة. احتفظ بها في مكان آمن.");
    },
    onError: () => {
      setMessage(null);
      setError("تعذر إنشاء كلمة المرور حالياً. حاول مرة أخرى.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (password.length < 10) {
      setError("كلمة المرور يجب أن تتكون من 10 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    mutation.mutate({ password });
  };

  return <section className="rounded-2xl border border-[#d5b85a]/25 bg-[#d5b85a]/10 p-4" dir="rtl">
    <div className="mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#d5b85a]" /><h3 className="text-sm font-bold">إنشاء كلمة مرور للإدارة</h3></div>
    <p className="mb-3 text-xs leading-5 text-white/60">بعد الدخول عبر Google، يمكنك إنشاء كلمة مرور محلية لاستعمالها لاحقاً.</p>
    <form onSubmit={submit} className="space-y-2">
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={200} placeholder="كلمة مرور جديدة" autoComplete="new-password" className="w-full rounded-lg border border-white/15 bg-[#09251a]/70 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#d5b85a]" />
      <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={10} maxLength={200} placeholder="تأكيد كلمة المرور" autoComplete="new-password" className="w-full rounded-lg border border-white/15 bg-[#09251a]/70 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#d5b85a]" />
      <button type="submit" disabled={mutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d5b85a] px-3 py-2 text-sm font-bold text-[#09251a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}حفظ كلمة المرور</button>
    </form>
    {message && <p className="mt-3 flex items-start gap-1 text-xs text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
    {error && <p className="mt-3 text-xs text-red-200">{error}</p>}
  </section>;
}
