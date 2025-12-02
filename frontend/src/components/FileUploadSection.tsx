import React from 'react';

interface ProprietaSezioneCaricamentoFile {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled?: boolean;
}

const FileUploadSection: React.FC<ProprietaSezioneCaricamentoFile> = ({ 
  files: fileAllegati, 
  setFiles: impostaFileAllegati, 
  disabled: disabilitato = false 
}) => {
  
  const gestisciCambioFile = (eventoInput: React.ChangeEvent<HTMLInputElement>) => {
    if (eventoInput.target.files) {
      const nuoviFile = Array.from(eventoInput.target.files);
      impostaFileAllegati(fileEsistenti => [...fileEsistenti, ...nuoviFile]);
    }
  };

  const rimuoviFile = (indiceFile: number) => {
    impostaFileAllegati(fileEsistenti => fileEsistenti.filter((_, indice) => indice !== indiceFile));
  };

  const gestisciRilascioFile = (eventoRilascio: React.DragEvent<HTMLDivElement>) => {
    eventoRilascio.preventDefault();
    eventoRilascio.currentTarget.style.borderColor = "#d1d5db";
    eventoRilascio.currentTarget.style.backgroundColor = "#f9fafb";
    if (eventoRilascio.dataTransfer.files) {
      const nuoviFile = Array.from(eventoRilascio.dataTransfer.files);
      impostaFileAllegati(fileEsistenti => [...fileEsistenti, ...nuoviFile]);
    }
  };

  const gestisciTrascina = (eventoTrascina: React.DragEvent<HTMLDivElement>) => {
    if (disabilitato) return;
    eventoTrascina.preventDefault();
    eventoTrascina.currentTarget.style.borderColor = "#0d9488";
    eventoTrascina.currentTarget.style.backgroundColor = "#f0fdfa";
  };

  const gestisciEsceDaAreaTrascina = (eventoTrascina: React.DragEvent<HTMLDivElement>) => {
    eventoTrascina.currentTarget.style.borderColor = "#d1d5db";
    eventoTrascina.currentTarget.style.backgroundColor = "#f9fafb";
  };

  const formattaDimensioneFile = (dimensioneInBytes: number): string => {
    return (dimensioneInBytes / 1024).toFixed(2);
  };

  return (
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
      <div 
        style={{
          border: "2px dashed #d1d5db",
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
          backgroundColor: disabilitato ? "#f3f4f6" : "#f9fafb",
          cursor: disabilitato ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: disabilitato ? 0.6 : 1
        }}
        onDragOver={gestisciTrascina}
        onDragLeave={gestisciEsceDaAreaTrascina}
        onDrop={gestisciRilascioFile}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={gestisciCambioFile}
          style={{ display: "none" }}
          id="input-caricamento-file"
          disabled={disabilitato}
        />
        <label 
          htmlFor="input-caricamento-file" 
          style={{ 
            cursor: disabilitato ? "not-allowed" : "pointer",
            display: "block"
          }}
        >
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

      {fileAllegati.length > 0 && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {fileAllegati.map((fileSingolo, indice) => (
            <div key={indice} style={{
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
                    {fileSingolo.name}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "2px"
                  }}>
                    {formattaDimensioneFile(fileSingolo.size)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => rimuoviFile(indice)}
                disabled={disabilitato}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "4px",
                  cursor: disabilitato ? "not-allowed" : "pointer",
                  color: "#dc2626",
                  fontSize: "16px",
                  lineHeight: 1,
                  opacity: disabilitato ? 0.5 : 1
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;