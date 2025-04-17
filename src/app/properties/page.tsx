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

// Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop1",
    title: "Appartement T3 Centre-ville",
    type: "apartment",
    address: "15 rue des Lilas",
    city: "Bordeaux",
    postalCode: "33000",
    price: 230000,
    surface: 68,
    rooms: 3,
    tenants: 2,
    occupied: true,
    rentalYield: 5.2,
    createdAt: "2022-05-15T10:30:00Z",
    updatedAt: "2023-11-20T14:45:00Z",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "prop2",
    title: "Maison avec jardin",
    type: "house",
    address: "8 allée des Chênes",
    city: "Toulouse",
    postalCode: "31000",
    price: 320000,
    surface: 110,
    rooms: 5,
    tenants: 0,
    occupied: false,
    rentalYield: 4.1,
    createdAt: "2021-09-03T09:15:00Z",
    updatedAt: "2023-10-12T11:20:00Z",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "prop3",
    title: "Local commercial",
    type: "commercial",
    address: "45 avenue Jean Jaurès",
    city: "Lyon",
    postalCode: "69000",
    price: 185000,
    surface: 75,
    rooms: 2,
    tenants: 1,
    occupied: true,
    rentalYield: 6.8,
    createdAt: "2023-02-18T14:30:00Z",
    updatedAt: "2023-08-05T16:40:00Z",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2ZmaWNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "prop4",
    title: "Studio étudiant",
    type: "apartment",
    address: "12 rue des Écoles",
    city: "Montpellier",
    postalCode: "34000",
    price: 98000,
    surface: 28,
    rooms: 1,
    tenants: 1,
    occupied: true,
    rentalYield: 7.2,
    createdAt: "2022-11-25T08:20:00Z",
    updatedAt: "2023-07-14T09:35:00Z",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHN0dWRpb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "prop5",
    title: "Terrain constructible",
    type: "land",
    address: "Route de la Plage",
    city: "Biarritz",
    postalCode: "64200",
    price: 250000,
    surface: 500,
    rooms: 0,
    tenants: 0,
    occupied: false,
    rentalYield: 0,
    createdAt: "2023-01-08T11:10:00Z",
    updatedAt: "2023-05-22T13:25:00Z",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "prop6",
    title: "Appartement T2 Neuf",
    type: "apartment",
    address: "3 rue Victor Hugo",
    city: "Nantes",
    postalCode: "44000",
    price: 175000,
    surface: 45,
    rooms: 2,
    tenants: 0,
    occupied: false,
    rentalYield: 4.8,
    createdAt: "2023-03-12T15:40:00Z",
    updatedAt: "2023-09-08T10:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  },
];

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

  // Load properties data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        setProperties(MOCK_PROPERTIES);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError("Impossible de charger les propriétés");
      setLoading(false);
    }
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
                                  onClick={() => handleDeleteProperty(property.id)}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}