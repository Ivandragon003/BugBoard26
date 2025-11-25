import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import Sidebar from "./Sidebar";

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPriorita, setFilterPriorita] = useState("");
  const [sortType, setSortType] = useState("date_desc");

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getAllIssues();
      setIssues(data);
      setFilteredIssues(data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Errore nel caricamento delle issue");
    } finally {
      setLoading(false);
    }
  };

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

    if (filterTipo) {
      filtered = filtered.filter(issue => issue.tipo.toLowerCase() === filterTipo.toLowerCase());
    }

    if (filterPriorita) {
      filtered = filtered.filter(issue => issue.priorita.toLowerCase() === filterPriorita.toLowerCase());
    }

    let ordered = [...filtered];

    switch (sortType) {
      case "date_asc":
        ordered.sort((a, b) => a.dataCreazione.localeCompare(b.dataCreazione));
        break;
      case "date_desc":
        ordered.sort((a, b) => b.dataCreazione.localeCompare(a.dataCreazione));
        break;
      case "titolo_asc":
        ordered.sort((a, b) => a.titolo.localeCompare(b.titolo));
        break;
      case "titolo_desc":
        ordered.sort((a, b) => b.titolo.localeCompare(a.titolo));
        break;
      case "prio_asc": {
        const prioOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        ordered.sort(
          (a, b) =>
            (prioOrder[a.priorita.toLowerCase()] || 0) -
            (prioOrder[b.priorita.toLowerCase()] || 0)
        );
        break;
      }
      case "prio_desc": {
        const prioOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        ordered.sort(
          (a, b) =>
            (prioOrder[b.priorita.toLowerCase()] || 0) -
            (prioOrder[a.priorita.toLowerCase()] || 0)
        );
        break;
      }
    }

    setFilteredIssues(ordered);
  }, [searchTerm, filterStato, filterTipo, filterPriorita, sortType, issues]);

  const getStatoStyle = (stato: string) => {
    switch (stato.toLowerCase()) {
      case "todo": return { backgroundColor: "#e5e7eb", color: "#374151" };
      case "inprogress":
      case "in_progress": return { backgroundColor: "#fed7aa", color: "#9a3412" };
      case "done": return { backgroundColor: "#86efac", color: "#166534" };
      default: return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getTipoStyle = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "documentation": return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "feature":
      case "features": return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "bug": return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "question": return { backgroundColor: "#e9d5ff", color: "#6b21a8" };
      default: return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getPrioritaStyle = (priorita: string) => {
    switch (priorita.toLowerCase()) {
      case "critical": return { backgroundColor: "#fecaca", color: "#7f1d1d" };
      case "high": return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "medium": return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "low": return { backgroundColor: "#f3f4f6", color: "#374151" };
      default: return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatStato = (stato: string) => {
    const s = stato.toLowerCase();
    if (s === "inprogress" || s === "in_progress") return "In Progress";
    if (s === "todo") return "To Do";
    if (s === "done") return "Done";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa issue?")) return;
    try {
      await issueService.deleteIssue(id);
      loadIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || "Errore durante l'eliminazione");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStato("");
    setFilterTipo("");
    setFilterPriorita("");
    setSortType("date_desc");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Sidebar condivisa */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "24px 48px 12px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#374151"
              }}
            >
              ☰
            </button>

            <div>
              <span style={{ fontSize: "28px", fontWeight: 700, color: "#18181b" }}>Lista Issue</span>
              <div style={{ fontSize: "15px", color: "#747b8c", marginTop: "2px" }}>
                Visualizza e gestisci tutte le issue
              </div>
            </div>
          </div>
        </header>

        {/* FILTRI + TABELLA */}
        <div style={{ maxWidth: 1400, margin: "32px auto", width: "100%" }}>
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 4px #0001",
            padding: 32,
            marginBottom: 18
          }}>
            {/* FILTRI */}
            <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
              <input
                type="text"
                style={{
                  flex: 2,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: 10,
                  minWidth: 140,
                  fontSize: 14
                }}
                placeholder="Cerca issue..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <select
                value={filterStato}
                onChange={e => setFilterStato(e.target.value)}
                style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, fontSize: 14 }}
              >
                <option value="">Tutti gli stati</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={filterTipo}
                onChange={e => setFilterTipo(e.target.value)}
                style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, fontSize: 14 }}
              >
                <option value="">Tutti i tipi</option>
                <option value="documentation">Documentation</option>
                <option value="features">Feature</option>
                <option value="bug">Bug</option>
                <option value="question">Question</option>
              </select>

              <select
                value={filterPriorita}
                onChange={e => setFilterPriorita(e.target.value)}
                style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, fontSize: 14 }}
              >
                <option value="">Tutte le priorità</option>
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Critica</option>
              </select>

              <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                style={{ borderRadius: 8, border: "1px solid #ddd", padding: 10, fontSize: 14 }}
              >
                <option value="date_desc">Data (più recente)</option>
                <option value="date_asc">Data (più vecchio)</option>
                <option value="titolo_asc">Titolo (A-Z)</option>
                <option value="titolo_desc">Titolo (Z-A)</option>
                <option value="prio_desc">Priorità (alta-bassa)</option>
                <option value="prio_asc">Priorità (bassa-alta)</option>
              </select>

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

            {/* TABELLA */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Titolo</th>
                    <th style={thStyle}>Stato</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Priorità</th>
                    <th style={thStyle}>Data Creazione</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Azioni</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={loadingStyle}>Caricamento...</td>
                    </tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={loadingStyle}>Nessuna issue trovata</td>
                    </tr>
                  ) : (
                    filteredIssues.map(issue => (
                      <tr key={issue.idIssue} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}>
                          <strong
                            style={{ cursor: "pointer", color: "#0d9488" }}
                            onClick={() => navigate(`/issues/${issue.idIssue}`)}
                          >
                            {issue.titolo}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          <span style={pill(getStatoStyle(issue.stato))}>
                            {formatStato(issue.stato)}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span style={pill(getTipoStyle(issue.tipo))}>
                            {issue.tipo}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span style={pill(getPrioritaStyle(issue.priorita))}>
                            {issue.priorita}
                          </span>
                        </td>

                        <td style={tdStyle}>{formatDate(issue.dataCreazione)}</td>

                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            onClick={() => navigate(`/issues/${issue.idIssue}`)}
                            style={actionBtn}
                            title="Modifica"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => handleDelete(issue.idIssue)}
                            style={actionBtn}
                            title="Elimina"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px 24px",
  textAlign: "left" as const,
  fontSize: "13px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase" as const
};

const tdStyle = {
  padding: "12px 24px",
  fontSize: "15px",
  color: "#1f2937"
};

const loadingStyle = {
  padding: "48px",
  textAlign: "center" as const,
  color: "#6b7280"
};

const pill = (style: any) => ({
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
  ...style
});

const actionBtn = {
  padding: "6px",
  margin: "0 4px",
  cursor: "pointer",
  background: "transparent",
  border: "none",
  fontSize: "18px"
};

export default ListaIssue;
