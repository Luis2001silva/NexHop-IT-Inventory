import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPT = language === 'pt';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success(
          isPT
            ? 'Login efetuado com sucesso!'
            : 'Login successful!'
        );

        navigate('/dashboard', { replace: true });
      } else {
        toast.error(
          isPT
            ? 'Email ou palavra-passe inválidos.'
            : 'Invalid email or password.'
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? 'Erro ao iniciar sessão.'
          : 'Unable to sign in.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoft = () => {
    toast.info(
      isPT
        ? 'Login com Microsoft será configurado brevemente.'
        : 'Microsoft login will be configured soon.'
    );
  };

  const handleGoogle = () => {
    toast.info(
      isPT
        ? 'Login com Google será configurado brevemente.'
        : 'Google login will be configured soon.'
    );
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#080D1F] text-white"
    >

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div
        className="pointer-events-none absolute left-[4%] top-[11%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.035] blur-[80px]"
      />

      <div
        className="pointer-events-none absolute left-[14%] top-[28%] h-[160px] w-[160px] rounded-full bg-blue-600/[0.12] blur-[65px]"
      />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10"
      >

        <div
          className="grid w-full max-w-[1050px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_420px] lg:gap-20"
        >

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="hidden lg:block">

            {/* GLOW CIRCLE */}

            <div
              className="relative mb-8 h-[420px] w-[420px] rounded-full bg-[#0A1021]"
            >

              <div
                className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.20] blur-[70px]"
              />

              <div
                className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.12] blur-[35px]"
              />

            </div>


            {/* TEXT */}

            <div className="max-w-[500px]">

              <div
                className="mb-4 text-sm font-medium text-white"
              >
                NexHop
              </div>

              <h1
                className="text-4xl font-bold leading-[1.08] tracking-tight xl:text-5xl"
              >
                {isPT ? (
                  <>
                    Operações IT, com
                    <br />
                    total controlo.
                  </>
                ) : (
                  <>
                    IT operations, under
                    <br />
                    total control.
                  </>
                )}
              </h1>

              <p
                className="mt-5 max-w-[470px] text-sm leading-6 text-blue-200/65"
              >
                {isPT
                  ? 'Visibilidade sobre equipamentos, pessoas e processos numa só plataforma segura.'
                  : 'Visibility across equipment, people and processes in one secure platform.'}
              </p>


              {/* STATUS */}

              <div
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.06] px-3 py-1.5 text-[10px] font-medium text-blue-300"
              >

                <span
                  className="h-1.5 w-1.5 rounded-full bg-blue-400"
                />

                {isPT
                  ? 'Ambiente operacional protegido'
                  : 'Protected operational environment'}

              </div>

            </div>

          </section>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <section>

            <div
              className="rounded-2xl border border-white/[0.08] bg-[#101726] p-7 shadow-2xl shadow-black/20"
            >

              {/* TITLE */}

              <div className="mb-6">

                <div
                  className="mb-2 text-sm font-semibold text-blue-400"
                >
                  NexHop
                </div>

                <h2
                  className="text-3xl font-bold leading-tight tracking-tight"
                >
                  {isPT
                    ? 'Entrar na plataforma'
                    : 'Enter the platform'}
                </h2>

                <p
                  className="mt-2 text-sm leading-5 text-white/45"
                >
                  {isPT
                    ? 'Aceda à gestão de equipamentos e operações IT'
                    : 'Access equipment management and IT operations'}
                </p>

              </div>


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-semibold text-white/80"
                  >
                    {isPT
                      ? 'Email profissional'
                      : 'Professional email'}
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder={
                      isPT
                        ? 'nome@empresa.pt'
                        : 'name@company.com'
                    }
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-[11px] font-semibold text-white/80"
                  >
                    {isPT
                      ? 'Palavra-passe'
                      : 'Password'}
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder={
                        isPT
                          ? 'Introduza a sua palavra-passe'
                          : 'Enter your password'
                      }
                      required
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0B1120] px-3.5 pr-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center text-white/35 transition hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>


                {/* OPTIONS */}

                <div
                  className="flex items-center justify-between gap-3"
                >

                  <label
                    htmlFor="remember"
                    className="flex cursor-pointer items-center gap-2 text-[10px] text-white/50"
                  >

                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-[#0B1120] accent-blue-600"
                    />

                    {isPT
                      ? 'Lembrar-me'
                      : 'Remember me'}

                  </label>


                  {/* FORGOT PASSWORD */}

                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    {isPT
                      ? 'Esqueceu-se da palavra-passe?'
                      : 'Forgot your password?'}
                  </Link>

                </div>


                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isSubmitting
                    ? (
                      isPT
                        ? 'A entrar...'
                        : 'Signing in...'
                    )
                    : (
                      <>
                        {isPT
                          ? 'Entrar'
                          : 'Sign in'}

                        <ArrowRight size={15} />
                      </>
                    )}

                </button>

              </form>


              {/* DIVIDER */}

              <div
                className="my-5 flex items-center gap-3"
              >

                <div className="h-px flex-1 bg-white/[0.06]" />

                <span
                  className="text-[10px] text-white/35"
                >
                  {isPT
                    ? 'ou continue com'
                    : 'or continue with'}
                </span>

                <div className="h-px flex-1 bg-white/[0.06]" />

              </div>


              {/* MICROSOFT */}

              <button
                type="button"
                onClick={handleMicrosoft}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-transparent text-xs font-semibold text-white/80 transition hover:bg-white/[0.035] hover:text-white"
              >

                <div
                  className="grid grid-cols-2 gap-[1px]"
                >
                  <span className="h-[6px] w-[6px] bg-white" />
                  <span className="h-[6px] w-[6px] bg-white/80" />
                  <span className="h-[6px] w-[6px] bg-white/80" />
                  <span className="h-[6px] w-[6px] bg-white" />
                </div>

                {isPT
                  ? 'Entrar com Microsoft'
                  : 'Sign in with Microsoft'}

              </button>


              {/* GOOGLE */}

              <button
                type="button"
                onClick={handleGoogle}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-transparent text-xs font-semibold text-white/80 transition hover:bg-white/[0.035] hover:text-white"
              >

                <span
                  className="text-base font-bold"
                >
                  G
                </span>

                {isPT
                  ? 'Entrar com Google'
                  : 'Sign in with Google'}

              </button>


              {/* CREATE ACCOUNT */}

              <Link
                to="/create-account"
                className="mt-5 block w-full text-center text-[10px] font-medium text-blue-400 transition hover:text-blue-300"
              >
                {isPT
                  ? 'Ainda não tem conta? Criar conta'
                  : "Don't have an account? Create account"}
              </Link>


              {/* SECURITY */}

              <div
                className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/40"
              >

                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />

                {isPT
                  ? 'Ligação segura e encriptada'
                  : 'Secure and encrypted connection'}

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default LoginForm;