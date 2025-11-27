import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";

interface FormData {
  titolo: string;
  descrizione: string;
  priorita: string;
  stato: string;
  tipo: string;
  idCreatore: number;
}

function CreaIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    console.log('=== VERIFICA AUTENTICAZIONE ===');
    
    const token = authService.getToken();
    const currentUser = authService.getUser();
    
    console.log('Token presente:', !!token);
    console.log('User presente:', !!currentUser);
    console.log('User completo:', currentUser);
    
    // Verifica token
    if (!token) {
      console.error('❌ Token non trovato - Redirect a login');
      navigate('/login');
      return;
    }
    
    // Verifica user
    if (!currentUser) {
      console.error('❌ User non trovato - Redirect a login');
      navigate('/login');
      return;
    }
    
    // Verifica ID utente
    if (!currentUser.id && !currentUser.idUtente) {
      console.error('❌ User senza ID - Redirect a login');
      console.error('Struttura user:', Object.keys(currentUser));
      navigate('/login');
      return;
    }
    
    // Normalizza l'ID (potrebbe essere "id" o "idUtente")
    const userId = currentUser.id || currentUser.idUtente;
    const normalizedUser = {
      ...currentUser,
      id: userId
    };
    
    console.log('✅ Autenticazione OK - User ID:', userId);
    setUser(normalizedUser);
    setIsCheckingAuth(false);
  }, [navigate]);

  const [formData, setFormData] = useState<FormData>({
    titolo: "",
    descrizione: "",
    priorita: "none",
    stato: "Todo",
    tipo: "bug",
    idCreatore: 0
  });

  useEffect(() => {
    if (user && user.id) {
      console.log('Impostazione idCreatore nel form:', user.id);
      setFormData(prev => ({
        ...prev,
        idCreatore: user.id
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== SUBMIT ISSUE ===');
    console.log('User corrente:', user);
    
    if (!user || !user.id) {
      console.error('❌ User non valido al submit');
      setError("Devi essere autenticato per creare un'issue");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...formData,
        idCreatore: user.id
      };

      console.log("📤 Dati inviati:", dataToSend);

      const newIssue = await issueService.createIssue(dataToSend);
      console.log("✅ Issue creata:", newIssue);

      if (files.length > 0 && newIssue.idIssue) {
        console.log(`📎 Upload di ${files.length} file...`);
        for (const file of files) {
          try {
            await allegatoService.uploadAllegato(file, newIssue.idIssue);
            console.log(`✅ File caricato: ${file.name}`);
          } catch (fileError: any) {
            console.error("❌ Errore upload file:", file.name, fileError);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/issues");
      }, 1500);

    } catch (err: any) {
      console.error("❌ Errore completo:", err);
      
      let errorMessage = "Errore durante la creazione dell'issue";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        fontSize: "18px",
        color: "#6b7280",
        backgroundColor: "#f5f7fa"
      }}>
        Caricamento...
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "20px",
                color: "#374151"
              }}
            >
              ☰
            </button>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Crea Nuova Issue
              </h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Aggiungi una nuova issue per tracciare bug, feature o domande
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate('/profilo')}
            style={{ 
              width: "36px",
              height: "36px",
              backgroundColor: "#e0f2f1",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
              <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </header>

        <div style={{ padding: "32px" }}>
          {error && (
            <div style={{ 
              color: "#dc2626", 
              backgroundColor: "#fee2e2",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px", 
              fontSize: "14px",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "start",
              gap: "12px"
            }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Errore</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: "#d1fae5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "20px" }}>✅</span>
              Issue creata con successo! Reindirizzamento in corso...
            </div>
          )}

          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "1px solid #e5e7eb"
            }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", margin: "0 0 4px 0" }}>
                Dettagli Issue
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Compila il form per la creazione di un issue
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Titolo <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleInputChange}
                  maxLength={200}
                  required
                  placeholder="Inserisci il titolo"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
                <div style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "4px",
                  textAlign: "right"
                }}>
                  {formData.titolo.length}/200
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Descrizione <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="descrizione"
                  value={formData.descrizione}
                  onChange={handleInputChange}
                  maxLength={5000}
                  rows={5}
                  required
                  placeholder="Inserisci la descrizione dettagliata dell'issue"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
                <div style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "4px",
                  textAlign: "right"
                }}>
                  {formData.descrizione.length}/5000
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Tipo <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  >
                    <option value="bug">Bug</option>
                    <option value="features">Feature</option>
                    <option value="documentation">Documentation</option>
                    <option value="question">Question</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Priorità (facoltativo)
                  </label>
                  <select
                    name="priorita"
                    value={formData.priorita}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  >
                    <option value="none">Nessuna</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Allegato File (facoltativo)
                </label>
                <div style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
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
                    setFiles(prev => [...prev, ...newFiles]);
                  }
                }}>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 12px",
                      backgroundColor: "#e0f2f1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px"
                    }}>
                      ⬆️
                    </div>
                    <p style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#0d9488",
                      margin: "0 0 4px 0"
                    }}>
                      Carica File
                    </p>
                    <p style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0
                    }}>
                      Formati supportati: JPEG, PNG, GIF, WebP - Max 5MB
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map((file, index) => (
                      <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "#e0f2f1",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px"
                          }}>
                            📄
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: 500,
                              color: "#1f2937",
                              fontSize: "13px"
                            }}>
                              {file.name}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "2px"
                            }}>
                              {(file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#dc2626",
                            fontSize: "16px",
                            lineHeight: 1
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb"
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      titolo: "",
                      descrizione: "",
                      priorita: "none",
                      stato: "Todo",
                      tipo: "bug",
                      idCreatore: user?.id || 0
                    });
                    setFiles([]);
                  }}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "white",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 28px",
                    backgroundColor: loading ? "#9ca3af" : "#0d9488",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0f766e")}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0d9488")}
                >
                  {loading ? "Creazione in corso..." : "Crea Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreaIssue;