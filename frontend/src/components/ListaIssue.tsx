import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [sidebarOpen] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPriorita, setFilterPriorita] = useState("");

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getAllIssues();
      setIssues(data);
      setFilteredIssues(data);
    } catch (err: any) {
      console.error("Errore caricamento issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...issues];

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.descrizione?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStato) {
      filtered = filtered.filter(
        (issue) =>
          issue.stato.toLowerCase() === filterStato.toLowerCase()
      );
    }
    if (filterTipo) {
      filtered = filtered.filter(
        (issue) => issue.tipo.toLowerCase() === filterTipo.toLowerCase()
      );
    }
    if (filterPriorita) {
      filtered = filtered.filter(
        (issue) =>
          issue.priorita.toLowerCase() === filterPriorita.toLowerCase()
      );
    }

    setFilteredIssues(filtered);
  }, [searchTerm, filterStato, filterTipo, filterPriorita, issues]);

  const currentPath = location.pathname;

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
      case "feature":
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
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatStato = (stato: string) => {
    switch (stato.toLowerCase()) {
      case "inprogress":
      case "in_progress":
        return "In Progress";
      case "todo":
        return "To Do";
      case "done":
        return "Done";
      default:
        return stato.charAt(0).toUpperCase() + stato.slice(1);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStato("");
    setFilterTipo("");
    setFilterPriorita("");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? "200px" : "0",
          backgroundColor: "#0d9488",
          transition: "width 0.3s",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px", color: "white" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "white",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#0d9488",
                fontSize: "14px",
              }}
            >
              BB
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>BugBoard</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>Dashboard</div>
            </div>
          </div>

          {/* NAV */}
          <nav>
            <a
              href="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: currentPath === "/home" ? 600 : 400,
                color: currentPath === "/home" ? "#FFF" : "white",
                backgroundColor:
                  currentPath === "/home"
                    ? "#059669"
                    : "rgba(255,255,255,0.15)",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "16px" }}>📊</span> Dashboard
            </a>

            <a
              href="/issues/nuova"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: currentPath === "/issues/nuova" ? 600 : 400,
                color:
                  currentPath === "/issues/nuova"
                    ? "#FFF"
                    : "rgba(255,255,255,0.7)",
                backgroundColor:
                  currentPath === "/issues/nuova" ? "#059669" : "transparent",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "16px" }}>➕</span> Nuova Issue
            </a>
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "24px 48px 12px 48px",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#18181b" }}>
            Lista Issue
          </div>
          <div style={{ fontSize: "15px", color: "#747b8c", marginTop: "2px" }}>
            Visualizza e gestisci tutte le issue
          </div>
        </header>

        <div style={{ maxWidth: 1400, margin: "32px auto", width: "100%" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 1px 4px #0001",
              padding: 32,
              marginBottom: 18,
            }}
          >
            {/* FILTRI */}
            <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
              <input
                type="text"
                style={{
                  flex: 2,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: 10,
                  minWidth: 180,
                  fontSize: 15,
                }}
                placeholder="Cerca issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={filterStato}
                onChange={(e) => setFilterStato(e.target.value)}
                style={{
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: 10,
                  minWidth: 120,
                }}
              >
                <option value="">Tutti gli stati</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                style={{
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: 10,
                  minWidth: 110,
                }}
              >
                <option value="">Tutti i tipi</option>
                <option value="documentation">Documentation</option>
                <option value="features">Feature</option>
                <option value="bug">Bug</option>
                <option value="question">Question</option>
              </select>

              <select
                value={filterPriorita}
                onChange={(e) => setFilterPriorita(e.target.value)}
                style={{
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: 10,
                  minWidth: 120,
                }}
              >
                <option value="">Tutte le priorità</option>
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Critica</option>
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
                }}
              >
                Reset
              </button>
            </div>

            {/* TABELLA */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Titolo
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Stato
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Tipo
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Priorità
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Data Creazione
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      Azioni
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "48px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        Caricamento in corso...
                      </td>
                    </tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "48px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        Nessuna issue trovata
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr
                        key={issue.idIssue}
                        style={{
                          borderTop: "1px solid #e5e7eb",
                          background: "#fff",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 24px",
                            color: "#1f2937",
                            fontWeight: 500,
                          }}
                        >
                          {issue.titolo}
                        </td>

                        <td style={{ padding: "14px 24px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontWeight: 500,
                              fontSize: "13px",
                              ...getStatoStyle(issue.stato),
                            }}
                          >
                            {formatStato(issue.stato)}
                          </span>
                        </td>

                        <td style={{ padding: "14px 24px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontWeight: 500,
                              fontSize: "13px",
                              ...getTipoStyle(issue.tipo),
                            }}
                          >
                            {issue.tipo}
                          </span>
                        </td>

                        <td style={{ padding: "14px 24px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontWeight: 500,
                              fontSize: "13px",
                              textTransform: "lowercase",
                              ...getPrioritaStyle(issue.priorita),
                            }}
                          >
                            {issue.priorita}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 24px",
                            color: "#6b7280",
                            fontSize: "14px",
                          }}
                        >
                          {formatDate(issue.dataCreazione)}
                        </td>

                        <td
                          style={{
                            padding: "14px 24px",
                            textAlign: "center",
                          }}
                        >
                          <button
                            title="Vedi"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#2462de",
                              fontSize: 18,
                              marginRight: 14,
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
                              fontSize: 18,
                            }}
                            onClick={() =>
                              alert("Funzione elimina da implementare")
                            }
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

export default ListaIssue;
