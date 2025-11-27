import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RecuperaPassword from "./components/RecuperaPassword";
import Home from "./components/Home";
import ListaIssue from "./components/ListaIssue";
import CreaIssue from "./components/CreaIssue";
import CreaUtenza from "./components/CreaUtenza";
import VisualizzaProfilo from "./components/VisualizzaProfilo";
import DettagliIssue from "./components/DettagliIssue"; 
import ListaIssueArchiviate from "./components/ListaIssueArchiviate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recupera-password" element={<RecuperaPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/issues" element={<ListaIssue />} />
        <Route path="/issues/:id" element={<DettagliIssue />} />
        <Route path="/issues/nuova" element={<CreaIssue />} />
        <Route path="/issues/archiviate" element={<ListaIssueArchiviate />} />
        <Route path="/crea-utenza" element={<CreaUtenza />} />
        <Route path="/profilo" element={<VisualizzaProfilo />} />
      </Routes>
    </Router>
  );
}

export default App;