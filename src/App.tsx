import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Referral from "./pages/Referral";
import Data from "./pages/Data";
import Airtime from "./pages/Airtime";
import Electricity from "./pages/Electricity";
import TV from "./pages/TV";
import Transfer from "./pages/Transfer";
import AddMoney from "./pages/AddMoney";
import BvnNin from "./pages/BvnNin";
import Notifications from "./pages/Notifications";
import WebAuth from "./pages/WebAuth";
import WebAbout from "./pages/WebAbout";
import WebContact from "./pages/WebContact";
import WebPricing from "./pages/WebPricing";
import Cashback from "./pages/Cashback";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import TransactionsPage from "./pages/admin/TransactionsPage";
import NotificationsAdmin from "./pages/admin/NotificationsAdmin";
import PricingConfig from "./pages/admin/PricingConfig";
import WalletsPage from "./pages/admin/WalletsPage";
import ReferralsPage from "./pages/admin/ReferralsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import { AdminProvider, useAdmin } from "@/hooks/useAdmin";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Website routes - separate from app */}
      <Route path="/website" element={<Index />} />
      <Route path="/weblogin" element={<WebAuth />} />
      <Route path="/webabout" element={<WebAbout />} />
      <Route path="/webcontact" element={<WebContact />} />
      <Route path="/webpricing" element={<WebPricing />} />
      
      {/* App routes */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referral"
        element={
          <ProtectedRoute>
            <Referral />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedRoute>
            <Data />
          </ProtectedRoute>
        }
      />
      <Route
        path="/airtime"
        element={
          <ProtectedRoute>
            <Airtime />
          </ProtectedRoute>
        }
      />
      <Route
        path="/electricity"
        element={
          <ProtectedRoute>
            <Electricity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tv"
        element={
          <ProtectedRoute>
            <TV />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <ProtectedRoute>
            <Transfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-money"
        element={
          <ProtectedRoute>
            <AddMoney />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bvn-nin"
        element={
          <ProtectedRoute>
            <BvnNin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashback"
        element={
          <ProtectedRoute>
            <Cashback />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="notifications" element={<NotificationsAdmin />} />
        <Route path="pricing" element={<PricingConfig />} />
        <Route path="wallets" element={<WalletsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin routes - completely separate */}
          <Route path="/admin/*" element={
            <AdminProvider>
              <AdminRoutes />
            </AdminProvider>
          } />
          
          {/* Main app routes */}
          <Route path="/*" element={
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
