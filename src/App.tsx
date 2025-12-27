import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuiProvider } from "@/providers/SuiProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Documentation from "./pages/Documentation";
import Whitepaper from "./pages/Whitepaper";
import NotFound from "./pages/NotFound";
import { DoctorPortal } from "./components/portal/doctor/DoctorPortal";
import { LabPortal } from "./components/portal/lab/LabPortal";

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="selora-theme">
    <SuiProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/portal/doctor" element={<DoctorPortal walletAddress="0x1234...5678" onSignOut={() => window.location.href = '/'} />} />
            <Route path="/portal/lab" element={<LabPortal walletAddress="0x1234...5678" onSignOut={() => window.location.href = '/'} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SuiProvider>
  </ThemeProvider>
);

export default App;
