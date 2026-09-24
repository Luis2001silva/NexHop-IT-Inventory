import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
} from 'lucide-react';

const ServerError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">

        {/* ICON */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.06] shadow-[0_0_40px_rgba(239,68,68,0.08)]">
          <AlertTriangle className="h-9 w-9 text-red-400" />
        </div>

        {/* ERROR CODE */}
        <div className="select-none text-[110px] font-bold leading-none tracking-[-0.06em] text-white/[0.06] sm:text-[150px]">
          500
        </div>

        {/* CONTENT */}
        <div className="-mt-10 relative">

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Algo correu mal
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
            Ocorreu um erro inesperado ao processar o pedido.
            Tenta novamente ou volta ao Dashboard.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            {/* RETRY */}
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-500"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-5 text-sm font-medium text-white/65 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>

            {/* BACK */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-5 text-sm font-medium text-white/65 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

          </div>

          {/* STATUS */}
          <div className="mx-auto mt-10 flex w-fit items-center gap-2 rounded-full border border-red-500/10 bg-red-500/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />

            <span className="text-[10px] text-white/30">
              Erro interno do servidor
            </span>
          </div>

          {/* FOOTER */}
          <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-white/20">
            nexthop · nexthop
          </p>

        </div>
      </div>
    </div>
  );
};

export default ServerError;