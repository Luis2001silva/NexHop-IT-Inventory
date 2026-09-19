import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

type RecoveryStep =
  | 'request'
  | 'pending'
  | 'code'
  | 'password'
  | 'success';

const ForgotPasswordPage = () => {
  const { language } = useLanguage();

  const [step, setStep] =
    useState<RecoveryStep>('request');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [code, setCode] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [codeError, setCodeError] = useState('');
  const [isValidatingCode, setIsValidatingCode] =
    useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isPT = language === 'pt';

  /* =========================================================
     EMAIL
  ========================================================= */

  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError(
        isPT
          ? 'O email é obrigatório.'
          : 'Email is required.'
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail
      )
    ) {
      setEmailError(
        isPT
          ? 'Introduza um email válido.'
          : 'Enter a valid email address.'
      );

      return false;
    }

    setEmailError('');

    return true;
  };

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (emailError) {
      setEmailError('');
    }
  };

  /* =========================================================
     REQUEST RECOVERY
  ========================================================= */

  const handleRequestRecovery = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateEmail()) return;

    setIsSubmitting(true);

    try {
      const { error } =
        await (supabase.rpc as any)(
          'request_password_reset',
          {
            p_email: email.trim(),
          }
        );

      if (error) {
        console.error(
          'Erro ao criar pedido:',
          error
        );

        toast.error(
          isPT
            ? 'Não foi possível criar o pedido de recuperação.'
            : 'Unable to create the recovery request.'
        );

        return;
      }

      setStep('pending');

      toast.success(
        isPT
          ? 'Pedido enviado para o administrador.'
          : 'Request sent to the administrator.'
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

  /* =========================================================
     CODE INPUT
  ========================================================= */

  const handleCodeChange = (
    index: number,
    value: string
  ) => {
    const digit = value
      .replace(/\D/g, '')
      .slice(-1);

    const newCode = [...code];

    newCode[index] = digit;

    setCode(newCode);
    setCodeError('');

    if (digit && index < 5) {
      document
        .getElementById(
          `recovery-code-${index + 1}`
        )
        ?.focus();
    }
  };

  /* =========================================================
     CODE KEYBOARD
  ========================================================= */

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === 'Backspace' &&
      !code[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `recovery-code-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {
      document
        .getElementById(
          `recovery-code-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === 'ArrowRight' &&
      index < 5
    ) {
      document
        .getElementById(
          `recovery-code-${index + 1}`
        )
        ?.focus();
    }
  };

  /* =========================================================
     CODE PASTE
  ========================================================= */

  const handleCodePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedCode = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedCode) return;

    const newCode = [
      '',
      '',
      '',
      '',
      '',
      '',
    ];

    pastedCode
      .split('')
      .forEach((digit, index) => {
        newCode[index] = digit;
      });

    setCode(newCode);
    setCodeError('');

    const focusIndex = Math.min(
      pastedCode.length,
      5
    );

    document
      .getElementById(
        `recovery-code-${focusIndex}`
      )
      ?.focus();
  };

  /* =========================================================
     VALIDATE CODE
  ========================================================= */

  const handleValidateCode = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isValidatingCode) return;

    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setCodeError(
        isPT
          ? 'Introduza o código completo de 6 dígitos.'
          : 'Enter the complete 6-digit code.'
      );

      return;
    }

    setIsValidatingCode(true);
    setCodeError('');

    try {
      const { data, error } =
        await (supabase.rpc as any)(
          'validate_password_reset_code',
          {
            p_email: email.trim(),
            p_code: fullCode,
          }
        );

      if (error) {
        console.error(
          'Erro ao validar código:',
          error
        );

        setCodeError(
          isPT
            ? 'Não foi possível validar o código.'
            : 'Unable to validate the code.'
        );

        return;
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (
        !result ||
        !result.valid
      ) {
        setCodeError(
          isPT
            ? 'Código inválido ou expirado.'
            : 'Invalid or expired code.'
        );

        return;
      }

      toast.success(
        isPT
          ? 'Código validado com sucesso.'
          : 'Code validated successfully.'
      );

      setStep('password');
    } catch (error) {
      console.error(error);

      setCodeError(
        isPT
          ? 'Ocorreu um erro ao validar o código.'
          : 'An error occurred while validating the code.'
      );
    } finally {
      setIsValidatingCode(false);
    }
  };

  /* =========================================================
     PASSWORD VALIDATION
  ========================================================= */

  const validatePassword = () => {
    let valid = true;

    if (!password) {
      setPasswordError(
        isPT
          ? 'A nova palavra-passe é obrigatória.'
          : 'New password is required.'
      );

      valid = false;
    } else if (password.length < 8) {
      setPasswordError(
        isPT
          ? 'A palavra-passe deve ter pelo menos 8 caracteres.'
          : 'Password must contain at least 8 characters.'
      );

      valid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        isPT
          ? 'Confirme a palavra-passe.'
          : 'Please confirm your password.'
      );

      valid = false;
    } else if (
      password !== confirmPassword
    ) {
      setConfirmPasswordError(
        isPT
          ? 'As palavras-passe não coincidem.'
          : 'Passwords do not match.'
      );

      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (
    value: string
  ) => {
    setConfirmPassword(value);

    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validatePassword()) return;

    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setStep('code');

      setCodeError(
        isPT
          ? 'Introduza o código completo de 6 dígitos.'
          : 'Enter the complete 6-digit code.'
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } =
        await supabase.functions.invoke(
          'reset-password-with-code',
          {
            body: {
              email: email.trim(),
              code: fullCode,
              password,
            },
          }
        );

      if (error) {
        console.error(
          'Erro ao alterar password:',
          error
        );

        toast.error(
          isPT
            ? 'Não foi possível alterar a palavra-passe.'
            : 'Unable to change the password.'
        );

        return;
      }

      if (!data?.success) {
        setStep('code');

        setCodeError(
          isPT
            ? 'Código inválido ou expirado.'
            : 'Invalid or expired recovery code.'
        );

        return;
      }

      setStep('success');

      toast.success(
        isPT
          ? 'Palavra-passe alterada com sucesso!'
          : 'Password changed successfully!'
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

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    if (step === 'code') {
      setStep('pending');
      return;
    }

    if (step === 'password') {
      setStep('code');
      return;
    }

    if (step === 'pending') {
      setStep('request');
      return;
    }
  };

  /* =========================================================
     TITLES
  ========================================================= */

  const getStepTitle = () => {
    switch (step) {
      case 'request':
        return isPT
          ? 'Recuperar palavra-passe'
          : 'Reset your password';

      case 'pending':
        return isPT
          ? 'Pedido enviado'
          : 'Request submitted';

      case 'code':
        return isPT
          ? 'Código de recuperação'
          : 'Recovery code';

      case 'password':
        return isPT
          ? 'Nova palavra-passe'
          : 'New password';

      case 'success':
        return isPT
          ? 'Palavra-passe alterada'
          : 'Password changed';

      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'request':
        return isPT
          ? 'Solicite um código de recuperação ao administrador do sistema.'
          : 'Request a recovery code from the system administrator.';

      case 'pending':
        return isPT
          ? 'O administrador foi notificado e irá analisar o seu pedido.'
          : 'The administrator has been notified and will review your request.';

      case 'code':
        return isPT
          ? 'Introduza o código de 6 dígitos fornecido pelo administrador.'
          : 'Enter the 6-digit code provided by the administrator.';

      case 'password':
        return isPT
          ? 'Defina uma nova palavra-passe para a sua conta.'
          : 'Set a new password for your account.';

      case 'success':
        return isPT
          ? 'A sua palavra-passe foi alterada com sucesso.'
          : 'Your password has been successfully changed.';

      default:
        return '';
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
          LEFT SIDE
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


      {/* =====================================================
          LOCATION
      ===================================================== */}

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


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

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


      {/* =====================================================
          DOMAIN
      ===================================================== */}

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

      <main
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-5
          py-8
        "
      >

        <section className="w-full max-w-[620px]">

          {/* =================================================
              CARD
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

            <div
              className="
                relative
                mb-7
                flex
                flex-col
                items-center
              "
            >

              <div
                className="
                  relative
                  mb-3
                  flex
                  h-[60px]
                  w-[60px]
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
                    h-[56px]
                    w-[56px]
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
                      text-[38px]
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
                  text-[27px]
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

            <div className="relative mb-7 text-center">

              <h1
                className="
                  text-[27px]
                  font-semibold
                  tracking-[-0.025em]
                  text-white
                  sm:text-[29px]
                "
              >
                {getStepTitle()}
              </h1>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[400px]
                  text-sm
                  leading-6
                  text-blue-200/60
                "
              >
                {getStepDescription()}
              </p>

            </div>


            {/* =================================================
                REQUEST
            ================================================= */}

            {step === 'request' && (
              <form
                onSubmit={
                  handleRequestRecovery
                }
                noValidate
                className="relative space-y-5"
              >

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
                      aria-invalid={
                        !!emailError
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
                          emailError
                            ? 'border-red-500/60 focus:border-red-500/70'
                            : 'border-blue-300/20 focus:border-blue-400/60'
                        }
                      `}
                    />

                  </div>

                  {emailError && (
                    <p className="mt-2 text-xs font-medium text-red-400">
                      {emailError}
                    </p>
                  )}

                </div>


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

                  {isSubmitting
                    ? isPT
                      ? 'A enviar pedido...'
                      : 'Submitting request...'
                    : (
                      <>
                        {isPT
                          ? 'Solicitar código'
                          : 'Request recovery code'}

                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                </button>

              </form>
            )}


            {/* =================================================
                PENDING
            ================================================= */}

            {step === 'pending' && (
              <div className="relative">

                <div className="flex flex-col items-center">

                  <div
                    className="
                      relative
                      mb-6
                      flex
                      h-[68px]
                      w-[68px]
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
                        h-[62px]
                        w-[62px]
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-blue-400/20
                        bg-[#0B1629]
                      "
                    >
                      <ShieldCheck
                        size={29}
                        className="text-blue-400"
                      />
                    </div>

                  </div>


                  <p className="text-sm text-blue-200/50">
                    {isPT
                      ? 'Pedido associado à conta'
                      : 'Request associated with'}
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-white/85">
                    {email}
                  </p>


                  <div
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      border
                      border-blue-300/[0.08]
                      bg-[#081120]
                      p-5
                      text-center
                    "
                  >

                    <div className="flex items-center justify-center gap-2">

                      <LockKeyhole
                        size={16}
                        className="text-blue-400"
                      />

                      <span className="text-xs font-medium text-blue-100/70">
                        {isPT
                          ? 'A aguardar aprovação'
                          : 'Waiting for approval'}
                      </span>

                    </div>

                    <p className="mx-auto mt-3 max-w-[390px] text-xs leading-5 text-blue-100/40">
                      {isPT
                        ? 'O administrador do sistema recebeu o pedido. Depois de aprovado, será disponibilizado um código de recuperação de 6 dígitos.'
                        : 'The system administrator has received your request. Once approved, a 6-digit recovery code will be available.'}
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setStep('code')
                    }
                    className="
                      mt-5
                      inline-flex
                      h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-blue-400/20
                      bg-blue-500/[0.06]
                      px-6
                      text-sm
                      font-medium
                      text-blue-300
                      transition
                      hover:border-blue-400/40
                      hover:bg-blue-500/[0.10]
                    "
                  >

                    <KeyRound size={16} />

                    {isPT
                      ? 'Já tenho o código'
                      : 'I already have the code'}

                    <ArrowRight size={15} />

                  </button>

                </div>

              </div>
            )}


            {/* =================================================
                CODE
            ================================================= */}

            {step === 'code' && (
              <form
                onSubmit={handleValidateCode}
                noValidate
                className="relative"
              >

                <div className="mb-6 flex items-center justify-center">

                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-blue-400/20
                      bg-[#0B1629]
                      text-blue-400
                    "
                  >
                    <KeyRound size={27} />
                  </div>

                </div>


                <div>

                  <label
                    className="
                      mb-3
                      block
                      text-center
                      text-xs
                      font-medium
                      text-white/75
                    "
                  >
                    {isPT
                      ? 'Código de recuperação'
                      : 'Recovery code'}
                  </label>


                  <div className="flex justify-center gap-2 sm:gap-3">

                    {code.map(
                      (digit, index) => (
                        <input
                          key={index}
                          id={`recovery-code-${index}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete={
                            index === 0
                              ? 'one-time-code'
                              : 'off'
                          }
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(
                              index,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleCodeKeyDown(
                              index,
                              e
                            )
                          }
                          onPaste={
                            handleCodePaste
                          }
                          className={`
                            h-14
                            w-11
                            rounded-xl
                            border
                            bg-[#081120]
                            text-center
                            text-xl
                            font-semibold
                            text-white
                            outline-none
                            transition
                            sm:h-16
                            sm:w-14
                            sm:text-2xl
                            ${
                              codeError
                                ? 'border-red-500/60'
                                : digit
                                  ? 'border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.10)]'
                                  : 'border-blue-300/20'
                            }
                            focus:border-blue-400
                            focus:ring-2
                            focus:ring-blue-500/10
                          `}
                        />
                      )
                    )}

                  </div>


                  {codeError && (
                    <p className="mt-3 text-center text-xs font-medium text-red-400">
                      {codeError}
                    </p>
                  )}

                </div>


                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-blue-200/40">

                  <ShieldCheck
                    size={14}
                    className="text-blue-400"
                  />

                  {isPT
                    ? 'Código válido durante 15 minutos'
                    : 'Code valid for 15 minutes'}

                </div>


                <button
                  type="submit"
                  disabled={
                    isValidatingCode ||
                    code.join('').length !== 6
                  }
                  className="
                    group
                    mt-6
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
                    hover:from-blue-400
                    hover:via-blue-500
                    hover:to-blue-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {isValidatingCode ? (
                    isPT
                      ? 'A validar...'
                      : 'Validating...'
                  ) : (
                    <>
                      {isPT
                        ? 'Validar código'
                        : 'Validate code'}

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>
            )}


            {/* =================================================
                NEW PASSWORD
            ================================================= */}

            {step === 'password' && (
              <form
                onSubmit={
                  handleChangePassword
                }
                noValidate
                className="space-y-5"
              >

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
                      ? 'Nova palavra-passe'
                      : 'New password'}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-blue-200/60
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
                      autoComplete="new-password"
                      placeholder={
                        isPT
                          ? 'Introduza a nova palavra-passe'
                          : 'Enter your new password'
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
                        placeholder:text-blue-100/25
                        focus:ring-2
                        focus:ring-blue-500/10
                        ${
                          passwordError
                            ? 'border-red-500/60'
                            : 'border-blue-300/20 focus:border-blue-400/60'
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-blue-200/40
                        transition
                        hover:text-blue-200/80
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                  {passwordError && (
                    <p className="mt-2 text-xs font-medium text-red-400">
                      {passwordError}
                    </p>
                  )}

                </div>


                <div>

                  <label
                    htmlFor="confirm-password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-white/80
                    "
                  >
                    {isPT
                      ? 'Confirmar palavra-passe'
                      : 'Confirm password'}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-blue-200/60
                      "
                    />

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        handleConfirmPasswordChange(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder={
                        isPT
                          ? 'Repita a nova palavra-passe'
                          : 'Repeat your new password'
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
                        placeholder:text-blue-100/25
                        focus:ring-2
                        focus:ring-blue-500/10
                        ${
                          confirmPasswordError
                            ? 'border-red-500/60'
                            : 'border-blue-300/20 focus:border-blue-400/60'
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-blue-200/40
                        transition
                        hover:text-blue-200/80
                      "
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                  {confirmPasswordError && (
                    <p className="mt-2 text-xs font-medium text-red-400">
                      {confirmPasswordError}
                    </p>
                  )}

                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-blue-300/[0.08]
                    bg-[#081120]
                    p-4
                  "
                >

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={15}
                      className="text-blue-400"
                    />

                    <span className="text-[11px] font-medium text-blue-100/60">
                      {isPT
                        ? 'Mínimo de 8 caracteres'
                        : 'Minimum 8 characters'}
                    </span>

                  </div>

                </div>


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
                    hover:from-blue-400
                    hover:via-blue-500
                    hover:to-blue-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {isSubmitting
                    ? isPT
                      ? 'A alterar...'
                      : 'Changing...'
                    : (
                      <>
                        {isPT
                          ? 'Alterar palavra-passe'
                          : 'Change password'}

                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                </button>

              </form>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {step === 'success' && (
              <div className="relative text-center">

                <div
                  className="
                    relative
                    mx-auto
                    mb-6
                    flex
                    h-[70px]
                    w-[70px]
                    items-center
                    justify-center
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0
                      rounded-2xl
                      bg-emerald-500/[0.10]
                      blur-xl
                    "
                  />

                  <div
                    className="
                      relative
                      flex
                      h-[64px]
                      w-[64px]
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-emerald-400/20
                      bg-[#0B1629]
                    "
                  >

                    <CheckCircle2
                      size={30}
                      className="text-emerald-400"
                    />

                  </div>

                </div>


                <h2 className="text-[25px] font-semibold tracking-tight">
                  {isPT
                    ? 'Palavra-passe alterada'
                    : 'Password changed'}
                </h2>


                <p className="mx-auto mt-3 max-w-[380px] text-sm leading-6 text-blue-200/55">
                  {isPT
                    ? 'A sua palavra-passe foi alterada com sucesso. Já pode iniciar sessão novamente.'
                    : 'Your password has been changed successfully. You can now sign in again.'}
                </p>


                <Link
                  to="/login"
                  className="
                    group
                    mt-7
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
                    hover:from-blue-400
                    hover:via-blue-500
                    hover:to-blue-400
                  "
                >

                  {isPT
                    ? 'Voltar ao login'
                    : 'Back to login'}

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </Link>

              </div>
            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="relative mt-8">

              <div className="flex items-center gap-3">

                <div className="h-px flex-1 bg-white/[0.07]" />

                <span className="text-[10px] text-blue-200/45">
                  {isPT
                    ? 'Sistema interno'
                    : 'Internal system'}
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />

              </div>


              <div className="mt-5 text-center text-[11px] text-blue-200/45">
                Secure · Manage · Work Better
              </div>

            </div>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          {step !== 'success' &&
            step !== 'request' && (
              <div className="mt-5 text-center">

                <button
                  type="button"
                  onClick={handleBack}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-blue-400
                    transition
                    hover:text-blue-300
                  "
                >

                  <ArrowLeft size={14} />

                  {isPT
                    ? 'Voltar'
                    : 'Back'}

                </button>

              </div>
            )}


          {step === 'request' && (
            <div className="mt-6 text-center">

              <Link
                to="/login"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-blue-400
                  transition
                  hover:text-blue-300
                "
              >

                <ArrowLeft size={14} />

                {isPT
                  ? 'Voltar ao login'
                  : 'Back to login'}

              </Link>

            </div>
          )}


          {step === 'pending' && (
            <div className="mt-6 text-center">

              <Link
                to="/login"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-blue-400
                  transition
                  hover:text-blue-300
                "
              >

                <ArrowLeft size={14} />

                {isPT
                  ? 'Voltar ao login'
                  : 'Back to login'}

              </Link>

            </div>
          )}


          <div
            className="
              mt-5
              text-center
              text-[10px]
              tracking-wide
              text-blue-200/30
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

export default ForgotPasswordPage;