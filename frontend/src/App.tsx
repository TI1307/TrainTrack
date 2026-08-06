// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';

import Login from '../pages/login';
import SetPassword from '../pages/SetPassword';
import Dashboard from '../pages/Dashboard';
import Stations from '../pages/Stations';
import Trains from '../pages/Trains';
import Wilayas from '../pages/Wilayas';
import AdminUsers from '../pages/AdminUsers';
import Lines from '../pages/Lines';
import Trips from '../pages/Trips';
import SchedulerPage from '../pages/Scheduler';
import Notices from '../pages/Notices';
import TicketConfig from '../pages/TicketConfig';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0A1428',
          color: '#94A3B8',
          fontFamily: 'Tajawal, sans-serif',
          direction: 'rtl',
        }}
      >
        <span className="spinner" style={{ width: '32px', height: '32px', marginLeft: '0.75rem' }}></span>
        <span>جاري التحقق من تسجيل الدخول...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stations"
        element={
          <ProtectedRoute>
            <Stations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trains"
        element={
          <ProtectedRoute>
            <Trains />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wilayas"
        element={
          <ProtectedRoute>
            <Wilayas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/set-password"
        element={
          <ProtectedRoute>
            <SetPassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lines"
        element={
          <ProtectedRoute>
            <Lines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <Trips />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scheduler"
        element={
          <ProtectedRoute>
            <SchedulerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <Notices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ticket-config"
        element={
          <ProtectedRoute>
            <TicketConfig />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
