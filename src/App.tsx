import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inspections from './pages/Inspections';
import Documents from './pages/Documents';
import Deficiencies from './pages/Deficiencies';
import Photos from './pages/Photos';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="inspections/*" element={<Inspections />} />
            <Route path="documents/*" element={<Documents />} />
            <Route path="deficiencies/*" element={<Deficiencies />} />
            <Route path="photos/*" element={<Photos />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;