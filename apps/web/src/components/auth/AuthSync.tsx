import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";

export function AuthSync() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncUserToBackend = async () => {
      if (!isAuthenticated || !user || hasSynced.current) return;

      try {
        const token = await getAccessTokenSilently();
        
        await api.post('/auth/sync', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("User synced with Backend Database");
        hasSynced.current = true;
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    syncUserToBackend();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return null;
}