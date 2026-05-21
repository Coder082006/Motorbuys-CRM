import { RouteGuard } from "./RouteGuard";
import type { UserRole } from "./useCurrentUser";

export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
) {
  function ProtectedComponent(props: P) {
    return (
      <RouteGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RouteGuard>
    );
  }

  ProtectedComponent.displayName = `withRoleGuard(${Component.displayName || Component.name || "Component"})`;

  return ProtectedComponent;
}
