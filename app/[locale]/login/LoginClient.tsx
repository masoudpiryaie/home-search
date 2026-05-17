"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Home, Lock, Mail, User } from "lucide-react";
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
        setSuccessMessage(getLabels(locale).resetEmailSent);
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

  const labels = getLabels(locale);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-120px)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="hidden overflow-hidden rounded-[2.5rem] bg-black p-8 text-white shadow-xl lg:block">
          <div className="flex h-[620px] flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                <Home size={24} />
              </div>

              <h1 className="mt-8 max-w-md text-5xl font-black leading-tight tracking-tight">
                {isReset
                  ? labels.sideResetTitle
                  : isRegister
                    ? labels.sideRegisterTitle
                    : labels.sideLoginTitle}
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/60">
                {labels.sideText}
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">
                {locale === "fa"
                  ? "دسترسی ساده"
                  : locale === "de"
                    ? "Einfacher Zugang"
                    : "Simple access"}
              </p>

              <p className="mt-2 text-xl font-bold">{t.auth.emailOrGoogle}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
          >
            <Home size={17} />
            {t.nav.home}
          </Link>

          <div className="rounded-[2.3rem] bg-white p-6 shadow-xl shadow-black/5 md:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#9a7a3d]">
                {isReset
                  ? t.auth.resetPassword
                  : isRegister
                    ? t.auth.createAccount
                    : t.auth.welcomeBack}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                {isReset
                  ? t.auth.resetPassword
                  : isRegister
                    ? t.auth.signUp
                    : t.auth.login}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {isReset
                  ? t.auth.resetSubtitle
                  : isRegister
                    ? t.auth.registerSubtitle
                    : t.auth.loginSubtitle}
              </p>
            </div>

            {!isReset && (
              <>
                <div className="mt-6 grid grid-cols-2 rounded-2xl bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      mode === "login"
                        ? "bg-white text-gray-950 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {t.auth.login}
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      mode === "register"
                        ? "bg-white text-gray-950 shadow-sm"
                        : "text-gray-500"
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
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-black text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <GoogleIcon />
                    {loadingProvider === "google"
                      ? labels.connecting
                      : t.auth.continueWithGoogle}
                  </button>
                </div>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs font-bold text-gray-400">
                    {labels.or}
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
              </>
            )}

            {isReset && (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700"
              >
                <ArrowLeft size={16} />
                {t.auth.backToLogin}
              </button>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t.auth.name}
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                    <User size={18} className="text-gray-400" />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={labels.namePlaceholder}
                      required={isRegister}
                      className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t.auth.email}
                </label>

                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                  <Mail size={18} className="text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {!isReset && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t.auth.password}
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                    <Lock size={18} className="text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={
                        isRegister
                          ? labels.passwordRegisterPlaceholder
                          : labels.passwordPlaceholder
                      }
                      required={!isReset}
                      minLength={6}
                      className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => changeMode("reset")}
                      className="mt-3 text-sm font-bold text-gray-700 hover:text-black"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold leading-6 text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                disabled={loadingProvider !== null}
                className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
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
              <p className="mt-5 text-center text-xs leading-5 text-gray-400">
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
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-gray-900">
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
