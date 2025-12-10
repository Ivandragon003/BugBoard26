import React, { useState } from 'react';
import styles from './FileUploadSection.module.css';

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
  // ✅ MIGLIORAMENTO: Stato per errori di validazione
  const [error, setError] = useState<string>('');

  // ✅ MIGLIORAMENTO: Costanti di configurazione
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILES = 10; // Limite opzionale

  // ✅ MIGLIORAMENTO: Funzione di validazione
  const validateFiles = (newFiles: File[]): string | null => {
    // Controlla numero massimo di file
    if (files.length + newFiles.length > MAX_FILES) {
      return `Massimo ${MAX_FILES} file consentiti`;
    }

    // Valida ogni file
    for (const file of newFiles) {
      // Controlla dimensione
      if (file.size > MAX_FILE_SIZE) {
        return `File "${file.name}" troppo grande (max 5MB)`;
      }

      // Controlla tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `File "${file.name}" non supportato. Usa JPEG, PNG, GIF o WebP`;
      }

      // Controlla duplicati
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        return `File "${file.name}" già caricato`;
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // ✅ MIGLIORAMENTO: Validazione prima di aggiungere
      const validationError = validateFiles(newFiles);
      if (validationError) {
        setError(validationError);
        setTimeout(() => setError(''), 5000);
        e.target.value = ''; // Reset input
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
      setError('');
      e.target.value = ''; // Reset input
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(''); // Clear error when removing files
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragActive);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove(styles.dragActive);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragActive);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      
      // ✅ MIGLIORAMENTO: Validazione anche per drag & drop
      const validationError = validateFiles(newFiles);
      if (validationError) {
        setError(validationError);
        setTimeout(() => setError(''), 5000);
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
      setError('');
    }
  };

  // ✅ MIGLIORAMENTO: Formattazione dimensione file
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={styles.uploadContainer}>
      <label className={styles.label}>
        Allegato File (facoltativo)
      </label>
      
      <div 
        className={`${styles.dropzone} ${disabled ? styles.dropzoneDisabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className={styles.fileInput}
          id="file-upload"
          disabled={disabled}
        />
        <label 
          htmlFor="file-upload" 
          className={`${styles.dropzoneLabel} ${disabled ? styles.dropzoneLabelDisabled : ''}`}
        >
          <div className={styles.uploadIconContainer}>
            ⬆️
          </div>
          <p className={styles.uploadTitle}>
            Carica File
          </p>
          <p className={styles.uploadHint}>
            Formati supportati: JPEG, PNG, GIF, WebP - Max 5MB
          </p>
          {/* ✅ MIGLIORAMENTO: Mostra conteggio file */}
          {files.length > 0 && (
            <p className={styles.uploadHint} style={{ marginTop: '0.5rem', color: '#0d9488' }}>
              {files.length} / {MAX_FILES} file caricati
            </p>
          )}
        </label>
      </div>

      {/* ✅ MIGLIORAMENTO: Messaggio di errore */}
      {error && (
        <div className={styles.errorMessage} style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileContent}>
                <div className={styles.fileIconContainer}>
                  📄
                </div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>
                    {file.name}
                  </div>
                  <div className={styles.fileSize}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className={`${styles.removeButton} ${disabled ? styles.removeButtonDisabled : ''}`}
                aria-label={`Rimuovi ${file.name}`}
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