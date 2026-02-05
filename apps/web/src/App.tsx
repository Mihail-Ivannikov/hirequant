import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthSync } from "@/components/auth/AuthSync";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VacancyMarketPage from "@/pages/VacancyMarketPage"; 

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/auth') {
      navigate('/jobs');
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <AuthRedirect />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<VacancyMarketPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;