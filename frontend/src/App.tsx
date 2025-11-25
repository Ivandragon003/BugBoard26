import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RecuperaPassword from "./components/RecuperaPassword";
import Home from "./components/Home";
import ListaIssue from "./components/ListaIssue";
import CreaIssue from "./components/CreaIssue";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recupera-password" element={<RecuperaPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/issues" element={<ListaIssue />} />
        <Route path="/issues/nuova" element={<CreaIssue />} />
      </Routes>
    </Router>
  );
}

export default App;