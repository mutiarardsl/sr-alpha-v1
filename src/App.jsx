/**
 * SR MVP — App Shell
 * Tim 6 Fase 2 | src/App.jsx
 *
 * Slim app shell: hanya provider + router + route guards.
 * Semua logika UI ada di pages/ dan components/.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyle } from './components/shared/UI';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import SplashPage      from './pages/SplashPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import PretestPage     from './pages/PretestPage';
import StudentRoot     from './pages/student/StudentRoot';
import TeacherRoot     from './pages/teacher/TeacherRoot';
import AdminRoot       from './pages/admin/AdminRoot';

export default function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<SplashPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/daftar"    element={<RegisterPage />} />
          <Route path="/pretest"   element={<PretestPage />} />

          {/* Protected — Siswa */}
          <Route path="/siswa/*" element={
            <ProtectedRoute allowedRoles={['siswa']}>
              <StudentRoot />
            </ProtectedRoute>
          } />

          {/* Protected — Guru */}
          <Route path="/guru/*" element={
            <ProtectedRoute allowedRoles={['guru']}>
              <TeacherRoot />
            </ProtectedRoute>
          } />

          {/* Protected — Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRoot />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
