"use client";

import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
}

// API Property Type (from Pluton API)
interface ApiProperty {
  id: number;
  address: string;
  surfaceArea: number;
  rent: number;
  numberOfBedrooms?: number;
  estimatedCharges?: number;
  propertyTypeId: number;
  ownerId: string;
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
  };
}

// Property Type Icons
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
  // Modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/users/me/properties`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des propriétés");
        const data = await res.json();
        setProperties((data.properties || []).map(mapApiPropertyToProperty));
      } catch (e: any) {
        setError(e.message || "Impossible de charger les propriétés");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Format price to Euro
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

  // Delete a property (with modal)
  const handleDeleteProperty = async (id: string) => {
    setDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/properties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setProperties((prev) => prev.filter((property) => property.id !== id));
      setDeleteId(null);
    } catch (e: any) {
      alert(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <SiteHeader />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Mes Propriétés</h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex items-center gap-2" size="sm">
                  <IconPlus className="h-4 w-4" />
                  Ajouter une propriété
                </Button>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4" />
                  Filtres
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
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
              className="mb-6"
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-2">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="apartment">Appartements</TabsTrigger>
                <TabsTrigger value="house">Maisons</TabsTrigger>
                <TabsTrigger value="commercial">Locaux</TabsTrigger>
                <TabsTrigger value="occupied">Occupés</TabsTrigger>
                <TabsTrigger value="vacant">Vacants</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-40">
                    <p className="text-muted-foreground mb-2">Aucune propriété trouvée</p>
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                        <div 
                          className="h-48 w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${property.imageUrl})` }}
                        >
                          <div className="p-2 flex justify-between">
                            <Badge className="bg-[#FFFFF]/80 backdrop-blur-sm">
                              {propertyTypeLabels[property.type]}
                            </Badge>
                            <Badge className={property.occupied ? "bg-green-500/80" : "bg-amber-500/80"}>
                              {property.occupied ? 'Occupé' : 'Vacant'}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-1">
                              {property.title}
                            </CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <IconChevronRight className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <IconEdit className="h-4 w-4" />
                                  Éditer
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-red-500 focus:text-red-500"
                                  onClick={() => setDeleteId(property.id)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <IconMapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {property.address}, {property.postalCode} {property.city}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Surface:</span>
                              <span className="font-medium">{property.surface} m²</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Pièces:</span>
                              <span className="font-medium">{property.rooms}</span>
                            </div>
                            {property.type !== "land" && (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Locataires:</span>
                                  <span className="font-medium">{property.tenants}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Rendement:</span>
                                  <span className="font-medium">{property.rentalYield.toFixed(1)}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between items-center pt-2">
                          <div className="text-lg font-semibold">
                            {formatPrice(property.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ajouté le {formatDate(property.createdAt)}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
                {/* Delete confirmation modal */}
                <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmer la suppression</DialogTitle>
                    </DialogHeader>
                    <div>Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.</div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
                        Annuler
                      </Button>
                      <Button variant="destructive" onClick={() => deleteId && handleDeleteProperty(deleteId)} disabled={deleting}>
                        {deleting ? "Suppression..." : "Supprimer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}