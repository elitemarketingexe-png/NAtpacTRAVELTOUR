import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Places from "./pages/Places";
import Trips from "./pages/Trips";
import StartTrip from "./pages/StartTrip";
import ActiveTrip from "./pages/ActiveTrip";
import Admin from "./pages/Admin";
import Gov from "./pages/Gov";
import { getRole, hasAnyRole, isAuthed } from "@/lib/auth";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

function RequireAuth({ roles, children }: { roles?: ("user"|"admin"|"gov")[]; children: JSX.Element }) {
  if (!isAuthed()) return <Navigate to="/auth" replace />;
  if (roles && !hasAnyRole(roles)) return <Navigate to="/" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
          <Route path="/places" element={<RequireAuth><Places /></RequireAuth>} />
          <Route path="/trips" element={<RequireAuth><Trips /></RequireAuth>} />
          <Route path="/trip/start" element={<RequireAuth><StartTrip /></RequireAuth>} />
          <Route path="/trip/active" element={<RequireAuth><ActiveTrip /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          <Route path="/admin" element={<RequireAuth roles={["admin"]}><Admin /></RequireAuth>} />
          <Route path="/gov" element={<RequireAuth roles={["gov","admin"]}><Gov /></RequireAuth>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
