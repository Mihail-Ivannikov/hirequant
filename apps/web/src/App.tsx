import { Routes, Route } from "react-router-dom";
import { AuthSync } from "@/components/auth/AuthSync";
import { Toaster } from "@/components/ui/toaster";

import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VacancyMarketPage from "@/pages/VacancyMarketPage";
import VacancyDetailsPage from "@/pages/VacancyDetailsPage";
import ApplicationWizardPage from "@/pages/ApplicationWizardPage";
import CandidateProfilePage from "@/pages/CandidateProfilePage";

function App() {
  return (
    <>
      {/* AuthSync is now only here, which is fine, but removing it from main.tsx is cleaner */}
      <AuthSync /> 

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<VacancyMarketPage />} />
        <Route path="/jobs/:id" element={<VacancyDetailsPage />} />
        <Route path="/jobs/:id/apply" element={<ApplicationWizardPage />} />
        <Route path="/profile" element={<CandidateProfilePage />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;