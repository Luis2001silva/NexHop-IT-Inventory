import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isPT = language === 'pt';

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = isPT
        ? 'O email é obrigatório.'
        : 'Email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      newErrors.email = isPT
        ? 'Introduza um email válido.'
        : 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = isPT
        ? 'A palavra-passe é obrigatória.'
        : 'Password is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const isValid = validateForm();

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const success = await login(
        email.trim(),
        password
      );

      if (success) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single();

        toast.success(
          isPT
            ? 'Login efetuado com sucesso!'
            : 'Login successful!'
        );

        if (profile?.role === 'user') {
          navigate('/portal', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
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

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: undefined,
      }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050A17] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            left-[-12%]
            top-[25%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-blue-600/[0.08]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            right-[-10%]
            top-[-10%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-blue-500/[0.07]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-[-15%]
            left-[30%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-600/[0.05]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            left-[-18%]
            top-[8%]
            h-[700px]
            w-[1000px]
            rounded-[50%]
            border
            border-blue-500/[0.12]
          "
        />

        <div
          className="
            absolute
            left-[-25%]
            top-[17%]
            h-[650px]
            w-[950px]
            rounded-[50%]
            border
            border-blue-400/[0.07]
          "
        />

        <div
          className="
            absolute
            right-[-22%]
            top-[-5%]
            h-[750px]
            w-[1050px]
            rounded-[50%]
            border
            border-blue-500/[0.10]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />

      </div>


      {/* =====================================================
          SIDE TEXT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-8
          top-1/2
          hidden
          -translate-y-1/2
          xl:block
        "
      >
        <div className="mb-5 h-px w-12 bg-blue-400/70" />

        <div className="space-y-3 text-[10px] font-medium tracking-[0.28em] text-blue-300/55">
          <div>PEOPLE</div>
          <div>EQUIPMENT</div>
          <div>SUPPORT</div>
          <div>ALWAYS CONNECTED</div>
        </div>
      </div>


      <div
        className="
          pointer-events-none
          absolute
          bottom-12
          left-8
          hidden
          xl:block
        "
      >
        <div className="space-y-1 text-[10px] tracking-[0.28em] text-blue-300/45">
          <div>GUIMARÃES</div>
          <div>PORTUGAL</div>
        </div>

        <div className="mt-4 h-px w-8 bg-blue-400/70" />
      </div>


      <div
        className="
          pointer-events-none
          absolute
          right-8
          top-1/2
          hidden
          -translate-y-1/2
          xl:block
        "
      >
        <div className="mb-5 h-px w-8 bg-blue-400/70" />

        <div className="max-w-[130px] space-y-2 text-[10px] font-medium leading-6 tracking-[0.28em] text-blue-300/45">
          <div>TECHNOLOGY</div>
          <div>FOR A BETTER</div>
          <div>TOMORROW</div>
        </div>
      </div>


      <div
        className="
          pointer-events-none
          absolute
          bottom-12
          right-8
          hidden
          xl:block
          text-[10px]
          tracking-[0.28em]
          text-blue-300/45
        "
      >
        NEXHOP.PT

        <div className="mt-4 ml-auto h-px w-8 bg-blue-400/70" />
      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">

        <section className="w-full max-w-[620px]">

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-blue-400/30
              bg-[#091120]/90
              p-7
              shadow-[0_0_80px_rgba(37,99,235,0.10)]
              backdrop-blur-xl
              sm:p-10
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-[2px]
                w-[55%]
                -translate-x-1/2
                bg-blue-400
                shadow-[0_0_25px_rgba(59,130,246,0.9)]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-[-100px]
                h-[220px]
                w-[220px]
                -translate-x-1/2
                rounded-full
                bg-blue-500/[0.08]
                blur-[70px]
              "
            />


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="relative mb-8 flex flex-col items-center">

              <div
                className="
                  relative
                  mb-3
                  flex
                  h-[64px]
                  w-[64px]
                  items-center
                  justify-center
                "
              >

                <div
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    bg-blue-500/[0.10]
                    blur-xl
                  "
                />

                <div
                  className="
                    relative
                    flex
                    h-[60px]
                    w-[60px]
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-400/20
                    bg-[#0B1629]
                    shadow-[0_0_30px_rgba(37,99,235,0.12)]
                  "
                >
                  <span
                    className="
                      bg-gradient-to-br
                      from-sky-300
                      via-blue-500
                      to-blue-700
                      bg-clip-text
                      text-[40px]
                      font-black
                      leading-none
                      tracking-[-0.12em]
                      text-transparent
                    "
                  >
                    N
                  </span>
                </div>

              </div>

              <div
                className="
                  text-[28px]
                  font-bold
                  tracking-[-0.04em]
                  text-white
                "
              >
                NexHop
              </div>

              <div
                className="
                  mt-1
                  text-[10px]
                  font-medium
                  tracking-[0.30em]
                  text-blue-300/70
                "
              >
                IT INVENTORY
              </div>

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="relative mb-8 text-center">

              <h1
                className="
                  text-[28px]
                  font-semibold
                  tracking-[-0.025em]
                  text-white
                  sm:text-[30px]
                "
              >
                {isPT
                  ? 'Bem-vindo de volta'
                  : 'Welcome back'}
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  text-blue-200/60
                "
              >
                {isPT
                  ? 'Inicia sessão para aceder ao sistema'
                  : 'Sign in to access the system'}
              </p>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-white/80
                  "
                >
                  {isPT
                    ? 'Email profissional'
                    : 'Professional email'}
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-blue-200/65
                    "
                  />

                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    value={email}
                    onChange={(e) =>
                      handleEmailChange(
                        e.target.value
                      )
                    }
                    placeholder={
                      isPT
                        ? 'nome@empresa.pt'
                        : 'name@company.com'
                    }
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email
                        ? 'email-error'
                        : undefined
                    }
                    className={`
                      h-14
                      w-full
                      rounded-xl
                      border
                      bg-[#081120]
                      pl-12
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-blue-100/30
                      hover:border-blue-300/30
                      focus:ring-2
                      focus:ring-blue-500/10
                      ${
                        errors.email
                          ? 'border-red-500/60 focus:border-red-500/70'
                          : 'border-blue-300/20 focus:border-blue-400/60'
                      }
                    `}
                  />

                </div>

                {errors.email && (
                  <p
                    id="email-error"
                    className="
                      mt-2
                      text-xs
                      font-medium
                      text-red-400
                    "
                  >
                    {errors.email}
                  </p>
                )}

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-white/80
                  "
                >
                  {isPT
                    ? 'Palavra-passe'
                    : 'Password'}
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-blue-200/65
                    "
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      handlePasswordChange(
                        e.target.value
                      )
                    }
                    placeholder={
                      isPT
                        ? 'Introduza a sua palavra-passe'
                        : 'Enter your password'
                    }
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password
                        ? 'password-error'
                        : undefined
                    }
                    className={`
                      h-14
                      w-full
                      rounded-xl
                      border
                      bg-[#081120]
                      pl-12
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-blue-100/30
                      hover:border-blue-300/30
                      focus:ring-2
                      focus:ring-blue-500/10
                      ${
                        errors.password
                          ? 'border-red-500/60 focus:border-red-500/70'
                          : 'border-blue-300/20 focus:border-blue-400/60'
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Ocultar palavra-passe'
                        : 'Mostrar palavra-passe'
                    }
                    className="
                      absolute
                      right-0
                      top-0
                      flex
                      h-14
                      w-12
                      items-center
                      justify-center
                      text-blue-200/50
                      transition
                      hover:text-blue-200
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    className="
                      mt-2
                      text-xs
                      font-medium
                      text-red-400
                    "
                  >
                    {errors.password}
                  </p>
                )}

              </div>


              {/* FORGOT PASSWORD */}

              <div className="flex justify-end">

                <Link
                  to="/forgot-password"
                  className="
                    text-xs
                    font-medium
                    text-blue-400
                    transition
                    hover:text-blue-300
                  "
                >
                  {isPT
                    ? 'Esqueceu-se da palavra-passe?'
                    : 'Forgot your password?'}
                </Link>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  group
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-500
                  via-blue-600
                  to-blue-500
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_0_30px_rgba(37,99,235,0.18)]
                  transition
                  duration-200
                  hover:from-blue-400
                  hover:via-blue-500
                  hover:to-blue-400
                  hover:shadow-[0_0_40px_rgba(37,99,235,0.28)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {isSubmitting ? (
                  isPT
                    ? 'A entrar...'
                    : 'Signing in...'
                ) : (
                  <>
                    {isPT
                      ? 'Entrar'
                      : 'Sign in'}

                    <ArrowRight
                      size={17}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}

              </button>

            </form>


            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="relative mt-8">

              <div className="flex items-center gap-3">

                <div className="h-px flex-1 bg-white/[0.07]" />

                <span
                  className="
                    text-[10px]
                    text-blue-200/45
                  "
                >
                  {isPT
                    ? 'Sistema interno'
                    : 'Internal system'}
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />

              </div>


              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-sm
                  text-blue-100/70
                "
              >

                <ShieldCheck
                  size={17}
                  className="text-blue-400"
                />

                <span>IT Inventory</span>

              </div>


              <div
                className="
                  mt-2
                  text-center
                  text-[11px]
                  text-blue-200/45
                "
              >
                Secure · Manage · Work Better
              </div>

            </div>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              mt-6
              text-center
              text-[10px]
              tracking-wide
              text-blue-200/35
            "
          >
            © 2026 NexHop.{' '}
            {isPT
              ? 'Todos os direitos reservados.'
              : 'All rights reserved.'}
          </div>

        </section>

      </main>

    </div>
  );
};

export default LoginForm;