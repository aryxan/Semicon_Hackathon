import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import InlineInspection from './pages/InlineInspection';
import WaferHistory from './pages/WaferHistory';
import EngineerDashboard from './pages/EngineerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/inspection" element={<InlineInspection />} />
          <Route path="/history" element={<WaferHistory />} />
          <Route path="/dashboard" element={<EngineerDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
