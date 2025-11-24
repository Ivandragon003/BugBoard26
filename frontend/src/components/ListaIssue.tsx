import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";

interface Issue {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  dataUltimaModifica: string;
  archiviata: boolean;
}

function ListaIssue() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtri
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [filterPriorita, setFilterPriorita] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Carica issues
  useEffect(() => {
    loadIssues();
  }, [showArchived]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getAllIssues();
      const filtered = showArchived 
        ? data.filter((i: Issue) => i.archiviata)
        : data.filter((i: Issue) => !i.archiviata);
      setIssues(filtered);
      setFilteredIssues(filtered);
      setError("");
    } catch (err: any) {
      console.error("Errore caricamento issues:", err);
      setError(err.response?.data?.message || "Errore nel caricamento delle issue");
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri
  useEffect(() => {
    let filtered = [...issues];

    // Filtro ricerca
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro stato
    if (filterStato) {
      filtered = filtered.filter(issue => issue.stato.toLowerCase() === filterStato.toLowerCase());
    }

    // Filtro priorità
    if (filterPriorita) {
      filtered = filtered.filter(issue => issue.priorita.toLowerCase() === filterPriorita.toLowerCase());
    }

    // Filtro tipo
    if (filterTipo) {
      filtered = filtered.filter(issue => issue.tipo.toLowerCase() === filterTipo.toLowerCase());
    }

    setFilteredIssues(filtered);
  }, [searchTerm, filterStato, filterPriorita, filterTipo, issues]);

  // Elimina issue
  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa issue?")) return;

    try {
      await issueService.deleteIssue(id);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || "Errore durante l'eliminazione");
    }
  };

  // Archivia issue
  const handleArchive = async (id: number) => {
    try {
      const userId = 1; // TODO: prendere dall'utente loggato
      await issueService.archiveIssue(id, userId);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || "Errore durante l'archiviazione");
    }
  };

  // Reset filtri
  const resetFilters = () => {
    setSearchTerm("");
    setFilterStato("");
    setFilterPriorita("");
    setFilterTipo("");
  };

  // Stili
  const getStatoStyle = (stato: string) => {
    switch (stato.toLowerCase()) {
      case "todo":
        return { backgroundColor: "#e5e7eb", color: "#374151" };
      case "inprogress":
      case "in_progress":
        return { backgroundColor: "#fed7aa", color: "#9a3412" };
      case "done":
        return { backgroundColor: "#86efac", color: "#166534" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getTipoStyle = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "documentation":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "features":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "bug":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "question":
        return { backgroundColor: "#e9d5ff", color: "#6b21a8" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getPrioritaStyle = (priorita: string) => {
    switch (priorita.toLowerCase()) {
      case "critical":
        return { backgroundColor: "#fecaca", color: "#7f1d1d" };
      case "high":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "medium":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "low":
        return { backgroundColor: "#f3f4f6", color: "#374151" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatStato = (stato: string) => {
    if (stato === "inProgress") return "In Progress";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

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
          maxWidth: "1400px", 
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/home")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ← Dashboard
            </button>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              {showArchived ? "Issue Archiviate" : "Tutte le Issue"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/issues/nuova")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            + Nuova Issue
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px"
          }}>
            {error}
          </div>
        )}

        {/* Filtri */}
        <div style={{ 
          backgroundColor: "white", 
          padding: "24px", 
          borderRadius: "12px", 
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
            {/* Ricerca */}
            <input
              type="text"
              placeholder="🔍 Cerca per titolo o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1 1 300px",
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            />

            {/* Stato */}
            <select
              value={filterStato}
              onChange={(e) => setFilterStato(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="">Tutti gli stati</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Priorità */}
            <select
              value={filterPriorita}
              onChange={(e) => setFilterPriorita(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="">Tutte le priorità</option>
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>

            {/* Tipo */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="">Tutti i tipi</option>
              <option value="bug">Bug</option>
              <option value="features">Feature</option>
              <option value="documentation">Documentation</option>
              <option value="question">Question</option>
            </select>

            {/* Reset */}
            <button
              onClick={resetFilters}
              style={{
                padding: "10px 16px",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500
              }}
            >
              Reset
            </button>
          </div>

          {/* Toggle archiviate */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              Mostra solo archiviate
            </span>
          </label>
        </div>

        {/* Tabella Issue */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "12px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{ 
            padding: "20px 24px", 
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              {filteredIssues.length} Issue trovate
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
              Caricamento in corso...
            </div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
              <p>Nessuna issue trovata</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Titolo</th>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Stato</th>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Tipo</th>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Priorità</th>
                    <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Data</th>
                    <th style={{ padding: "12px 24px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr 
                      key={issue.idIssue} 
                      style={{ borderTop: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 500, color: "#1f2937" }}>{issue.titolo}</div>
                        {issue.descrizione && (
                          <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                            {issue.descrizione.substring(0, 60)}{issue.descrizione.length > 60 ? "..." : ""}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "12px", 
                          fontWeight: 500,
                          fontSize: "14px",
                          ...getStatoStyle(issue.stato)
                        }}>
                          {formatStato(issue.stato)}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "12px", 
                          fontWeight: 500,
                          fontSize: "14px",
                          ...getTipoStyle(issue.tipo)
                        }}>
                          {issue.tipo}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "12px", 
                          fontWeight: 500,
                          fontSize: "14px",
                          textTransform: "capitalize",
                          ...getPrioritaStyle(issue.priorita)
                        }}>
                          {issue.priorita}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", color: "#6b7280", fontSize: "14px" }}>
                        {formatDate(issue.dataCreazione)}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          {!issue.archiviata && (
                            <button
                              onClick={() => handleArchive(issue.idIssue)}
                              title="Archivia"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px"
                              }}
                            >
                              📦
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(issue.idIssue)}
                            title="Elimina"
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px"
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaIssue;