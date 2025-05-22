import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PdfPreviewModal } from "@/components/pdf-preview-modal";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

// Mapping pour afficher des noms lisibles pour les types de documents
const documentTypeLabels: Record<string, string> = {
  "lease-contract": "Contrat de location",
  "rent-receipt": "Quittance de loyer",
  "property-inspection": "État des lieux"
};

export function PropertyContractsSection({ propertyId, deleteModalOpen, setDeleteModalOpen }: { propertyId: number, deleteModalOpen?: boolean, setDeleteModalOpen?: (open: boolean) => void }) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [contractDocs, setContractDocs] = useState<Record<number, any[]>>({}); // contractId -> documents
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [contractsList, setContractsList] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  useEffect(() => {
    if (!propertyId) return;
    const fetchContracts = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/properties/${propertyId}/contracts`, { credentials: "include" });
        if (!res.ok) throw new Error("Erreur lors du chargement des contrats");
        const data = await res.json();
        setContracts(data.contracts || []);
        // Pour chaque contrat, aller chercher les documents
        const docsObj: Record<number, any[]> = {};
        await Promise.all(
          (data.contracts || []).map(async (c: any) => {
            try {
              const resDocs = await fetch(`${apiUrl}/api/contracts/${c.contract.id}/documents`, { credentials: "include" });
              if (resDocs.ok) {
                const docsData = await resDocs.json();
                docsObj[c.contract.id] = docsData.data || [];
              } else {
                docsObj[c.contract.id] = [];
              }
            } catch {
              docsObj[c.contract.id] = [];
            }
          })
        );
        setContractDocs(docsObj);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des contrats");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [propertyId]);

  const fetchContractsList = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/properties/${propertyId}/contracts`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des contrats");
      const data = await res.json();
      setContractsList(data.contracts || []);
    } catch (e: any) {
      setDeleteError(e.message || "Erreur lors du chargement des contrats");
    }
  }, [propertyId]);

  const handleDeleteDocument = async (contractId: number, docId: number) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/contracts/${contractId}/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression du document");
      toast.success("Document supprimé");
      // Refresh docs for this contract only
      setContractDocs((prev) => {
        const newDocs = { ...prev };
        newDocs[contractId] = (newDocs[contractId] || []).filter((d) => d.id !== docId);
        return newDocs;
      });
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression du document");
    }
  };

  const handleDeleteContract = async () => {
    if (!selectedContract) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Delete all documents for this contract
      const docsRes = await fetch(`${apiUrl}/api/contracts/${selectedContract.contract.id}/documents`, { credentials: "include" });
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        const docs = docsData.data || [];
        for (const doc of docs) {
          await fetch(`${apiUrl}/api/contracts/${selectedContract.contract.id}/documents/${doc.id}`, {
            method: "DELETE",
            credentials: "include",
          });
        }
      }
      // Delete the contract itself
      const res = await fetch(`${apiUrl}/api/contracts/${selectedContract.contract.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression du contrat");
      toast.success("Contrat supprimé avec succès");
      setSelectedContract(null);
      // Refresh contracts
      setContracts((prev) => prev.filter((c) => c.contract.id !== selectedContract.contract.id));
      // Optionally, refresh contractDocs
      setContractDocs((prev) => {
        const newDocs = { ...prev };
        delete newDocs[selectedContract.contract.id];
        return newDocs;
      });
    } catch (e: any) {
      setDeleteError(e.message || "Erreur lors de la suppression du contrat");
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour obtenir un nom d'affichage lisible pour le document
  const getDocumentDisplayName = (doc: any) => {
    // Si on a le type de document, on l'utilise en priorité
    if (doc.documentType?.name && documentTypeLabels[doc.documentType.name]) {
      return documentTypeLabels[doc.documentType.name];
    }
    
    // Sinon on utilise les autres propriétés disponibles
    return doc.title || doc.name || (doc.filePath ? doc.filePath.split("/").pop().replace(/document_\d+\.pdf/, "Document") : `Document #${doc.id}`);
  };

  return (
    <>
      <Card className="w-full bg-card mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contrats du bien</CardTitle>
          {/* Add delete contract button here, only if setDeleteModalOpen is provided */}
          {setDeleteModalOpen && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteModalOpen(true)}>
              Supprimer un contrat
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Chargement...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : contracts.length === 0 ? (
            <div className="text-muted-foreground text-sm">Aucun contrat pour ce bien.</div>
          ) : (
            (() => {
              // On ne garde que les docs liés à chaque contrat
              const allDocs = contracts.flatMap((c) => {
                const docs = contractDocs[c.contract.id] || [];
                return docs.map((doc: any) => ({ doc, contract: c }));
              });
              if (allDocs.length === 0) {
                return <div className="text-muted-foreground text-sm">Aucun document pour ce bien.</div>;
              }
              return (
                <div className="grid gap-x-4 gap-y-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {allDocs.map(({ doc, contract }, idx) => (
                    <Card key={doc.id || idx} className="group flex flex-col h-full w-full bg-card border border-border shadow-sm hover:shadow-lg transition-shadow rounded-2xl overflow-hidden p-0 relative">
                      <div className="bg-muted flex items-center justify-center h-32 border-b border-border">
                        <span className="text-4xl text-primary/80 group-hover:scale-110 transition-transform">📄</span>
                      </div>
                      <div className="flex flex-col gap-1 px-7 pt-5 pb-2">
                        <div className="font-semibold truncate text-lg text-foreground mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
                          {getDocumentDisplayName(doc)}
                          <Button size="icon" variant="destructive" className="ml-2" title="Supprimer ce document" onClick={() => handleDeleteDocument(contract.contract.id, doc.id)}>
                            <span aria-hidden>🗑️</span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {contract.property && (
                            <span className="capitalize font-medium bg-muted/60 px-2 py-0.5 rounded" title={contract.property.address || `Bien #${doc.propertyId}`}>
                              {contract.property.address
                                ? `${contract.property.address.substring(0, 15)}${contract.property.address.length > 15 ? '...' : ''}`
                                : `Bien #${doc.propertyId}`}
                            </span>
                          )}
                          {doc.contractId && (
                            <span className="capitalize font-medium bg-muted/60 px-2 py-0.5 rounded">Contrat #{doc.contractId}</span>
                          )}
                          <span className="ml-auto">{doc.creationDate ? new Date(doc.creationDate).toLocaleDateString("fr-FR") : "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {doc.size && <span>{doc.size}</span>}
                          {doc.documentType && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {documentTypeLabels[doc.documentType.name] || doc.documentType.description || doc.documentType.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 px-7 pb-6 pt-5 mt-auto">
                        <Button size="sm" variant="default" className="w-1/2 rounded-md font-medium" onClick={() => { 
                          // On transfère toutes les propriétés du document à la modale
                          setPreviewDoc({ 
                            ...doc, 
                            url: doc.signedUrl,
                            displayName: getDocumentDisplayName(doc),
                            propertyAddress: contract.property?.address,
                            documentTypeName: doc.documentType?.name
                          });
                          setShowPreview(true); 
                        }}>
                          Prévisualiser
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-1/2 rounded-md font-medium" 
                          onClick={() => {
                            if (doc.signedUrl) {
                              try {
                                // Création d'un lien temporaire pour le téléchargement
                                const link = document.createElement('a');
                                link.href = doc.signedUrl;
                                const fileName = `${getDocumentDisplayName(doc)} - ${doc.creationDate ? new Date(doc.creationDate).toLocaleDateString('fr-FR') : 'Document'}.pdf`;
                                link.setAttribute('download', fileName);
                                link.setAttribute('target', '_blank');
                                document.body.appendChild(link);
                                
                                toast.success("Téléchargement démarré", {
                                  description: fileName,
                                  duration: 3000
                                });
                                
                                link.click();
                                document.body.removeChild(link);
                              } catch (err) {
                                console.error("Erreur lors du téléchargement", err);
                                toast.error("Erreur lors du téléchargement", {
                                  description: "Veuillez réessayer ultérieurement.",
                                  duration: 5000
                                });
                              }
                            } else {
                              console.error("URL de téléchargement non disponible");
                              toast.error("URL de téléchargement non disponible", {
                                description: "Veuillez réessayer ultérieurement.",
                                duration: 5000
                              });
                            }
                          }}
                        >
                          Télécharger
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })()
          )}
        </CardContent>
        <PdfPreviewModal open={showPreview} onClose={() => setShowPreview(false)} doc={previewDoc} />
      </Card>
      {/* Delete contract modal, controlled by parent if props provided */}
      <Dialog open={!!deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer un contrat</DialogTitle>
          </DialogHeader>
          {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
          {!selectedContract ? (
            <div>
              <div className="mb-2">Sélectionnez un contrat à supprimer :</div>
              <ul className="space-y-2">
                {contractsList.length === 0 ? (
                  <li className="text-muted-foreground text-sm">Aucun contrat disponible.</li>
                ) : contractsList.map((c: any) => (
                  <li key={c.contract.id} className="flex items-center justify-between border-b pb-2">
                    <span>
                      Contrat #{c.contract.id} - {c.contract.startDate ? new Date(c.contract.startDate).toLocaleDateString('fr-FR') : ''} à {c.contract.endDate ? new Date(c.contract.endDate).toLocaleDateString('fr-FR') : ''}
                    </span>
                    <Button size="sm" variant="destructive" onClick={() => setSelectedContract(c)}>
                      Supprimer
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <div className="mb-2">Êtes-vous sûr de vouloir supprimer le contrat #{selectedContract.contract.id} ?<br/>Tous les documents liés seront également supprimés.</div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedContract(null)} disabled={deleting}>Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteContract} disabled={deleting}>
                  {deleting ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
