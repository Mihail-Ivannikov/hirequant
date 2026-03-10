import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "@/lib/api";
import { useUserStore } from "@/hooks/use-user-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AuthSync() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const hasSynced = useRef(false);
  const { toast } = useToast();
  
  // Global Store
  const { setAvatarUrl, requires2FA, is2FAVerified, setRequires2FA, set2FAVerified } = useUserStore();
  
  // Local State for the verification modal
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (!isAuthenticated || !user || hasSynced.current) return;

      try {
        const token = await getAccessTokenSilently();

        // 1. Sync User to Database
        await api.post('/auth/sync', {}, { headers: { Authorization: `Bearer ${token}` } });

        // 2. Fetch full profile and 2FA status immediately
        const response = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = response.data;

        // 3. Set Global Avatar so the Header updates instantly!
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        if (data.profile?.avatarUrl) {
            setAvatarUrl(`${baseUrl}/uploads/${data.profile.avatarUrl}`);
        } else if (user.picture) {
            setAvatarUrl(user.picture);
        }

        // 4. Check 2FA Status
        if (data.phoneAuth?.isTwoFactorEnabled) {
            setRequires2FA(true); // This will trigger the lock screen below
        } else {
            set2FAVerified(true); // User is safe to proceed
        }

        hasSynced.current = true;
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };

    initializeUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsVerifying(true);
    try {
      const token = await getAccessTokenSilently();
      await api.post('/auth/2fa/verify', { code }, { headers: { Authorization: `Bearer ${token}` } });
      set2FAVerified(true); // Unlocks the screen!
      toast({ title: "Verified", description: "Successfully logged in." });
    } catch (error) {
      toast({ title: "Error", description: "Invalid 2FA code.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  // If 2FA is required but not yet verified, we render a full-screen lock overlay
  if (requires2FA && !is2FAVerified) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
        <Card className="w-[400px] shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
               <ShieldCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
            <p className="text-sm text-slate-500 mt-2">Please open Google Authenticator and enter your 6-digit code.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input 
              type="text"
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button onClick={handleVerify} disabled={isVerifying || code.length !== 6} className="w-full h-12 text-lg">
              {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}