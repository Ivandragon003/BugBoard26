import React, { useState } from "react";
import { authService } from "../services/authService";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function CreaUtenza() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    ruolo: "Utente"
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Blocca la pagina se non sei admin
  if (!authService.isAdmin()) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#e11d48", fontWeight: 600 }}>
        Solo gli amministratori possono creare un nuovo utente!
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.post(`${API_BASE_URL}/utenza/crea`, form, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setMessage({ type: "success", text: "Utente creato con successo!" });
      setTimeout(() => navigate("/home"), 1200);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Errore nella creazione dell'utente"
      });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Sidebar condivisa */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "20px",
              color: "#374151"
            }}
          >
            ☰
          </button>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              Crea nuovo utente
            </h2>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
              Aggiungi un nuovo utente al sistema
            </div>
          </div>
        </header>

        {/* Form */}
        <div style={{ padding: "32px", maxWidth: 500, margin: "0 auto", width: "100%" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  required
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  required
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Ruolo</label>
                <select name="ruolo" value={form.ruolo} onChange={handleChange} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}>
                  <option value="Utente">Utente</option>
                  <option value="Amministratore">Amministratore</option>
                </select>
              </div>
              {message.text && (
                <div style={{
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 6,
                  color: message.type === "success" ? "#16a34a" : "#e11d48",
                  backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  {message.text}
                </div>
              )}
              <button type="submit" style={{ width: "100%", padding: "10px 20px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Crea utente
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
