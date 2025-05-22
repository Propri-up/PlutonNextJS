import React, { useRef } from 'react';
import { X } from 'lucide-react';

// Mapping pour afficher des noms lisibles pour les types de documents
const documentTypeLabels: Record<string, string> = {
  "lease-contract": "Contrat de location",
  "rent-receipt": "Quittance de loyer",
  "property-inspection": "État des lieux"
};

export function PdfPreviewModal({ open, onClose, doc }: {
  open: boolean;
  onClose: () => void;
  doc: any | null;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  if (!open || !doc) return null;
  
  // Fonction pour obtenir un titre lisible
  const getDocumentTitle = () => {
    if (doc.documentTypeName && documentTypeLabels[doc.documentTypeName]) {
      return documentTypeLabels[doc.documentTypeName];
    }
    return doc.title || doc.name || `Document #${doc.id}`;
  };
  
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
        <div className="p-6 pb-2 flex flex-col border-b border-[#23234a]">
          <div className="text-lg font-bold text-white truncate">{getDocumentTitle()}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            {doc.propertyAddress ? (
              <span className="flex items-center"><span className="text-xs mr-1 text-primary">📍</span> {doc.propertyAddress}</span>
            ) : doc.propertyId ? (
              <span>Bien #{doc.propertyId}</span>
            ) : null}
            {doc.contractId && <span>Contrat #{doc.contractId}</span>}
            {doc.creationDate && <span>{new Date(doc.creationDate).toLocaleDateString("fr-FR")}</span>}
            {doc.size && <span className="ml-auto">{doc.size}</span>}
          </div>
        </div>
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
