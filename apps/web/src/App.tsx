import { Routes, Route } from "react-router-dom";
import { AuthSync } from "@/components/auth/AuthSync";
import { Toaster } from "@/components/ui/toaster";

import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VacancyMarketPage from "@/pages/VacancyMarketPage";
import VacancyDetailsPage from "@/pages/VacancyDetailsPage";
import ApplicationWizardPage from "@/pages/ApplicationWizardPage";
import CandidateProfilePage from "@/pages/CandidateProfilePage";
import MyApplicationsPage from "@/pages/MyApplicationsPage";
import EmployerDashboardPage from "@/pages/EmployerDashboardPage";
import JobConstructorPage from "@/pages/JobConstructorPage";
import ApplicantRankingPage from "@/pages/ApplicantRankingPage";
import CandidateReviewPage from "@/pages/CandidateReviewPage";

function App() {
  return (
    <>
      <AuthSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<VacancyMarketPage />} />
        <Route path="/jobs/:id" element={<VacancyDetailsPage />} />
        <Route path="/jobs/:id/apply" element={<ApplicationWizardPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
        <Route path="/employer/jobs/create" element={<JobConstructorPage />} />
        <Route path="/employer/jobs/edit/:id" element={<JobConstructorPage />} />
        <Route path="/employer/jobs/:id/applicants" element={<ApplicantRankingPage />} />
        <Route path="/employer/applications/:applicationId" element={<CandidateReviewPage />} />
        <Route path="/profile" element={<CandidateProfilePage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;