import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import InlineInspection from './pages/InlineInspection';
import WaferHistory from './pages/WaferHistory';
import EngineerDashboard from './pages/EngineerDashboard';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { AppProvider, useAppContext } from './context/AppContext';
import { ErrorBoundary } from './ErrorBoundary';
import { loadWaferDatabase } from './data/wafers';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    loadWaferDatabase().catch((error) => {
      console.error('Wafer history load failed:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Overview />} />
              <Route path="/inspection" element={<InlineInspection />} />
              <Route path="/history" element={<WaferHistory />} />
              <Route path="/dashboard" element={<EngineerDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
