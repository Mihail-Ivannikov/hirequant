import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get("mode") === "register" ? "register" : "login";
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "candidate";

  const { loginWithRedirect } = useAuth0();

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [role, setRole] = useState<"candidate" | "employer">(defaultRole);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAuth() {
    try {
      setIsLoading(true);

      // Save onboarding payload to local storage so AuthSync.tsx can send it 
      // to the backend upon return from the Auth0 Redirect window.
      if (mode === "register") {
        localStorage.setItem("onboarding_role", role);
        if (role === "employer" && companyName.trim()) {
          localStorage.setItem("onboarding_company", companyName.trim());
        }
      } else {
        localStorage.removeItem("onboarding_role");
        localStorage.removeItem("onboarding_company");
      }

      await loginWithRedirect({
        authorizationParams: {
          screen_hint: mode === "register" ? "signup" : "login",
          scope: "openid profile email",
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue={defaultMode} onValueChange={(v) => setMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Sign Up</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "register" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">I am a...</label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="candidate" />
                <span>Candidate (looking for jobs)</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employer" />
                <span>Employer (hiring talent)</span>
              </div>
            </RadioGroup>
          </div>

          {/* FIXED: Removed 'disabled', added required state binding */}
          {role === "employer" && (
            <Input 
              placeholder="Company Name (Required)" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          )}
        </div>
      )}

      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        onClick={handleAuth}
        disabled={isLoading || (mode === "register" && role === "employer" && !companyName.trim())}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "login" ? "Continue to Sign In" : "Continue to Sign Up"}
      </Button>

      <div className="text-center text-sm text-slate-500">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-indigo-600">
          Terms of Service
        </a>
      </div>
    </div>
  );
}