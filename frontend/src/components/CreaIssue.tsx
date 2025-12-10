import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService"; 
import Sidebar from "./Sidebar";
import styles from "./CreaIssue.module.css"; // ✅ Esternalizza gli stili

// ✅ Tipizza i tipi e priorità
type TipoIssue = "bug" | "features" | "question" | "documentation";
type Priorita = "none" | "low" | "medium" | "high" | "critical";

// ✅ Interfaccia per errori API
interface ApiErrorResponse {
  message?: string;
}

function CreaIssue() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [titolo, setTitolo] = useState<string>("");
  const [descrizione, setDescrizione] = useState<string>("");
  const [tipo, setTipo] = useState<TipoIssue>("bug");
  const [priorita, setPriorita] = useState<Priorita>("none");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Controllo autenticazione
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();
    
    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Gestione upload con feedback
  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const validFiles = Array.from(newFiles).filter(file => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`Il file ${file.name} supera i 5MB`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  // ✅ Gestione drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragActive);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove(styles.dragActive);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragActive);
    handleFileChange(e.dataTransfer.files);
  };

  // ✅ Rimozione file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit con gestione errori tipizzata
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const currentUser = authService.getUser();
      if (!currentUser) {
        throw new Error("Devi essere autenticato per creare un'issue");
      }

      const userId = currentUser.id || currentUser.idUtente;
      if (!userId) {
        throw new Error("ID utente non valido");
      }

      const dataToSend = {
        titolo,
        descrizione,
        stato: "Todo" as const,
        tipo,
        priorita,
        idCreatore: userId  
      };

      const nuovaIssue = await issueService.createIssue(dataToSend);

      // ✅ Upload allegati con gestione errori per singolo file
      if (files.length > 0) {
        const uploadResults = await Promise.allSettled(
          files.map(file => allegatoService.uploadAllegato(file, nuovaIssue.idIssue))
        );

        const failedUploads = uploadResults.filter(r => r.status === "rejected");
        if (failedUploads.length > 0) {
          console.warn(`${failedUploads.length} file non caricati`);
        }
      }

      setSuccess("Issue creata con successo!");
      setTimeout(() => navigate("/issues"), 1500);

    } catch (err) {
      // ✅ Gestione errori tipizzata
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ApiErrorResponse;
        setError(apiError?.message || "Errore del server");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore sconosciuto nella creazione dell'issue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.menuButton}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div>
            <h2 className={styles.title}>Nuova Issue</h2>
            <div className={styles.subtitle}>Crea una nuova segnalazione</div>
          </div>
        </header>

        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit}>
              {/* Titolo */}
              <div className={styles.formGroup}>
                <label htmlFor="titolo" className={styles.label}>
                  Titolo *
                </label>
                <input
                  id="titolo"
                  type="text"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  required
                  maxLength={200}
                  className={styles.input}
                  placeholder="Inserisci il titolo dell'issue"
                />
                <div className={styles.charCount}>{titolo.length}/200</div>
              </div>

              {/* Descrizione */}
              <div className={styles.formGroup}>
                <label htmlFor="descrizione" className={styles.label}>
                  Descrizione *
                </label>
                <textarea
                  id="descrizione"
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  required
                  maxLength={5000}
                  rows={6}
                  className={styles.textarea}
                  placeholder="Descrivi il problema o la richiesta..."
                />
                <div className={styles.charCount}>{descrizione.length}/5000</div>
              </div>

              {/* Tipo e Priorità */}
              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo" className={styles.label}>Tipo *</label>
                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoIssue)}
                    className={styles.select}
                  >
                    <option value="bug">Bug</option>
                    <option value="features">Feature</option>
                    <option value="question">Question</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="priorita" className={styles.label}>Priorità *</label>
                  <select
                    id="priorita"
                    value={priorita}
                    onChange={(e) => setPriorita(e.target.value as Priorita)}
                    className={styles.select}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Upload Files */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Allega file (facoltativo)</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={styles.dropzone}
                >
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                    className={styles.fileInput}
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-input" className={styles.dropzoneLabel}>
                    <div className={styles.uploadIcon}>⬆️</div>
                    <div className={styles.uploadText}>Trascina file qui o clicca</div>
                    <div className={styles.uploadHint}>
                      JPEG, PNG, GIF, WebP, PDF, DOC, DOCX - Max 5MB
                    </div>
                  </label>
                </div>

                {/* Lista file */}
                {files.length > 0 && (
                  <div className={styles.fileList}>
                    <div className={styles.fileListTitle}>File selezionati:</div>
                    {files.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <div>
                          <div className={styles.fileName}>{file.name}</div>
                          <div className={styles.fileSize}>
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className={styles.removeButton}
                          aria-label={`Rimuovi ${file.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messaggi */}
              {error && (
                <div className={styles.errorMessage} role="alert">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className={styles.successMessage} role="status">
                  ✅ {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? "Creazione in corso..." : "Crea Issue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreaIssue;