import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
    Loading workspace...
  </div>
);

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { currentUser, isInitializing } = useAppContext();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { currentUser, isInitializing } = useAppContext();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};

const ManagerRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { currentUser, isInitializing } = useAppContext();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }

  return <>{element}</>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ManagerRoute element={<ReportsPage />} />} />
            <Route path="users" element={<AdminRoute element={<UsersPage />} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
