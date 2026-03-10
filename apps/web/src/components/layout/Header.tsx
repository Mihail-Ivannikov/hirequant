import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "@/hooks/use-user-store"; // Store import

export function Header() {
  const { isAuthenticated, logout, user } = useAuth0();
  const { avatarUrl } = useUserStore(); // Global State
  const [imgError, setImgError] = useState(false); 

  // Determine URL. Priority: Global State > Auth0 Picture
  const displayAvatarUrl = avatarUrl || user?.picture;
  
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
            <div className="flex items-center gap-4">
              {/* Profile Avatar */}
              <Link to="/profile">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all">
                  {displayAvatarUrl && !imgError ? (
                    <img 
                      src={displayAvatarUrl} 
                      alt="Profile Avatar" 
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)} 
                    />
                  ) : (
                    // Fallback Initials
                    <span className="text-xs">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
              
              <Button
                variant="ghost"
                className="text-slate-600 text-sm"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth?mode=login">
                <Button variant="ghost" className="text-slate-600">Sign In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}