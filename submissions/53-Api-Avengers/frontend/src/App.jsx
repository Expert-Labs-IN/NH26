import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import InboxPage from './pages/Inbox';
import CalendarPage from './pages/Calendar';
import Landing from './pages/Landing';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="inbox" element={<InboxPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="triage" element={<InboxPage filterTriagedOnly={true} />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/inbox" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
