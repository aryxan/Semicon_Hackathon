import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LocalizationWorkspace from './pages/LocalizationWorkspace';
import DatasetGenerator from './pages/DatasetGenerator';
import BenchmarkPage from './pages/BenchmarkPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import MethodologyPage from './pages/MethodologyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/app" element={<LocalizationWorkspace />} />
          <Route path="/dataset" element={<DatasetGenerator />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/explainability" element={<ExplainabilityPage />} />
          <Route path="/about" element={<MethodologyPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
