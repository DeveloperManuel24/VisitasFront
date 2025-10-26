"use client";

import { ReactNode, useMemo } from "react";
import { useAuth } from "@/app/components/auth-context";

/**
 * Uso:
 *   <CanAccess allow={["ADMINISTRADOR", "SUPERVISOR", "TECNICO"]}>
 *      ...link...
 *   </CanAccess>
 *
 * - ADMINISTRADOR siempre puede ver todo.
 * - Comparamos en MAYÚSCULAS.
 */
export default function CanAccess({
  allow,
  children,
}: {
  allow: Array<"ADMINISTRADOR" | "SUPERVISOR" | "TECNICO">;
  children: ReactNode;
}) {
  const { roles } = useAuth();

  const allowed = useMemo(() => {
    if (!roles || roles.length === 0) return false;

    const userRolesUpper = roles.map((r) => r.toUpperCase());

    // admin ve todo
    if (userRolesUpper.includes("ADMINISTRADOR")) return true;

    // si alguno de los roles del user está en allow => deja ver
    return allow.some((rolReq) => userRolesUpper.includes(rolReq));
  }, [roles, allow]);

  if (!allowed) return null;
  return <>{children}</>;
}
