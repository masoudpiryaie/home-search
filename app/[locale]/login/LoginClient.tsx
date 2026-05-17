"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/app/context/AuthContext";
import { getDictionary, type Locale } from "@/app/lib/i18n";

type AuthMode = "login" | "register" | "reset";

type LoginClientProps = {
  locale: Locale;
};

export default function LoginClient({ locale }: LoginClientProps) {
  const router = useRouter();
  const t = getDictionary(locale);
  const labels = getLabels(locale);
  const isRtl = locale === "fa";

  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "email" | "google" | "reset" | null
  >(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isRegister = mode === "register";
  const isReset = mode === "reset";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setLoadingProvider(isReset ? "reset" : "email");

    try {
      if (isReset) {
        await resetPassword(email);
        setSuccessMessage(labels.resetEmailSent);
        setLoadingProvider(null);
        return;
      }

      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }

      router.push(`/${locale}/submit-property`);
    } catch (error) {
      console.error(error);
      setErrorMessage(getAuthErrorMessage(error, mode, locale));
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleGoogleLogin() {
    setErrorMessage("");
    setSuccessMessage("");
    setLoadingProvider("google");

    try {
      await loginWithGoogle();
      router.push(`/${locale}/submit-property`);
    } catch (error) {
      console.error(error);
      setErrorMessage(getAuthErrorMessage(error, mode, locale));
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--color-bg)] px-3 py-5 md:px-5 md:py-7"
    >
      <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-[1180px] items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-shell)] lg:block">
          <div className="relative flex h-[660px] flex-col justify-between overflow-hidden bg-[var(--color-primary)] p-9 text-white">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-6 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-[var(--color-primary)] shadow-lg">
                <Home size={26} />
              </div>

              <h1 className="mt-9 max-w-md text-[52px] font-black leading-[1.05] tracking-[-0.055em]">
                {isReset
                  ? labels.sideResetTitle
                  : isRegister
                    ? labels.sideRegisterTitle
                    : labels.sideLoginTitle}
              </h1>

              <p className="mt-5 max-w-md text-base font-medium leading-8 text-white/75">
                {labels.sideText}
              </p>
            </div>

            <div className="relative rounded-[28px] border border-white/10 bg-white/15 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)]">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    {t.common.siteName}
                  </p>

                  <p className="mt-1 text-sm font-medium leading-6 text-white/70">
                    {t.auth.emailOrGoogle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link
            href={`/${locale}`}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
          >
            <Home size={17} />
            {t.nav.home}
          </Link>

          <div className="rounded-[30px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-shell)] md:rounded-[34px] md:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[var(--color-primary)]">
                {isReset
                  ? t.auth.resetPassword
                  : isRegister
                    ? t.auth.createAccount
                    : t.auth.welcomeBack}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--color-text)] md:text-4xl">
                {isReset
                  ? t.auth.resetPassword
                  : isRegister
                    ? t.auth.signUp
                    : t.auth.login}
              </h1>

              <p className="mt-3 text-sm font-medium leading-6 text-[var(--color-muted)]">
                {isReset
                  ? t.auth.resetSubtitle
                  : isRegister
                    ? t.auth.registerSubtitle
                    : t.auth.loginSubtitle}
              </p>
            </div>

            {!isReset && (
              <>
                <div className="mt-6 grid grid-cols-2 rounded-[20px] bg-[var(--color-surface-soft)] p-1 ring-1 ring-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className={`rounded-[16px] px-4 py-3 text-sm font-black transition ${
                      mode === "login"
                        ? "bg-white text-[var(--color-text)] shadow-sm"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {t.auth.login}
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className={`rounded-[16px] px-4 py-3 text-sm font-black transition ${
                      mode === "register"
                        ? "bg-white text-[var(--color-text)] shadow-sm"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {t.auth.signUp}
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loadingProvider !== null}
                    className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-[var(--color-border)] bg-white px-5 py-4 text-sm font-black text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-surface-soft)] disabled:opacity-50"
                  >
                    <GoogleIcon />
                    {loadingProvider === "google"
                      ? labels.connecting
                      : t.auth.continueWithGoogle}
                  </button>
                </div>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-xs font-black text-[var(--color-muted)]">
                    {labels.or}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
              </>
            )}

            {isReset && (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-black text-[var(--color-primary)]"
              >
                <ArrowLeft size={16} />
                {t.auth.backToLogin}
              </button>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--color-text)]">
                    {t.auth.name}
                  </label>

                  <div className="flex items-center gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
                    <User size={18} className="text-[var(--color-muted)]" />

                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={labels.namePlaceholder}
                      required={isRegister}
                      className="w-full bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-black text-[var(--color-text)]">
                  {t.auth.email}
                </label>

                <div className="flex items-center gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
                  <Mail size={18} className="text-[var(--color-muted)]" />

                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="name@email.com"
                    required
                    className="w-full bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {!isReset && (
                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--color-text)]">
                    {t.auth.password}
                  </label>

                  <div className="flex items-center gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
                    <Lock size={18} className="text-[var(--color-muted)]" />

                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        isRegister
                          ? labels.passwordRegisterPlaceholder
                          : labels.passwordPlaceholder
                      }
                      required={!isReset}
                      minLength={6}
                      className="w-full bg-transparent text-sm font-semibold text-[var(--color-text)] placeholder:text-gray-400 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => changeMode("reset")}
                      className="mt-3 text-sm font-black text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-[18px] bg-green-50 px-4 py-3 text-sm font-bold leading-6 text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                disabled={loadingProvider !== null}
                className="w-full rounded-[18px] bg-[var(--color-primary)] px-5 py-4 text-sm font-black text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
              >
                {loadingProvider === "email" || loadingProvider === "reset"
                  ? isReset
                    ? labels.sendingReset
                    : isRegister
                      ? labels.creatingAccount
                      : labels.loggingIn
                  : isReset
                    ? t.auth.sendResetLink
                    : isRegister
                      ? t.auth.createAccount
                      : t.auth.login}
              </button>
            </form>

            {!isReset && (
              <p className="mt-5 text-center text-xs font-medium leading-5 text-[var(--color-muted)]">
                {labels.helpText}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-[var(--color-text)] ring-1 ring-[var(--color-border)]">
      G
    </span>
  );
}

function getLabels(locale: Locale) {
  if (locale === "fa") {
    return {
      sideLoginTitle: "به پلتفرم خانه خوش برگشتی.",
      sideRegisterTitle: "حساب بساز و آگهی ملک ثبت کن.",
      sideResetTitle: "رمز عبور خود را ساده بازیابی کن.",
      sideText:
        "با ایمیل و رمز عبور یا گوگل وارد شو. اگر رمز عبور را فراموش کردی، لینک بازیابی برایت ارسال می‌شود.",
      namePlaceholder: "نام شما",
      passwordPlaceholder: "رمز عبور",
      passwordRegisterPlaceholder: "حداقل ۶ کاراکتر",
      connecting: "در حال اتصال...",
      or: "یا",
      resetEmailSent:
        "ایمیل بازیابی رمز عبور ارسال شد. لطفاً inbox خود را چک کن.",
      sendingReset: "در حال ارسال لینک...",
      creatingAccount: "در حال ساخت حساب...",
      loggingIn: "در حال ورود...",
      helpText:
        "اگر قبلاً با گوگل ثبت‌نام کرده‌ای، از ورود با گوگل استفاده کن. اگر با ایمیل و رمز عبور ثبت‌نام کرده‌ای، می‌توانی رمز را بازیابی کنی.",
    };
  }

  if (locale === "de") {
    return {
      sideLoginTitle: "Willkommen zurück auf deiner Immobilienplattform.",
      sideRegisterTitle: "Erstelle ein Konto und gib deine Anzeige auf.",
      sideResetTitle: "Setze dein Passwort einfach zurück.",
      sideText:
        "Melde dich mit E-Mail und Passwort oder mit Google an. Wenn du dein Passwort vergessen hast, senden wir dir einen Reset-Link.",
      namePlaceholder: "Dein Name",
      passwordPlaceholder: "Dein Passwort",
      passwordRegisterPlaceholder: "Mindestens 6 Zeichen",
      connecting: "Verbindung...",
      or: "ODER",
      resetEmailSent:
        "E-Mail zum Zurücksetzen wurde gesendet. Bitte prüfe dein Postfach.",
      sendingReset: "Reset-Link wird gesendet...",
      creatingAccount: "Konto wird erstellt...",
      loggingIn: "Login läuft...",
      helpText:
        "Wenn du dein Konto mit Google erstellt hast, nutze Google Login. Wenn du E-Mail und Passwort genutzt hast, kannst du dein Passwort zurücksetzen.",
    };
  }

  return {
    sideLoginTitle: "Welcome back to your property platform.",
    sideRegisterTitle: "Create your account and submit your property.",
    sideResetTitle: "Reset your password easily.",
    sideText:
      "Use email and password or continue with Google. If you forgot your password, we will send a reset link to your email.",
    namePlaceholder: "Your name",
    passwordPlaceholder: "Your password",
    passwordRegisterPlaceholder: "At least 6 characters",
    connecting: "Connecting...",
    or: "OR",
    resetEmailSent: "Password reset email sent. Please check your inbox.",
    sendingReset: "Sending reset email...",
    creatingAccount: "Creating account...",
    loggingIn: "Logging in...",
    helpText:
      "If you created your account with Google, use Google login. If you created it with email and password, you can reset your password here.",
  };
}

function getAuthErrorMessage(error: unknown, mode: AuthMode, locale: Locale) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  const messages = {
    en: {
      emailAlready:
        "This email is already registered. Please login instead, or use password reset.",
      invalidCredential:
        "Email or password is not correct. If you used Google before, please use Continue with Google. If you forgot your password, use password reset.",
      wrongPassword:
        "Password is not correct. You can reset your password using Forgot password.",
      userNotFound:
        "No account was found with this email. Please sign up first.",
      weakPassword: "Password is too weak. Please use at least 6 characters.",
      popupClosed: "The Google sign-in popup was closed.",
      differentCredential:
        "This email already exists with another sign-in method. Please use the original method, or reset your password if you used email/password before.",
      operationNotAllowed: "This sign-in method is not enabled in Firebase.",
      tooMany: "Too many attempts. Please wait a bit and try again.",
      resetFailed:
        "Could not send reset email. Please check the email address.",
      fallback: "Authentication failed. Please try again.",
    },
    fa: {
      emailAlready:
        "این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید یا از بازیابی رمز عبور استفاده کنید.",
      invalidCredential:
        "ایمیل یا رمز عبور درست نیست. اگر قبلاً با گوگل وارد شده‌ای، از دکمه ورود با گوگل استفاده کن. اگر رمز را فراموش کردی، بازیابی رمز عبور را بزن.",
      wrongPassword:
        "رمز عبور درست نیست. می‌توانی از گزینه بازیابی رمز عبور استفاده کنی.",
      userNotFound: "حسابی با این ایمیل پیدا نشد. لطفاً ثبت‌نام کن.",
      weakPassword: "رمز عبور ضعیف است. حداقل از ۶ کاراکتر استفاده کن.",
      popupClosed: "پنجره ورود با گوگل بسته شد.",
      differentCredential:
        "این ایمیل با روش ورود دیگری ثبت شده است. لطفاً از همان روش استفاده کن یا اگر با ایمیل ثبت‌نام کرده‌ای، رمز را بازیابی کن.",
      operationNotAllowed: "این روش ورود در Firebase فعال نشده است.",
      tooMany: "تلاش‌های زیادی انجام شده. کمی صبر کن و دوباره امتحان کن.",
      resetFailed: "امکان ارسال ایمیل بازیابی وجود ندارد. ایمیل را بررسی کن.",
      fallback: "ورود ناموفق بود. لطفاً دوباره امتحان کن.",
    },
    de: {
      emailAlready:
        "Diese E-Mail ist bereits registriert. Bitte logge dich ein oder setze dein Passwort zurück.",
      invalidCredential:
        "E-Mail oder Passwort ist nicht korrekt. Wenn du vorher Google genutzt hast, nutze bitte Google Login. Wenn du dein Passwort vergessen hast, setze es zurück.",
      wrongPassword:
        "Das Passwort ist nicht korrekt. Du kannst dein Passwort zurücksetzen.",
      userNotFound:
        "Es wurde kein Konto mit dieser E-Mail gefunden. Bitte registriere dich zuerst.",
      weakPassword:
        "Das Passwort ist zu schwach. Bitte nutze mindestens 6 Zeichen.",
      popupClosed: "Das Google Login-Fenster wurde geschlossen.",
      differentCredential:
        "Diese E-Mail existiert bereits mit einer anderen Login-Methode. Bitte nutze die ursprüngliche Methode oder setze dein Passwort zurück.",
      operationNotAllowed:
        "Diese Login-Methode ist in Firebase nicht aktiviert.",
      tooMany: "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
      resetFailed:
        "Reset-E-Mail konnte nicht gesendet werden. Bitte prüfe die E-Mail-Adresse.",
      fallback: "Authentifizierung fehlgeschlagen. Bitte versuche es erneut.",
    },
  };

  const m = messages[locale];

  if (code === "auth/email-already-in-use") return m.emailAlready;
  if (code === "auth/invalid-credential") return m.invalidCredential;
  if (code === "auth/wrong-password") return m.wrongPassword;
  if (code === "auth/user-not-found") return m.userNotFound;
  if (code === "auth/weak-password") return m.weakPassword;
  if (code === "auth/popup-closed-by-user") return m.popupClosed;
  if (code === "auth/account-exists-with-different-credential") {
    return m.differentCredential;
  }
  if (code === "auth/operation-not-allowed") return m.operationNotAllowed;
  if (code === "auth/too-many-requests") return m.tooMany;

  if (mode === "reset") return m.resetFailed;

  return m.fallback;
}
