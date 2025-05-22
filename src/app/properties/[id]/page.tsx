"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconBuilding, IconEdit, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PropertyContractsSection } from '@/components/property-contracts-section';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Helper pour afficher les erreurs réseau/fetch
function getErrorMessage(error: any): string {
  if (!error) return "Erreur inconnue";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error.message) return error.message;
  return JSON.stringify(error);
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editStep, setEditStep] = useState(1); // Ajout pour étapes modale édition

  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [contractSuccess, setContractSuccess] = useState<string | null>(null);
  const [contractForm, setContractForm] = useState({
    startDate: '',
    endDate: '',
    monthlyRent: property?.rent || '',
    tenantEmails: '', // comma separated
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contractDeleteModalOpen, setContractDeleteModalOpen] = useState(false); // for contract delete modal

  // Ajout pour la création de document
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [docTypeLoading, setDocTypeLoading] = useState(false);
  const [docTypeError, setDocTypeError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(null);
  const [generateDocLoading, setGenerateDocLoading] = useState(false);
  const [generateDocError, setGenerateDocError] = useState<string | null>(null);
  const [generateDocSuccess, setGenerateDocSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // Get property details
        const resProp = await fetch(`${apiUrl}/api/properties/${id}`, { credentials: 'include' });
        const dataProp = await resProp.json();
        setProperty(dataProp.property);
        // Get tenants for this property
        const resTenants = await fetch(`${apiUrl}/api/contracts/property/${id}/tenants`, { credentials: 'include' });
        const dataTenants = await resTenants.json();
        if (resTenants.ok) {
          setTenants(dataTenants.tenants || []);
        } else {
          setTenants([]);
        }
        // Get contracts for this property (restore correct fetch)
        const resContracts = await fetch(`${apiUrl}/api/properties/${id}/contracts`, { credentials: 'include' });
        const dataContracts = await resContracts.json();
        setContracts(dataContracts.contracts || []);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (property) {
      setEditForm({
        address: property.address || "",
        surfaceArea: property.surfaceArea || "",
        rent: property.rent || "",
        propertyTypeId: property.propertyTypeId || 1,
        numberOfBedrooms: property.numberOfBedrooms || "",
        estimatedCharges: property.estimatedCharges || "",
        description: property.description || "",
        contractId: property.contractId || "",
        carpetArea: property.carpetArea || "",
        plotArea: property.plotArea || "",
        numberOfBathrooms: property.numberOfBathrooms || "",
        numberOfFloors: property.numberOfFloors || "",
        propertyOnFloor: property.propertyOnFloor || "",
      });
    }
  }, [property]);

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      // Affiche les contrats dans la console pour debug
      // (affiche aussi les documents liés à chaque contrat)
      // eslint-disable-next-line no-console
      console.log("CONTRACTS:", contracts);
    }
  }, [contracts]);

  // Récupère les types de documents à l'ouverture de la modale
  useEffect(() => {
    if (createDocOpen) {
      setDocTypeLoading(true);
      setDocTypeError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiUrl}/api/documents/types`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          console.log('Réponse API /api/documents/types:', data); // DEBUG
          setDocTypes(data.data || []);
        })
        .catch((err) => {
          setDocTypeError("Erreur lors du chargement des types de document.");
          console.error('Erreur API /api/documents/types:', err); // DEBUG
        })
        .finally(() => setDocTypeLoading(false));
    }
  }, [createDocOpen]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) throw new Error("API_URL non défini");
      if (!property?.id) throw new Error("ID du bien manquant");
      const body: any = {
        address: editForm.address,
        surfaceArea: Number(editForm.surfaceArea),
        rent: Number(editForm.rent),
        propertyTypeId: Number(editForm.propertyTypeId),
      };
      if (editForm.numberOfBedrooms) body.numberOfBedrooms = Number(editForm.numberOfBedrooms);
      if (editForm.estimatedCharges) body.estimatedCharges = Number(editForm.estimatedCharges);
      if (editForm.description) body.description = editForm.description;
      if (editForm.contractId) body.contractId = editForm.contractId;
      if (editForm.carpetArea) body.carpetArea = Number(editForm.carpetArea);
      if (editForm.plotArea) body.plotArea = Number(editForm.plotArea);
      if (editForm.numberOfBathrooms) body.numberOfBathrooms = Number(editForm.numberOfBathrooms);
      if (editForm.numberOfFloors) body.numberOfFloors = Number(editForm.numberOfFloors);
      if (editForm.propertyOnFloor) body.propertyOnFloor = editForm.propertyOnFloor;
      let res;
      try {
        res = await fetch(`${apiUrl}/api/properties/${property.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error("Erreur réseau : " + getErrorMessage(err));
      }
      if (!res.ok) {
        let errorMsg = `Erreur API (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch (err) {
          errorMsg += ' (réponse non JSON)';
        }
        throw new Error(errorMsg);
      }
      setEditOpen(false);
      window.location.reload();
    } catch (e: any) {
      setEditError(getErrorMessage(e));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) throw new Error("API_URL non défini");
      if (!property?.id) throw new Error("ID du bien manquant");
      let res;
      try {
        res = await fetch(`${apiUrl}/api/properties/${property.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (err) {
        throw new Error("Erreur réseau : " + getErrorMessage(err));
      }
      if (!res.ok) {
        let errorMsg = `Erreur API (${res.status})`;
        let errorData = null;
        try {
          const data = await res.json();
          errorData = data;
          if (data && data.error) errorMsg = data.error;
        } catch (err) {
          errorMsg += ' (réponse non JSON)';
        }
        throw new Error(errorMsg);
      }
      
      // Fermer la modale de confirmation
      setDeleteConfirmOpen(false);
      
      // Afficher une notification de succès
      toast.success("Le bien immobilier a été supprimé avec succès", {
        description: "Redirection vers la liste des biens...",
        duration: 3000,
      });
      
      // Rediriger vers la liste des propriétés
      setTimeout(() => router.push('/properties'), 500);
    } catch (e: any) {
      // Afficher l'erreur dans l'interface
      const errorMessage = getErrorMessage(e);
      setError(errorMessage);
      
      // Afficher une notification d'erreur
      toast.error("Erreur lors de la suppression", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContractForm({ ...contractForm, [e.target.name]: e.target.value });
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setContractLoading(true);
    setContractError(null);
    setContractSuccess(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) throw new Error("API_URL non défini");
      if (!property?.id) throw new Error("ID du bien manquant");
      const body: any = {
        propertyId: property.id,
        monthlyRent: Number(contractForm.monthlyRent),
      };
      if (contractForm.startDate) body.startDate = contractForm.startDate;
      if (contractForm.endDate) body.endDate = contractForm.endDate;
      if (contractForm.tenantEmails) {
        body.tenantEmails = contractForm.tenantEmails.split(',').map((email: string) => email.trim()).filter(Boolean);
      }
      let res;
      try {
        res = await fetch(`${apiUrl}/api/contracts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      } catch (err) {
        throw new Error("Erreur réseau : " + getErrorMessage(err));
      }
      if (!res.ok) {
        let errorMsg = `Erreur API (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch (err) {
          errorMsg += ' (réponse non JSON)';
        }
        throw new Error(errorMsg);
      }
      setContractSuccess('Contrat créé avec succès !');
      setCreateContractOpen(false);
      setContractForm({ startDate: '', endDate: '', monthlyRent: property?.rent || '', tenantEmails: '' });
      window.location.reload();
    } catch (e: any) {
      setContractError(getErrorMessage(e));
    } finally {
      setContractLoading(false);
    }
  };

  // Handler pour générer le document
  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateDocLoading(true);
    setGenerateDocError(null);
    setGenerateDocSuccess(null);
    try {
      if (!contracts?.length) throw new Error("Aucun contrat disponible pour ce bien.");
      if (!selectedDocType) throw new Error("Veuillez sélectionner un type de document.");
      // On prend le premier contrat par défaut (ou on peut laisser choisir)
      const contractId = contracts[0]?.contract?.id || contracts[0]?.id;
      if (!contractId) throw new Error("Aucun contrat valide trouvé.");
      
      if (!selectedDocTypeId) throw new Error("ID du type de document invalide.");
      const payload = {
        contractId,
        documentTypeId: selectedDocTypeId,
        uploadToS3: true,
      };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/contracts/documents/generate/${selectedDocType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Check if it's a Puppeteer timeout error
        if (data?.error && data.error.includes("TimeoutError") && data.error.includes("trying to connect to the browser")) {
          throw new Error("Erreur de génération PDF: Impossible de démarrer Chrome. Veuillez contacter l'administrateur système.");
        } else {
          throw new Error(data?.error || "Erreur lors de la génération du document");
        }
      }
      setGenerateDocSuccess("Document généré avec succès !");
      setCreateDocOpen(false);
      setSelectedDocType("");
      setSelectedDocTypeId(null);
      // Recharger les documents/contrats
      window.location.reload();
    } catch (e: any) {
      setGenerateDocError(e.message || "Erreur lors de la génération du document");
    } finally {
      setGenerateDocLoading(false);
    }
  };

  // Helper for property type label
  const propertyTypeLabels: Record<number, string> = {
    1: 'Appartement',
    2: 'Maison',
    3: 'Local commercial',
    4: 'Terrain',
  };

  // Helper for formatting
  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '';

  // Met à jour le titre de la page (navbar) avec le nom/adresse du bien
  useEffect(() => {
    if (property && typeof document !== 'undefined') {
      document.title = property.address;
    }
  }, [property]);

  if (!property) return null;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
      className="bg-[#0A0A22] text-white min-h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={property?.address || 'Détail du bien'} />
        <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
          <div className="flex gap-2 mb-2">
            <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => router.back()}>
              ← Retour
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">Chargement...</div>
          ) : error ? (
            <div className="w-full bg-red-900/90 text-red-200 border border-red-700 rounded-lg p-4 my-2 text-center animate-in fade-in shadow-lg whitespace-pre-wrap">
              <span className="font-bold">Erreur :</span> {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Réessayer</Button>
              </div>
            </div>
          ) : property ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 flex items-center justify-center bg-muted/30 rounded-lg shadow-inner border border-border/50">
                    <IconBuilding className="h-12 w-12 text-primary/80" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{property.address}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5">{propertyTypeLabels[property.propertyTypeId] || 'Type inconnu'}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Barre d'actions principales */}
              <div className="flex flex-wrap items-center gap-3 mb-3 mt-2">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <IconEdit className="h-4 w-4 mr-2" />Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
                  <IconTrash className="h-4 w-4 mr-2" />Supprimer
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setContractDeleteModalOpen(true)}>
                  <IconTrash className="h-4 w-4 mr-2" />Supprimer un contrat
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href={`/chat?propertyId=${property.id}`} prefetch={false}>
                    <IconMessageCircle className="h-4 w-4 mr-2" />Chat
                  </Link>
                </Button>
                <Button variant="default" size="sm" className="ml-auto" onClick={() => setCreateContractOpen(true)}>
                  <span className="mr-1">+</span> Créer un contrat
                </Button>
                <Button variant="default" size="sm" onClick={() => setCreateDocOpen(true)}>
                  <span className="mr-1">+</span> Générer un document
                </Button>
              </div>
              <Card className="w-full bg-card/80 shadow-md mt-2 border border-border rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-primary">Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="font-medium text-sm leading-relaxed">
                    {property.description ? property.description : 
                    <span className="text-muted-foreground italic">Aucune description disponible</span>}
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mt-2">
                {/* Détails */}
                <Card className="col-span-2 bg-card">
                  <CardHeader>
                    <CardTitle>Détails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><span className="text-muted-foreground text-sm">Type</span><div className="font-medium">{propertyTypeLabels[property.propertyTypeId] || '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Surface</span><div className="font-medium">{property.surfaceArea} m²</div></div>
                      <div><span className="text-muted-foreground text-sm">Loyer</span><div className="font-medium">{formatPrice(property.rent)}</div></div>
                      <div><span className="text-muted-foreground text-sm">Charges estimées</span><div className="font-medium">{property.estimatedCharges ? formatPrice(property.estimatedCharges) : '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Pièces</span><div className="font-medium">{property.numberOfBedrooms ?? '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Surface habitable</span><div className="font-medium">{property.carpetArea ?? '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Surface du terrain</span><div className="font-medium">{property.plotArea ?? '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Salles de bain</span><div className="font-medium">{property.numberOfBathrooms ?? '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Nombre d'étages</span><div className="font-medium">{property.numberOfFloors ?? '-'}</div></div>
                      <div><span className="text-muted-foreground text-sm">Étage du bien</span><div className="font-medium">{property.propertyOnFloor ?? '-'}</div></div>
                    </div>
                  </CardContent>
                </Card>
                {/* Locataires */}
                <Card className="col-span-1 flex flex-col bg-card">
                  <CardHeader>
                    <CardTitle>Locataires</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-[200px]">
                    <ScrollArea className="h-[200px] pr-2">
                      {tenants.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Aucun locataire pour ce bien.</div>
                      ) : (
                        tenants.map((tenant) => (
                          <div key={tenant.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                            <div className="flex-1">
                              <div className="font-medium leading-tight">{tenant.name}</div>
                              <div className="text-xs text-muted-foreground">{tenant.email}</div>
                              {tenant.phone && <div className="text-xs text-muted-foreground">{tenant.phone}</div>}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" asChild><a href={`mailto:${tenant.email}`} title="Envoyer un mail"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg></a></Button>
                              {tenant.phone && <Button variant="outline" size="icon" asChild><a href={`tel:${tenant.phone}`} title="Appeler"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"></path></svg></a></Button>}
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              {/* Résumé financier du bien - version améliorée */}
              <Card className="w-full bg-card/90 shadow-lg border border-border rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Résumé financier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-muted-foreground text-sm mb-1">Loyer annuel</span>
                      <span className="font-extrabold text-2xl text-primary">{formatPrice((property.rent || 0) * 12)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-muted-foreground text-sm mb-1">Charges annuelles</span>
                      <span className="font-extrabold text-2xl text-red-400">{formatPrice((property.estimatedCharges || 0) * 12)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-muted-foreground text-sm mb-1">Net annuel</span>
                      <span className="font-extrabold text-2xl text-green-400">{formatPrice(((property.rent || 0) - (property.estimatedCharges || 0)) * 12)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Gestion des erreurs et messages utilisateur - version robuste */}
              {error && (
                <div className="w-full bg-red-900/90 text-red-200 border border-red-700 rounded-lg p-4 my-2 text-center animate-in fade-in shadow-lg">
                  <span className="font-bold">Erreur :</span> {error}
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Réessayer</Button>
                  </div>
                </div>
              )}
              {!loading && !error && !property && (
                <div className="w-full bg-yellow-900/90 text-yellow-200 border border-yellow-700 rounded-lg p-4 my-2 text-center animate-in fade-in shadow-lg">
                  Impossible de charger les informations du bien. Veuillez réessayer plus tard.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Réessayer</Button>
                  </div>
                </div>
              )}
              {loading && (
                <div className="w-full bg-muted text-muted-foreground rounded-lg p-4 my-2 text-center animate-pulse shadow-lg">
                  Chargement des données du bien en cours...
                </div>
              )}
<PropertyContractsSection propertyId={property.id} />     
              <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditStep(1); setEditError(null); } }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le bien</DialogTitle>
                    <button
                      type="button"
                      onClick={() => { setEditOpen(false); setEditStep(1); setEditError(null); }}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition p-1"
                      aria-label="Fermer"
                      tabIndex={0}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </DialogHeader>
                  <form onSubmit={handleEditProperty} className="space-y-4">
                    {editStep === 1 && (
                      <>
                        <div>
                          <label className="block mb-1 font-medium">Type</label>
                          <select
                            name="propertyTypeId"
                            value={editForm.propertyTypeId}
                            onChange={handleEditChange}
                            className="w-full rounded-md border bg-background text-foreground px-3 py-2"
                            required
                          >
                            <option value={1}>Appartement</option>
                            <option value={2}>Maison</option>
                            <option value={3}>Local commercial</option>
                            <option value={4}>Terrain</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">Adresse</label>
                          <input name="address" value={editForm.address} onChange={handleEditChange} required className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input name="surfaceArea" type="number" min="1" value={editForm.surfaceArea} onChange={handleEditChange} required className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                          <div className="flex-1">
                            <input name="rent" type="number" min="1" value={editForm.rent} onChange={handleEditChange} required className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">Description</label>
                          <input name="description" value={editForm.description} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                        </div>
                      </>
                    )}
                    {editStep === 2 && (
                      <>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input name="numberOfBedrooms" type="number" min="0" value={editForm.numberOfBedrooms} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                          <div className="flex-1">
                            <input name="estimatedCharges" type="number" min="0" value={editForm.estimatedCharges} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input name="carpetArea" type="number" min="0" value={editForm.carpetArea} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                          <div className="flex-1">
                            <input name="plotArea" type="number" min="0" value={editForm.plotArea} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input name="numberOfBathrooms" type="number" min="0" value={editForm.numberOfBathrooms} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                          <div className="flex-1">
                            <input name="numberOfFloors" type="number" min="0" value={editForm.numberOfFloors} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">Étage du bien</label>
                          <input name="propertyOnFloor" value={editForm.propertyOnFloor} onChange={handleEditChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                        </div>
                      </>
                    )}
                    {editError && <div className="text-red-500 text-sm whitespace-pre-wrap">{editError}</div>}
                    <DialogFooter className="gap-2">
                      {editStep === 2 && (
                        <Button type="button" variant="outline" onClick={() => setEditStep(1)} disabled={editLoading}>
                          Précédent
                        </Button>
                      )}
                      {editStep === 1 && (
                        <Button type="button" variant="default" onClick={() => setEditStep(2)} disabled={editLoading}>
                          Suivant
                        </Button>
                      )}
                      {editStep === 2 && (
                        <Button type="submit" variant="default" disabled={editLoading}>
                          {editLoading ? "Modification..." : "Enregistrer"}
                        </Button>
                      )}
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Modal de confirmation suppression */}
              <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                  </DialogHeader>
                  <div className="py-3">
                    <p className="mb-3">Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.</p>
                    {error && (
                      <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-3 text-sm">
                        <strong>Erreur:</strong> {error}
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => {
                      setDeleteConfirmOpen(false);
                      setError(null);
                    }} disabled={loading}>
                      Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Suppression...
                        </>
                      ) : "Supprimer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Modale de création de contrat */}
              <Dialog open={createContractOpen} onOpenChange={setCreateContractOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un contrat</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateContract} className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">Loyer mensuel (€)</label>
                      <input name="monthlyRent" type="number" min="1" value={contractForm.monthlyRent} onChange={handleContractChange} required className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Date de début</label>
                      <input name="startDate" type="date" value={contractForm.startDate} onChange={handleContractChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Date de fin</label>
                      <input name="endDate" type="date" value={contractForm.endDate} onChange={handleContractChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Emails des locataires (séparés par des virgules)</label>
                      <textarea name="tenantEmails" value={contractForm.tenantEmails} onChange={handleContractChange} className="w-full rounded-md border bg-background text-foreground px-3 py-2" placeholder="ex: locataire1@email.com, locataire2@email.com" />
                    </div>
                    {contractError && <div className="text-red-500 text-sm whitespace-pre-wrap">{contractError}</div>}
                    {contractSuccess && <div className="text-green-500 text-sm">{contractSuccess}</div>}
                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => setCreateContractOpen(false)} disabled={contractLoading}>
                        Annuler
                      </Button>
                      <Button type="submit" variant="default" disabled={contractLoading}>
                        {contractLoading ? 'Création...' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Modale de génération de document */}
              <Dialog open={createDocOpen} onOpenChange={(open) => {
                setCreateDocOpen(open);
                if (!open) {
                  setSelectedDocType("");
                  setSelectedDocTypeId(null);
                }
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Générer un document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGenerateDocument} className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">Type de document</label>
                      {docTypeLoading ? (
                        <div className="text-muted-foreground text-sm">Chargement...</div>
                      ) : docTypeError ? (
                        <div className="text-red-500 text-sm">{docTypeError}</div>
                      ) : (
                        <select
                          value={selectedDocType}
                          onChange={e => {
                            setSelectedDocType(e.target.value);
                            const option = e.target.options[e.target.selectedIndex];
                            setSelectedDocTypeId(option.getAttribute('data-id') ? Number(option.getAttribute('data-id')) : null);
                          }}
                          className="w-full rounded-md border bg-background text-foreground px-3 py-2"
                          required
                        >
                          <option value="">Sélectionner un type</option>
                          {docTypes.map((type: any) => (
                            <option key={type.id} value={type.name} data-id={type.id}>{type.description || type.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {generateDocError && <div className="text-red-500 text-sm whitespace-pre-wrap">{generateDocError}</div>}
                    {generateDocSuccess && <div className="text-green-500 text-sm">{generateDocSuccess}</div>}
                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => setCreateDocOpen(false)} disabled={generateDocLoading}>
                        Annuler
                      </Button>
                      <Button type="submit" variant="default" disabled={generateDocLoading}>
                        {generateDocLoading ? "Génération..." : "Générer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          ) : null}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
