import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import AppLayout from "./components/Layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForbiddenPage from "./pages/Forbidden";

import DashboardPage from "./pages/Dashboard";
import EquipmentPage from "./pages/EquipmentPage";
import UsersPage from "./pages/UsersPage";
import DepartmentsPage from "./pages/HierarchyPage";
import InvoicesPage from "./pages/InvoicePage";
import WarrantiesPage from "./pages/WarrantyPage";
import ReservationsPage from "./pages/ReservationsPage";
import DocumentsPage from "./pages/DocumentsPage";
import HierarchyPage from "./pages/HierarchyPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";

import MyPortalPage from "./pages/MyPortal";
import PasswordResetRequestsPage from "./pages/PasswordResetRequestsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Routes>
              {/* ========================================
                  ROTAS PÚBLICAS
              ======================================== */}

              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />

              <Route
                path="/403"
                element={<ForbiddenPage />}
              />

              {/* ========================================
                  PORTAL DO UTILIZADOR
              ======================================== */}

              <Route
                element={
                  <ProtectedRoute allowedRoles={["user"]} />
                }
              >
                <Route
                  path="/portal/*"
                  element={<MyPortalPage />}
                />
              </Route>

              {/* ========================================
                  ÁREA IT
                  ADMIN + VIEWER
              ======================================== */}

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "viewer"]}
                  />
                }
              >
                <Route element={<AppLayout />}>

                  {/* ====================================
                      PRINCIPAL
                  ==================================== */}

                  <Route
                    path="/dashboard"
                    element={<DashboardPage />}
                  />

                  <Route
                    path="/equipment"
                    element={<EquipmentPage />}
                  />

                  <Route
                    path="/equipment/new"
                    element={<EquipmentPage />}
                  />

                  <Route
                    path="/equipment/:id"
                    element={<EquipmentPage />}
                  />

                  {/* ====================================
                      GESTÃO
                  ==================================== */}

                  <Route
                    path="/users"
                    element={<UsersPage />}
                  />

                  <Route
                    path="/departments"
                    element={<DepartmentsPage />}
                  />

                  <Route
                    path="/invoices"
                    element={<InvoicesPage />}
                  />

                  <Route
                    path="/invoices/new"
                    element={<InvoicesPage />}
                  />

                  <Route
                    path="/invoices/:id"
                    element={<InvoicesPage />}
                  />

                  <Route
                    path="/warranties"
                    element={<WarrantiesPage />}
                  />

                  <Route
                    path="/reservations"
                    element={<ReservationsPage />}
                  />

                  <Route
                    path="/documents"
                    element={<DocumentsPage />}
                  />

                  <Route
                    path="/hierarchy"
                    element={<HierarchyPage />}
                  />

                  {/* ====================================
                      MONITORIZAÇÃO
                  ==================================== */}

                  <Route
                    path="/alerts"
                    element={<AlertsPage />}
                  />

                  <Route
                    path="/reports"
                    element={<ReportsPage />}
                  />

                  {/* ====================================
                      ADMIN ONLY
                  ==================================== */}

                  <Route
                    element={
                      <ProtectedRoute allowedRoles={["admin"]} />
                    }
                  >
                    <Route
                      path="/logs"
                      element={<LogsPage />}
                    />

                    <Route
                      path="/password-reset-requests"
                      element={<PasswordResetRequestsPage />}
                    />
                  </Route>

                  {/* ====================================
                      SISTEMA
                  ==================================== */}

                  <Route
                    path="/settings"
                    element={<SettingsPage />}
                  />

                  <Route
                    path="/profile"
                    element={<ProfilePage />}
                  />

                  <Route
                    path="/support"
                    element={<SupportPage />}
                  />

                </Route>
              </Route>

              {/* ========================================
                  FALLBACK
              ======================================== */}

              <Route
                path="*"
                element={<Navigate to="/login" replace />}
              />

            </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;