import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/auth/Login';
import RoleSelect from './pages/auth/RoleSelect';
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/select-role" element={<RoleSelect />} />

          {/* Protected routes — require auth + role selection */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<PlaceholderPage title="Dashboard" />} />
              <Route path="/fleet" element={<PlaceholderPage title="Fleet" />} />
              <Route path="/drivers" element={<PlaceholderPage title="Drivers" />} />
              <Route path="/trips" element={<PlaceholderPage title="Trips" />} />
              <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" />} />
              <Route path="/fuel-expenses" element={<PlaceholderPage title="Fuel & Expenses" />} />
              <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>

          {/* Catch-all → redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
