import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function Header() {
  const { isAuthenticated, logout } = useAuth0();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SmartRecruit<span className="text-indigo-600">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Find Jobs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              className="text-slate-600"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/auth?mode=login">
                <Button variant="ghost" className="text-slate-600">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}