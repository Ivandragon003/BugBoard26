import React, { useState } from "react";
import { authService } from "../services/authService";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

export default function CreaUtenza() {
  const navigate = useNavigate();
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
      const response = await axios.post(`${API_BASE_URL}/utenza/crea`, form, {
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
    <div style={{ maxWidth: 400, margin: "64px auto", background: "#fff", borderRadius: 12, padding: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 12 }}>Crea nuovo utente</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            required
            onChange={handleChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            required
            onChange={handleChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Ruolo</label>
          <select name="ruolo" value={form.ruolo} onChange={handleChange} style={{ width: "100%", padding: 8, marginTop: 4 }}>
            <option value="Utente">Utente</option>
            <option value="Amministratore">Amministratore</option>
          </select>
        </div>
        {message.text && (
          <div style={{
            marginBottom: 12,
            color: message.type === "success" ? "#16a34a" : "#e11d48",
            fontWeight: 600
          }}>
            {message.text}
          </div>
        )}
        <button type="submit" style={{ padding: "8px 20px", backgroundColor: "#0d9488", color: "#fff", borderRadius: 8, fontWeight: 600 }}>
          Crea utente
        </button>
      </form>
    </div>
  );
}
