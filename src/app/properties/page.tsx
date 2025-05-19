"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  IconBuilding,
  IconHome,
  IconBuildingStore,
  IconFilter,
  IconPlus,
  IconMapPin,
  IconUsers,
  IconCurrencyEuro,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

// Property Types
interface Property {
  id: string;
  title: string;
  type: "apartment" | "house" | "commercial" | "land";
  address: string;
  city: string;
  postalCode: string;
  price: number;
  surface: number;
  rooms: number;
  tenants: number;
  occupied: boolean;
  rentalYield: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  estimatedCharges?: number;
}

interface ApiProperty {
  id: number;
  address: string;
  surfaceArea: number;
  rent: number;
  propertyTypeId: number;
  numberOfBedrooms?: number;
  estimatedCharges?: number;
}

// Map API property type to UI property type
function mapApiPropertyToProperty(api: ApiProperty): Property {
  // Map propertyTypeId to type string
  let type: Property["type"] = "apartment";
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
    title: api.address, // No title in API, fallback to address
    type,
    address: api.address,
    city: "", // Not provided by API
    postalCode: "", // Not provided by API
    price: api.rent,
    surface: api.surfaceArea,
    rooms: api.numberOfBedrooms || 0,
    tenants: 0, // Not provided by API
    occupied: false, // Not provided by API
    rentalYield: 0, // Not provided by API
    createdAt: "", // Not provided by API
    updatedAt: "", // Not provided by API
    imageUrl: "", // Not provided by API
    estimatedCharges: api.estimatedCharges,
  };
}

// Icônes pour chaque type de propriété
const PropertyTypeIcon = ({ type }: { type: Property["type"] }) => {
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

// Property Type Labels
const propertyTypeLabels: Record<Property["type"], string> = {
  apartment: "Appartement",
  house: "Maison",
  commercial: "Local commercial",
  land: "Terrain",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  // États pour les modales
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  // Ajout d'un bien
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "apartment",
    address: "",
    surface: "",
    rent: "",
    numberOfBedrooms: "",
    estimatedCharges: "",
  });

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Map type string to propertyTypeId
      let propertyTypeId = 1;
      if (form.type === "house") propertyTypeId = 2;
      else if (form.type === "commercial") propertyTypeId = 3;
      else if (form.type === "land") propertyTypeId = 4;
      const body = {
        address: form.address,
        surfaceArea: Number(form.surface),
        rent: Number(form.rent),
        propertyTypeId,
        numberOfBedrooms: form.numberOfBedrooms ? Number(form.numberOfBedrooms) : undefined,
        estimatedCharges: form.estimatedCharges ? Number(form.estimatedCharges) : undefined,
        description: "",
      };
      const res = await fetch(`${apiUrl}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur lors de l'ajout du bien");
      }
      setAddOpen(false);
      setForm({ type: "apartment", address: "", surface: "", rent: "", numberOfBedrooms: "", estimatedCharges: "" });
      fetchProperties();
    } catch (e: any) {
      setAddError(e.message || "Erreur lors de l'ajout du bien");
    } finally {
      setAddLoading(false);
    }
  };

  // Fonction pour charger les propriétés (avec gestion d'erreur réseau et serveur)
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!navigator.onLine) {
      setError("Pas de connexion internet. Veuillez vérifier votre réseau.");
      setLoading(false);
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/users/me`, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur lors du chargement des propriétés");
      }
      const data = await res.json();
      // data.properties est un tableau
      setProperties((data.properties || []).map(mapApiPropertyToProperty));
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des propriétés");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load properties data
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Chats liés aux propriétés
  const [propertyChats, setPropertyChats] = useState<Record<string, number>>({}); // propertyId -> chatId

  // Fetch chats and map propertyId to chatId
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/chat/list`, { credentials: "include" });
        if (!res.ok) return;
        const chats = await res.json();
        // Map propertyId to chatId for property chats
        const mapping: Record<string, number> = {};
        for (const chat of chats) {
          if (chat.chatType === "property" && chat.propertyId) {
            mapping[String(chat.propertyId)] = chat.id;
          }
        }
        setPropertyChats(mapping);
      } catch {}
    };
    fetchChats();
  }, []);

  // Formate le prix en euros
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return "Date inconnue";
    }
  };

  // Filter properties based on search query and active tab
  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "occupied") return matchesSearch && property.occupied;
      if (activeTab === "vacant") return matchesSearch && !property.occupied;
      if (activeTab === property.type) return matchesSearch;
      
      return false;
    });

  // Delete a property
  const handleDeleteProperty = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) {
      setProperties(properties.filter(property => property.id !== id));
    }
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">Mes Propriétés</h1>
            </div>
            <Button onClick={() => setAddOpen(true)} variant="default" className="gap-2">
              <IconPlus className="h-5 w-5" /> Ajouter un bien
            </Button>
          </div>
          <div>
            <Input
              placeholder="Rechercher par titre, adresse ou ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-2">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="apartment">Appartements</TabsTrigger>
              <TabsTrigger value="house">Maisons</TabsTrigger>
              <TabsTrigger value="commercial">Locaux</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center h-40 gap-2">
                  <p className="text-red-500 text-center">{error}</p>
                  <Button variant="outline" onClick={fetchProperties}>
                    Réessayer
                  </Button>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-40">
                  <p className="text-muted-foreground mb-2">
                    Aucune propriété trouvée
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      size="sm"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredProperties.map((property) => (
                    <Link key={property.id} href={`/properties/${property.id}`} className="group">
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
                          <CardDescription className="truncate mt-1 text-xs text-muted-foreground">
                            {property.address}
                          </CardDescription>
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
                    </Link>
                  ))}
                </div>
              )}
              {/* Delete confirmation modal */}
              <Dialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                  </DialogHeader>
                  <div>
                    Êtes-vous sûr de vouloir supprimer cette propriété ? Cette
                    action est irréversible.
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteId(null)}
                      disabled={deleting}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        deleteId && handleDeleteProperty(deleteId)
                      }
                      disabled={deleting}
                    >
                      {deleting ? "Suppression..." : "Supprimer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Add property modal */}
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un bien</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProperty} className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">Type</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleAddChange}
                        className="w-full rounded-md border bg-background text-foreground px-3 py-2"
                        required
                      >
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="commercial">Local commercial</option>
                        <option value="land">Terrain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Adresse</label>
                      <Input name="address" value={form.address} onChange={handleAddChange} required />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block mb-1 font-medium">Surface (m²)</label>
                        <Input name="surface" type="number" min="1" value={form.surface} onChange={handleAddChange} required />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 font-medium">Loyer (€)</label>
                        <Input name="rent" type="number" min="1" value={form.rent} onChange={handleAddChange} required />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block mb-1 font-medium">Pièces</label>
                        <Input name="numberOfBedrooms" type="number" min="0" value={form.numberOfBedrooms} onChange={handleAddChange} />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 font-medium">Charges estimées (€)</label>
                        <Input name="estimatedCharges" type="number" min="0" value={form.estimatedCharges} onChange={handleAddChange} />
                      </div>
                    </div>
                    {addError && <div className="text-red-500 text-sm">{addError}</div>}
                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={addLoading}>
                        Annuler
                      </Button>
                      <Button type="submit" variant="default" disabled={addLoading}>
                        {addLoading ? "Ajout..." : "Ajouter"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}