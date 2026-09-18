import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";

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
import Forbidden from "@/pages/Forbidden";

import MyPortal from "@/pages/MyPortal";

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

              {/* =====================================================
                 PUBLIC
                 Páginas que não precisam de autenticação.
                 ===================================================== */}

              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />

              {/* =====================================================
                 IT PANEL
                 Admin e Viewer podem entrar no painel IT.
                 ===================================================== */}

              <Route element={<ProtectedRoute allowedRoles={["admin", "viewer"]} />}>
                <Route path="/" element={<AppLayout />}>

                  {/* -------------------------------------------------
                     ÁREAS DE CONSULTA
                     Admin + Viewer
                     ------------------------------------------------- */}

                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="equipment" element={<EquipmentPage />} />
                  <Route path="equipment/:id" element={<EquipmentPage />} />
                  <Route path="invoices" element={<InvoicePage />} />
                  <Route path="invoices/:id" element={<InvoicePage />} />
                  <Route path="warranties" element={<WarrantyPage />} />
                  <Route path="reservations" element={<ReservationsPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="reports" element={<ReportsPage />} />

                  {/* -------------------------------------------------
                     ADMIN + VIEWER
                     Viewer pode consultar estas áreas.
                     Apenas o Admin poderá alterar dados.
                     ------------------------------------------------- */}

                  <Route element={<ProtectedRoute allowedRoles={["admin", "viewer"]} />}>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="hierarchy" element={<HierarchyPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* -------------------------------------------------
                     ADMIN ONLY
                     Apenas o Admin pode consultar os Logs.
                     ------------------------------------------------- */}

                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="logs" element={<LogsPage />} />
                  </Route>

                  {/* -------------------------------------------------
                     ÁREAS PESSOAIS
                     Admin + Viewer
                     ------------------------------------------------- */}

                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="support" element={<SupportPage />} />

                  {/* -------------------------------------------------
                     SERVER ERROR
                     ------------------------------------------------- */}

                  <Route path="500" element={<ServerError />} />

                </Route>
              </Route>

              {/* =====================================================
                 USER PORTAL
                 Layout independente do painel IT.
                 Apenas utilizadores com role "user".
                 ===================================================== */}

              <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                <Route path="/portal/*" element={<MyPortal />} />
              </Route>

              {/* =====================================================
                 ACCESS DENIED
                 ===================================================== */}

              <Route path="/403" element={<Forbidden />} />

              {/* =====================================================
                 404
                 ===================================================== */}

              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>

        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
