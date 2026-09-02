import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  MailCheck,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Mode =
  | "login"
  | "register"
  | "activate"
  | "reset-request"
  | "reset"
  | "verify";

function getPasswordStrength(value: string) {
  if (!value) return 0;
  return [
    value.length >= 10,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;
}

const strengthLabels = {
  ar: ["لم تُدخل كلمة سر", "ضعيفة جداً", "ضعيفة", "جيدة", "قوية"],
  en: ["No password yet", "Very weak", "Weak", "Good", "Strong"],
  fr: ["Aucun mot de passe", "Très faible", "Faible", "Correcte", "Forte"],
  ber: ["ⵓⵔ ⵜⵍⵉ ⵜⴰⵡⴰⵍⵜ", "ⵜⴰⵏⴼⵔⵓⵜ", "ⵜⴰⵎⵣⵡⴰⵔⵜ", "ⵜⵎⵎⴰ", "ⵜⵣⵎⵎⵔ"],
} as const;

const labels = {
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    activate: "تفعيل حساب الإدارة",
    resetRequest: "استعادة كلمة السر",
    reset: "تعيين كلمة سر جديدة",
    verify: "تحقق من البريد الإلكتروني",
    intro: "استخدم بريدك الإلكتروني وكلمة السر الخاصة بك في ADRAR.",
    name: "الاسم الكامل",
    providerType: "نوع الحساب",
    email: "البريد الإلكتروني",
    password: "كلمة السر",
    newPassword: "كلمة السر الجديدة",
    token: "رمز التحقق",
    secret: "رمز إعداد الإدارة",
    submitLogin: "دخول",
    submitRegister: "إنشاء الحساب",
    submitActivate: "تفعيل الإدارة",
    submitResetRequest: "طلب رابط الاستعادة",
    submitReset: "حفظ كلمة السر الجديدة",
    submitVerify: "تأكيد البريد الإلكتروني",
    switchRegister: "ليس لديك حساب؟ أنشئ حساباً",
    switchLogin: "لديك حساب؟ سجّل الدخول",
    forgot: "نسيت كلمة السر؟",
    admin: "لديك حساب الإدارة القديم؟ فعّله هنا",
    back: "العودة إلى الدخول",
    working: "جارٍ المعالجة…",
    passwordHint: "10 أحرف على الأقل",
    passwordWeak:
      "اختر كلمة سر قوية تجمع بين الأحرف الكبيرة والصغيرة والأرقام والرموز.",
    accountExists:
      "هذا البريد مسجل مسبقاً. سجّل الدخول أو فعّل حساب الإدارة القديم.",
    invalid: "البريد الإلكتروني أو كلمة السر أو رمز الإعداد غير صحيح.",
    oauthAccount: "هذا الحساب مرتبط بتسجيل خارجي. استعمل زر تسجيل Google أو طريقة الدخول الأصلية.",
    registerError: "تعذر إنشاء الحساب حالياً. تحقق من البيانات وحاول مرة أخرى.",
    formIncomplete: "يرجى إكمال الحقول المطلوبة والتحقق من الرمز وكلمة السر.",
    passwordChanged: "تم تغيير كلمة السر بنجاح. يمكنك تسجيل الدخول الآن.",
    confirmPassword: "تأكيد كلمة السر الجديدة",
    passwordMismatch: "كلمتا السر غير متطابقتين.",
    passwordMatch: "كلمتا السر متطابقتان.",
    showPassword: "إظهار كلمة السر",
    hidePassword: "إخفاء كلمة السر",
    activated: "تم تفعيل حساب الإدارة. يمكنك الآن تسجيل الدخول.",
    resetSent: "تم تجهيز طلب الاستعادة. سيظهر رابط الإرسال بعد ربط نطاق موثق.",
    verifyPending:
      "تم إنشاء الحساب. سيتاح إرسال رابط التحقق بعد ربط نطاق موثق.",
    tokenHint: "ألصق الرمز الذي وصلك بالبريد الإلكتروني.",
    invalidToken: "الرمز غير صالح أو انتهت صلاحيته.",
    verified: "تم تأكيد البريد الإلكتروني بنجاح.",
  },
  en: {
    login: "Sign in",
    register: "Create account",
    activate: "Activate administrator account",
    resetRequest: "Recover password",
    reset: "Set a new password",
    verify: "Verify email",
    intro: "Use your ADRAR email and password.",
    name: "Full name",
    providerType: "Account type",
    email: "Email address",
    password: "Password",
    newPassword: "New password",
    token: "Verification token",
    secret: "Administrator setup secret",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    submitActivate: "Activate administrator account",
    submitResetRequest: "Prepare recovery link",
    submitReset: "Save new password",
    submitVerify: "Verify email",
    switchRegister: "New here? Create an account",
    switchLogin: "Have an account? Sign in",
    forgot: "Forgot your password?",
    admin: "Have the existing administrator account? Activate it here",
    back: "Back to sign in",
    working: "Please wait…",
    passwordHint: "At least 10 characters",
    passwordWeak:
      "Choose a strong password with uppercase and lowercase letters, numbers, and symbols.",
    accountExists:
      "This email already has an account. Sign in or activate the existing administrator account.",
    invalid: "The email or password is incorrect.",
    oauthAccount: "This account uses an external sign-in method. Use Google sign-in or the original provider.",
    registerError: "The account could not be created right now. Check your details and try again.",
    formIncomplete:
      "Please complete the required fields and check the token and password.",
    passwordChanged: "Password changed successfully. You can sign in now.",
    confirmPassword: "Confirm new password",
    passwordMismatch: "The passwords do not match.",
    passwordMatch: "The passwords match.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    activated: "Administrator account activated. You can now sign in.",
    resetSent:
      "The recovery request is prepared. Sending will be enabled after a verified domain is connected.",
    verifyPending:
      "Your account was created. Verification sending will be enabled after a verified domain is connected.",
    tokenHint: "Paste the token received by email.",
    invalidToken: "The token is invalid or expired.",
    verified: "Email verified successfully.",
  },
  fr: {
    login: "Se connecter",
    register: "Créer un compte",
    activate: "Activer le compte administrateur",
    resetRequest: "Récupérer le mot de passe",
    reset: "Définir un nouveau mot de passe",
    verify: "Vérifier l’e-mail",
    intro: "Utilisez votre e-mail et votre mot de passe ADRAR.",
    name: "Nom complet",
    providerType: "Type de compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    newPassword: "Nouveau mot de passe",
    token: "Jeton de vérification",
    secret: "Code de configuration administrateur",
    submitLogin: "Se connecter",
    submitRegister: "Créer le compte",
    submitActivate: "Activer le compte administrateur",
    submitResetRequest: "Préparer le lien",
    submitReset: "Enregistrer le mot de passe",
    submitVerify: "Vérifier l’e-mail",
    switchRegister: "Nouveau ? Créer un compte",
    switchLogin: "Déjà un compte ? Se connecter",
    forgot: "Mot de passe oublié ?",
    admin: "Compte administrateur existant ? Activez-le ici",
    back: "Retour à la connexion",
    working: "Traitement…",
    passwordHint: "10 caractères minimum",
    passwordWeak:
      "Choisissez un mot de passe fort avec majuscules, minuscules, chiffres et symboles.",
    accountExists:
      "Cet e-mail possède déjà un compte. Connectez-vous ou activez le compte administrateur.",
    invalid: "E-mail ou mot de passe incorrect.",
    oauthAccount: "Ce compte utilise une connexion externe. Utilisez Google ou le fournisseur d’origine.",
    registerError: "Le compte n’a pas pu être créé. Vérifiez vos informations et réessayez.",
    formIncomplete:
      "Veuillez remplir les champs requis et vérifier le jeton et le mot de passe.",
    passwordChanged:
      "Mot de passe modifié. Vous pouvez maintenant vous connecter.",
    confirmPassword: "Confirmer le nouveau mot de passe",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordMatch: "Les mots de passe correspondent.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    activated:
      "Compte administrateur activé. Vous pouvez maintenant vous connecter.",
    resetSent:
      "La demande est préparée. L’envoi sera activé après la connexion d’un domaine vérifié.",
    verifyPending:
      "Compte créé. L’envoi de vérification sera activé après la connexion d’un domaine vérifié.",
    tokenHint: "Collez le jeton reçu par e-mail.",
    invalidToken: "Jeton invalide ou expiré.",
    verified: "E-mail vérifié avec succès.",
  },
  ber: {
    login: "ⴽⵛⵎ",
    register: "ⵙⵏⵓⵍⴼⵓ ⴰⵎⵉⴷⴰⵏ",
    activate: "ⵙⵙⵏ ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ",
    resetRequest: "ⵔⵔ ⵜⴰⵡⴰⵍⵜ",
    reset: "ⵙⵙⵏ ⵜⴰⵡⴰⵍⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ",
    verify: "ⵙⵙⵏ ⵉⵎⵉⵍ",
    intro: "ⵙⵙⵎⵔⵙ ⵉⵎⵉⵍ ⴷ ⵜⴰⵡⴰⵍⵜ ⵏ ADRAR.",
    name: "ⵉⵙⵎ",
    providerType: "ⵜⵉⵏⵎⵍ ⵏ ⵓⵎⵉⴷⴰⵏ",
    email: "ⵉⵎⵉⵍ",
    password: "ⵜⴰⵡⴰⵍⵜ",
    newPassword: "ⵜⴰⵡⴰⵍⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ",
    token: "ⴰⵎⵣⵔⵓⵢ",
    secret: "ⴰⵎⵣⵔⵓⵢ ⵏ ⵓⵏⴱⴷⴰⴷ",
    submitLogin: "ⴽⵛⵎ",
    submitRegister: "ⵙⵏⵓⵍⴼⵓ",
    submitActivate: "ⵙⵙⵏ",
    submitResetRequest: "ⵙⵙⵏ ⴰⵙⵔⵓⵙ",
    submitReset: "ⵃⴹⵓ",
    submitVerify: "ⵙⵙⵏ",
    switchRegister: "ⵓⵔ ⴷⴰⵔⴽ ⴰⵎⵉⴷⴰⵏ?",
    switchLogin: "ⴷⴰⵔⴽ ⴰⵎⵉⴷⴰⵏ?",
    forgot: "ⵜⵜⵓⵜ ⵜⴰⵡⴰⵍⵜ?",
    admin: "ⴰⵎⵉⴷⴰⵏ ⵏ ⵓⵏⴱⴷⴰⴷ",
    back: "ⵔⵔ",
    working: "ⵉⵜⵜⵓⵙⵡⵓⵔ…",
    passwordHint: "10 ⵉⵙⴽⴽⵉⵍⵏ",
    passwordWeak: "ⵙⵙⵏ ⵜⴰⵡⴰⵍⵜ ⵜⵣⵎⵔ ⵙ ⵉⵙⴽⴽⵉⵍⵏ ⴷ ⵉⵎⵏⵣⴰⵢⵏ ⴷ ⵉⵎⵣⵣⵉⵣⵏ",
    accountExists: "ⵉⵍⴰ ⴰⵎⵉⴷⴰⵏ",
    invalid: "ⵓⵔ ⵉⵙⵖⵓⴷⴰ",
    oauthAccount: "ⴰⵎⵉⴷⴰⵏ-ⴰ ⵉⵙⵙⵎⵔⵙ ⵜⵉⵏⵎⵍ ⵏ ⵜⵎⵙⵙⵉⵔⵜ. ⵙⵙⵎⵔⵙ Google ⵏⵉⵖ ⵜⵉⵏⵎⵍ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ.",
    registerError: "ⵓⵔ ⵉⵣⵎⵔ ⵓⵎⵉⴷⴰⵏ ⴰⴷ ⵉⵜⵜⵓⵙⵏⵓⵍⴼⵓ. ⵙⵙⵏ ⵉⵎⵙⵙⴰⵡⵏ ⴷ ⵙⵙⵏ ⵜⵉⴽⵍⵉⵏ.",
    formIncomplete: "ⵙⵙⵎⵔⵙ ⵉⵙⵏ ⵉⵎⵣⵣⵉⵣⵏ ⴷ ⴰⵎⵣⵔⵓⵢ ⴷ ⵜⴰⵡⴰⵍⵜ.",
    passwordChanged: "ⵜⴱⴷⴷⵍ ⵜⴰⵡⴰⵍⵜ",
    confirmPassword: "ⵙⵙⵏ ⵜⴰⵡⴰⵍⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ",
    passwordMismatch: "ⵜⵉⵡⴰⵍⵉⵏ ⵓⵔ ⵎⵎⵛⴰⵡⴰⵏⵜ.",
    passwordMatch: "ⵜⵉⵡⴰⵍⵉⵏ ⵎⵎⵛⴰⵡⴰⵏⵜ.",
    showPassword: "ⵙⵙⴽⵏ ⵜⴰⵡⴰⵍⵜ",
    hidePassword: "ⴼⵔ ⵜⴰⵡⴰⵍⵜ",
    activated: "ⵉⵜⵜⵓⵙⵙⵏ",
    resetSent: "ⵉⵜⵜⵓⵙⵡⵓⵔ ⵓⵙⵔⵓⵙ",
    verifyPending: "ⵉⵜⵜⵓⵙⵏⵓⵍⴼⴰ ⵓⵎⵉⴷⴰⵏ",
    tokenHint: "ⵙⵙⵏ ⴰⵎⵣⵔⵓⵢ",
    invalidToken: "ⴰⵎⵣⵔⵓⵢ ⵓⵔ ⵉⵙⵖⵓⴷⴰ",
    verified: "ⵉⵜⵜⵓⵙⵙⵏ ⵉⵎⵉⵍ",
  },
} as const;

const providerOptions = {
  ar: {
    tourist: "سائح",
    hotel_owner: "مالك فندق أو دار ضيافة",
    restaurant_owner: "مالك مطعم أو مقهى",
    activity_provider: "منظم أنشطة",
    guide: "مرشد سياحي",
    transport_provider: "مقدم نقل أو كراء سيارات",
  },
  en: {
    tourist: "Tourist",
    hotel_owner: "Hotel or guesthouse owner",
    restaurant_owner: "Restaurant or café owner",
    activity_provider: "Activity provider",
    guide: "Tour guide",
    transport_provider: "Transport or car-rental provider",
  },
  fr: {
    tourist: "Touriste",
    hotel_owner: "Propriétaire d'hôtel ou maison d'hôtes",
    restaurant_owner: "Propriétaire de restaurant ou café",
    activity_provider: "Prestataire d'activités",
    guide: "Guide touristique",
    transport_provider: "Prestataire de transport ou location",
  },
  ber: {
    tourist: "ⵉⵎⵔⵣⵣⴰ",
    hotel_owner: "ⴰⵎⵙⵡⵉⵔ ⵏ ⵓⵙⵏⵙⵓ",
    restaurant_owner: "ⴰⵎⵙⵡⵉⵔ ⵏ ⵓⵎⵙⵙⵉ",
    activity_provider: "ⴰⵎⵙⵙⴽⵜ ⵏ ⵉⵎⵙⵙⴽⵜⵏ",
    guide: "ⴰⵎⵙⵙⵏ",
    transport_provider: "ⴰⵎⵙⵙⵓⵔ ⵏ ⵓⵙⵉⵡⵍ",
  },
} as const;

export function openLocalAuth() {
  window.dispatchEvent(new Event("adrar:open-auth"));
}

export default function LocalAuthDialog() {
  const { lang } = useLanguage();
  const c = labels[lang];
  const utils = trpc.useUtils();
  const params = new URLSearchParams(window.location.search);
  const initialMode =
    params.get("auth") === "register"
      ? "register"
      : params.get("auth") === "activate-admin"
        ? "activate"
        : params.get("auth") === "reset"
          ? "reset"
          : params.get("auth") === "verify"
            ? "verify"
            : "login";
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [providerType, setProviderType] = useState<
    | "tourist"
    | "hotel_owner"
    | "restaurant_owner"
    | "activity_provider"
    | "guide"
    | "transport_provider"
  >("tourist");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordStrength = getPasswordStrength(password);
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [token, setToken] = useState(params.get("token") ?? "");
  const [error, setError] = useState("");
  const [feedbackType, setFeedbackType] = useState<"error" | "success">(
    "error"
  );
  useEffect(() => {
    const show = () => {
      setError("");
      setOpen(true);
    };
    window.addEventListener("adrar:open-auth", show);
    if (params.has("auth")) show();
    return () => window.removeEventListener("adrar:open-auth", show);
  }, []);
  const showError = (message: string) => {
    setFeedbackType("error");
    setError(message);
  };
  const showSuccess = (message: string) => {
    setFeedbackType("success");
    setError(message);
  };
  const finish = (user: any, message = "") => {
    utils.auth.me.setData(undefined, user);
    void utils.auth.me.invalidate();
    if (message) showSuccess(message);
    else setOpen(false);
  };
  const login = trpc.auth.login.useMutation({
    onSuccess: ({ user }) => finish(user),
    onError: err => {
      showError(
        err.message.includes("OAUTH_ACCOUNT_USE_OAUTH") ? c.oauthAccount : c.invalid
      );
    },
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: ({ user }) => finish(user, c.verifyPending),
    onError: err => {
      const message = String(err.message ?? "");
      if (
        message.includes("EMAIL_ALREADY_REGISTERED") ||
        err.data?.code === "CONFLICT"
      ) {
        showError(c.accountExists);
        return;
      }
      if (message.includes("ACCOUNT_CREATION_FAILED")) {
        showError(c.registerError);
        return;
      }
      showError(c.registerError);
    },
  });
  const activate = trpc.auth.activateExistingAdmin.useMutation({
    onSuccess: ({ user }) => finish(user, c.activated),
    onError: () => showError(c.invalid),
  });
  const resetRequest = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => showSuccess(c.resetSent),
    onError: () => showError(c.invalid),
  });
  const reset = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setMode("login");
      showSuccess(c.passwordChanged);
    },
    onError: () => showError(c.invalidToken),
  });
  const verify = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => showSuccess(c.verified),
    onError: () => showError(c.invalidToken),
  });
  const pending = [login, register, activate, resetRequest, reset, verify].some(
    m => m.isPending
  );
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setFeedbackType("error");
    if ((mode === "reset" || mode === "verify") && token.trim().length < 32) {
      showError(c.formIncomplete);
      return;
    }
    if (
      (mode === "reset" ||
        mode === "login" ||
        mode === "register" ||
        mode === "activate") &&
      password.length < 10
    ) {
      showError(c.formIncomplete);
      return;
    }
    if (mode === "reset" && passwordStrength < 4) {
      showError(c.passwordWeak);
      return;
    }
    if (mode === "reset" && password !== confirmPassword) {
      showError(c.passwordMismatch);
      return;
    }
    if (mode === "login") login.mutate({ email, password });
    if (mode === "register")
      register.mutate({ name, email, password, providerType });
    if (mode === "activate")
      activate.mutate({ email, password, bootstrapSecret });
    if (mode === "reset-request") resetRequest.mutate({ email });
    if (mode === "reset") reset.mutate({ token, password });
    if (mode === "verify") verify.mutate({ token });
  };
  const title =
    mode === "login"
      ? c.login
      : mode === "register"
        ? c.register
        : mode === "activate"
          ? c.activate
          : mode === "reset-request"
            ? c.resetRequest
            : mode === "reset"
              ? c.reset
              : c.verify;
  const icon =
    mode === "register" ? (
      <UserPlus className="h-5 w-5" />
    ) : mode === "activate" ? (
      <ShieldCheck className="h-5 w-5" />
    ) : mode === "verify" ? (
      <MailCheck className="h-5 w-5" />
    ) : (
      <LogIn className="h-5 w-5" />
    );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[92dvh] overflow-y-auto border-[#cae1d1] p-0 sm:max-w-md"
        dir={lang === "ar" || lang === "ber" ? "rtl" : "ltr"}
      >
        <div className="bg-gradient-to-br from-[#0f3d28] to-[#1b6b47] px-6 py-7 text-white">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            {icon}
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 leading-6 text-white/80">
              {c.intro}
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          {mode === "register" && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.name}
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
              />
            </label>
          )}
          {mode === "register" && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.providerType}
              <select
                value={providerType}
                onChange={e =>
                  setProviderType(e.target.value as typeof providerType)
                }
                className="rounded-xl border border-[#cfddd2] bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
              >
                {(
                  Object.keys(providerOptions[lang]) as Array<
                    keyof (typeof providerOptions)[typeof lang]
                  >
                ).map(option => (
                  <option key={option} value={option}>
                    {providerOptions[lang][option]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {["login", "register", "activate", "reset-request"].includes(
            mode
          ) && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.email}
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
              />
            </label>
          )}
          {["login", "register", "activate", "reset"].includes(mode) && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {mode === "reset" ? c.newPassword : c.password}
              <div className="relative">
                <input
                  required
                  type={mode === "reset" && showPassword ? "text" : "password"}
                  minLength={10}
                  autoComplete={
                    mode === "reset"
                      ? "new-password"
                      : mode === "login"
                        ? "current-password"
                        : "new-password"
                  }
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#cfddd2] px-3 py-2.5 pe-11 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
                />
                {mode === "reset" && (
                  <button
                    type="button"
                    aria-label={showPassword ? c.hidePassword : c.showPassword}
                    title={showPassword ? c.hidePassword : c.showPassword}
                    onClick={() => setShowPassword(value => !value)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#4f765f] transition hover:bg-[#eaf4ed] focus:outline-none focus:ring-2 focus:ring-[#2c8b62]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
              <span className="text-xs font-normal text-[#6a786e]">
                {c.passwordHint}
              </span>
              {mode === "reset" && (
                <div className="mt-2 space-y-1.5" aria-live="polite">
                  <div
                    className="flex gap-1"
                    role="progressbar"
                    aria-label={strengthLabels[lang][passwordStrength]}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuenow={passwordStrength}
                  >
                    {[1, 2, 3, 4, 5].map(level => (
                      <span
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${level <= passwordStrength ? (passwordStrength >= 4 ? "bg-emerald-500" : passwordStrength >= 3 ? "bg-amber-400" : "bg-red-400") : "bg-[#dce8df]"}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-semibold ${passwordStrength >= 4 ? "text-emerald-700" : passwordStrength >= 3 ? "text-amber-700" : "text-red-700"}`}
                  >
                    {strengthLabels[lang][passwordStrength]}
                  </p>
                </div>
              )}
            </label>
          )}
          {mode === "reset" && (
            <label className="mt-3 grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.confirmPassword}
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={10}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  aria-invalid={
                    confirmPassword.length > 0 && password !== confirmPassword
                  }
                  className={`w-full rounded-xl border px-3 py-2.5 pe-11 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62] ${confirmPassword.length > 0 && password !== confirmPassword ? "border-red-400" : "border-[#cfddd2]"}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? c.hidePassword : c.showPassword}
                  title={showPassword ? c.hidePassword : c.showPassword}
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#4f765f] transition hover:bg-[#eaf4ed] focus:outline-none focus:ring-2 focus:ring-[#2c8b62]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p role="alert" className="text-xs font-semibold text-red-700">
                  {c.passwordMismatch}
                </p>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <p
                  role="status"
                  className="text-xs font-semibold text-emerald-700"
                >
                  {c.passwordMatch}
                </p>
              )}
            </label>
          )}
          {["reset", "verify"].includes(mode) && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.token}
              <input
                required
                minLength={32}
                value={token}
                onChange={e => setToken(e.target.value)}
                className="rounded-xl border border-[#cfddd2] px-3 py-2.5 font-mono text-xs font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
              />
              <span className="text-xs font-normal text-[#6a786e]">
                {c.tokenHint}
              </span>
            </label>
          )}
          {mode === "activate" && (
            <label className="grid gap-1.5 text-sm font-bold text-[#315443]">
              {c.secret}
              <div className="relative">
                <KeyRound className="absolute start-3 top-3 h-4 w-4 text-[#4f765f]" />
                <input
                  required
                  type="password"
                  minLength={12}
                  value={bootstrapSecret}
                  onChange={e => setBootstrapSecret(e.target.value)}
                  className="w-full rounded-xl border border-[#cfddd2] py-2.5 ps-10 pe-3 font-normal outline-none focus:ring-2 focus:ring-[#2c8b62]"
                />
              </div>
            </label>
          )}
          {error && (
            <div
              role={feedbackType === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${feedbackType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
            >
              {feedbackType === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#125b40] active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          >
            {pending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {pending
              ? c.working
              : mode === "login"
                ? c.submitLogin
                : mode === "register"
                  ? c.submitRegister
                  : mode === "activate"
                    ? c.submitActivate
                    : mode === "reset-request"
                      ? c.submitResetRequest
                      : mode === "reset"
                        ? c.submitReset
                        : c.submitVerify}
          </button>
          <div className="space-y-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset-request");
                    setError("");
                  }}
                  className="font-bold text-[#176b4d] hover:underline"
                >
                  {c.forgot}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="block w-full font-bold text-[#176b4d] hover:underline"
                >
                  {c.switchRegister}
                </button>
              </>
            )}
            {mode === "register" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-bold text-[#176b4d] hover:underline"
              >
                {c.switchLogin}
              </button>
            )}
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setPassword("");
                  setConfirmPassword("");
                  setShowPassword(false);
                }}
                className="block w-full rounded-xl border border-[#cfe1d4] px-4 py-2.5 font-bold text-[#176b4d] transition hover:-translate-y-0.5 hover:bg-[#f1f8f3] focus:outline-none focus:ring-2 focus:ring-[#2c8b62]"
              >
                {c.back}
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
