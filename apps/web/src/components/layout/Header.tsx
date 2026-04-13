import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "@/hooks/use-user-store";
import { api } from "@/lib/api";

export function Header() {
  const { isAuthenticated, logout, user, getAccessTokenSilently } = useAuth0();
  const { avatarUrl, role, setRole } = useUserStore();
  const [imgError, setImgError] = useState(false);
  const location = useLocation();

  const displayAvatarUrl = avatarUrl || user?.picture;

  useEffect(() => {
    if (isAuthenticated && role === null) {
      const fetchRole = async () => {
        try {
          const token = await getAccessTokenSilently();
          const { data } = await api.get('/vacancies/user/role', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRole(data.role);
        } catch (error) {
          console.error("Failed to fetch user role");
        }
      };
      fetchRole();
    }
  },[isAuthenticated, role, getAccessTokenSilently, setRole]);

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
            {/* Candidate Navigation */}
            {role !== 'EMPLOYER' && (
              <>
                <Link to="/jobs" className={`text-sm font-medium transition-colors ${location.pathname.includes('/jobs') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  Find Jobs
                </Link>
                {isAuthenticated && (
                  <Link to="/my-applications" className={`text-sm font-medium transition-colors ${location.pathname === '/my-applications' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                    My Applications
                  </Link>
                )}
              </>
            )}

            {/* Employer Navigation */}
            {role === 'EMPLOYER' && (
              <>
                <Link to="/employer/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/employer/dashboard' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  Dashboard
                </Link>
                <Link to="/profile" className={`text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  Company Profile
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all">
                  {displayAvatarUrl && !imgError ? (
                    <img src={displayAvatarUrl} alt="Profile" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                  ) : (
                    <span className="text-xs">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </Link>
              <Button variant="ghost" className="text-slate-600 text-sm" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth?mode=login"><Button variant="ghost" className="text-slate-600">Sign In</Button></Link>
              <Link to="/auth?mode=register"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}