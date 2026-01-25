import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MainLayout } from './layouts/MainLayout';
import { AnalysisPage } from './pages/AnalysisPage';
import { ComparePage } from './pages/ComparePage';
import { GamePage } from './pages/GamePage';
import { PvpPage } from './pages/PvpPage';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<AnalysisPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="game" element={<GamePage />} />
              <Route path="pvp" element={<PvpPage />} />
              <Route path="pvp/:matchId" element={<PvpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </NotificationProvider>
  );
};

export default App;