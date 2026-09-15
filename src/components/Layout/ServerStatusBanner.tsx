import {
  Loader2,
  RefreshCw,
  Wrench,
  WifiOff,
} from 'lucide-react';

type ServerStatus =
  | 'connecting'
  | 'updating'
  | 'maintenance'
  | 'online'
  | 'offline';

interface ServerStatusBannerProps {
  status: ServerStatus;
}

const ServerStatusBanner = ({
  status,
}: ServerStatusBannerProps) => {

  const config = {
    connecting: {
      icon: Loader2,
      title: 'A ligar ao servidor...',
      description: 'A estabelecer ligação segura aos serviços NexHop.',
      color: 'blue',
      iconClass: 'animate-spin',
    },

    updating: {
      icon: RefreshCw,
      title: 'Servidor a atualizar',
      description: 'Estamos a aplicar uma atualização. Algumas funcionalidades poderão estar temporariamente indisponíveis.',
      color: 'blue',
      iconClass: 'animate-spin',
    },

    maintenance: {
      icon: Wrench,
      title: 'Servidor em manutenção',
      description: 'O sistema está temporariamente indisponível. Voltaremos em breve.',
      color: 'amber',
      iconClass: '',
    },

    online: {
      icon: WifiOff,
      title: 'Servidor online',
      description: 'O servidor está completamente operacional.',
      color: 'green',
      iconClass: '',
    },

    offline: {
      icon: WifiOff,
      title: 'Sem ligação ao servidor',
      description: 'Não foi possível estabelecer ligação ao servidor.',
      color: 'red',
      iconClass: '',
    },
  }[status];

  const Icon = config.icon;

  const colors = {
    blue: {
      wrapper: 'border-blue-500/20 bg-blue-500/[0.06]',
      icon: 'text-blue-400',
      bar: 'bg-blue-500',
    },

    amber: {
      wrapper: 'border-amber-500/20 bg-amber-500/[0.06]',
      icon: 'text-amber-400',
      bar: 'bg-amber-400',
    },

    red: {
      wrapper: 'border-red-500/20 bg-red-500/[0.06]',
      icon: 'text-red-400',
      bar: 'bg-red-500',
    },
  }[config.color];

  return (
    <div className="relative w-full shrink-0 overflow-hidden border-b border-white/[0.06] bg-[#080D1F]">

      <div className="mx-auto flex min-h-[58px] w-full max-w-[1600px] items-center px-6 lg:px-8">

        {/* ICON */}
        <div
          className={`
            mr-3
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            ${colors.wrapper}
          `}
        >
          <Icon
            className={`
              h-4
              w-4
              ${colors.icon}
              ${config.iconClass}
            `}
          />
        </div>

        {/* TEXT */}
        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">

            <p className="text-xs font-semibold text-white">
              {config.title}
            </p>

            {status === 'connecting' && (
              <div className="flex gap-1">
                <span className="h-1 w-1 animate-bounce rounded-full bg-blue-400" />
                <span
                  className="h-1 w-1 animate-bounce rounded-full bg-blue-400"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-1 w-1 animate-bounce rounded-full bg-blue-400"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            )}

          </div>

          <p className="mt-0.5 truncate text-[11px] text-white/35">
            {config.description}
          </p>

        </div>

        {/* SERVER */}
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 sm:flex">

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${colors.bar}
              ${status === 'connecting' ? 'animate-pulse' : ''}
            `}
          />

          <span className="text-[10px] text-white/35">
            NexHop Server
          </span>

        </div>

      </div>

      {/* PROGRESS BAR */}
      {(status === 'connecting' || status === 'updating') && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-white/[0.03]">
          <div
            className={`
              h-full
              w-1/3
              rounded-full
              ${colors.bar}
              animate-[serverProgress_1.5s_ease-in-out_infinite]
            `}
          />
        </div>
      )}

    </div>
  );
};

export default ServerStatusBanner;