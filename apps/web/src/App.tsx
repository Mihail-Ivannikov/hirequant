import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VacancyMarketPage from "@/pages/VacancyMarketPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<VacancyMarketPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;