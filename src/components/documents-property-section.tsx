import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PdfPreviewModal } from "@/components/pdf-preview-modal";

export function DocumentsPropertySection({ propertyId }: { propertyId: number }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    if (!propertyId) return;
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simule des documents si aucun n'est trouvé
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/documents?propertyId=${propertyId}`, { credentials: "include" });
        let docs = [];
        if (res.ok) {
          const data = await res.json();
          docs = data.documents || [];
        }
        // Si aucun document, injecte un faux document PDF
        if (!docs.length) {
          docs = [
            {
              id: 1,
              title: "Bail locatif (exemple)",
              type: "PDF",
              createdAt: new Date().toISOString(),
              url: "/dummy.pdf", // Utilise un vrai PDF pour la démo
            },
          ];
        }
        setDocuments(docs);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [propertyId]);

  return (
    <Card className="w-full bg-card mt-6">
      <CardHeader>
        <CardTitle>Documents du bien</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">Chargement...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : documents.length === 0 ? (
          <div className="text-muted-foreground text-sm">Aucun document pour ce bien.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title || doc.name || `Document #${doc.id}`}</TableCell>
                  <TableCell>{doc.type || doc.documentType || "-"}</TableCell>
                  <TableCell>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("fr-FR") : "-"}</TableCell>
                  <TableCell>
                    {doc.url && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="min-w-[120px]" onClick={() => { setPreviewDoc(doc); setShowPreview(true); }}>
                          Prévisualiser
                        </Button>
                        <Button asChild size="sm" variant="outline" className="min-w-[120px]">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">Télécharger</a>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <PdfPreviewModal open={showPreview} onClose={() => setShowPreview(false)} doc={previewDoc} />
    </Card>
  );
}
