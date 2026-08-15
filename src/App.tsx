import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import InlineInspection from './pages/InlineInspection';
import WaferHistory from './pages/WaferHistory';
import EngineerDashboard from './pages/EngineerDashboard';
import Overview from './pages/Overview';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './ErrorBoundary';
import { loadWaferDatabase } from './data/wafers';

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
            <Route element={<Layout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/inspection" element={<InlineInspection />} />
              <Route path="/history" element={<WaferHistory />} />
              <Route path="/dashboard" element={<EngineerDashboard />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
