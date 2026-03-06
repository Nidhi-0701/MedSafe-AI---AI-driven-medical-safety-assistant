import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import InteractionChecker from "./pages/InteractionChecker";
import PrescriptionAnalyzer from "./pages/PrescriptionAnalyzer";
import SymptomSolver from "./pages/SymptomSolver";
import SideEffectMonitor from "./pages/SideEffectMonitor";
import EmergencyRisk from "./pages/EmergencyRisk";
import HealthInsights from "./pages/HealthInsights";
import Patients from "./pages/Patients";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LayoutWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interactions" element={<InteractionChecker />} />
            <Route path="/prescription" element={<PrescriptionAnalyzer />} />
            <Route path="/symptoms" element={<SymptomSolver />} />
            <Route path="/side-effects" element={<SideEffectMonitor />} />
            <Route path="/emergency" element={<EmergencyRisk />} />
            <Route path="/insights" element={<HealthInsights />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
