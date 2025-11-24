import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService";

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
  const [hoveredItem, setHoveredItem] = useState<string>("");

  const user = authService.getUser();

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormData>({
    titolo: "",
    descrizione: "",
    priorita: "none",
    stato: "todo",
    tipo: "bug",
    idCreatore: user?.id || 0
  });

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
    
    if (!user || !user.id) {
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

      const newIssue = await issueService.createIssue(dataToSend);

      if (files.length > 0 && newIssue.idIssue) {
        for (const file of files) {
          try {
            await allegatoService.uploadAllegato(file, newIssue.idIssue);
          } catch (fileError: any) {
            console.error("Errore upload file:", file.name, fileError);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/issues");
      }, 1500);

    } catch (err: any) {
      console.error("Errore completo:", err);
      
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

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      {/* Sidebar - IDENTICA A HOME */}
      <div style={{
        width: sidebarOpen ? "200px" : "0",
        backgroundColor: "#0d9488",
        transition: "width 0.3s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>
        {/* Linea verticale di separazione sul bordo destro */}
        <div style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          backgroundColor: "rgba(255,255,255,0.3)"
        }} />
        
        <div style={{ padding: "20px", color: "white" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "2px solid rgba(255,255,255,0.25)"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              backgroundColor: "white",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#0d9488",
              fontSize: "14px"
            }}>
              BB
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>BugBoard</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>Dashboard</div>
            </div>
          </div>
          
          <nav>
            <a 
              href="/home" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "rgba(255,255,255,0.7)", 
                textDecoration: "none",
                borderRadius: "6px",
                backgroundColor: hoveredItem === "dashboard" ? "rgba(255,255,255,0.1)" : "transparent",
                marginBottom: "6px",
                fontSize: "13px",
                transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={() => setHoveredItem("dashboard")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "dashboard" && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>📊</span> Dashboard
            </a>
            <a 
              href="/issues" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "rgba(255,255,255,0.7)", 
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: hoveredItem === "lista" ? "rgba(255,255,255,0.1)" : "transparent",
                transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={() => setHoveredItem("lista")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "lista" && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>📋</span> Lista Issue
            </a>
            <a 
              href="/issues/nuova" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "white", 
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: "rgba(255,255,255,0.15)",
                marginBottom: "6px",
                transition: "all 0.2s",
                position: "relative"
              }}
            >
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
              <span style={{ fontSize: "16px" }}>➕</span> Nuova Issue
            </a>
          </nav>
        </div>
        
        {/* Spacer per spingere profilo/logout in basso */}
        <div style={{ flex: 1 }} />
        
        <div style={{ 
          padding: "20px", 
          borderTop: "2px solid rgba(255,255,255,0.25)",
          color: "white"
        }}>
          <a 
            href="/profilo" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "13px",
              marginBottom: "6px",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: hoveredItem === "profilo" ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "all 0.2s",
              position: "relative"
            }}
            onMouseEnter={() => setHoveredItem("profilo")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {hoveredItem === "profilo" && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>👤</span> Profilo
          </a>
          <a 
            href="/logout" 
            onClick={(e) => {
              e.preventDefault();
              authService.logout();
              navigate('/login');
            }}
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "13px",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: hoveredItem === "logout" ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "all 0.2s",
              position: "relative",
              cursor: "pointer"
            }}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {hoveredItem === "logout" && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>🚪</span> Logout
          </a>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header - STESSO STILE DI HOME */}
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
                Add a new issue to track bugs, features, or questions
              </div>
            </div>
          </div>
          <div style={{ 
            width: "36px",
            height: "36px",
            backgroundColor: "#e0f2f1",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
              <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </header>

        {/* Main Content */}
        <div style={{ padding: "32px" }}>
          {/* Alerts */}
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

          {/* Form Card */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            {/* Form Header */}
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "1px solid #e5e7eb"
            }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", margin: "0 0 4px 0" }}>
                Crea Issue
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Compila il form per la creazione di un issue
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              {/* Titolo */}
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
                  placeholder="Inserisci il titolo "
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

              {/* Descrizione */}
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

              {/* Tipo e Priorità */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px"
              }}>
                {/* Tipo */}
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

                {/* Priorità */}
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

              {/* Allegato Immagine */}
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
                    id="allega file"
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
                      Upload Image
                    </p>
                    <p style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0
                    }}>
                      Formati supportati: JPEG (.jpg, .jpeg), PNG (.png), GIF (.gif), WebP (.webp) - Max 5MB
                    </p>
                  </label>
                </div>

                {/* File List */}
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

              {/* Action Buttons */}
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
                      priorita: "medium",
                      stato: "todo",
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
