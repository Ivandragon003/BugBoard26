import React, { useState, useEffect } from "react";
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
}

function Home() {
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Issue state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Carica le issue dal backend all'avvio
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        const data = await issueService.getAllIssues();
        setIssues(data);
        setError("");
      } catch (err: any) {
        console.error("Errore caricamento issues:", err);
        setError(err.response?.data?.message || "Errore nel caricamento delle issue");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  // Stili issue
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

  // RENDER
  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "250px" : "0",
        backgroundColor: "#1f2937",
        transition: "width 0.3s",
        overflow: "hidden"
      }}>
        <div style={{ padding: "24px", color: "white" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "32px" }}>
            BugBoard
          </h1>
          <nav>
            <a href="/home" style={{ 
              display: "block", 
              padding: "12px 16px", 
              color: "white", 
              textDecoration: "none",
              borderRadius: "8px",
              backgroundColor: "#374151",
              marginBottom: "8px"
            }}>
              Dashboard
            </a>
            <a href="/issues" style={{ 
              display: "block", 
              padding: "12px 16px", 
              color: "#9ca3af", 
              textDecoration: "none",
              borderRadius: "8px"
            }}>
              Issue
            </a>
          </nav>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ☰
          </button>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            Dashboard
          </h2>
        </header>

        {/* Main Content */}
        <div style={{ padding: "32px" }}>
          {error && (
            <div style={{ 
              color: "#dc2626", 
              backgroundColor: "#fee2e2",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "16px", 
              fontSize: "16px",
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
            overflow: "hidden" 
          }}>
            <div style={{ 
              padding: "24px", 
              borderBottom: "1px solid #e5e7eb", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Issue Recenti
              </h2>
              <a 
                href="/issues/nuova"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                + Nuova Issue
              </a>
            </div>

            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Caricamento in corso...
              </div>
            ) : issues.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Nessuna issue trovata. Crea la tua prima issue!
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ 
                        padding: "16px 24px", 
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Titolo
                      </th>
                      <th style={{ 
                        padding: "16px 24px", 
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Stato
                      </th>
                      <th style={{ 
                        padding: "16px 24px", 
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Tipo
                      </th>
                      <th style={{ 
                        padding: "16px 24px", 
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Priorità
                      </th>
                      <th style={{ 
                        padding: "16px 24px", 
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Data Creazione
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr 
                        key={issue.idIssue} 
                        style={{ 
                          borderTop: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        onClick={() => window.location.href = `/issues/${issue.idIssue}`}
                      >
                        <td style={{ 
                          padding: "16px 24px", 
                          color: "#1f2937",
                          fontWeight: 500
                        }}>
                          {issue.titolo}
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
                        <td style={{ padding: "16px 24px", color: "#6b7280" }}>
                          {formatDate(issue.dataCreazione)}
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
    </div>
  );
}

export default Home;