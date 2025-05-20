"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  IconBuilding,
  IconHome,
  IconBuildingStore,
  IconMapPin,
} from "@tabler/icons-react";
import { PropertyContractsSection } from "@/components/property-contracts-section";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Map API property type to UI property type
function mapApiPropertyToProperty(api: any) {
  let type: "apartment" | "house" | "commercial" | "land" = "apartment";
  switch (api.propertyTypeId) {
    case 1:
      type = "apartment";
      break;
    case 2:
      type = "house";
      break;
    case 3:
      type = "commercial";
      break;
    case 4:
      type = "land";
      break;
    default:
      type = "apartment";
  }
  return {
    id: String(api.id),
    title: api.address,
    type,
    address: api.address,
    surface: api.surfaceArea,
    rooms: api.numberOfBedrooms || 0,
    price: api.rent,
    estimatedCharges: api.estimatedCharges,
  };
}

const PropertyTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "apartment":
      return <IconBuilding className="h-5 w-5" />;
    case "house":
      return <IconHome className="h-5 w-5" />;
    case "commercial":
      return <IconBuildingStore className="h-5 w-5" />;
    case "land":
      return <IconMapPin className="h-5 w-5" />;
    default:
      return <IconBuilding className="h-5 w-5" />;
  }
};

const propertyTypeLabels: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  commercial: "Local commercial",
  land: "Terrain",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

async function fetchAccountData() {
  const res = await fetch(`${API_URL}/api/users/me`, { credentials: "include" });
  if (res.status === 401) throw new Error("401");
  if (res.status === 404) throw new Error("404");
  if (!res.ok) throw new Error("GENERIC");
  return await res.json();
}

async function updateAccountData({ name, telephone, image }: { name: string; telephone: string; image: string }) {
  const body: Record<string, string> = {};
  if (name) body.name = name;
  if (telephone) body.telephone = telephone;
  if (image) body.image = image;
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let apiError = "";
    try {
      const data = await res.json();
      if (data && typeof data.error === "string") apiError = data.error;
    } catch {}
    if (res.status === 401) throw new Error(apiError || "401");
    if (res.status === 404) throw new Error(apiError || "404");
    throw new Error(apiError || "GENERIC");
  }
  return await res.json();
}

export default function AccountPage() {
  const [data, setData] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountData()
      .then(setData)
      .catch((e) => {
        let msg = "Une erreur est survenue lors du chargement du compte.";
        if (e instanceof Error) {
          if (e.message === "401") msg = "Vous n'êtes pas connecté. Merci de vous connecter.";
          else if (e.message === "404") msg = "Profil utilisateur introuvable.";
        }
        toast.error(msg);
        setError(msg);
      });
  }, []);

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] w-full">
      <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
      <span className="text-muted-foreground">Chargement...</span>
    </div>
  );
  const { user, properties } = data;

  // Ouvre le dialog d'édition et préremplit les champs
  function openEdit() {
    setEditName(user.name ?? "");
    setEditPhone(user.telephone ?? "");
    setEditImage(user.image ?? "");
    setEditEmail(user.email ?? "");
    setEditOpen(true);
  }

  // Sauvegarde les modifications utilisateur
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAccountData({
        name: editName,
        telephone: editPhone,
        image: editImage,
      });
      setData((prev: any) => ({ ...prev, user: { ...prev.user, ...updated.user } }));
      setEditOpen(false);
      toast.success("Profil mis à jour avec succès");
    } catch (e) {
      let msg = "Erreur lors de la sauvegarde";
      if (e instanceof Error && e.message && e.message !== "GENERIC" && e.message !== "401" && e.message !== "404") {
        msg = e.message;
      } else if (e instanceof Error) {
        if (e.message === "401") msg = "Vous n'êtes pas connecté. Merci de vous connecter.";
        else if (e.message === "404") msg = "Profil utilisateur introuvable.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col h-full w-full px-0 md:px-8 py-8 gap-8">
          <div className="flex flex-1 flex-col md:flex-row gap-8 w-full h-full">
            {/* Profil utilisateur */}
            <Card className="w-full md:max-w-sm bg-card/90 text-foreground flex flex-col items-center p-8 shadow-xl border border-border rounded-2xl h-fit md:sticky md:top-8">
              <Avatar className="h-28 w-28 shadow-lg mb-4">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {user.name?.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-2xl font-bold mb-1 text-center w-full truncate">{user.name}</CardTitle>
              <div className="flex flex-col items-center gap-1 mb-2 w-full">
                <span className="text-muted-foreground text-base truncate">{user.email}</span>
                {user.emailVerified && (
                  <Badge variant="outline" className="border-primary text-primary">Email vérifié</Badge>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2 text-sm text-muted-foreground w-full">
                <div className="flex items-center justify-between w-full"><span className="font-medium">Téléphone</span><span className="text-foreground">{user.telephone || <span className='italic text-xs'>Non renseigné</span>}</span></div>
                <div className="flex items-center justify-between w-full"><span className="font-medium">Rôle</span><span className="text-foreground">{user.userTypeId === 1 ? "Propriétaire" : "Locataire"}</span></div>
                <div className="flex items-center justify-between w-full"><span className="font-medium">Abonnement</span><span className="text-foreground">{user.subscriptionId === 2 ? "Premium" : "Standard"}</span></div>
                <div className="flex items-center justify-between w-full"><span className="font-medium">Inscrit le</span><span className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                <div className="flex items-center justify-between w-full"><span className="font-medium">Dernière mise à jour</span><span className="text-foreground">{new Date(user.updatedAt).toLocaleDateString()}</span></div>
              </div>
              <Button variant="outline" className="mt-6 border-primary text-primary w-full" size="sm" onClick={openEdit}>
                Modifier mon profil
              </Button>
            </Card>

            {/* Propriétés utilisateur */}
            <Card className="flex-1 bg-card/90 text-foreground flex flex-col shadow-xl border border-border rounded-2xl min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Mes propriétés</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {properties.length === 0 ? (
                  <div className="text-muted-foreground">Aucune propriété enregistrée.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {properties.map((prop: any) => {
                      const property = mapApiPropertyToProperty(prop);
                      return (
                        <div key={property.id} className="flex flex-col gap-2">
                          <a href={`/properties/${property.id}`} className="group">
                            <Card
                              className="overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer flex flex-col bg-gradient-to-t from-primary/5 to-card dark:bg-card border border-border rounded-2xl min-h-[340px] group-hover:ring-2 group-hover:ring-primary relative"
                              tabIndex={0}
                              role="button"
                              aria-label={`Voir détails de ${property.title}`}
                            >
                              {/* Badge type en haut à gauche */}
                              <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-xs px-3 py-1 rounded shadow-md">
                                {propertyTypeLabels[property.type]}
                              </Badge>
                              {/* Logo centré, fond harmonieux */}
                              <div className="h-40 w-full flex items-center justify-center bg-gradient-to-b from-background/80 to-muted/80 dark:from-card/80 dark:to-muted/60 relative rounded-b-none rounded-t-2xl">
                                <span className="flex items-center justify-center rounded-full bg-muted shadow-inner h-20 w-20 border-2 border-primary/20">
                                  {PropertyTypeIcon({ type: property.type })}
                                </span>
                              </div>
                              <CardHeader className="pb-2 flex-1 flex flex-col justify-between">
                                <CardTitle className="text-lg font-semibold truncate text-foreground">
                                  {property.title}
                                </CardTitle>
                                <div className="truncate mt-1 text-xs text-muted-foreground">
                                  {property.address}
                                </div>
                              </CardHeader>
                              <CardFooter className="flex flex-col gap-1 items-start pt-2 px-4 pb-4">
                                <div className="text-base font-bold text-primary">
                                  {formatPrice(property.price)}
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>Surface: <span className="font-medium text-foreground">{property.surface} m²</span></span>
                                  <span>Pièces: <span className="font-medium text-foreground">{property.rooms}</span></span>
                                </div>
                              </CardFooter>
                            </Card>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dialog édition utilisateur */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier mon profil</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <Input value={editName || ""} onChange={e => setEditName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <Input value={editPhone || ""} onChange={e => setEditPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input value={editEmail || ""} onChange={e => setEditEmail(e.target.value)} type="email" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image (URL)</label>
                    <Input value={editImage || ""} onChange={e => setEditImage(e.target.value)} type="url" placeholder="https://..." />
                  </div>
                </div>
                {error && <div className="text-destructive text-sm">{error}</div>}
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="default" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
