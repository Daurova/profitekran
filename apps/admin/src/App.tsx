import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthPage } from './screens/auth/ui/AuthPage';
import { AdminPage } from './screens/admin/ui/AdminPage';
import { ProtectedRoute } from './features/auth-by-token/ui/ProtectedRoute';
import { VideoWallPage } from './screens/video-wall/ui/VideoWallPage';
import { VideoWallEditPage } from './screens/video-wall/ui/VideoWallEditPage';

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="top-center" />
      
      {/* Добавили basename="/admin" */}
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            {/* Убрали /admin из пути, так как basename уже его подразумевает */}
            <Route path="/" element={<AdminPage />} />
            <Route path="/wall" element={<VideoWallPage />} /> {/* <-- НОВЫЙ РОУТ */}
            <Route path="/wall/:id" element={<VideoWallEditPage />} />
          </Route>          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

    </MantineProvider>
  );
}

export default App;