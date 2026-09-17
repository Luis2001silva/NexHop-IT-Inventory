import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import Forbidden from "@/pages/Forbidden";

import AppLayout from "@/components/Layout/AppLayout";

import AlertsPage from "@/pages/AlertsPage";

import ServerError from "@/pages/ServerError";
import CreateAccountPage from "@/pages/CreateAccountPage";
import Dashboard from "@/pages/Dashboard";
import DocumentsPage from "@/pages/DocumentsPage";
import EquipmentPage from "@/pages/EquipmentPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import HierarchyPage from "@/pages/HierarchyPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import LogsPage from "@/pages/LogsPage";
import NotFound from "@/pages/NotFound";
import InvoicePage from "@/pages/InvoicePage";
import ProfilePage from "@/pages/ProfilePage";
import ReportsPage from "@/pages/ReportsPage";
import ReservationsPage from "@/pages/ReservationsPage";
import SupportPage from "@/pages/SupportPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import WarrantyPage from "@/pages/WarrantyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>

              {/* PUBLIC */}

              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />

              {/* IT PANEL */}

             {/* IT PANEL */}

              <Route element={<ProtectedRoute allowedRoles={["admin", "viewer"]} />}>
                <Route path="/" element={<AppLayout />}>

                  {/* Dashboard */}
                  <Route path="dashboard" element={<Dashboard />} />

                  {/* Hierarchy */}
                  <Route path="hierarchy" element={<HierarchyPage />} />

                  {/* Server Error */}
                  <Route path="500" element={<ServerError />} />

                  {/* Warranties */}
                  <Route path="warranties" element={<WarrantyPage />} />

                  {/* Reservations */}
                  <Route path="reservations" element={<ReservationsPage />} />

                  {/* Equipment */}
                  <Route path="equipment" element={<EquipmentPage />} />

                  {/* Equipment Details */}
                  <Route path="equipment/:id" element={<EquipmentPage />} />

                  {/* Reports */}
                  <Route path="reports" element={<ReportsPage />} />

                  {/* Documents */}
                  <Route path="documents" element={<DocumentsPage />} />

                  {/* Alerts */}
                  <Route path="alerts" element={<AlertsPage />} />

                  {/* Profile */}
                  <Route path="profile" element={<ProfilePage />} />

                  {/* Invoices */}
                  <Route path="invoices" element={<InvoicePage />} />

                  {/* Invoice Details */}
                  <Route path="invoices/:id" element={<InvoicePage />} />

                  {/* Logs */}
                  <Route path="logs" element={<LogsPage />} />

                  {/* Support */}
                  <Route path="support" element={<SupportPage />} />

                  {/* Users */}
                  <Route path="users" element={<UsersPage />} />

                  {/* Settings */}
                  <Route path="settings" element={<SettingsPage />} />

                </Route>
              </Route>

              {/* ACCESS DENIED */}

              <Route path="/403" element={<Forbidden />} />

              {/* 404 */}

              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>

        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;