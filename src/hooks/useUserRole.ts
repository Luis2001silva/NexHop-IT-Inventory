import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.ts";

export type UserRole = "admin" | "viewer" | "user";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (mounted) {
        setRole(error ? null : (data?.role as UserRole));
        setLoading(false);
      }
    };

    loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  return { role, loading };
}