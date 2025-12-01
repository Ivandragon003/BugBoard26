import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
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
  dataUltimaModifica: string;
  dataRisoluzione: string | null;
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
  const [uploadResults, setUploadResults] = useState<Array<{fileName: string; success: boolean; error?: string}>>([]);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<File[]>([]);
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
    console.log("=== VERIFICA AUTENTICAZIONE ===");
    try {
      const token = authService.getToken();
      const currentUser = authService.getUser();
      console.log("Token presente:", !!token);
      console.log("User presente:", !!currentUser);
      if (!token || !currentUser) {
        console.error("❌ Non autenticato");
        navigate("/login");
        return;
      }

      const userId = currentUser.id || currentUser.idUtente;
      if (!userId) {
        console.error("❌ User senza ID");
        navigate("/login");
        return;
      }

      const normalizedUser: User = {
        ...currentUser,
        id: userId,
      };
      console.log("✅ Autenticazione OK - User ID:", userId);
      setUser(normalizedUser);
      setIsCheckingAuth(false);
    } catch (err) {
      console.error("❌ Errore autenticazione:", err);
      navigate("/login");
    }
  }, [navigate]);

  const loadIssue = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📥 Caricamento issue:", id);
      const data = await issueService.getIssueById(Number(id));
      console.log("✅ Issue caricata:", data);
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
      console.error("❌ Errore caricamento:", err);
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

  const handleSave = async () => {
    try {
      console.log("💾 Salvataggio modifiche:", formData);
      setUploadResults([]);

      const issueAggiornata = await issueService.updateIssue(Number(id), formData);
      console.log("✅ Modifiche salvate, issue aggiornata:", issueAggiornata);

      if (files.length > 0) {
        console.log(`📎 Upload di ${files.length} file per issue ID: ${id}...`);
        const results: Array<{fileName: string; success: boolean; error?: string}> = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`📤 Upload file ${i + 1}/${files.length}: ${file.name}`);
          try {
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
              throw new Error(`File troppo grande (max 5MB)`);
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
              throw new Error('Formato non supportato');
            }

            await allegatoService.uploadAllegato(file, Number(id));
            results.push({
              fileName: file.name,
              success: true
            });
            console.log(`✅ File caricato: ${file.name}`);
          } catch (uploadErr: any) {
            console.error(`❌ Errore upload ${file.name}:`, uploadErr);
            const errorMsg = uploadErr.response?.data?.message || uploadErr.message || 'Errore sconosciuto';
            results.push({
              fileName: file.name,
              success: false,
              error: errorMsg
            });
          }
        }

        setUploadResults(results);
        const someFailed = results.some(r => !r.success);
        if (someFailed) {
          setError("Issue aggiornata. Alcuni allegati non sono stati caricati (vedi sotto).");
        }
        console.log("📊 Risultati upload:", results);
      }

      setFiles([]);
      setSuccess("Issue aggiornata con successo!");
      await loadIssue();
      setEditMode(false);
      setTimeout(() => {
        setSuccess("");
        setUploadResults([]);
      }, 5000);
    } catch (err: any) {
      console.error("❌ Errore salvataggio:", err);
      let errorMessage = "Errore nel salvataggio";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
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
        console.log("📦 Archiviazione:", id);
        await issueService.archiveIssue(Number(id), user.id || user.idUtente || 0);
        console.log("✅ Issue archiviata");
        setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
        setSuccess("Issue archiviata con successo!");
        await loadIssue();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        console.error("❌ Errore archiviazione:", err);
        
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
          console.log("📤 Disarchiviazione:", id);
          await issueService.unarchiveIssue(Number(id));
          console.log("✅ Issue disarchiviata");
          setShowConfirm({ open: false, title: "", message: "", action: async () => {} });
          setSuccess("Issue disarchiviata con successo!");
          await loadIssue();
          setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
          console.error("❌ Errore disarchiviazione:", err);
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
          console.log("🗑️ Eliminazione:", id);
          await issueService.deleteIssue(Number(id));
          console.log("✅ Issue eliminata");
          const backPath = getBackPath();
          navigate(backPath);
        } catch (err: any) {
          console.error("❌ Errore eliminazione:", err);
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

  const getNextStato = (currentStato: string): string => {
    if (currentStato === "Todo") return "inProgress";
    if (currentStato === "inProgress") return "Done";
    return currentStato;
  };

  const canChangeStato = (): boolean => {
    return formData.stato !== "Done" && !issue?.archiviata;
  };

  const handleAdvanceStato = () => {
    if (canChangeStato()) {
      setFormData((prev) => ({
        ...prev,
        stato: getNextStato(prev.stato),
      }));
    }
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
        {/* Header */}
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
                Visualizza e modifica i dettagli dell'issue
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {canEdit && !editMode && (
              <button 
                onClick={() => setEditMode(true)} 
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: "#0d9488", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                ✏️ Modifica
              </button>
            )}
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

        {/* Main Content */}
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
            {/* Colonna Sinistra */}
            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "24px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
            }}>
              {/* Titolo */}
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
                        fontSize: "14px", 
                        boxSizing: "border-box" 
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

              {/* Descrizione */}
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
                        fontSize: "14px",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", 
                        resize: "vertical", 
                        boxSizing: "border-box" 
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

              {/* Allegati File - SOLO IN EDIT MODE */}
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

              {/* Pulsanti Modifica */}
              {editMode && (
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button 
                    onClick={handleSave} 
                    style={{ 
                      padding: "12px 24px", 
                      backgroundColor: "#0d9488", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "8px", 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      cursor: "pointer" 
                    }}
                  >
                    💾 Salva Modifiche
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        titolo: issue.titolo,
                        descrizione: issue.descrizione,
                        stato: issue.stato,
                        tipo: issue.tipo,
                        priorita: issue.priorita,
                      });
                      setFiles([]);
                    }}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ✖ Annulla
                  </button>
                </div>
              )}
            </div>

            {/* Colonna Destra */}
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

              {/* Stato */}
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
                  <button 
                    onClick={handleAdvanceStato} 
                    style={{ 
                      padding: "8px 16px", 
                      backgroundColor: "#dbeafe", 
                      color: "#1e40af", 
                      border: "1px solid #93c5fd", 
                      borderRadius: "6px", 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      cursor: "pointer", 
                      width: "100%" 
                    }}
                  >
                    {getStatoLabel(formData.stato)} → {getStatoLabel(getNextStato(formData.stato))}
                  </button>
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

              {/* Tipo */}
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

              {/* Priorità */}
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
                  >
                    <option value="none">None</option>
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

              {/* ID Issue */}
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

              {/* Creatore */}
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

              {/* Data Creazione */}
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

              {/* Data Ultima Modifica */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "4px" 
                }}>
                  Ultima Modifica
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937" }}>
                  {formatDate(issue.dataUltimaModifica)}
                </div>
              </div>

              {/* Data Risoluzione */}
              {issue.dataRisoluzione && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: 600, 
                    color: "#6b7280", 
                    marginBottom: "4px" 
                  }}>
                    Data Risoluzione
                  </div>
                  <div style={{ fontSize: "14px", color: "#10b981" }}>
                    {formatDate(issue.dataRisoluzione)}
                  </div>
                </div>
              )}

              {/* Dati Archiviazione */}
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

          {/* Sezione Allegati */}
          <div style={{ marginTop: "20px" }}>
            <AttachmentsViewer idIssue={Number(id)} canEdit={canEdit}/>
          </div>
        </div>
      </div>

      {/* Modal di Conferma */}
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
                onClick={() => setShowConfirm({ open: false, title: "", message: "", action: async () => {} })} 
                style={{ 
                  padding: "10px 24px", 
                  backgroundColor: "#f3f4f6", 
                  color: "#374151", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                Annulla
              </button>
              <button 
                onClick={handleConfirmAction} 
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
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DettagliIssue;
