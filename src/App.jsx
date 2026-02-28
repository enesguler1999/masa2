import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ComponentsPage from './pages/ComponentsPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AuthCallback from './pages/Auth/AuthCallback';
import VerifyMobile from './pages/Auth/VerifyMobile';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPasswordByEmail from './pages/Auth/ResetPasswordByEmail';
import ResetPasswordByMobile from './pages/Auth/ResetPasswordByMobile';
import ProfileDashboard from './pages/Profile/ProfileDashboard';
import MessageTest from './pages/Test/MessageTest';
import AdminDashboard from './pages/admin/AdminDashboard';

function Home() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-4xl font-bold">masa v0</h1>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/verify-mobile" element={<VerifyMobile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/email" element={<ResetPasswordByEmail />} />
        <Route path="/reset-password/mobile" element={<ResetPasswordByMobile />} />
        <Route path="/profile" element={<ProfileDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/test/messagetest" element={<MessageTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
