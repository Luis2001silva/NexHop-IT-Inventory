import { useState } from 'react';
import {
  UserRound,
  Palette,
  Bell,
  ShieldCheck,
  Server,
  Database,
  HardDrive,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Settings,
  Monitor,
  Globe,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

type ServiceStatus = 'online' | 'checking';

const SettingsPage = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const isPT = language === 'pt';

  const [services, setServices] = useState<
    Record<string, ServiceStatus>
  >({
    api: 'online',
    database: 'online',
    auth: 'online',
    storage: 'online',
  });

  const [notifications, setNotifications] = useState({
    warranty: true,
    equipment: true,
    system: true,
  });

  const [checking, setChecking] = useState(false);

  const checkServices = () => {
    setChecking(true);

    setServices({
      api: 'checking',
      database: 'checking',
      auth: 'checking',
      storage: 'checking',
    });

    window.setTimeout(() => {
      setServices({
        api: 'online',
        database: 'online',
        auth: 'online',
        storage: 'online',
      });

      setChecking(false);
    }, 1800);
  };

  const serviceData = [
    {
      id: 'api',
      name: 'API Server',
      icon: Server,
    },
    {
      id: 'database',
      name: isPT ? 'Base de dados' : 'Database',
      icon: Database,
    },
    {
      id: 'auth',
      name: isPT ? 'Autenticação' : 'Authentication',
      icon: KeyRound,
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: HardDrive,
    },
  ];

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8">

      {/* HEADER */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {isPT ? 'Definições' : 'Settings'}
        </h1>

        <p className="mt-1.5 text-sm text-white/35">
          {isPT
            ? 'Configure as preferências e o comportamento da plataforma.'
            : 'Configure platform preferences and behaviour.'}
        </p>
      </div>

      {/* PREFERENCE CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">

        {/* ==================== CONTA ==================== */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5 transition hover:border-white/[0.10]">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">
                {isPT ? 'Conta' : 'Account'}
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {isPT
                  ? 'Informações e preferências da tua conta.'
                  : 'Account information and preferences.'}
              </p>

              <div className="mt-4">
                <p className="text-xs font-medium text-white/70">
                  {user?.name || 'Utilizador'}
                </p>

                <p className="mt-0.5 text-[11px] text-white/30">
                  {user?.email || '—'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== APARÊNCIA ==================== */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Palette className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-sm font-semibold text-white">
                {isPT ? 'Aparência' : 'Appearance'}
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {isPT
                  ? 'Personaliza o tema e o idioma.'
                  : 'Customize theme and language.'}
              </p>

              {/* TEMA */}
              <div className="mt-4">

                <p className="mb-2 text-[10px] uppercase tracking-wider text-white/25">
                  {isPT ? 'Tema' : 'Theme'}
                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`
                      rounded-lg border px-3 py-2
                      text-[11px] transition
                      ${
                        theme === 'dark'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-white/[0.06] bg-white/[0.025] text-white/35 hover:text-white'
                      }
                    `}
                  >
                    {isPT ? 'Escuro' : 'Dark'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`
                      rounded-lg border px-3 py-2
                      text-[11px] transition
                      ${
                        theme === 'light'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-white/[0.06] bg-white/[0.025] text-white/35 hover:text-white'
                      }
                    `}
                  >
                    {isPT ? 'Claro' : 'Light'}
                  </button>

                </div>
              </div>

              {/* IDIOMA */}
              <div className="mt-4">

                <p className="mb-2 text-[10px] uppercase tracking-wider text-white/25">
                  {isPT ? 'Idioma' : 'Language'}
                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() => setLanguage('pt')}
                    className={`
                      inline-flex items-center gap-1.5
                      rounded-lg border px-3 py-2
                      text-[11px] transition
                      ${
                        language === 'pt'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-white/[0.06] bg-white/[0.025] text-white/35 hover:text-white'
                      }
                    `}
                  >
                    <Globe className="h-3 w-3" />
                    Português
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`
                      inline-flex items-center gap-1.5
                      rounded-lg border px-3 py-2
                      text-[11px] transition
                      ${
                        language === 'en'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-white/[0.06] bg-white/[0.025] text-white/35 hover:text-white'
                      }
                    `}
                  >
                    <Globe className="h-3 w-3" />
                    English
                  </button>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ==================== NOTIFICAÇÕES ==================== */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Bell className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-sm font-semibold text-white">
                {isPT ? 'Notificações' : 'Notifications'}
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {isPT
                  ? 'Controla os avisos que recebes.'
                  : 'Control the notifications you receive.'}
              </p>

              <div className="mt-4">

                {/* GARANTIA */}
                <div className="flex h-9 items-center justify-between">
                  <span className="text-xs text-white/55">
                    {isPT
                      ? 'Alertas de garantia'
                      : 'Warranty alerts'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        warranty: !prev.warranty,
                      }))
                    }
                    aria-pressed={notifications.warranty}
                    className={`
                      relative h-5 w-9 shrink-0
                      rounded-full transition-colors
                      ${
                        notifications.warranty
                          ? 'bg-blue-500'
                          : 'bg-white/[0.12]'
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute left-1 top-1
                        h-3 w-3 rounded-full
                        bg-white shadow-sm
                        transition-transform
                        ${
                          notifications.warranty
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }
                      `}
                    />
                  </button>
                </div>

                {/* EQUIPAMENTO */}
                <div className="flex h-9 items-center justify-between">
                  <span className="text-xs text-white/55">
                    {isPT
                      ? 'Equipamento atribuído'
                      : 'Equipment assigned'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        equipment: !prev.equipment,
                      }))
                    }
                    aria-pressed={notifications.equipment}
                    className={`
                      relative h-5 w-9 shrink-0
                      rounded-full transition-colors
                      ${
                        notifications.equipment
                          ? 'bg-blue-500'
                          : 'bg-white/[0.12]'
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute left-1 top-1
                        h-3 w-3 rounded-full
                        bg-white shadow-sm
                        transition-transform
                        ${
                          notifications.equipment
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }
                      `}
                    />
                  </button>
                </div>

                {/* SISTEMA */}
                <div className="flex h-9 items-center justify-between">
                  <span className="text-xs text-white/55">
                    {isPT
                      ? 'Alertas do sistema'
                      : 'System alerts'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        system: !prev.system,
                      }))
                    }
                    aria-pressed={notifications.system}
                    className={`
                      relative h-5 w-9 shrink-0
                      rounded-full transition-colors
                      ${
                        notifications.system
                          ? 'bg-blue-500'
                          : 'bg-white/[0.12]'
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute left-1 top-1
                        h-3 w-3 rounded-full
                        bg-white shadow-sm
                        transition-transform
                        ${
                          notifications.system
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }
                      `}
                    />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ==================== SEGURANÇA ==================== */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-sm font-semibold text-white">
                {isPT ? 'Segurança' : 'Security'}
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {isPT
                  ? 'Opções de segurança e autenticação.'
                  : 'Security and authentication options.'}
              </p>

              <div className="mt-4 space-y-2">

                {/* 2FA */}
                <div className="flex min-h-[44px] items-center justify-between gap-4 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3">
                  <div className="min-w-0">
                    <p className="text-xs text-white/60">
                      {isPT
                        ? 'Autenticação de dois fatores'
                        : 'Two-factor authentication'}
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/25">
                      {isPT
                        ? 'Camada adicional de proteção.'
                        : 'Additional account protection.'}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md border border-amber-500/15 bg-amber-500/[0.05] px-2 py-1 text-[9px] font-medium text-amber-400">
                    {isPT ? 'Brevemente' : 'Coming soon'}
                  </span>
                </div>

                {/* ENTRA ID */}
                <div className="flex min-h-[44px] items-center justify-between gap-4 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3">
                  <div className="min-w-0">
                    <p className="text-xs text-white/60">
                      Microsoft Entra ID
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/25">
                      {isPT
                        ? 'Autenticação empresarial Microsoft.'
                        : 'Microsoft enterprise authentication.'}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md border border-amber-500/15 bg-amber-500/[0.05] px-2 py-1 text-[9px] font-medium text-amber-400">
                    {isPT ? 'Brevemente' : 'Coming soon'}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== ESTADO DO SISTEMA ==================== */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">

        <div className="border-b border-white/[0.06] px-5 py-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Server className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  {isPT
                    ? 'Estado do Sistema'
                    : 'System Status'}
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {isPT
                    ? 'Estado atual dos serviços NexHop.'
                    : 'Current status of NexHop services.'}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={checkServices}
              disabled={checking}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`
                  h-3.5 w-3.5
                  ${checking ? 'animate-spin' : ''}
                `}
              />

              {checking
                ? isPT
                  ? 'A verificar...'
                  : 'Checking...'
                : isPT
                  ? 'Verificar agora'
                  : 'Check now'}
            </button>

          </div>
        </div>

        <div className="divide-y divide-white/[0.05]">

          {serviceData.map((service) => {
            const Icon = service.icon;
            const status = services[service.id];

            return (
              <div
                key={service.id}
                className="flex items-center gap-3 px-5 py-4"
              >

                <Icon className="h-4 w-4 text-white/25" />

                <span className="flex-1 text-xs text-white/60">
                  {service.name}
                </span>

                {status === 'checking' ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-400">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    {isPT ? 'A verificar' : 'Checking'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {isPT ? 'Operacional' : 'Operational'}
                  </span>
                )}

              </div>
            );
          })}

        </div>
      </div>

      {/* ==================== SISTEMA ==================== */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-white/50">
            <Monitor className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              {isPT ? 'Sistema' : 'System'}
            </h2>

            <p className="mt-1 text-xs text-white/35">
              {isPT
                ? 'Informações da instalação.'
                : 'Installation information.'}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] text-white/25">
              Versão
            </p>

            <p className="mt-1 text-xs font-medium text-white/60">
              1.0.0
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] text-white/25">
              Ambiente
            </p>

            <p className="mt-1 text-xs font-medium text-white/60">
              Development
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[10px] text-white/25">
              {isPT ? 'Plataforma' : 'Platform'}
            </p>

            <p className="mt-1 text-xs font-medium text-white/60">
              NexHop
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SettingsPage;