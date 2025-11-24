import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService";

interface FormData {
  titolo: string;
  descrizione: string;
  priorita: string;
  stato: string;
  tipo: string;
  idCreatore: number;
}

function CreaIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Recupera l'utente loggato
  const user = authService.getUser();

  // Redirect al login se non autenticato
  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormData>({
    titolo: "",
    descrizione: "",
    priorita: "medium",
    stato: "todo",
    tipo: "bug",
    idCreatore: user?.id || 0  // Usa l'ID reale dell'utente loggato
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica che l'utente sia loggato
    if (!user || !user.id) {
      setError("Devi essere autenticato per creare un'issue");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Assicurati che idCreatore sia impostato correttamente
      const dataToSend = {
        ...formData,
        idCreatore: user.id
      };

      console.log("Invio dati:", dataToSend);
      
      // 1. Crea l'issue
      const newIssue = await issueService.createIssue(dataToSend);
      console.log("Issue creata:", newIssue);

      // 2. Upload allegati se presenti
      if (files.length > 0 && newIssue.idIssue) {
        for (const file of files) {
          try {
            await allegatoService.uploadAllegato(file, newIssue.idIssue);
          } catch (fileError: any) {
            console.error("Errore upload file:", file.name, fileError);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/issues");
      }, 1500);

    } catch (err: any) {
      console.error("Errore completo:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      
      let errorMessage = "Errore durante la creazione dell'issue";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Se non c'è un utente, non renderizzare il form
  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 32px",
        marginBottom: "32px"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <button
            onClick={() => navigate("/issues")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ← Indietro
          </button>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
            Crea Nuova Issue
          </h1>
        </div>
      </header>

      {/* Form */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px" }}>
        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px"
          }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Errore</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#d1fae5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "20px" }}>✅</span>
            Issue creata con successo! Reindirizzamento in corso...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {/* Info utente */}
          <div style={{ 
            backgroundColor: "#f0fdf4", 
            border: "1px solid #bbf7d0",
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "24px",
            fontSize: "14px",
            color: "#166534"
          }}>
            <strong>Creatore:</strong> {user.nome} {user.cognome} (ID: {user.id})
          </div>

          {/* Titolo */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
              Titolo *
            </label>
            <input
              type="text"
              name="titolo"
              value={formData.titolo}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
              placeholder="Inserisci il titolo dell'issue"
            />
          </div>

          {/* Descrizione */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
              Descrizione
            </label>
            <textarea
              name="descrizione"
              value={formData.descrizione}
              onChange={handleInputChange}
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
              placeholder="Descrivi l'issue in dettaglio..."
            />
          </div>

          {/* Row: Tipo e Priorità */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {/* Tipo */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  cursor: "pointer"
                }}
              >
                <option value="bug">🐛 Bug</option>
                <option value="features">✨ Feature</option>
                <option value="documentation">📚 Documentation</option>
                <option value="question">❓ Question</option>
              </select>
            </div>

            {/* Priorità */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
                Priorità *
              </label>
              <select
                name="priorita"
                value={formData.priorita}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "white",
                  cursor: "pointer"
                }}
              >
                <option value="low">🟢 Bassa</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🟠 Alta</option>
                <option value="critical">🔴 Critica</option>
              </select>
            </div>
          </div>

          {/* Stato */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
              Stato *
            </label>
            <select
              name="stato"
              value={formData.stato}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="todo">📋 To Do</option>
              <option value="inprogress">🔄 In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          {/* Upload Allegati */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#374151" }}>
              Allegati
            </label>
            <div style={{
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.backgroundColor = "#eff6ff";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.backgroundColor = "#f9fafb";
              if (e.dataTransfer.files) {
                const newFiles = Array.from(e.dataTransfer.files);
                setFiles(prev => [...prev, ...newFiles]);
              }
            }}>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>📎</div>
                <p style={{ color: "#6b7280", marginBottom: "4px" }}>
                  Clicca per selezionare o trascina i file qui
                </p>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Puoi caricare più file contemporaneamente
                </p>
              </label>
            </div>

            {/* Lista file selezionati */}
            {files.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <span style={{ fontSize: "20px" }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: "#1f2937" }}>{file.name}</div>
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#fee2e2",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        color: "#dc2626",
                        fontSize: "18px"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => navigate("/issues")}
              disabled={loading}
              style={{
                padding: "12px 24px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                backgroundColor: loading ? "#9ca3af" : "#0d9488",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s"
              }}
            >
              {loading ? "Creazione in corso..." : "Crea Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreaIssue;
