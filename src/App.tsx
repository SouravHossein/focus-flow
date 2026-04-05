import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import ResetPasswordPage from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import InboxPage from "./pages/Inbox";
import TodayPage from "./pages/Today";
import UpcomingPage from "./pages/Upcoming";
import OverduePage from "./pages/Overdue";
import CompletedPage from "./pages/Completed";
import ProjectPage from "./pages/Project";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";
import LabelFilterPage from "./pages/LabelFilter";
import SavedFilterPage from "./pages/SavedFilter";
import FocusPage from "./pages/Focus";
import JourneyPage from "./pages/Journey";
import TemplatesSettingsPage from "./pages/settings/TemplatesSettings";
import MyDayPage from "./pages/MyDay";
import ActivityPage from "./pages/Activity";
import WorkspaceSettingsPage from "./pages/WorkspaceSettings";
import InviteAcceptPage from "./pages/InviteAccept";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/inbox" replace />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="today" element={<TodayPage />} />
              <Route path="upcoming" element={<UpcomingPage />} />
              <Route path="overdue" element={<OverduePage />} />
              <Route path="completed" element={<CompletedPage />} />
              <Route path="project/:projectId" element={<ProjectPage />} />
              <Route path="label/:labelId" element={<LabelFilterPage />} />
              <Route path="filter/:filterId" element={<SavedFilterPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="focus" element={<FocusPage />} />
              <Route path="journey" element={<JourneyPage />} />
              <Route path="myday" element={<MyDayPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/templates" element={<TemplatesSettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
