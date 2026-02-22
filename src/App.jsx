import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ComponentsPage from './pages/ComponentsPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AuthCallback from './pages/Auth/AuthCallback';
import VerifyMobile from './pages/Auth/VerifyMobile';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ProfileDashboard from './pages/Profile/ProfileDashboard';

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
        <Route path="/profile" element={<ProfileDashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
