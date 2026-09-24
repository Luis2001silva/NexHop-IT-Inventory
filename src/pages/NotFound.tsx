import { Link } from 'react-router-dom';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">

        {/* ICON */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] shadow-[0_0_40px_rgba(59,130,246,0.08)]">
          <SearchX className="h-9 w-9 text-blue-400" />
        </div>

        {/* ERROR CODE */}
        <div className="select-none text-[110px] font-bold leading-none tracking-[-0.06em] text-white/[0.06] sm:text-[150px]">
          404
        </div>

        {/* CONTENT */}
        <div className="-mt-10 relative">

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Página não encontrada
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
            A página que procuras não existe, foi movida ou
            já não está disponível.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-500"
            >
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-5 text-sm font-medium text-white/65 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

          </div>

          {/* FOOTER TEXT */}
          <p className="mt-10 text-[10px] uppercase tracking-[0.18em] text-white/20">
            nexthop · nexthop
          </p>

        </div>
      </div>
    </div>
  );
};

export default NotFound;