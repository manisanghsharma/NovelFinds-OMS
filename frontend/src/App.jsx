import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Expenses = lazy(() => import('./pages/Expenses'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Auth check component
const AuthCheck = ({ children }) => {
    const location = useLocation();
    const adminToken = localStorage.getItem('adminToken');

    if (adminToken && location.pathname === '/login') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <AppProvider>
            <Router>
                <Toaster position="top-right" />
                <AuthCheck>
                    <Routes>
                        {/* Public route */}
                        <Route path="/login" element={<AdminLogin />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route 
                                path="dashboard" 
                                element={
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Dashboard />
                                    </Suspense>
                                } 
                            />
                            <Route 
                                path="inventory" 
                                element={
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Inventory />
                                    </Suspense>
                                } 
                            />
                            <Route 
                                path="orders" 
                                element={
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Orders />
                                    </Suspense>
                                } 
                            />
                            <Route 
                                path="customers" 
                                element={
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Customers />
                                    </Suspense>
                                } 
                            />
                            <Route 
                                path="expenses" 
                                element={
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <Expenses />
                                    </Suspense>
                                } 
                            />
                        </Route>

                        {/* Catch all route */}
                        <Route 
                            path="*" 
                            element={<Navigate to="/" replace />} 
                        />
                    </Routes>
                </AuthCheck>
            </Router>
        </AppProvider>
    );
}

export default App;
