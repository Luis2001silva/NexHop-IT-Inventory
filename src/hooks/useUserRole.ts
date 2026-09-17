import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/* =========================================================
   USER ROLES
   ========================================================= */

export type UserRole = "admin" | "viewer" | "user";

/* =========================================================
   HOOK
   Obtém o role do utilizador autenticado através da tabela
   profiles do Supabase.
   ========================================================= */

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD USER ROLE
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      try {
        /* ---------------------------------------------------
           Obter utilizador atualmente autenticado
        --------------------------------------------------- */

        const {
          data: { user },
        } = await supabase.auth.getUser();

        /* ---------------------------------------------------
           Se não existir sessão, não existe role
        --------------------------------------------------- */

        if (!user) {
          if (mounted) {
            setRole(null);
            setLoading(false);
          }

          return;
        }

        /* ---------------------------------------------------
           Procurar o role na tabela profiles
        --------------------------------------------------- */

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        /* ---------------------------------------------------
           Guardar o role encontrado
        --------------------------------------------------- */

        if (mounted) {
          if (error) {
            setRole(null);
          } else {
            setRole(data?.role as UserRole);
          }

          setLoading(false);
        }
      } catch (error) {
        /* ---------------------------------------------------
           Erro inesperado
        --------------------------------------------------- */

        console.error("Error loading user role:", error);

        if (mounted) {
          setRole(null);
          setLoading(false);
        }
      }
    };

    loadRole();

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    role,
    loading,
  };
}