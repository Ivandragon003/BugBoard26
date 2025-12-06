import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import AttachmentsViewer from "./AttachmentsViewer";

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

interface FormData {
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
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
  const [editMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadResults] = useState<Array<{fileName: string, success: boolean, error?: string}>>([]);
  const [showConfirm, setShowConfirm] = useState<ConfirmDialog>({
    open: false,
    title: "",
    message: "",
    action: async () => {},
  });
  const [formData, setFormData] = useState<FormData>({
    titolo: "",
    descrizione: "",
    stato: "",
    tipo: "",
    priorita: "",
  });

  const getBackPath = (): string => {
    if (location.state?.from === "/issues/archiviate") {
      return "/issues/archiviate";
    }
    if (location.state?.from === "/issues") {
      return "/issues";
    }
    return "/issues";
  };

  useEffect(() => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getUser();
      
      if (!token || !currentUser) {
        navigate("/login");
        return;
      }

      const userId = currentUser.id || currentUser.idUtente;
      if (!userId) {
        navigate("/login");
        return;
      }

      const normalizedUser: User = {
        ...currentUser,
        id: userId,
      };
      
      setUser(normalizedUser);
      setIsCheckingAuth(false);
    } catch (err) {
      console.error("Errore autenticazione:", err);
      navigate("/login");
    }
  }, [navigate]);

  const loadIssue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssueById(Number(id));
      setIssue(data);
      setFormData({
        titolo: data.titolo,
        descrizione: data.descrizione,
        stato: data.stato,
        tipo: data.tipo,
        priorita: data.priorita,
      });
      setError("");
    } catch (err: any) {
      console.error("Errore caricamento:", err);
      let errorMessage = "Errore nel caricamento dell'issue";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isCheckingAuth || !id) return;
    loadIssue();
  }, [id, isCheckingAuth, loadIssue]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          let errorMessage = "Errore nell'archiviazione dell'issue";
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
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
          let errorMessage = "Errore nella disarchiviazione";
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          setError(errorMessage);
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
          const backPath = getBackPath();
          navigate(backPath);
        } catch (err: any) {
          console.error("Errore eliminazione:", err);
          let errorMessage = "Errore nell'eliminazione";
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          setError(errorMessage);
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

  const canChangeStato = (): boolean => {
    return formData.stato !== "Done" && !issue?.archiviata;
  };

  const isArchived = issue?.archiviata || false;
  const canEdit = !isArchived;
  const isAdmin = user?.ruolo === "Amministratore" || user?.role === "admin";

  if (isCheckingAuth) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento issue...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#dc2626" }}>Issue non trovata</div>
        </div>
      </div>
    );
  }

  const backPath = getBackPath();
  const backLabel = backPath === "/issues/archiviate" ? "← Torna alle Archiviate" : "← Torna alla lista";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ 
          backgroundColor: "white", 
          borderBottom: "1px solid #e5e7eb", 
          padding: "16px 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => navigate(backPath)} 
              style={{ 
                padding: "8px 12px", 
                backgroundColor: "transparent", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "18px", 
                color: "#374151" 
              }}
            >
              {backLabel}
            </button>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Dettagli Issue
              </h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Visualizza i dettagli dell'issue
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {isAdmin && !isArchived && (
              <button 
                onClick={handleArchive} 
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: "#f59e0b", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                📦 Archivia
              </button>
            )}
            {isAdmin && isArchived && (
              <button 
                onClick={handleUnarchive} 
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: "#10b981", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                📤 Disarchivia
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={handleDelete} 
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: "#dc2626", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                🗑️ Elimina
              </button>
            )}
          </div>
        </header>

        <div style={{ padding: "24px 16px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          {error && (
            <div style={{ 
              color: "#dc2626", 
              backgroundColor: "#fee2e2", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "24px", 
              fontSize: "14px", 
              border: "1px solid #fecaca" 
            }}>
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              color: "#065f46", 
              backgroundColor: "#d1fae5", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "24px", 
              fontSize: "14px", 
              border: "1px solid #6ee7b7" 
            }}>
              ✅ {success}
            </div>
          )}

          {uploadResults.length > 0 && (
            <div style={{ 
              backgroundColor: "#fef3c7", 
              padding: "16px", 
              borderRadius: "8px", 
              marginBottom: "24px", 
              border: "1px solid #fde68a" 
            }}>
              <div style={{ fontWeight: 600, color: "#92400e", marginBottom: "12px", fontSize: "14px" }}>
                📎 Risultati Upload Allegati
              </div>
              {uploadResults.map((result, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    marginBottom: "6px", 
                    fontSize: "13px" 
                  }}
                >
                  <span>{result.success ? '✅' : '❌'}</span>
                  <span style={{ color: "#92400e" }}>{result.fileName}</span>
                  {result.error && (
                    <span style={{ color: "#dc2626", fontSize: "12px" }}>
                      ({result.error})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {isArchived && (
            <div style={{ 
              color: "#92400e", 
              backgroundColor: "#fef3c7", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "24px", 
              fontSize: "14px", 
              border: "1px solid #fde68a" 
            }}>
              ⚠️ Questa issue è archiviata e non può essere modificata
            </div>
          )}

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: window.innerWidth > 1024 ? "minmax(0, 2fr) minmax(280px, 1fr)" : "1fr",
            gap: "20px" 
          }}>
            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "24px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
            }}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  color: "#374151", 
                  marginBottom: "8px" 
                }}>
                  Titolo *
                </label>
                {editMode ? (
                  <>
                    <input
                      type="text"
                      name="titolo"
                      value={formData.titolo}
                      onChange={handleInputChange}
                      maxLength={200}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        border: "1px solid #d1d5db", 
                        borderRadius: "8px", 
                        fontSize: "15px",
                        fontFamily: "inherit",
                        color: "#4b5563",
                        boxSizing: "border-box",
                        outline: "none"
                      }}
                    />
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#6b7280", 
                      marginTop: "4px", 
                      textAlign: "right" 
                    }}>
                      {formData.titolo.length}/200
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
                    {issue.titolo}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  color: "#374151", 
                  marginBottom: "8px" 
                }}>
                  Descrizione *
                </label>
                {editMode ? (
                  <>
                    <textarea
                      name="descrizione"
                      value={formData.descrizione}
                      onChange={handleInputChange}
                      maxLength={5000}
                      rows={8}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        border: "1px solid #d1d5db", 
                        borderRadius: "8px", 
                        fontSize: "15px",
                        fontFamily: "inherit",
                        color: "#4b5563",
                        lineHeight: 1.6,
                        resize: "vertical", 
                        boxSizing: "border-box",
                        outline: "none"
                      }}
                    />
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#6b7280", 
                      marginTop: "4px", 
                      textAlign: "right" 
                    }}>
                      {formData.descrizione.length}/5000
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    fontSize: "15px", 
                    color: "#4b5563", 
                    lineHeight: 1.6, 
                    whiteSpace: "pre-wrap" 
                  }}>
                    {issue.descrizione}
                  </div>
                )}
              </div>

              {editMode && (
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ 
                    display: "block", 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    color: "#374151", 
                    marginBottom: "8px" 
                  }}>
                    Allega File (facoltativo)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#0d9488";
                      e.currentTarget.style.backgroundColor = "#f0fdfa";
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
                        setFiles((prev) => [...prev, ...newFiles]);
                      }
                    }}
                    style={{
                      border: "2px dashed #d1d5db",
                      borderRadius: "8px",
                      padding: "24px",
                      textAlign: "center",
                      backgroundColor: "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          setFiles((prev) => [...prev, ...newFiles]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>⬆️</div>
                      <div style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        color: "#1f2937", 
                        marginBottom: "4px" 
                      }}>
                        Trascina file qui o clicca
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Formati supportati: JPEG, PNG, GIF, WebP - Max 5MB
                      </div>
                    </label>
                  </div>
                  {files && files.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ 
                        fontSize: "12px", 
                        fontWeight: 600, 
                        color: "#6b7280", 
                        marginBottom: "8px" 
                      }}>
                        File selezionati:
                      </div>
                      {files.map((file: any, index: number) => (
                        <div 
                          key={index} 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            padding: "8px 12px", 
                            backgroundColor: "#f3f4f6", 
                            borderRadius: "6px", 
                            marginBottom: "6px", 
                            fontSize: "12px" 
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: "#1f2937" }}>{file.name}</div>
                            <div style={{ color: "#6b7280" }}>{(file.size / 1024).toFixed(2)} KB</div>
                          </div>
                          <button
                            onClick={() =>
                              setFiles((prev) => prev.filter((_, i) => i !== index))
                            }
                            style={{
                              padding: "6px 10px",
                              backgroundColor: "#fee2e2",
                              border: "1px solid #fca5a5",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "#dc2626",
                              fontSize: "16px",
                              lineHeight: "1",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "20px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
              height: "fit-content" 
            }}>
              <h3 style={{ 
                fontSize: "16px", 
                fontWeight: 600, 
                color: "#1f2937", 
                margin: "0 0 20px 0" 
              }}>
                Informazioni
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Stato
                </label>
                {editMode && canChangeStato() ? (
                  <select
                    name="stato"
                    value={formData.stato}
                    onChange={(e) => {
                      const nuovoStato = e.target.value;
                      setShowConfirm({
                        open: true,
                        title: "Modifica Stato",
                        message: `Sei sicuro di voler cambiare lo stato da "${getStatoLabel(formData.stato)}" a "${getStatoLabel(nuovoStato)}"?`,
                        action: async () => {
                          setFormData((prev) => ({
                            ...prev,
                            stato: nuovoStato,
                          }));
                          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
                        },
                      });
                    }}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "1px solid #d1d5db", 
                      borderRadius: "6px", 
                      fontSize: "14px", 
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      cursor: "pointer"
                    }}
                  >
                    {formData.stato === "Todo" && (
                      <>
                        <option value="Todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="Done">Done</option>
                      </>
                    )}
                    {formData.stato === "inProgress" && (
                      <>
                        <option value="inProgress">In Progress</option>
                        <option value="Done">Done</option>
                      </>
                    )}
                    {formData.stato === "Done" && (
                      <option value="Done">Done</option>
                    )}
                  </select>
                ) : (
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: formData.stato === "Done" ? "#d1fae5" : formData.stato === "inProgress" ? "#fef3c7" : "#e5e7eb",
                    color: formData.stato === "Done" ? "#065f46" : formData.stato === "inProgress" ? "#92400e" : "#374151",
                    borderRadius: "6px", 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    display: "inline-block" 
                  }}>
                    {getStatoLabel(formData.stato)}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Tipo
                </label>
                {editMode ? (
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "1px solid #d1d5db", 
                      borderRadius: "6px", 
                      fontSize: "14px", 
                      boxSizing: "border-box" 
                    }}
                  >
                    <option value="bug">Bug</option>
                    <option value="features">Feature</option>
                    <option value="question">Question</option>
                    <option value="documentation">Documentation</option>
                  </select>
                ) : (
                  <span style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "#dbeafe", 
                    color: "#1e40af", 
                    borderRadius: "6px", 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    display: "inline-block" 
                  }}>
                    {formData.tipo}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Priorità
                </label>
                {editMode ? (
                  <select
                    name="priorita"
                    value={formData.priorita}
                    onChange={handleInputChange}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px", 
                      border: "1px solid #d1d5db", 
                      borderRadius: "6px", 
                      fontSize: "14px", 
                      boxSizing: "border-box" 
                    }}
                  ><option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <span style={{ 
                padding: "6px 12px", 
                backgroundColor: formData.priorita === "critical" ? "#fecaca" : formData.priorita === "high" ? "#fed7aa" : formData.priorita === "medium" ? "#fef3c7" : "#f3f4f6",
                color: formData.priorita === "critical" ? "#7f1d1d" : formData.priorita === "high" ? "#9a3412" : formData.priorita === "medium" ? "#92400e" : "#374151",
                borderRadius: "6px", 
                fontSize: "14px", 
                fontWeight: 600, 
                display: "inline-block", 
                textTransform: "capitalize" 
              }}>
                {formData.priorita}
              </span>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

          <div style={{ marginBottom: "16px" }}>
            <div style={{ 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#6b7280", 
              marginBottom: "4px" 
            }}>
              ID Issue
            </div>
            <div style={{ fontSize: "14px", color: "#1f2937", fontFamily: "monospace" }}>
              #{issue.idIssue}
            </div>
          </div>

          {issue.creatore && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 600, 
                color: "#6b7280", 
                marginBottom: "4px" 
              }}>
                Creato da
              </div>
              <div style={{ fontSize: "14px", color: "#1f2937" }}>
                {issue.creatore.nome} {issue.creatore.cognome}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {issue.creatore.email}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <div style={{ 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#6b7280", 
              marginBottom: "4px" 
            }}>
              Data Creazione
            </div>
            <div style={{ fontSize: "14px", color: "#1f2937" }}>
              {formatDate(issue.dataCreazione)}
            </div>
          </div>

          {isArchived && (
            <>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />
              {issue.dataArchiviazione && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: 600, 
                    color: "#6b7280", 
                    marginBottom: "4px" 
                  }}>
                    Data Archiviazione
                  </div>
                  <div style={{ fontSize: "14px", color: "#92400e" }}>
                    {formatDate(issue.dataArchiviazione)}
                  </div>
                </div>
              )}
              {issue.archiviatore && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: 600, 
                    color: "#6b7280", 
                    marginBottom: "4px" 
                  }}>
                    Archiviato da
                  </div>
                  <div style={{ fontSize: "14px", color: "#92400e" }}>
                    {issue.archiviatore.nome} {issue.archiviatore.cognome}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {issue.archiviatore.email}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <AttachmentsViewer idIssue={Number(id)} canEdit={canEdit} />
      </div>
    </div>
  </div>

  {showConfirm.open && (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: "rgba(0, 0, 0, 0.5)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      zIndex: 1000 
    }}>
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "12px", 
        padding: "32px", 
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", 
        maxWidth: "400px", 
        textAlign: "center" 
      }}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", marginTop: 0 }}>
          {showConfirm.title}
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", marginTop: "12px" }}>
          {showConfirm.message}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button 
            onClick={handleConfirmAction} 
            style={{ 
              padding: "10px 24px", 
              backgroundColor: "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontSize: "14px", 
              fontWeight: 600, 
              cursor: "pointer" 
            }}
          >
            Conferma
          </button>
          <button 
            onClick={() => {
              if (issue) {
                setFormData((prev) => ({
                  ...prev,
                  stato: issue.stato,
                }));
              }
              setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
            }} 
            style={{ 
              padding: "10px 24px", 
              backgroundColor: "#dc2626", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontSize: "14px", 
              fontWeight: 600, 
              cursor: "pointer" 
            }}
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