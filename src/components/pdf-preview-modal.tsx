import React, { useRef } from 'react';
import { X } from 'lucide-react';

export function PdfPreviewModal({ open, onClose, doc }: {
  open: boolean;
  onClose: () => void;
  doc: { title?: string; name?: string; id?: number; url: string } | null;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  if (!open || !doc) return null;
  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-200"
      style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
      onClick={e => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="relative w-[94vw] max-w-5xl h-[94vh] bg-[#18182f] rounded-xl shadow-2xl flex flex-col border border-[#23234a] animate-fade-in" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-white hover:text-primary transition p-1"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={28} />
        </button>
        <div className="p-6 pb-2 text-lg font-bold text-white truncate border-b border-[#23234a]">{doc.title || doc.name || `Document #${doc.id}`}</div>
        <div className="flex-1 flex items-center justify-center bg-muted rounded-b-xl p-2">
          <iframe
            src={doc.url}
            title="Aperçu PDF"
            className="w-full h-full min-h-[60vh] rounded"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
