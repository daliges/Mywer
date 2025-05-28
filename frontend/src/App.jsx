import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';

// Wrapper to check for playlist in location.state
function ResultsRouteWrapper() {
  const location = useLocation();
  // If no playlist, redirect to Home
  if (!location.state || !location.state.playlist) {
    return <Navigate to="/" replace />;
  }
  // Otherwise render the ResultsPage
  return <ResultsPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsRouteWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
