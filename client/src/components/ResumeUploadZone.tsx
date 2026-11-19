import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { JobzyButton } from './JobzyButton';

interface ResumeUploadZoneProps {
  onFileUpload?: (file: File) => Promise<void>;
  isLoading?: boolean;
  multiple?: boolean;
  onMultipleUpload?: (files: File[]) => Promise<void>;
  acceptText?: string;
}

export const ResumeUploadZone: React.FC<ResumeUploadZoneProps> = ({
  onFileUpload,
  isLoading = false,
  multiple = false,
  onMultipleUpload,
  acceptText = 'Supports PDF, DOCX, DOC up to 15MB',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported format (${ext}). Please upload PDF or DOCX.`);
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File exceeds maximum size limit of 15MB.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    try {
      files.forEach(validateFile);
      setSelectedFiles(files);

      if (multiple && onMultipleUpload) {
        await onMultipleUpload(files);
      } else if (files[0]) {
        await onFileUpload(files[0]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    try {
      files.forEach(validateFile);
      setSelectedFiles(files);

      if (multiple && onMultipleUpload) {
        await onMultipleUpload(files);
      } else if (files[0]) {
        await onFileUpload(files[0]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${
            isDragging
              ? 'border-[#C4F167] bg-[#C4F167]/10 scale-[1.01]'
              : 'border-[#2a2a2a] bg-[#111111] hover:border-[#383838] hover:bg-[#141414]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          multiple={multiple}
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center text-[#C4F167] group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {multiple
                ? 'Drop multiple resumes here or click to browse'
                : 'Drop your resume here or click to upload'}
            </p>
            <p className="text-xs text-[#A3A3A3] mt-1">{acceptText}</p>
          </div>

          <div className="pt-2">
            <JobzyButton
              size="sm"
              variant="outline"
              isLoading={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Select Document
            </JobzyButton>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedFiles.length > 0 && !error && (
        <div className="mt-3 space-y-1.5">
          {selectedFiles.slice(0, 3).map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="w-4 h-4 text-[#C4F167] flex-shrink-0" />
                <span className="text-white truncate font-medium">{f.name}</span>
                <span className="text-[#A3A3A3] text-[11px]">
                  ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#C4F167] flex-shrink-0" />
            </div>
          ))}
          {selectedFiles.length > 3 && (
            <p className="text-xs text-[#A3A3A3] pl-1 font-medium">
              +{selectedFiles.length - 3} more files ready for processing
            </p>
          )}
        </div>
      )}
    </div>
  );
};
