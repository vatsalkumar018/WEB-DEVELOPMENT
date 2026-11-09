import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { OrderProvider } from '@/contexts/OrderContext';

import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Code-split pages for high performance
const LandingPage = lazy(() =>
  import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const StudentHomePage = lazy(() =>
  import('@/pages/student/StudentHomePage').then((m) => ({ default: m.StudentHomePage }))
);
const MenuPage = lazy(() =>
  import('@/pages/student/MenuPage').then((m) => ({ default: m.MenuPage }))
);
const CartPage = lazy(() =>
  import('@/pages/student/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('@/pages/student/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const TokenTrackingPage = lazy(() =>
  import('@/pages/student/TokenTrackingPage').then((m) => ({ default: m.TokenTrackingPage }))
);
const OrderHistoryPage = lazy(() =>
  import('@/pages/student/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage }))
);
const NotificationsPage = lazy(() =>
  import('@/pages/student/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const FeedbackPage = lazy(() =>
  import('@/pages/student/FeedbackPage').then((m) => ({ default: m.FeedbackPage }))
);

const StaffDashboardPage = lazy(() =>
  import('@/pages/staff/StaffDashboardPage').then((m) => ({ default: m.StaffDashboardPage }))
);
const KitchenDisplayPage = lazy(() =>
  import('@/pages/staff/KitchenDisplayPage').then((m) => ({ default: m.KitchenDisplayPage }))
);

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const MenuManagementPage = lazy(() =>
  import('@/pages/admin/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage }))
);
const InventoryPage = lazy(() =>
  import('@/pages/admin/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const UnauthorizedPage = lazy(() =>
  import('@/pages/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);
const ProfilePage = lazy(() =>
  import('@/pages/user/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/user/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
    <span className="font-sora text-sm font-semibold text-on-surface-variant dark:text-neutral-400">
      Loading Token &amp; Bite...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <OrderProvider>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Public and Standard Layout Routes */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/student" element={<StudentHomePage />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrderHistoryPage />} />
                      <Route path="/orders/:id" element={<TokenTrackingPage />} />
                      <Route path="/token/:tokenNumber" element={<TokenTrackingPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />

                      {/* Staff Route */}
                      <Route
                        path="/staff"
                        element={
                          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                            <StaffDashboardPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/menu"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <MenuManagementPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/inventory"
                        element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <InventoryPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Auth Pages */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    </Route>

                    {/* Dedicated Fullscreen Kitchen Display Route */}
                    <Route
                      path="/kitchen"
                      element={
                        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                          <KitchenDisplayPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </OrderProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
