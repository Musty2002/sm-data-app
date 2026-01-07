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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Check if current hostname is the website subdomain (www) or app subdomain
const isWebsiteSubdomain = () => {
  const hostname = window.location.hostname;
  // Website subdomain patterns: www.*, or root domain without app prefix
  // App subdomain patterns: app.*
  return hostname.startsWith('www.') || 
         (!hostname.startsWith('app.') && !hostname.includes('localhost'));
};

const isAppSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname.startsWith('app.') || hostname.includes('localhost');
};

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

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page - accessible on website subdomain, redirects to dashboard on app subdomain */}
      <Route 
        path="/" 
        element={
          isAppSubdomain() ? <Navigate to="/dashboard" replace /> : <Index />
        } 
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
