import { useEffect, useState } from 'react';
import { KeyRound, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Mode = 'login' | 'register' | 'activate';

const labels = {
  ar: { login: 'تسجيل الدخول', register: 'إنشاء حساب', activate: 'تفعيل حساب الإدارة', intro: 'استعمل بريدك الإلكتروني وكلمة السر ديال ADRAR. ما كاين لا Manus لا Google.', name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة السر', secret: 'رمز الإعداد الإداري', submitLogin: 'دخول', submitRegister: 'إنشاء الحساب', submitActivate: 'تفعيل الإدارة', switchRegister: 'ما عندكش حساب؟ أنشئ واحد', switchLogin: 'عندك حساب؟ دخل', admin: 'عندك حساب الإدارة القديم؟ فعّلو هنا', back: 'رجوع للدخول', working: 'كنعالجو…', passwordHint: '10 حروف على الأقل', accountExists: 'هاد الإيميل عندو حساب من قبل. دخل بكلمة السر، أو فعّل حساب الإدارة إذا كان حسابك القديم.', invalid: 'الإيميل أو كلمة السر أو رمز الإعداد غير صحيحين.', activated: 'تفعّل حساب الإدارة. دابا تقدر تدخل بالإيميل وكلمة السر.' },
  en: { login: 'Sign in', register: 'Create account', activate: 'Activate administrator account', intro: 'Use your ADRAR email and password. No Manus or Google account is required.', name: 'Full name', email: 'Email address', password: 'Password', secret: 'Administrator setup secret', submitLogin: 'Sign in', submitRegister: 'Create account', submitActivate: 'Activate administrator account', switchRegister: 'New here? Create an account', switchLogin: 'Have an account? Sign in', admin: 'Have the existing administrator account? Activate it here', back: 'Back to sign in', working: 'Please wait…', passwordHint: 'At least 10 characters', accountExists: 'This email already has an account. Sign in, or activate it if it is the existing administrator account.', invalid: 'The email or password is incorrect.', activated: 'Administrator account activated. You can now sign in with email and password.' },
  fr: { login: 'Se connecter', register: 'Créer un compte', activate: 'Activer le compte administrateur', intro: 'Utilisez votre e-mail et mot de passe ADRAR. Aucun compte Manus ou Google n’est requis.', name: 'Nom complet', email: 'Adresse e-mail', password: 'Mot de passe', secret: 'Code de configuration administrateur', submitLogin: 'Se connecter', submitRegister: 'Créer le compte', submitActivate: 'Activer le compte administrateur', switchRegister: 'Nouveau ? Créer un compte', switchLogin: 'Déjà un compte ? Se connecter', admin: 'Vous avez le compte administrateur existant ? Activez-le ici', back: 'Retour à la connexion', working: 'Traitement…', passwordHint: '10 caractères au minimum', accountExists: 'Cet e-mail a déjà un compte. Connectez-vous, ou activez-le s’il s’agit du compte administrateur existant.', invalid: 'L’e-mail ou le mot de passe est incorrect.', activated: 'Compte administrateur activé. Vous pouvez maintenant vous connecter avec votre e-mail et mot de passe.' },
  ber: { login: 'ⴽⵛⵎ', register: 'ⵙⵏⵓⵍⴼⵓ ⴰⵎⵉⴷⴰⵏ', activate: 'ⵙⵙⵏ ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ', intro: 'ⵙⵙⵎⵔⵙ ⵉⵎⵉⵍ ⵏⵏⴽ ⴷ ⵜⴰⵡⴰⵍⵜ ⵏ ADRAR. ⵓⵔ ⵉⵍⵉ Manus ⵏⵖ Google.', name: 'ⵉⵙⵎ ⵏⵏⴽ', email: 'ⵉⵎⵉⵍ', password: 'ⵜⴰⵡⴰⵍⵜ', secret: 'ⴰⵎⵣⵔⵓⵢ ⵏ ⵓⵙⵏⵓⵍⴼⵓ ⵏ ⵓⵏⴱⴷⴰⴷ', submitLogin: 'ⴽⵛⵎ', submitRegister: 'ⵙⵏⵓⵍⴼⵓ ⴰⵎⵉⴷⴰⵏ', submitActivate: 'ⵙⵙⵏ ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ', switchRegister: 'ⵓⵔ ⴷⴰⵔⴽ ⴰⵎⵉⴷⴰⵏ? ⵙⵏⵓⵍⴼⵓ ⵢⴰⵏ', switchLogin: 'ⴷⴰⵔⴽ ⴰⵎⵉⴷⴰⵏ? ⴽⵛⵎ', admin: 'ⴷⴰⵔⴽ ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ? ⵙⵙⵏⵉⵜ ⴷⴰ', back: 'ⵔⵔ ⵖⵔ ⵓⴽⵛⵓⵎ', working: 'ⵉⵜⵜⵓⵙⵡⵓⵔ…', passwordHint: '10 ⵉⵙⴽⴽⵉⵍⵏ ⵖ ⵓⴳⴳⴰⵔ', accountExists: 'ⵉⵎⵉⵍ ⴰⴷ ⵉⵍⴰ ⴰⵎⵉⴷⴰⵏ. ⴽⵛⵎ ⵏⵖ ⵙⵙⵏ ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ.', invalid: 'ⵉⵎⵉⵍ ⵏⵖ ⵜⴰⵡⴰⵍⵜ ⵓⵔ ⵉⵙⵖⵓⴷⴰ.', activated: 'ⵉⵜⵜⵓⵙⵙⵏ ⵓⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ. ⵜⵣⵎⵔⴷ ⴰⴷ ⵜⴽⵛⵎⴷ ⵙ ⵉⵎⵉⵍ ⴷ ⵜⴰⵡⴰⵍⵜ.' },
} as const;

export function openLocalAuth() {
  window.dispatchEvent(new Event('adrar:open-auth'));
}

export default function LocalAuthDialog() {
  const { lang } = useLanguage();
  const c = labels[lang];
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bootstrapSecret, setBootstrapSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const show = () => { setError(''); setOpen(true); };
    window.addEventListener('adrar:open-auth', show);
    if (new URLSearchParams(window.location.search).get('auth') === 'login') show();
    return () => window.removeEventListener('adrar:open-auth', show);
  }, []);

  const finish = (user: any, successMessage = '') => {
    utils.auth.me.setData(undefined, user);
    void utils.auth.me.invalidate();
    setError(successMessage);
    if (!successMessage) setOpen(false);
  };
  const login = trpc.auth.login.useMutation({ onSuccess: ({ user }) => finish(user), onError: () => setError(c.invalid) });
  const register = trpc.auth.register.useMutation({ onSuccess: ({ user }) => finish(user), onError: (err) => setError(err.message === 'EMAIL_ALREADY_REGISTERED' ? c.accountExists : c.invalid) });
  const activate = trpc.auth.activateExistingAdmin.useMutation({ onSuccess: ({ user }) => finish(user, c.activated), onError: () => setError(c.invalid) });
  const pending = login.isPending || register.isPending || activate.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'login') login.mutate({ email, password });
    if (mode === 'register') register.mutate({ name, email, password });
    if (mode === 'activate') activate.mutate({ email, password, bootstrapSecret });
  };
  const title = mode === 'login' ? c.login : mode === 'register' ? c.register : c.activate;

  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[92dvh] overflow-y-auto border-[#cae1d1] p-0 sm:max-w-md" dir={lang === 'ar' || lang === 'ber' ? 'rtl' : 'ltr'}><div className="bg-gradient-to-br from-[#0f3d28] to-[#1b6b47] px-6 py-7 text-white"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">{mode === 'register' ? <UserPlus className="h-5 w-5" /> : mode === 'activate' ? <ShieldCheck className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}</div><DialogHeader><DialogTitle className="text-xl font-black text-white">{title}</DialogTitle><DialogDescription className="mt-2 leading-6 text-white/80">{c.intro}</DialogDescription></DialogHeader></div><form onSubmit={submit} className="space-y-4 p-6">{mode === 'register' && <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.name}<input required value={name} onChange={event => setName(event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]" /></label>}<label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.email}<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]" /></label><label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.password}<input required type="password" minLength={10} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]" /><span className="text-xs font-normal text-[#6a786e]">{c.passwordHint}</span></label>{mode === 'activate' && <label className="grid gap-1.5 text-sm font-bold text-[#315443]">{c.secret}<div className="relative"><KeyRound className="absolute start-3 top-3 h-4 w-4 text-[#4f765f]" /><input required type="password" minLength={12} value={bootstrapSecret} onChange={event => setBootstrapSecret(event.target.value)} className="w-full rounded-xl border border-[#cfddd2] py-2.5 ps-10 pe-3 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]" /></div></label>}{error && <p role="alert" className={`rounded-xl px-3 py-2 text-sm ${error === c.activated ? 'bg-[#e6f6eb] text-[#176b4d]' : 'bg-[#fff0ed] text-[#9b302b]'}`}>{error}</p>}<button disabled={pending} className="w-full rounded-xl bg-[#176b4d] px-4 py-3 font-bold text-white transition hover:bg-[#125b40] disabled:opacity-60">{pending ? c.working : mode === 'login' ? c.submitLogin : mode === 'register' ? c.submitRegister : c.submitActivate}</button><div className="space-y-2 text-center text-sm"><button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="font-bold text-[#176b4d] hover:underline">{mode === 'login' ? c.switchRegister : c.switchLogin}</button>{mode !== 'activate' && <button type="button" onClick={() => { setMode('activate'); setError(''); }} className="block w-full text-[#6b5731] hover:underline">{c.admin}</button>}{mode === 'activate' && <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-[#176b4d] hover:underline">{c.back}</button>}</div></form></DialogContent></Dialog>;
}
