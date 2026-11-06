import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthPage } from './screens/auth/ui/AuthPage';
import { AdminPage } from './screens/admin/ui/AdminPage';
import { ProtectedRoute } from './features/auth-by-token/ui/ProtectedRoute';

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;