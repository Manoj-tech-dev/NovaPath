import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';

interface AtsDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  theme: 'dark' | 'light';
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];
const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const AtsDropzone: React.FC<AtsDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  theme,
  disabled = false
}) => {
  const isDark = theme === 'dark';
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File size exceeds maximum allowed ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The uploaded file is empty. Please select a valid document.');
      return;
    }

    // Validate extension / MIME
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isValidExt && !isValidMime) {
      setErrorMessage('Unsupported file format. Please upload PDF, DOCX, PNG, JPG, or JPEG.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        className="hidden"
        accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Selected File Card */}
      {selectedFile ? (
        <div
          id="selected-resume-card"
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
              : 'bg-white border-indigo-200 shadow-md shadow-indigo-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  isDark
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm sm:text-base font-bold truncate max-w-[220px] sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <span
                    className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isDark
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Ready
                  </span>
                </div>
                <p
                  className={`text-xs font-mono mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                id="replace-resume-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Choose different resume"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replace</span>
              </button>
              <button
                type="button"
                id="remove-resume-btn"
                onClick={() => onFileSelect(null)}
                disabled={disabled}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-900/50'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300'
                }`}
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          id="resume-dropzone-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`group relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? isDark
                ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/30'
                : 'border-indigo-500 bg-indigo-50/70 shadow-md shadow-indigo-100'
              : isDark
              ? 'border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-cyan-500/50'
              : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-indigo-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`p-4 rounded-2xl transition-all group-hover:scale-105 ${
                isDark
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 group-hover:border-cyan-500/50'
                  : 'bg-white text-indigo-600 border border-slate-200 group-hover:border-indigo-300 shadow-sm'
              }`}
            >
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold">
                Drop your resume here, or <span className={isDark ? 'text-cyan-400 underline underline-offset-2' : 'text-indigo-600 underline underline-offset-2'}>browse files</span>
              </p>
              <p
                className={`text-xs mt-1 font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Supports PDF, DOCX, PNG, JPG, JPEG (Max {MAX_SIZE_MB}MB)
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                PDF
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                DOCX
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                PNG / JPG
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          id="dropzone-error-msg"
          className={`mt-3 p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
            isDark
              ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
