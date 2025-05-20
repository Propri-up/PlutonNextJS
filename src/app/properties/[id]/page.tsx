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

export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // Get property details
        const resProp = await fetch(`${apiUrl}/api/properties/${id}`, { credentials: 'include' });
        const dataProp = await resProp.json();
        console.log('Property details:', dataProp);
        setProperty(dataProp.property);
        // Get tenants for this property
        const resTenants = await fetch(`${apiUrl}/api/contracts/property/${id}/tenants`, { credentials: 'include' });
        const dataTenants = await resTenants.json();
        console.log('Tenants:', dataTenants);
        if (resTenants.ok) {
          setTenants(dataTenants.tenants || []);
        } else {
          setTenants([]);
        }
        // Get contracts for this property
        const resContracts = await fetch(`${apiUrl}/api/properties/${id}/contracts`, { credentials: 'include' });
        const dataContracts = await resContracts.json();
        console.log('Contracts:', dataContracts);
        // Pour chaque contrat, va chercher les documents
        const contractsWithDocs = await Promise.all((dataContracts.contracts || []).map(async (c: any) => {
          const resDocs = await fetch(`${apiUrl}/api/contracts/${c.contract.id}/documents`, { credentials: 'include' });
          const dataDocs = await resDocs.json();
          return { ...c, documents: dataDocs.documents || [] };
        }));
        setContracts(contractsWithDocs);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

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
          <Button variant="outline" size="sm" className="w-fit mb-2" onClick={() => router.back()}>
            ← Retour
          </Button>
          {loading ? (
            <div className="flex justify-center items-center h-40">Chargement...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : property ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-lg">
                    <IconBuilding className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{property.address}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge>{propertyTypeLabels[property.propertyTypeId] || 'Type inconnu'}</Badge>
                      <span className="text-muted-foreground text-sm">{property.address}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm"><IconEdit className="h-4 w-4 mr-1" />Modifier</Button>
                  <Button variant="destructive" size="sm"><IconTrash className="h-4 w-4 mr-1" />Supprimer</Button>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/chat?propertyId=${property.id}`} prefetch={false}>
                      <IconMessageCircle className="h-4 w-4 mr-1" />Chat
                    </Link>
                  </Button>
                </div>
              </div>
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
                      <div><span className="text-muted-foreground text-sm">Créé le</span><div className="font-medium">{formatDate(property.createdAt)}</div></div>
                      <div><span className="text-muted-foreground text-sm">Modifié le</span><div className="font-medium">{formatDate(property.updatedAt)}</div></div>
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
            </>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
