import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Monitor } from 'lucide-react';
import { toast } from 'sonner';

import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordPage = () => {
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const isPT = language === 'pt';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(
          isPT
            ? 'Não foi possível enviar o email de recuperação.'
            : 'Unable to send the recovery email.'
        );

        return;
      }

      setSent(true);

      toast.success(
        isPT
          ? 'Email de recuperação enviado!'
          : 'Recovery email sent!'
      );
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? 'Ocorreu um erro. Tente novamente.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1F] text-white">

      {/* HEADER */}

      <header
        className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6 lg:px-10"
      >

        {/* LOGO */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600"
          >
            <Monitor
              size={19}
              className="text-white"
            />
          </div>

          <div>
            <div
              className="font-semibold text-[15px] leading-none"
            >
              NexHop
            </div>

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
        className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-6 py-16"
      >

        {/* GLOW */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.06] blur-[120px]"
        />


        {/* CARD */}

        <div
          className="relative z-10 w-full max-w-[420px]"
        >

          {!sent ? (

            <>
              {/* TITLE */}

              <div className="mb-8 text-center">

                <div
                  className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400"
                >
                  <Mail size={21} />
                </div>

                <h1
                  className="text-2xl font-semibold tracking-tight"
                >
                  {isPT
                    ? 'Recuperar palavra-passe'
                    : 'Reset your password'}
                </h1>

                <p
                  className="mx-auto mt-2 max-w-[340px] text-xs leading-5 text-white/40"
                >
                  {isPT
                    ? 'Introduza o seu email profissional e enviaremos um link para criar uma nova palavra-passe.'
                    : 'Enter your professional email and we will send you a link to create a new password.'}
                </p>

              </div>


              {/* FORM CARD */}

              <div
                className="rounded-2xl border border-white/[0.07] bg-[#101726] p-6 shadow-2xl shadow-black/20"
              >

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-[11px] font-semibold text-white/70"
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
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0B1120] px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isSubmitting ? (
                      isPT
                        ? 'A enviar...'
                        : 'Sending...'
                    ) : (
                      <>
                        {isPT
                          ? 'Enviar link de recuperação'
                          : 'Send recovery link'}

                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </>
                    )}

                  </button>

                </form>

              </div>
            </>

          ) : (

            /* SUCCESS */

            <div
              className="rounded-2xl border border-white/[0.07] bg-[#101726] p-8 text-center shadow-2xl shadow-black/20"
            >

              <div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
              >
                <CheckCircle2 size={23} />
              </div>

              <h1
                className="text-2xl font-semibold"
              >
                {isPT
                  ? 'Verifique o seu email'
                  : 'Check your email'}
              </h1>

              <p
                className="mt-3 text-xs leading-5 text-white/40"
              >
                {isPT
                  ? 'Enviámos um link de recuperação para'
                  : 'We sent a recovery link to'}
              </p>

              <p
                className="mt-1 break-all text-sm font-medium text-white/75"
              >
                {email}
              </p>

              <p
                className="mt-4 text-[10px] leading-5 text-white/30"
              >
                {isPT
                  ? 'Verifique também a pasta de spam ou correio não solicitado.'
                  : 'Also check your spam or junk folder.'}
              </p>

            </div>

          )}


          {/* BACK TO LOGIN */}

          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] font-medium text-white/35 transition hover:text-white/70"
            >
              <ArrowLeft size={12} />

              {isPT
                ? 'Voltar ao login'
                : 'Back to login'}
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
};

export default ForgotPasswordPage;