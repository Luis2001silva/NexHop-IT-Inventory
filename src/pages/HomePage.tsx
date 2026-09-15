import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRight,
  ShieldCheck,
  Monitor,
  Activity,
  Database,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#080D1F] text-white overflow-hidden">

      {/* HEADER */}
      <header className="h-[72px] border-b border-white/[0.06] flex items-center justify-between px-6 lg:px-10">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Monitor
              size={19}
              className="text-white"
            />
          </div>

          <div>
            <div className="font-semibold text-[15px] leading-none">
              NexHop
            </div>

            <div className="mt-1 text-[9px] tracking-[0.12em] text-white/35">
              IT OPERATIONS
            </div>
          </div>
        </Link>

        {/* LOGIN */}
        <Link
          to="/login"
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-white"
        >
          {language === 'pt'
            ? 'Entrar'
            : 'Sign in'}
        </Link>

      </header>

      {/* HERO */}
      <main className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-20">

        {/* BACKGROUND GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">

          {/* STATUS */}
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-3.5 py-1.5 text-[11px] text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

            {language === 'pt'
              ? 'Ambiente operacional protegido'
              : 'Protected operational environment'}
          </div>

          {/* TITLE */}
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {language === 'pt' ? (
              <>
                Operações IT,
                <br />
                <span className="text-blue-500">
                  com total controlo.
                </span>
              </>
            ) : (
              <>
                IT operations,
                <br />
                <span className="text-blue-500">
                  under total control.
                </span>
              </>
            )}
          </h1>

          {/* DESCRIPTION */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
            {language === 'pt'
              ? 'Uma plataforma centralizada para gerir equipamentos, utilizadores, garantias, documentação e operações IT num único lugar.'
              : 'A centralized platform to manage equipment, users, warranties, documentation and IT operations in one place.'}
          </p>

          {/* ACTIONS */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/login"
              className="group flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-medium text-white transition hover:bg-blue-500"
            >
              {language === 'pt'
                ? 'Entrar na plataforma'
                : 'Enter platform'}

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <button
              className="h-11 rounded-lg border border-white/[0.08] px-5 text-xs font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
            >
              {language === 'pt'
                ? 'Saber mais'
                : 'Learn more'}
            </button>

          </div>

          {/* FEATURES */}
          <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* FEATURE 1 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Monitor size={17} />
              </div>

              <h3 className="text-xs font-semibold text-white">
                {language === 'pt'
                  ? 'Gestão de ativos'
                  : 'Asset management'}
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/35">
                {language === 'pt'
                  ? 'Controlo completo sobre o teu parque informático.'
                  : 'Complete visibility across your IT estate.'}
              </p>
            </div>

            {/* FEATURE 2 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity size={17} />
              </div>

              <h3 className="text-xs font-semibold text-white">
                {language === 'pt'
                  ? 'Monitorização'
                  : 'Monitoring'}
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/35">
                {language === 'pt'
                  ? 'Acompanha o estado da infraestrutura em tempo real.'
                  : 'Track infrastructure health in real time.'}
              </p>
            </div>

            {/* FEATURE 3 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck size={17} />
              </div>

              <h3 className="text-xs font-semibold text-white">
                {language === 'pt'
                  ? 'Segurança'
                  : 'Security'}
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/35">
                {language === 'pt'
                  ? 'Dados e acessos protegidos numa plataforma centralizada.'
                  : 'Protected data and access in one centralized platform.'}
              </p>
            </div>

          </div>

          {/* BOTTOM STATUS */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/30">
            <Database size={12} />

            {language === 'pt'
              ? 'NexHop • IT Infrastructure Management'
              : 'NexHop • IT Infrastructure Management'}
          </div>

        </div>

      </main>

    </div>
  );
};

export default HomePage;