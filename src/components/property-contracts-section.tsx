import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PdfPreviewModal } from "@/components/pdf-preview-modal";

export function PropertyContractsSection({ propertyId }: { propertyId: number }) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [contractDocs, setContractDocs] = useState<Record<number, any[]>>({}); // contractId -> documents

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
                docsObj[c.contract.id] = docsData.documents || [];
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

  return (
    <Card className="w-full bg-card mt-6">
      <CardHeader>
        <CardTitle>Contrats du bien</CardTitle>
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
              return <div className="text-muted-foreground text-sm">Aucun PDF pour ce bien.</div>;
            }
            return (
              <div className="grid gap-x-4 gap-y-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {allDocs.map(({ doc, contract }, idx) => (
                  <Card key={doc.id || idx} className="group flex flex-col h-full w-full bg-card border border-border shadow-sm hover:shadow-lg transition-shadow rounded-2xl overflow-hidden p-0 relative">
                    <div className="bg-muted flex items-center justify-center h-24 border-b border-border">
                      <span className="text-3xl text-primary/80 group-hover:scale-110 transition-transform">📄</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 pt-4 pb-2">
                      <div className="font-semibold truncate text-base text-foreground mb-1 group-hover:text-primary transition-colors">{doc.title || doc.name || `Document #${doc.id}`}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize font-medium bg-muted/60 px-2 py-0.5 rounded">{doc.type || "PDF"}</span>
                        <span className="ml-auto">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("fr-FR") : "-"}</span>
                      </div>
                      <div className="text-xs mt-1">
                        <span className="font-medium">Locataires :</span> {contract.tenants && contract.tenants.length > 0 ? contract.tenants.map((t: any) => `${t.name} (${t.email})`).join(", ") : <span className="italic text-muted-foreground">Aucun</span>}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Période :</span> {contract.contract.startDate ? new Date(contract.contract.startDate).toLocaleDateString("fr-FR") : "-"} — {contract.contract.endDate ? new Date(contract.contract.endDate).toLocaleDateString("fr-FR") : "-"}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Loyer :</span> {contract.contract.monthlyRent ? `${contract.contract.monthlyRent} €` : "-"}
                      </div>
                    </div>
                    <div className="flex gap-3 px-6 pb-5 pt-4 mt-auto">
                      <Button size="sm" variant="default" className="w-1/2 rounded-md font-medium" onClick={() => { setPreviewDoc({ ...doc, title: doc.name || doc.title || `Document #${doc.id}` }); setShowPreview(true); }}>
                        Prévisualiser
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-1/2 rounded-md font-medium">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">Télécharger</a>
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
  );
}
