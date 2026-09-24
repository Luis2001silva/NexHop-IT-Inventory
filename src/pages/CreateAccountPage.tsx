import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Monitor } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const CreateAccountPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isPT = language === "pt";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (password !== confirmPassword) {
      toast.error(
        isPT ? "As palavras-passe não coincidem." : "Passwords do not match.",
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        isPT
          ? "A palavra-passe deve ter pelo menos 6 caracteres."
          : "Password must contain at least 6 characters.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success(
          isPT ? "Conta criada com sucesso!" : "Account created successfully!",
        );

        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Não foi possível criar a conta."
          : "Unable to create the account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080D1F] text-white">
      {/* BACKGROUND GLOW */}

      <div
        className="pointer-events-none absolute left-[8%] top-[12%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.04] blur-[100px]"
      />

      <div
        className="pointer-events-none absolute right-[8%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-blue-600/[0.035] blur-[90px]"
      />

      {/* HEADER */}

      <header
        className="relative z-10 flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6 lg:px-10"
      >
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600"
          >
            <Monitor size={19} />
          </div>

          <div>
            <div className="text-[15px] font-semibold leading-none">nexthop</div>

            <div
              className="mt-1 text-[9px] tracking-[0.12em] text-white/35"
            >
              IT OPERATIONS
            </div>
          </div>
        </Link>
      </header>

      {/* MAIN */}

      <main
        className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-[440px]">
          {/* TITLE */}

          <div className="mb-7 text-center">
            <h1
              className="text-3xl font-bold tracking-tight"
            >
              {isPT ? "Criar conta" : "Create account"}
            </h1>

            <p
              className="mt-2 text-xs leading-5 text-white/40"
            >
              {isPT
                ? "Crie a sua conta para começar a utilizar o nexthop."
                : "Create your account to start using nexthop."}
            </p>
          </div>

          {/* CARD */}

          <div
            className="rounded-2xl border border-white/[0.08] bg-[#101726] p-7 shadow-2xl shadow-black/20"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[11px] font-semibold text-white/75"
                >
                  {isPT ? "Nome completo" : "Full name"}
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isPT ? "Nome completo" : "Full name"}
                  required
                  autoComplete="name"
                  className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-semibold text-white/75"
                >
                  {isPT ? "Email profissional" : "Professional email"}
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isPT ? "nome@empresa.pt" : "name@company.com"}
                  required
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold text-white/75"
                >
                  {isPT ? "Palavra-passe" : "Password"}
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isPT ? "Mínimo de 6 caracteres" : "Minimum 6 characters"
                    }
                    required
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 pr-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center text-white/35 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[11px] font-semibold text-white/75"
                >
                  {isPT ? "Confirmar palavra-passe" : "Confirm password"}
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      isPT ? "Repita a palavra-passe" : "Repeat your password"
                    }
                    required
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 pr-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center text-white/35 hover:text-white/70"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  isPT ? (
                    "A criar conta..."
                  ) : (
                    "Creating account..."
                  )
                ) : (
                  <>
                    {isPT ? "Criar conta" : "Create account"}

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}

            <div
              className="mt-6 border-t border-white/[0.06] pt-5 text-center"
            >
              <p className="text-[10px] text-white/35">
                {isPT ? "Já tem uma conta?" : "Already have an account?"}{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 transition hover:text-blue-300"
                >
                  {isPT ? "Entrar" : "Sign in"}
                </Link>
              </p>
            </div>
          </div>

          {/* BACK */}

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] text-white/30 transition hover:text-white/60"
            >
              <ArrowLeft size={12} />

              {isPT ? "Voltar ao login" : "Back to login"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAccountPage;
