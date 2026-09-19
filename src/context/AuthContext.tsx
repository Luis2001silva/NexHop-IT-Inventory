import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] =
    useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     VERIFICAR SESSÃO INICIAL
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Erro ao obter sessão:",
          error
        );
      }

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    loadSession();

    /* =======================================================
       OUVIR ALTERAÇÕES DE AUTENTICAÇÃO

       LOGIN
       LOGOUT
       REFRESH
       EXPIRAÇÃO DA SESSÃO
       ======================================================= */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     LOGIN
     ========================================================= */

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(
        "Erro ao iniciar sessão:",
        error
      );

      return false;
    }

    setSession(data.session);
    setUser(data.user);

    return true;
  };

  /* =========================================================
     TERMINAR SESSÃO
     ========================================================= */

  const signOut = async (): Promise<void> => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Erro ao terminar sessão:",
        error
      );

      throw error;
    }

    /* Garantir que o estado local é limpo
       imediatamente. */

    setUser(null);
    setSession(null);
  };

  /* =========================================================
     CONTEXT
     ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ===========================================================
   HOOK
   =========================================================== */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}