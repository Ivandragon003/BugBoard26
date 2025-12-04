
import React from 'react';

interface FileUploadSectionProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled?: boolean;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ 
  files, 
  setFiles, 
  disabled = false 
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#d1d5db";
    e.currentTarget.style.backgroundColor = "#f9fafb";
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
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
          backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: disabled ? 0.6 : 1
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.currentTarget.style.borderColor = "#0d9488";
          e.currentTarget.style.backgroundColor = "#f0fdfa";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
          e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
          disabled={disabled}
        />
        <label 
          htmlFor="file-upload" 
          style={{ 
            cursor: disabled ? "not-allowed" : "pointer",
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
                disabled={disabled}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "4px",
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: "#dc2626",
                  fontSize: "16px",
                  lineHeight: 1,
                  opacity: disabled ? 0.5 : 1
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