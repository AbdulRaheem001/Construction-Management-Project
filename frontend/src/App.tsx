import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Materials from './pages/Materials';
import Labour from './pages/Labour';
import Equipment from './pages/Equipment';
import Warehouse from './pages/Warehouse';
import Expenses from './pages/Expenses';
import Users from './pages/Users';
import './App.css';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Initialize auth state from localStorage on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Toaster position="top-right" />
      
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects/*" element={<Projects />} />
          <Route path="materials/*" element={<Materials />} />
          <Route path="labour/*" element={<Labour />} />
          <Route path="equipment/*" element={<Equipment />} />
          <Route path="warehouse/*" element={<Warehouse />} />
          <Route path="expenses/*" element={<Expenses />} />
          <Route path="users/*" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
