import React, { useState } from "react";
import axios from "axios";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const APIBASEURL = "http://localhost:8080/api";

export default function CreaIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    tipo: "",
    priorita: "medium",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  // Tipo e priorità
  const tipiIssue = [
    { value: "bug", label: "Bug" },
    { value: "features", label: "Features" },
    { value: "question", label: "Question" },
    { value: "documentation", label: "Documentation" },
  ];
  const prioritaOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // Input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage({ type: "error", text: "Formato non supportato. Usa JPEG, PNG, GIF o WebP." });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Il file supera i 5MB." });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setMessage({ type: "", text: "" });
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // Submit
  const handleSubmit = async () => {
    if (!formData.titolo.trim()) {
      setMessage({ type: "error", text: "Il titolo è obbligatorio" });
      return;
    }
    if (!formData.descrizione.trim()) {
      setMessage({ type: "error", text: "La descrizione è obbligatoria" });
      return;
    }
    if (!formData.tipo) {
      setMessage({ type: "error", text: "Seleziona un tipo di issue" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Crea l'issue
      const issueResponse = await axios.post(
        `${APIBASEURL}/issue/crea`,
        {
          titolo: formData.titolo,
          descrizione: formData.descrizione,
          tipo: formData.tipo,
          priorita: formData.priorita,
          stato: "todo",
          idCreatore: 1, // TODO: sostituire con utente loggato
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdIssue = issueResponse.data;

      // 2. Upload allegato se presente
      if (file && createdIssue.idIssue) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("idIssue", createdIssue.idIssue);
        await axios.post(`${APIBASEURL}/allegato/upload`, fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMessage({ type: "success", text: "Issue creata con successo!" });
      setTimeout(() => navigate("/lista-issue"), 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: error?.response?.data?.message || "Errore di connessione al server" });
    } finally {
      setLoading(false);
    }
  };

  // Resetta
  const handleReset = () => {
    setFormData({ titolo: "", descrizione: "", tipo: "", priorita: "medium" });
    setFile(null);
    setFilePreview(null);
    setMessage({ type: "", text: "" });
  };

  // RENDER
  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Crea Nuova Issue</h1>
        <p className="text-gray-500 mb-8">
          Add a new issue to track bugs, features, or questions
        </p>
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Dettagli Issue</h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill in the details for your new issue
          </p>
          
          {/* Titolo */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titolo"
              value={formData.titolo}
              onChange={handleInputChange}
              placeholder="Enter issue title"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{formData.titolo.length}/200</div>
          </div>

          {/* Descrizione */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descrizione <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descrizione"
              value={formData.descrizione}
              onChange={handleInputChange}
              placeholder="Enter detailed description"
              maxLength={5000}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{formData.descrizione.length}/5000</div>
          </div>

          {/* Tipo e Priorità */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="">Select issue type</option>
                {tipiIssue.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priorità (facoltativo)
              </label>
              <select
                name="priorita"
                value={formData.priorita}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                {prioritaOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Allegato */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Allegato Immagine (facoltativo)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {filePreview ? (
                <div className="relative inline-block">
                  <img src={filePreview} alt="Preview" className="max-h-32 rounded" />
                  <button type="button" onClick={removeFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <X size={14} />
                  </button>
                  <p className="text-sm text-gray-600 mt-2">{file?.name}</p>
                </div>
              ) : (
                <>
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      <Upload size={16} /> Upload Image
                    </div>
                    <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Formati supportati: JPEG (.jpg, .jpeg), PNG (.png), GIF (.gif), WebP (.webp) - Max 5MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creazione in corso..." : "Crea Issue"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
