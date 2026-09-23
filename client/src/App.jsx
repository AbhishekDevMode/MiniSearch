import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import ResultsPage from "./components/ResultsPage";
import Footer from "./components/Footer";
function App() {

  return (
    <div className="min-h-screen flex flex-col">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />

    </div>
  );
}

export default App;
