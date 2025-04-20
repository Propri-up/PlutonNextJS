"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { IconBuilding, IconEdit, IconTrash, IconMessageCircle, IconDownload } from '@tabler/icons-react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';

// Mock data
const mockProperty = {
  id: '1',
  title: 'Appartement Paris 15ème',
  type: 'apartment',
  address: '12 rue de la Convention, 75015 Paris',
  price: 1450,
  surface: 52,
  rooms: 2,
  estimatedCharges: 120,
  createdAt: '2024-01-10',
  updatedAt: '2024-04-01',
  imageUrl: '',
};

const mockQuittances = [
  { id: 1, month: 'Mars 2025', amount: 1450, status: 'Payée', url: '#' },
  { id: 2, month: 'Février 2025', amount: 1450, status: 'Payée', url: '#' },
  { id: 3, month: 'Janvier 2025', amount: 1450, status: 'En attente', url: '#' },
];

// Mock locataires
const mockTenants = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@email.com", phone: "0601020304" },
  { id: 2, name: "Sophie Martin", email: "sophie.martin@email.com", phone: "0611223344" },
];

export default function PropertyDetailsPage() {
  const router = useRouter();

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
          <Button variant="outline" size="sm" className="w-fit mb-2" onClick={() => router.back()}>
            ← Retour
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-lg">
                <IconBuilding className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{mockProperty.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge>{mockProperty.type === 'apartment' ? 'Appartement' : 'Type inconnu'}</Badge>
                  <span className="text-muted-foreground text-sm">{mockProperty.address}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm"><IconEdit className="h-4 w-4 mr-1" />Modifier</Button>
              <Button variant="destructive" size="sm"><IconTrash className="h-4 w-4 mr-1" />Supprimer</Button>
              <Button asChild variant="default" size="sm"><Link href="/chat"><IconMessageCircle className="h-4 w-4 mr-1" />Chat</Link></Button>
              <Button variant="outline" size="sm"><IconDownload className="h-4 w-4 mr-1" />Créer une quittance</Button>
              <Button variant="outline" size="sm" disabled={!mockTenants[0]?.phone}><a href={mockTenants[0]?.phone ? `tel:${mockTenants[0].phone}` : undefined}><span className="inline-flex items-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-1"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"></path></svg>Appeler</span></a></Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><span className="text-muted-foreground text-sm">Surface</span><div className="font-medium">{mockProperty.surface} m²</div></div>
                <div><span className="text-muted-foreground text-sm">Loyer</span><div className="font-medium">{mockProperty.price} €</div></div>
                <div><span className="text-muted-foreground text-sm">Pièces</span><div className="font-medium">{mockProperty.rooms}</div></div>
                <div><span className="text-muted-foreground text-sm">Charges estimées</span><div className="font-medium">{mockProperty.estimatedCharges} €</div></div>
                <div><span className="text-muted-foreground text-sm">Créé le</span><div className="font-medium">{mockProperty.createdAt}</div></div>
                <div><span className="text-muted-foreground text-sm">Modifié le</span><div className="font-medium">{mockProperty.updatedAt}</div></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Locataires</CardTitle>
            </CardHeader>
            <CardContent>
              {mockTenants.length === 0 ? (
                <div className="text-muted-foreground text-sm">Aucun locataire pour ce bien.</div>
              ) : (
                <div className="space-y-2">
                  {mockTenants.map((tenant) => (
                    <div key={tenant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b last:border-b-0 py-2 gap-2">
                      <div>
                        <span className="font-medium">{tenant.name}</span>
                        <span className="block text-xs text-muted-foreground">{tenant.email}</span>
                        <span className="block text-xs text-muted-foreground">{tenant.phone}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" asChild><a href={`mailto:${tenant.email}`} title="Envoyer un mail"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg></a></Button>
                        <Button variant="outline" size="icon" asChild disabled={!tenant.phone}><a href={tenant.phone ? `tel:${tenant.phone}` : undefined} title="Appeler"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z"></path></svg></a></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Tabs defaultValue="quittances">
            <TabsList>
              <TabsTrigger value="quittances">Quittances</TabsTrigger>
            </TabsList>
            <TabsContent value="quittances">
              <Card>
                <CardHeader>
                  <CardTitle>Quittances de loyer</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockQuittances.map(q => (
                        <TableRow key={q.id}>
                          <TableCell>{q.month}</TableCell>
                          <TableCell>{q.amount} €</TableCell>
                          <TableCell>{q.status}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="icon" asChild>
                              <a href={q.url} download title="Télécharger la quittance"><IconDownload className="h-4 w-4" /></a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
