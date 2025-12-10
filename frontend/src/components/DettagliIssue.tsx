import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import AttachmentsViewer from "./AttachmentsViewer";
import styles from "./DettagliIssue.module.css";

interface Issue {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  archiviata: boolean;
  dataArchiviazione: string | null;
  creatore: {
    idUtente: number;
    nome: string;
    cognome: string;
    email: string;
  };
  archiviatore: {
    idUtente: number;
    nome: string;
    cognome: string;
    email: string;
  } | null;
}

interface User {
  id?: number;
  idUtente?: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo?: string;
  role?: string;
}

interface ConfirmDialog {
  open: boolean;
  title: string;
  message: string;
  action: () => Promise<void>;
}

function DettagliIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState<ConfirmDialog>({
    open: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const getBackPath = (): string => {
    if (location.state?.from === "/issues/archiviate") {
      return "/issues/archiviate";
    }
    return "/issues";
  };

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getUser();
    
    if (!token || !currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  const loadIssue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssueById(Number(id));
      setIssue(data);
      setError("");
    } catch (err: any) {
      console.error("Errore caricamento:", err);
      setError(err.response?.data?.message || "Errore nel caricamento dell'issue");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    loadIssue();
  }, [id, user, loadIssue]);

  const handleArchive = () => {
    if (issue && issue.stato !== "Done") {
      setError("Non è possibile archiviare un'issue che non è stata completata.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    setShowConfirm({
      open: true,
      title: "Archivia Issue",
      message: "Sei sicuro di voler archiviare questa issue?",
      action: async () => {
        if (!user) return;
        try {
          await issueService.archiveIssue(Number(id), user.id || user.idUtente || 0);
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
          setSuccess("Issue archiviata con successo!");
          await loadIssue();
          setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
          console.error("Errore archiviazione:", err);
          setError(err.response?.data?.message || "Errore nell'archiviazione dell'issue");
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
          setTimeout(() => setError(""), 5000);
        }
      },
    });
  };

  const handleUnarchive = () => {
    setShowConfirm({
      open: true,
      title: "Disarchivia Issue",
      message: "Sei sicuro di voler disarchiviare questa issue?",
      action: async () => {
        try {
          await issueService.unarchiveIssue(Number(id));
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
          setSuccess("Issue disarchiviata con successo!");
          await loadIssue();
          setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
          console.error("Errore disarchiviazione:", err);
          setError(err.response?.data?.message || "Errore nella disarchiviazione");
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
        }
      },
    });
  };

  const handleDelete = () => {
    setShowConfirm({
      open: true,
      title: "Elimina Issue",
      message: "Sei sicuro di voler eliminare questa issue? Questa azione non può essere annullata.",
      action: async () => {
        try {
          await issueService.deleteIssue(Number(id));
          navigate(getBackPath());
        } catch (err: any) {
          console.error("Errore eliminazione:", err);
          setError(err.response?.data?.message || "Errore nell'eliminazione");
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
        }
      },
    });
  };

  const handleConfirmAction = async () => {
    await showConfirm.action();
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getStatoLabel = (s: string): string => {
    const statoMap: { [key: string]: string } = {
      Todo: "To Do",
      inProgress: "In Progress",
      Done: "Done",
    };
    return statoMap[s] || s;
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

  const isArchived = issue?.archiviata || false;
  const isAdmin = authService.isAdmin();

  if (loading) {
    return (
      <div className={styles.container}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Caricamento issue...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className={styles.container}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundText}>Issue non trovata</div>
        </div>
      </div>
    );
  }

  const backPath = getBackPath();
  const backLabel = backPath === "/issues/archiviate" ? "← Torna alle Archiviate" : "← Torna alla lista";

  return (
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate(backPath)} className={styles.backButton}>
              {backLabel}
            </button>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Dettagli Issue</h2>
              <div className={styles.subtitle}>Visualizza i dettagli dell'issue</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            {isAdmin && !isArchived && (
              <button onClick={handleArchive} className={styles.archiveButton}>
                📦 Archivia
              </button>
            )}
            {isAdmin && isArchived && (
              <button onClick={handleUnarchive} className={styles.unarchiveButton}>
                📤 Disarchivia
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className={styles.deleteButton}>
                🗑️ Elimina
              </button>
            )}
          </div>
        </header>

        <div className={styles.contentWrapper}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div className={styles.successMessage}>
              ✅ {success}
            </div>
          )}

          {isArchived && (
            <div className={styles.archivedNotice}>
              ⚠️ Questa issue è archiviata e non può essere modificata
            </div>
          )}

          <div className={styles.gridContainer}>
            <div className={styles.mainCard}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Titolo</label>
                <div className={styles.displayTitle}>{issue.titolo}</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descrizione</label>
                <div className={styles.displayDescription}>
                  {issue.descrizione}
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Informazioni</h3>

              <div className={styles.infoField}>
                <label className={styles.infoLabel}>Stato</label>
                <span className={`${styles.badge} ${getStatoBadgeClass(issue.stato)}`}>
                  {getStatoLabel(issue.stato)}
                </span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.infoLabel}>Tipo</label>
                <span className={`${styles.badge} ${styles.badgeType}`}>
                  {issue.tipo}
                </span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.infoLabel}>Priorità</label>
                <span className={`${styles.badge} ${getPrioritaBadgeClass(issue.priorita)}`}>
                  {issue.priorita}
                </span>
              </div>

              <hr className={styles.divider} />

              <div className={styles.infoField}>
                <div className={styles.infoLabel}>ID Issue</div>
                <div className={styles.infoValue} style={{ fontFamily: 'monospace' }}>
                  #{issue.idIssue}
                </div>
              </div>

              {issue.creatore && (
                <div className={styles.infoField}>
                  <div className={styles.infoLabel}>Creato da</div>
                  <div className={styles.infoValue}>
                    {issue.creatore.nome} {issue.creatore.cognome}
                  </div>
                  <div className={styles.infoValueSecondary}>
                    {issue.creatore.email}
                  </div>
                </div>
              )}

              <div className={styles.infoField}>
                <div className={styles.infoLabel}>Data Creazione</div>
                <div className={styles.infoValue}>
                  {formatDate(issue.dataCreazione)}
                </div>
              </div>

              {isArchived && (
                <>
                  <hr className={styles.divider} />
                  {issue.dataArchiviazione && (
                    <div className={styles.infoField}>
                      <div className={styles.infoLabel}>Data Archiviazione</div>
                      <div className={styles.infoValue} style={{ color: '#92400e' }}>
                        {formatDate(issue.dataArchiviazione)}
                      </div>
                    </div>
                  )}
                  {issue.archiviatore && (
                    <div className={styles.infoField}>
                      <div className={styles.infoLabel}>Archiviato da</div>
                      <div className={styles.infoValue} style={{ color: '#92400e' }}>
                        {issue.archiviatore.nome} {issue.archiviatore.cognome}
                      </div>
                      <div className={styles.infoValueSecondary}>
                        {issue.archiviatore.email}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <AttachmentsViewer idIssue={Number(id)} canEdit={false} />
        </div>
      </div>

      {showConfirm.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{showConfirm.title}</h3>
            <p className={styles.modalMessage}>{showConfirm.message}</p>
            <div className={styles.modalActions}>
              <button onClick={handleConfirmAction} className={styles.modalConfirmButton}>
                Conferma
              </button>
              <button
                onClick={() => setShowConfirm({ open: false, title: "", message: "", action: async () => {} })}
                className={styles.modalCancelButton}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DettagliIssue;
