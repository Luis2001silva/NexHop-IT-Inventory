import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
} from "lucide-react";

import { toast } from "sonner";

import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

type RecoveryStep =
  | "request"
  | "pending"
  | "code"
  | "password"
  | "success";

const ForgotPasswordPage = () => {
  const { language } = useLanguage();

  const [step, setStep] =
    useState<RecoveryStep>("request");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] =
    useState("");

  const [code, setCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [codeError, setCodeError] =
    useState("");

  const [
    isValidatingCode,
    setIsValidatingCode,
  ] = useState(false);

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const isPT = language === "pt";

  /* =========================================================
     EMAIL VALIDATION
  ========================================================= */

  const validateEmail = () => {
    const trimmedEmail =
      email.trim();

    if (!trimmedEmail) {
      setEmailError(
        isPT
          ? "O email é obrigatório."
          : "Email is required."
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
          ? "Introduza um email válido."
          : "Enter a valid email address."
      );

      return false;
    }

    setEmailError("");

    return true;
  };

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (emailError) {
      setEmailError("");
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
      const { data, error } =
        await supabase.rpc(
          "request_password_reset",
          {
            p_email:
              email.trim(),
          }
        );

      if (error) {
        console.error(
          "Erro ao criar pedido:",
          error
        );

        toast.error(
          isPT
            ? "Não foi possível criar o pedido de recuperação."
            : "Unable to create the recovery request."
        );

        return;
      }

      /*
       * A RPC devolve false quando o email não
       * existe na base de dados.
       */
      if (data !== true) {
        setEmailError(
          isPT
            ? "Este email não está registado no sistema."
            : "This email is not registered in the system."
        );

        toast.error(
          isPT
            ? "O email não está registado no sistema."
            : "The email is not registered in the system."
        );

        return;
      }

      setStep("pending");

      toast.success(
        isPT
          ? "Pedido enviado para o administrador."
          : "Request sent to the administrator."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Ocorreu um erro. Tente novamente."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     CHECK RECOVERY REQUEST STATUS
  ========================================================= */

  useEffect(() => {
    if (step !== "pending" || !email.trim()) {
      return;
    }

    let cancelled = false;

    const checkRequestStatus = async () => {
      try {
        const { data, error } =
          await supabase.rpc(
            "get_password_reset_status",
            {
              p_email: email.trim(),
            }
          );

        if (cancelled || error) {
          if (error) {
            console.error(
              "Erro ao consultar estado do pedido:",
              error
            );
          }

          return;
        }

        const result =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!result?.status) {
          return;
        }

        if (
          result.status === "approved"
        ) {
          setStep("code");

          toast.success(
            isPT
              ? "Pedido aprovado. Introduza o código de recuperação."
              : "Request approved. Enter the recovery code."
          );

          return;
        }

        if (
          result.status === "rejected"
        ) {
          setStep("request");
          setEmailError(
            isPT
              ? "O administrador recusou o pedido de recuperação."
              : "The administrator rejected the recovery request."
          );

          toast.error(
            isPT
              ? "O pedido de recuperação foi recusado."
              : "The recovery request was rejected."
          );

          return;
        }

        if (
          result.status === "expired"
        ) {
          setStep("request");
          setEmailError(
            isPT
              ? "O pedido de recuperação expirou. Faça um novo pedido."
              : "The recovery request expired. Please submit a new request."
          );

          toast.error(
            isPT
              ? "O pedido de recuperação expirou."
              : "The recovery request expired."
          );

          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Erro ao consultar estado do pedido:",
            error
          );
        }
      }
    };

    void checkRequestStatus();

    const interval = window.setInterval(
      () => {
        void checkRequestStatus();
      },
      2000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [step, email, isPT]);

  /* =========================================================
     CODE INPUT
  ========================================================= */

  const handleCodeChange = (
    index: number,
    value: string
  ) => {
    const digit = value
      .replace(/\D/g, "")
      .slice(-1);

    const newCode = [...code];

    newCode[index] = digit;

    setCode(newCode);
    setCodeError("");

    if (
      digit &&
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
     CODE KEYBOARD
  ========================================================= */

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
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
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(
          `recovery-code-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === "ArrowRight" &&
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

    const pastedCode =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedCode) return;

    const newCode = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedCode
      .split("")
      .forEach(
        (digit, index) => {
          newCode[index] = digit;
        }
      );

    setCode(newCode);
    setCodeError("");

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
     VALIDATE REAL RECOVERY CODE
  ========================================================= */

  const handleValidateCode = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isValidatingCode) return;

    const fullCode =
      code.join("");

    if (fullCode.length !== 6) {
      setCodeError(
        isPT
          ? "Introduza o código completo de 6 dígitos."
          : "Enter the complete 6-digit code."
      );

      return;
    }

    setIsValidatingCode(true);
    setCodeError("");

    try {
      const { data, error } =
        await supabase.rpc(
          "validate_password_reset_code",
          {
            p_email:
              email.trim(),
            p_code:
              fullCode,
          }
        );

      if (error) {
        console.error(
          "Erro ao validar código:",
          error
        );

        setCodeError(
          isPT
            ? "Não foi possível validar o código."
            : "Unable to validate the code."
        );

        return;
      }

      const result =
        Array.isArray(data)
          ? data[0]
          : data;

      if (
        !result ||
        !result.valid ||
        !result.user_id ||
        !result.request_id
      ) {
        setCodeError(
          isPT
            ? "Código inválido ou expirado."
            : "Invalid or expired code."
        );

        return;
      }

      /*
       * O código é apenas validado aqui.
       *
       * Ainda NÃO é consumido.
       * Será consumido pela Edge Function
       * quando a nova password for efetivamente
       * alterada.
       */

      setCodeError("");
      setStep("password");

      toast.success(
        isPT
          ? "Código validado."
          : "Code validated."
      );
    } catch (error) {
      console.error(error);

      setCodeError(
        isPT
          ? "Ocorreu um erro ao validar o código."
          : "An error occurred while validating the code."
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
          ? "A nova palavra-passe é obrigatória."
          : "New password is required."
      );

      valid = false;
    } else if (
      password.length < 8
    ) {
      setPasswordError(
        isPT
          ? "A palavra-passe deve ter pelo menos 8 caracteres."
          : "Password must contain at least 8 characters."
      );

      valid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        isPT
          ? "Confirme a nova palavra-passe."
          : "Confirm your new password."
      );

      valid = false;
    } else if (
      password !== confirmPassword
    ) {
      setConfirmPasswordError(
        isPT
          ? "As palavras-passe não coincidem."
          : "Passwords do not match."
      );

      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    return valid;
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (
    value: string
  ) => {
    setConfirmPassword(value);

    if (confirmPasswordError) {
      setConfirmPasswordError("");
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

    if (!validatePassword()) {
      return;
    }

    const fullCode =
      code.join("");

    if (
      fullCode.length !== 6
    ) {
      setCodeError(
        isPT
          ? "Código de recuperação inválido."
          : "Invalid recovery code."
      );

      setStep("code");

      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * A alteração real da password acontece
       * numa Edge Function com privilégios de
       * servidor.
       */

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "reset-password-with-code",
          {
            body: {
              email:
                email.trim(),
              code: fullCode,
              password,
            },
          }
        );

      if (error) {
        console.error(
          "Erro na recuperação de password:",
          error
        );

        setPasswordError(
          isPT
            ? "Não foi possível alterar a palavra-passe."
            : "Unable to change the password."
        );

        toast.error(
          isPT
            ? "Não foi possível alterar a palavra-passe."
            : "Unable to change the password."
        );

        return;
      }

      if (
        !data ||
        data.success !== true
      ) {
        console.error(
          "Resposta inesperada:",
          data
        );

        setPasswordError(
          isPT
            ? "Não foi possível concluir a recuperação."
            : "Unable to complete the recovery."
        );

        toast.error(
          isPT
            ? "Não foi possível concluir a recuperação."
            : "Unable to complete the recovery."
        );

        return;
      }

      /*
       * Só chegamos aqui depois de a Edge Function
       * alterar efetivamente a password.
       */

      setPassword("");
      setConfirmPassword("");
      setCode([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setStep("success");

      toast.success(
        isPT
          ? "Palavra-passe alterada com sucesso."
          : "Password changed successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Ocorreu um erro. Tente novamente."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    if (
      step === "code"
    ) {
      setStep("pending");
      return;
    }

    if (
      step === "password"
    ) {
      setStep("code");
      return;
    }

    if (
      step === "pending"
    ) {
      setStep("request");
      setEmailError("");
      return;
    }
  };

  /* =========================================================
     TITLES
  ========================================================= */

  const getStepTitle = () => {
    switch (step) {
      case "request":
        return isPT
          ? "Recuperar palavra-passe"
          : "Reset your password";

      case "pending":
        return isPT
          ? "Pedido enviado"
          : "Request submitted";

      case "code":
        return isPT
          ? "Código de recuperação"
          : "Recovery code";

      case "password":
        return isPT
          ? "Nova palavra-passe"
          : "New password";

      case "success":
        return isPT
          ? "Palavra-passe alterada"
          : "Password changed";

      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "request":
        return isPT
          ? "Solicite um código de recuperação ao administrador do sistema."
          : "Request a recovery code from the system administrator.";

      case "pending":
        return isPT
          ? "O administrador foi notificado e irá analisar o seu pedido."
          : "The administrator has been notified and will review your request.";

      case "code":
        return isPT
          ? "Introduza o código de 6 dígitos fornecido pelo administrador."
          : "Enter the 6-digit code provided by the administrator.";

      case "password":
        return isPT
          ? "Defina uma nova palavra-passe para a sua conta."
          : "Set a new password for your account.";

      case "success":
        return isPT
          ? "A sua palavra-passe foi alterada com sucesso."
          : "Your password has been successfully changed.";

      default:
        return "";
    }
  };

  /* =========================================================
     BACKGROUND
  ========================================================= */

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
            border-blue-500/[0.08]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize:
              "40px 40px",
          }}
        />

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <section className="w-full max-w-[470px]">

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="mb-7 flex flex-col items-center">

            <div
              className="
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-400/20
                bg-[#081120]
                shadow-[0_0_40px_rgba(37,99,235,0.12)]
              "
            >
              <KeyRound
                size={28}
                className="text-blue-400"
              />
            </div>

            <div className="text-center">

              <div className="text-[11px] font-semibold tracking-[0.22em] text-blue-300/70">
                NEXHOP
              </div>

              <div className="mt-1 text-[10px] tracking-[0.18em] text-blue-200/35">
                IT INVENTORY
              </div>

            </div>

          </div>

          {/* =================================================
              CARD
          ================================================= */}

          <div
            className="
              rounded-3xl
              border
              border-blue-300/[0.10]
              bg-[#07101F]/90
              p-6
              shadow-[0_20px_80px_rgba(0,0,0,0.35)]
              backdrop-blur-xl
              sm:p-8
            "
          >

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="text-center">

              <h1 className="text-[25px] font-semibold tracking-tight">
                {getStepTitle()}
              </h1>

              <p className="mx-auto mt-2 max-w-[390px] text-sm leading-6 text-blue-100/45">
                {getStepDescription()}
              </p>

            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            {step !== "success" && (
              <div className="mt-7 flex items-center justify-center gap-2">

                {[
                  "request",
                  "pending",
                  "code",
                  "password",
                ].map(
                  (
                    item,
                    index
                  ) => {
                    const currentIndex =
                      [
                        "request",
                        "pending",
                        "code",
                        "password",
                      ].indexOf(step);

                    const active =
                      index <=
                      currentIndex;

                    return (
                      <div
                        key={item}
                        className={`
                          h-1.5
                          rounded-full
                          transition-all
                          duration-300
                          ${
                            active
                              ? "w-10 bg-blue-500"
                              : "w-5 bg-white/[0.08]"
                          }
                        `}
                      />
                    );
                  }
                )}

              </div>
            )}

            {/* =================================================
                REQUEST
            ================================================= */}

            {step === "request" && (
              <form
                onSubmit={
                  handleRequestRecovery
                }
                noValidate
                className="mt-7 space-y-5"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-white/75
                    "
                  >
                    {isPT
                      ? "Email profissional"
                      : "Professional email"}
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-blue-200/45
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        handleEmailChange(
                          e.target.value
                        )
                      }
                      autoComplete="email"
                      placeholder={
                        isPT
                          ? "nome@empresa.pt"
                          : "name@company.com"
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
                        placeholder:text-blue-100/25
                        focus:ring-2
                        focus:ring-blue-500/10
                        ${
                          emailError
                            ? "border-red-500/60"
                            : "border-blue-300/20 focus:border-blue-400/60"
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

                <div
                  className="
                    rounded-xl
                    border
                    border-blue-400/10
                    bg-blue-500/[0.035]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <p className="text-xs leading-5 text-blue-100/45">
                      {isPT
                        ? "Será criado um pedido para o administrador. Após a aprovação, receberá um código de 6 dígitos."
                        : "A request will be created for the administrator. After approval, you will receive a 6-digit code."}
                    </p>

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
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
                  {isSubmitting ? (
                    isPT
                      ? "A enviar..."
                      : "Sending..."
                  ) : (
                    <>
                      {isPT
                        ? "Pedir recuperação"
                        : "Request recovery"}

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

            {step === "pending" && (
              <div className="mt-8 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-400/20
                    bg-[#0B1629]
                    shadow-[0_0_40px_rgba(37,99,235,0.10)]
                  "
                >
                  <ShieldCheck
                    size={34}
                    className="text-blue-400"
                  />
                </div>

                <div
                  className="
                    mt-6
                    rounded-xl
                    border
                    border-blue-400/10
                    bg-blue-500/[0.035]
                    p-4
                    text-left
                  "
                >
                  <p className="text-xs leading-5 text-blue-100/55">
                    {isPT
                      ? "O seu pedido foi registado. O administrador recebeu uma notificação e precisa de aprovar o pedido antes de ser gerado o código."
                      : "Your request has been registered. The administrator has been notified and must approve the request before a code is generated."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-blue-200/40">

                  <Mail
                    size={14}
                    className="text-blue-400"
                  />

                  {email}

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setStep("request")
                  }
                  className="
                    mt-7
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
                  <ArrowLeft
                    size={14}
                  />

                  {isPT
                    ? "Voltar"
                    : "Back"}
                </button>

              </div>
            )}

            {/* =================================================
                CODE
            ================================================= */}

            {step === "code" && (
              <form
                onSubmit={
                  handleValidateCode
                }
                noValidate
                className="mt-8"
              >

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
                      ? "Código de recuperação"
                      : "Recovery code"}
                  </label>

                  {/* 6 CAIXAS */}

                  <div className="flex justify-center gap-2 sm:gap-3">

                    {code.map(
                      (
                        digit,
                        index
                      ) => (
                        <input
                          key={index}
                          id={`recovery-code-${index}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete={
                            index === 0
                              ? "one-time-code"
                              : "off"
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
                                ? "border-red-500/60"
                                : "border-blue-300/20 focus:border-blue-400/60"
                            }
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

                {/* VALIDITY */}

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-blue-200/40">

                  <ShieldCheck
                    size={14}
                    className="text-blue-400"
                  />

                  {isPT
                    ? "Código válido durante 5 minutos"
                    : "Code valid for 5 minutes"}

                </div>

                {/* VALIDATE */}

                <button
                  type="submit"
                  disabled={
                    isValidatingCode ||
                    code.join("")
                      .length !== 6
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
                      ? "A validar..."
                      : "Validating..."
                  ) : (
                    <>
                      {isPT
                        ? "Validar código"
                        : "Validate code"}

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    handleBack
                  }
                  className="
                    mx-auto
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-blue-400
                    transition
                    hover:text-blue-300
                  "
                >
                  <ArrowLeft
                    size={14}
                  />

                  {isPT
                    ? "Voltar"
                    : "Back"}
                </button>

              </form>
            )}

            {/* =================================================
                NEW PASSWORD
            ================================================= */}

            {step === "password" && (
              <form
                onSubmit={
                  handleChangePassword
                }
                noValidate
                className="mt-8 space-y-5"
              >

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-white/75
                    "
                  >
                    {isPT
                      ? "Nova palavra-passe"
                      : "New password"}
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
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(e) =>
                        handlePasswordChange(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder={
                        isPT
                          ? "Introduza a nova palavra-passe"
                          : "Enter your new password"
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
                            ? "border-red-500/60"
                            : "border-blue-300/20 focus:border-blue-400/60"
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
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>

                  </div>

                  {passwordError && (
                    <p className="mt-2 text-xs font-medium text-red-400">
                      {passwordError}
                    </p>
                  )}

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="confirm-password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-white/75
                    "
                  >
                    {isPT
                      ? "Confirmar palavra-passe"
                      : "Confirm password"}
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
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        handleConfirmPasswordChange(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder={
                        isPT
                          ? "Repita a nova palavra-passe"
                          : "Repeat your new password"
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
                            ? "border-red-500/60"
                            : "border-blue-300/20 focus:border-blue-400/60"
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
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>

                  </div>

                  {confirmPasswordError && (
                    <p className="mt-2 text-xs font-medium text-red-400">
                      {confirmPasswordError}
                    </p>
                  )}

                </div>

                {/* INFO */}

                <div
                  className="
                    rounded-xl
                    border
                    border-blue-400/10
                    bg-blue-500/[0.035]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <div>

                      <p className="text-xs font-medium text-blue-100/65">
                        {isPT
                          ? "Requisitos"
                          : "Requirements"}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-blue-100/40">
                        {isPT
                          ? "A palavra-passe deve ter pelo menos 8 caracteres."
                          : "The password must contain at least 8 characters."}
                      </p>

                    </div>

                  </div>
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
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
                  {isSubmitting ? (
                    isPT
                      ? "A alterar..."
                      : "Changing..."
                  ) : (
                    <>
                      {isPT
                        ? "Alterar palavra-passe"
                        : "Change password"}

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    handleBack
                  }
                  disabled={
                    isSubmitting
                  }
                  className="
                    mx-auto
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-blue-400
                    transition
                    hover:text-blue-300
                    disabled:opacity-50
                  "
                >
                  <ArrowLeft
                    size={14}
                  />

                  {isPT
                    ? "Voltar ao código"
                    : "Back to code"}
                </button>

              </form>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {step === "success" && (
              <div className="mt-8 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-emerald-400/20
                    bg-[#0B1629]
                    shadow-[0_0_40px_rgba(16,185,129,0.08)]
                  "
                >
                  <CheckCircle2
                    size={34}
                    className="text-emerald-400"
                  />
                </div>

                <h2 className="mt-6 text-[25px] font-semibold tracking-tight">
                  {isPT
                    ? "Palavra-passe alterada"
                    : "Password changed"}
                </h2>

                <p className="mx-auto mt-3 max-w-[380px] text-sm leading-6 text-blue-200/55">
                  {isPT
                    ? "A sua palavra-passe foi alterada com sucesso. Já pode iniciar sessão novamente."
                    : "Your password has been changed successfully. You can now sign in again."}
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
                    ? "Voltar ao login"
                    : "Back to login"}

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
                    ? "Sistema interno"
                    : "Internal system"}
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />

              </div>

              <div className="mt-5 text-center text-[11px] text-blue-200/45">
                Secure · Manage · Work Better
              </div>

            </div>

          </div>

          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          {step === "request" && (
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
                <ArrowLeft
                  size={14}
                />

                {isPT
                  ? "Voltar ao login"
                  : "Back to login"}
              </Link>

            </div>
          )}

          {step === "pending" && (
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
                <ArrowLeft
                  size={14}
                />

                {isPT
                  ? "Voltar ao login"
                  : "Back to login"}
              </Link>

            </div>
          )}

          {/* =================================================
              COPYRIGHT
          ================================================= */}

          <div
            className="
              mt-5
              text-center
              text-[10px]
              tracking-wide
              text-blue-200/30
            "
          >
            © 2026 NexHop.{" "}
            {isPT
              ? "Todos os direitos reservados."
              : "All rights reserved."}
          </div>

        </section>

      </main>

    </div>
  );
};

export default ForgotPasswordPage;