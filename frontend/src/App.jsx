import './App.css'
import Dashboard from './components/Dashboard'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JurorLogin from './components/JurorLogin';
import AdminLogin from './components/AdminLogin';
function App() {

  return (
    <>
      <Router>
      <Dashboard />
      <Routes>
        <Route path="/juror-login" element={<JurorLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
      </Router>
    </>
     
  )
}

export default App
