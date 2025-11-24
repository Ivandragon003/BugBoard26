import React, { useState, useEffect } from "react";
import axios from "axios";

function Home() {
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Issue state
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState<string>("");

  // Carica le issue dal backend all'avvio
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/issues", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      })
      .then((response) => setIssues(response.data))
      .catch(() => setError("Errore nel caricamento delle issue"));
  }, []);

  // Stili issue
  const getStatoStyle = (stato: string) => {
    switch (stato) {
      case "To Do":
        return { backgroundColor: "#e5e7eb", color: "#374151" };
      case "In Progress":
        return { backgroundColor: "#fed7aa", color: "#9a3412" };
      case "Done":
        return { backgroundColor: "#86efac", color: "#166534" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };
  const getTipoStyle = (tipo: string) => {
    switch (tipo) {
      case "Documentation":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "Feature":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "Bug":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "Question":
        return { backgroundColor: "#e9d5ff", color: "#6b21a8" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };
  const getPrioritaStyle = (priorita: string) => {
    switch (priorita) {
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

  // RENDER
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* ...qui il resto della sidebar e del layout esattamente come nel tuo codice */}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ...header come nel tuo codice */}

        <div style={{ padding: "32px" }}>
          {error && (
            <div style={{ color: "red", marginBottom: "16px", fontSize: "16px" }}>{error}</div>
          )}
          <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", margin: 0 }}>Issue Recenti</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{ padding: "16px 24px" }}>Titolo</th>
                    <th style={{ padding: "16px 24px" }}>Stato</th>
                    <th style={{ padding: "16px 24px" }}>Tipo</th>
                    <th style={{ padding: "16px 24px" }}>Priorità</th>
                    <th style={{ padding: "16px 24px" }}>Data Creazione</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue: any, index: number) => (
                    <tr key={index} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "16px 24px", color: "#1f2937" }}>{issue.titolo}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontWeight: 500, ...getStatoStyle(issue.stato) }}>
                          {issue.stato}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontWeight: 500, ...getTipoStyle(issue.tipo) }}>
                          {issue.tipo}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontWeight: 500, ...getPrioritaStyle(issue.priorita) }}>
                          {issue.priorita}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", color: "#6b7280" }}>{issue.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
