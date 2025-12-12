import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ListaIssue from "./components/ListaIssue";
import CreaIssue from "./components/CreaIssue";
import CreaUtenza from "./components/CreaUtenza";
import VisualizzaProfilo from "./components/VisualizzaProfilo";
import DettagliIssue from "./components/DettagliIssue"; 
import ListaIssueArchiviate from "./components/ListaIssueArchiviate";
import ListaUtenza from "./components/ListaUtenza";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.innerWidth > 768;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/issues" element={<ListaIssue sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/issues/:id" element={<DettagliIssue sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/issues/nuova" element={<CreaIssue sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/issues/archiviate" element={<ListaIssueArchiviate sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/crea-utenza" element={<CreaUtenza sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/profilo" element={<VisualizzaProfilo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        <Route path="/utenti" element={<ListaUtenza sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
      </Routes>
    </Router>
  );
}

export default App;
