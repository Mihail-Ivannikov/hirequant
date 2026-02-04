import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthSync } from "@/components/auth/AuthSync";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VacancyMarketPage from "@/pages/VacancyMarketPage"; 

function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<VacancyMarketPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;