import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Network,
  Search,
  Users,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface Profile {
  id: string;
  full_name: string | null;
  email?: string | null;
  role: string | null;
  department: string | null;s
  position: string | null;
  manager_id: string | null;
}

interface HierarchyNode extends Profile {
  children: HierarchyNode[];
}

const HierarchyPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const isPT = language === 'pt';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /*
   * ---------------------------------------------------------
   * LOAD USERS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);

    const { data, error } = await (supabase as any)
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        department,
        position,
        manager_id
      `)
      .order('full_name');

    if (!error && data) {
      setProfiles(data);

      /*
       * Expandimos inicialmente os níveis superiores.
       */
      const roots = data.filter(
        (profile) => !profile.manager_id
      );

      setExpanded(new Set(roots.map((profile) => profile.id)));
    }

    setLoading(false);
  };

  /*
   * ---------------------------------------------------------
   * BUILD TREE
   * ---------------------------------------------------------
   */

  const tree = useMemo(() => {
    const map = new Map<string, HierarchyNode>();

    profiles.forEach((profile) => {
      map.set(profile.id, {
        ...profile,
        children: [],
      });
    });

    const roots: HierarchyNode[] = [];

    map.forEach((node) => {
      if (node.manager_id && map.has(node.manager_id)) {
        map.get(node.manager_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortTree = (nodes: HierarchyNode[]) => {
      nodes.sort((a, b) =>
        (a.full_name || '').localeCompare(
          b.full_name || '',
          'pt'
        )
      );

      nodes.forEach((node) => {
        sortTree(node.children);
      });
    };

    sortTree(roots);

    return roots;
  }, [profiles]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role?: string | null) => {
    if (role === 'admin') {
      return isPT ? 'Administrador' : 'Administrator';
    }

    return isPT ? 'Visualizador' : 'Viewer';
  };

  const toggleNode = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const expandAll = () => {
    setExpanded(new Set(profiles.map((profile) => profile.id)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const searchLower = search.trim().toLowerCase();

  const matchesSearch = (node: HierarchyNode): boolean => {
    if (!searchLower) return true;

    const ownMatch =
      node.full_name?.toLowerCase().includes(searchLower) ||
      node.email?.toLowerCase().includes(searchLower) ||
      node.department?.toLowerCase().includes(searchLower) ||
      node.position?.toLowerCase().includes(searchLower);

    const childMatch = node.children.some(matchesSearch);

    return Boolean(ownMatch || childMatch);
  };

  /*
   * ---------------------------------------------------------
   * RENDER NODE
   * ---------------------------------------------------------
   */

  const renderNode = (
    node: HierarchyNode,
    level = 0
  ): React.ReactNode => {
    if (!matchesSearch(node)) return null;

    const hasChildren = node.children.length > 0;
    const isExpanded =
      expanded.has(node.id) || Boolean(searchLower);

    const isCurrentUser =
      user?.id === node.id;

    return (
      <div key={node.id} className="relative">

        {/* CONNECTOR */}
        {level > 0 && (
          <div
            className="absolute -left-5 top-7 h-px w-5 bg-white/[0.08]"
          />
        )}

        <div
          className={`
            group
            relative
            flex
            items-center
            gap-3
            rounded-xl
            border
            px-4
            py-3
            transition-all
            ${
              isCurrentUser
                ? 'border-blue-500/30 bg-blue-500/[0.06]'
                : 'border-white/[0.06] bg-[#0D1730] hover:border-white/[0.10] hover:bg-[#101B35]'
            }
          `}
        >

          {/* EXPAND */}
          <button
            type="button"
            onClick={() => {
              if (hasChildren) {
                toggleNode(node.id);
              }
            }}
            className={`
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition
              ${
                hasChildren
                  ? 'text-white/40 hover:bg-white/[0.05] hover:text-white'
                  : 'text-transparent cursor-default'
              }
            `}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* AVATAR */}
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-xs
              font-semibold
              ${
                node.role === 'admin'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-white/[0.06] text-white/60'
              }
            `}
          >
            {getInitials(node.full_name)}
          </div>

          {/* INFO */}
          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <span className="truncate text-sm font-medium text-white">
                {node.full_name || 'Sem nome'}
              </span>

              {isCurrentUser && (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-medium text-blue-400">
                  {isPT ? 'Tu' : 'You'}
                </span>
              )}

            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/35">

              {node.position && (
                <span>{node.position}</span>
              )}

              {node.position && node.department && (
                <span className="text-white/15">•</span>
              )}

              {node.department && (
                <span>{node.department}</span>
              )}

            </div>

          </div>

          {/* ROLE */}
          <div className="hidden items-center gap-2 sm:flex">

            <span
              className={`
                rounded-lg
                border
                px-2.5
                py-1
                text-[10px]
                font-medium
                ${
                  node.role === 'admin'
                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
                    : 'border-white/[0.06] bg-white/[0.03] text-white/35'
                }
              `}
            >
              {getRoleLabel(node.role)}
            </span>

            {hasChildren && (
              <span className="inline-flex min-w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-white/35">
                {node.children.length}
              </span>
            )}

          </div>

        </div>

        {/* CHILDREN */}
        {hasChildren && isExpanded && (
          <div
            className="relative ml-9 mt-2 space-y-2 border-l border-white/[0.07] pl-5"
          >
            {node.children.map((child) =>
              renderNode(child, level + 1)
            )}
          </div>
        )}

      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const adminCount = profiles.filter(
    (profile) => profile.role === 'admin'
  ).length;

  const managerCount = profiles.filter((profile) =>
    profiles.some(
      (child) => child.manager_id === profile.id
    )
  ).length;

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT ? 'Hierarquia' : 'Hierarchy'}
          </h1>

          <p className="mt-1.5 text-sm text-white/35">
            {isPT
              ? 'Estrutura organizacional e relações entre colaboradores.'
              : 'Organizational structure and employee relationships.'}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={expandAll}
            className="inline-flex h-9 items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
          >
            {isPT ? 'Expandir tudo' : 'Expand all'}
          </button>

          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex h-9 items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
          >
            {isPT ? 'Recolher tudo' : 'Collapse all'}
          </button>

        </div>

      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* TOTAL */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[11px] text-white/35">
                {isPT ? 'Colaboradores' : 'Employees'}
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {profiles.length}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </div>

          </div>
        </div>

        {/* MANAGERS */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[11px] text-white/35">
                {isPT ? 'Gestores' : 'Managers'}
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {managerCount}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-white/50">
              <UserRound className="h-4 w-4" />
            </div>

          </div>
        </div>

        {/* ADMINS */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[11px] text-white/35">
                {isPT ? 'Administradores' : 'Administrators'}
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {adminCount}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>

          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0D1730] p-3">
        <div className="relative">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              isPT
                ? 'Pesquisar colaborador, cargo ou departamento...'
                : 'Search employee, position or department...'
            }
            className="h-10 w-full rounded-lg border border-white/[0.07] bg-[#0A1328] pl-10 pr-4 text-xs text-white outline-none placeholder:text-white/25 transition focus:border-blue-500/30"
          />

        </div>
      </div>

      {/* TREE */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5 lg:p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-white">
              {isPT
                ? 'Estrutura organizacional'
                : 'Organizational structure'}
            </h2>

            <p className="mt-1 text-[11px] text-white/30">
              {isPT
                ? 'Todos os colaboradores podem consultar a estrutura.'
                : 'All employees can view the organizational structure.'}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1.5 text-[10px] text-emerald-400">
            {isPT
              ? 'Visualização'
              : 'Read only'}
          </div>

        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-white/35">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
              {isPT
                ? 'A carregar hierarquia...'
                : 'Loading hierarchy...'}
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

            <Network className="mb-3 h-8 w-8 text-white/15" />

            <p className="text-sm text-white/45">
              {isPT
                ? 'Não existem colaboradores para apresentar.'
                : 'There are no employees to display.'}
            </p>

          </div>
        ) : (
          <div className="space-y-2">
            {tree.map((node) => renderNode(node))}
          </div>
        )}

      </div>

    </div>
  );
};

export default HierarchyPage;