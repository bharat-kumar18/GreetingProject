import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Recipients from './pages/Recipients';
import Preview from './pages/Preview';
import BatchGeneration from './pages/BatchGeneration';
import GeneratedOutputs from './pages/GeneratedOutputs';
import './styles/app.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="templates" element={<Templates />} />
          <Route path="recipients" element={<Recipients />} />
          <Route path="preview" element={<Preview />} />
          <Route path="batch-generation" element={<BatchGeneration />} />
          <Route path="generated" element={<GeneratedOutputs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
