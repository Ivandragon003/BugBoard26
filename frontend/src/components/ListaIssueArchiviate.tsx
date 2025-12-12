import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import styles from "./ListaIssueArchiviate.module.css";

interface Issue {
  idIssue: number;
  titolo: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  dataArchiviazione: string;
  archiviata: boolean;
}

function ListaIssueArchiviate() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
  const saved = localStorage.getItem('sidebarOpen');
  if (saved !== null) {
    return saved === 'true';
  }
  return window.innerWidth > 768;
});

useEffect(() => {
  localStorage.setItem('sidebarOpen', String(sidebarOpen));
}, [sidebarOpen]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statoFilter, setStatoFilter] = useState("Tutti gli stati");
  const [tipoFilter, setTipoFilter] = useState("Tutti i tipi");
  const [prioritaFilter, setPrioritaFilter] = useState("Tutte le priorità");
  const [sortOrder, setSortOrder] = useState("Data (più recente)");

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    loadIssues();
  }, [navigate]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getAllIssues();
      const archived = data.filter((issue: Issue) => issue.archiviata);
      setIssues(archived);
      setFilteredIssues(archived);
    } catch (error) {
      console.error("Errore caricamento issue archiviate:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter((issue) =>
        issue.titolo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statoFilter !== "Tutti gli stati") {
      filtered = filtered.filter((issue) => issue.stato === statoFilter);
    }

    if (tipoFilter !== "Tutti i tipi") {
      filtered = filtered.filter((issue) => issue.tipo === tipoFilter);
    }

    if (prioritaFilter !== "Tutte le priorità") {
      filtered = filtered.filter((issue) => issue.priorita === prioritaFilter);
    }

    if (sortOrder === "Data (più recente)") {
      filtered.sort((a, b) => new Date(b.dataArchiviazione).getTime() - new Date(a.dataArchiviazione).getTime());
    } else if (sortOrder === "Data (meno recente)") {
      filtered.sort((a, b) => new Date(a.dataArchiviazione).getTime() - new Date(b.dataArchiviazione).getTime());
    }

    setFilteredIssues(filtered);
  }, [searchTerm, statoFilter, tipoFilter, prioritaFilter, sortOrder, issues]);

  const handleReset = () => {
    setSearchTerm("");
    setStatoFilter("Tutti gli stati");
    setTipoFilter("Tutti i tipi");
    setPrioritaFilter("Tutte le priorità");
    setSortOrder("Data (più recente)");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT");
  };

  const hasActiveFilters = () => {
    return searchTerm !== "" || 
           statoFilter !== "Tutti gli stati" || 
           tipoFilter !== "Tutti i tipi" || 
           prioritaFilter !== "Tutte le priorità";
  };

  const getStatoBadgeClass = (stato: string): string => {
    if (stato === "Done") return styles.badgeStatusDone;
    if (stato === "inProgress") return styles.badgeStatusInProgress;
    return styles.badgeStatusTodo;
  };

  const getPrioritaBadgeClass = (priorita: string): string => {
    if (priorita === "critical") return styles.badgePriorityCritical;
    if (priorita === "high") return styles.badgePriorityHigh;
    if (priorita === "medium") return styles.badgePriorityMedium;
    if (priorita === "low") return styles.badgePriorityLow;
    return styles.badgePriorityNone;
  };

  const formatStato = (stato: string) => {
    if (stato === "inProgress") return "In corso";
    return stato;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={styles.loadingContent}>
          <div className={styles.loadingText}>Caricamento issue archiviate...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Issue Archiviate</h1>
            <p className={styles.subtitle}>
              Visualizza e gestisci tutte le issue archiviate
            </p>
          </div>
          <button
            onClick={() => navigate("/issues")}
            className={styles.backButton}
          >
            ← Torna alla lista
          </button>
        </header>

        <div className={styles.content}>
          {hasActiveFilters() && (
            <div className={styles.activeFiltersNotice}>
              <span style={{ fontSize: "16px" }}>🔍</span>
              <strong>Filtri attivi:</strong>
              <span>Mostrando {filteredIssues.length} di {issues.length} issue archiviate</span>
            </div>
          )}

          <div className={styles.filterBar}>
            <div className={styles.filterGrid}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>
                  🔍 Cerca issue
                </label>
                <input
                  type="text"
                  placeholder="Scrivi il titolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${styles.searchInput} ${searchTerm ? styles.searchInputActive : ''}`}
                />
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Stato</label>
                <select
                  value={statoFilter}
                  onChange={(e) => setStatoFilter(e.target.value)}
                  className={`${styles.filterSelect} ${statoFilter !== "Tutti gli stati" ? styles.filterSelectActive : ''}`}
                >
                  <option>Tutti gli stati</option>
                  <option>Todo</option>
                  <option>inProgress</option>
                  <option>Done</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Tipo</label>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className={`${styles.filterSelect} ${tipoFilter !== "Tutti i tipi" ? styles.filterSelectActive : ''}`}
                >
                  <option>Tutti i tipi</option>
                  <option>bug</option>
                  <option>features</option>
                  <option>question</option>
                  <option>documentation</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Priorità</label>
                <select
                  value={prioritaFilter}
                  onChange={(e) => setPrioritaFilter(e.target.value)}
                  className={`${styles.filterSelect} ${prioritaFilter !== "Tutte le priorità" ? styles.filterSelectActive : ''}`}
                >
                  <option>Tutte le priorità</option>
                  <option>none</option>
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                  <option>critical</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Ordina</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option>Data (più recente)</option>
                  <option>Data (meno recente)</option>
                </select>
              </div>

              <button
                onClick={handleReset}
                className={styles.resetButton}
              >
                Reset
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeaderCell}>Titolo</th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Stato
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Tipo
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Priorità
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Data Arch.
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Nessuna issue archiviata
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr
                      key={issue.idIssue}
                      className={styles.tableRow}
                      onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/issues/archiviate" } })}
                    >
                      <td className={`${styles.tableCell} ${styles.tableCellTitle}`}>
                        {issue.titolo}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${getStatoBadgeClass(issue.stato)}`}>
                          {formatStato(issue.stato)}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${styles.badgeType}`}>
                          {issue.tipo}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${getPrioritaBadgeClass(issue.priorita)}`}>
                          {issue.priorita}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellDate}`}>
                        {formatDate(issue.dataArchiviazione)}
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
  );
}

export default ListaIssueArchiviate;
