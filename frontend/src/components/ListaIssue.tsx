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

  // --- CORREZIONE: aggiungi index signature TypeScript ---
  const statoPill: { [key: string]: string[] } = {
    todo: ["#f3f4f6", "#6b7280"],
    inprogress: ["#fef3c7", "#b45309"],
    done: ["#bbf7d0", "#15803d"]
  };
  const tipoPill: { [key: string]: string[] } = {
    documentation: ["#bbf7d0", "#065f46"],
    features: ["#dbeafe", "#1e40af"],
    bug: ["#fee2e2", "#991b1b"],
    question: ["#e9d5ff", "#7c3aed"]
  };
  const prioritaPill: { [key: string]: string[] } = {
    low: ["#f3f4f6", "#6b7280"],
    medium: ["#fef3c7", "#b45309"],
    high: ["#fee2e2", "#dc2626"],
    critical: ["#fecaca", "#7f1d1d"]
  };

  // Stile delle pill
  const pillStyle = (background: string, color: string) => ({
    display: "inline-block",
    padding: "2px 16px",
    fontSize: "13px",
    borderRadius: "12px",
    fontWeight: 500,
    background,
    color
  });

  // Carica issues
  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line
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
      setError(err.response?.data?.message || "Errore nel caricamento delle issue");
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri
  useEffect(() => {
    let filtered = [...issues];
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStato) {
      filtered = filtered.filter(issue => issue.stato.toLowerCase() === filterStato.toLowerCase());
    }
    if (filterPriorita) {
      filtered = filtered.filter(issue => issue.priorita.toLowerCase() === filterPriorita.toLowerCase());
    }
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
      const userId = 1; // Da sistemare con utente loggato!
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatStato = (stato: string) => {
    if (stato.toLowerCase() === "inprogress") return "In Progress";
    if (stato.toLowerCase() === "todo") return "To Do";
    if (stato.toLowerCase() === "done") return "Done";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "22px 40px 16px 40px" }}>
        <div style={{ fontSize: "1.43rem", fontWeight: 700 }}>Lista Issue</div>
        <div style={{ fontSize: "16px", color: "#6b7280", paddingTop: 6 }}>Visualizza e gestisci tutte le issue</div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", marginTop: 28 }}>
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px #0001", padding: 32, marginBottom: 22 }}>
          {/* Filtri */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input type="text" style={{ flex: 2, borderRadius: 8, border: "1px solid #ddd", padding: 10, minWidth: 180, fontSize: 15 }} placeholder="Cerca issue..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, minWidth: 120 }}>
              <option value="">Tutti gli stati</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, minWidth: 110 }}>
              <option value="">Tutti i tipi</option>
              <option value="documentation">Documentation</option>
              <option value="features">Feature</option>
              <option value="bug">Bug</option>
              <option value="question">Question</option>
            </select>
            <select value={filterPriorita} onChange={e => setFilterPriorita(e.target.value)} style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, minWidth: 120 }}>
              <option value="">Tutte le priorità</option>
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>
            <button onClick={resetFilters} style={{
              padding: "10px 16px",
              backgroundColor: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500
            }}>
              Reset
            </button>
          </div>
          {/* Visualizzazione conteggio */}
          <div style={{ fontSize: "15px", color: "#737373", marginBottom: 14 }}>
            {filteredIssues.length > 0 ? `Visualizzazione di ${filteredIssues.length} di ${issues.length} issue` : "Nessuna issue trovata"}
          </div>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #f3f4f6" }}>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "left", padding: "12px 8px" }}>Titolo</th>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "left", padding: "12px 8px" }}>Stato</th>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "left", padding: "12px 8px" }}>Tipo</th>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "left", padding: "12px 8px" }}>Priorità</th>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "left", padding: "12px 8px" }}>Data Creazione</th>
                  <th style={{ fontWeight: 600, color: "#222", textAlign: "center", padding: "12px 8px" }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(issue => (
                  <tr key={issue.idIssue} style={{ borderTop: "1px solid #f3f4f6", background: "#fff" }}>
                    <td style={{ fontWeight: 500, color: "#222", padding: "16px 8px" }}>
                      {issue.titolo}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={pillStyle(
                          statoPill[issue.stato.toLowerCase()]?.[0] || "#eee",
                          statoPill[issue.stato.toLowerCase()]?.[1] || "#222"
                        )}
                      >
                        {formatStato(issue.stato)}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={pillStyle(
                          tipoPill[issue.tipo.toLowerCase()]?.[0] || "#eee",
                          tipoPill[issue.tipo.toLowerCase()]?.[1] || "#222"
                        )}
                      >
                        {issue.tipo.charAt(0).toUpperCase() + issue.tipo.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={pillStyle(
                          prioritaPill[issue.priorita.toLowerCase()]?.[0] || "#eee",
                          prioritaPill[issue.priorita.toLowerCase()]?.[1] || "#222"
                        )}
                      >
                        {issue.priorita}
                      </span>
                    </td>
                    <td style={{ padding: "8px", color: "#666" }}>{formatDate(issue.dataCreazione)}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        title="Vedi"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#2462de",
                          fontSize: 18,
                          marginRight: 12
                        }}
                        onClick={() => navigate(`/issues/${issue.idIssue}`)}
                      >
                        👁️
                      </button>
                      <button
                        title="Elimina"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          fontSize: 18
                        }}
                        onClick={() => handleDelete(issue.idIssue)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListaIssue;
