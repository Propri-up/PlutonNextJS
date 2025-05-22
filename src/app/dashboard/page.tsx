"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { IconHome, IconBuilding, IconFileText, IconUsers, IconCreditCard, IconPlus, IconChevronRight } from "@tabler/icons-react"
import Link from "next/link"

type DashboardStats = {
  propertyCount: number;
  totalRentalIncome: number;
  averageRent: number;
  occupancyRate: number;
  tenantCount: number;
  messageCount: number;
};

type PropertyStats = {
  id: number;
  address: string;
  totalIncome: number;
  occupancyRate: number;
  messageCount: number;
};

type MonthlyIncome = {
  month: string;
  year: number;
  income: number;
};

type Property = {
  id: number;
  address: string;
  surfaceArea: number;
  rent: number;
  propertyTypeId: number;
  ownerId: string;
  numberOfBedrooms?: number;
  estimatedCharges?: number;
};

type Contract = {
  contract: {
    id: number;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    propertyId: number;
  };
  tenants: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  property: {
    id: number;
    address: string;
  };
};

export default function DashboardPage() {
  // Statistics state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  
  // User's properties and contracts
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        
        // Fetch all data in parallel
        const [
          dashboardStatsRes,
          propertyStatsRes,
          monthlyIncomeRes,
          propertiesRes,
          contractsRes
        ] = await Promise.all([
          // Dashboard statistics
          fetch(`${apiUrl}/api/statistics/dashboard`, { credentials: "include" }),
          fetch(`${apiUrl}/api/statistics/properties`, { credentials: "include" }),
          fetch(`${apiUrl}/api/statistics/income/monthly`, { credentials: "include" }),
          
          // User's properties
          fetch(`${apiUrl}/api/users/me`, { credentials: "include" }),
          
          // User's contracts
          fetch(`${apiUrl}/api/contracts/owner`, { credentials: "include" })
        ]);
        
        // Process dashboard statistics
        if (dashboardStatsRes.ok) {
          const dashboardData = await dashboardStatsRes.json();
          setDashboardStats(dashboardData.statistics);
        }
        
        // Process property statistics
        if (propertyStatsRes.ok) {
          const propertiesData = await propertyStatsRes.json();
          setPropertyStats(propertiesData.properties);
        }
        
        // Process monthly income
        if (monthlyIncomeRes.ok) {
          const monthlyData = await monthlyIncomeRes.json();
          setMonthlyIncome(monthlyData.monthlyIncome);
        }
        
        // Process user properties
        if (propertiesRes.ok) {
          const userData = await propertiesRes.json();
          setProperties(userData.properties || []);
        }
        
        // Process contracts
        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          setContracts(contractsData.contracts || []);
        }
        
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des données");
        console.error("Error fetching dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format monthlyIncome data for chart
  const chartData = monthlyIncome.map(item => ({
    month: `${item.month.substring(0, 3)} ${item.year}`,
    income: Math.round(item.income)
  }));

  // Sort properties by rent (highest first)
  const sortedProperties = [...properties].sort((a, b) => (b.rent || 0) - (a.rent || 0)).slice(0, 5);
  
  // Recent contracts (last 5)
  const recentContracts = [...contracts].slice(0, 5);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="bg-[#0A0A22] text-white min-h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-lg">Chargement du tableau de bord...</div>
              </div>
            ) : error ? (
              <Card className="bg-red-950/20 border-red-800">
                <CardHeader>
                  <CardTitle>Erreur</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Top Statistics Cards */}
                <SectionCards dashboardStats={dashboardStats} />
                
                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                  {/* Monthly Income Chart */}
                  <Card className="col-span-2 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>Revenus mensuels</CardTitle>
                        <CardDescription>Évolution sur 12 mois</CardDescription>
                      </div>
                      <Link href="/statistiques" passHref>
                        <Button variant="outline" size="sm" className="gap-1">
                          Plus de détails <IconChevronRight className="size-4" />
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} className="text-white">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                          <YAxis stroke="var(--muted-foreground)" />
                          <Tooltip
                            contentStyle={{ background: "var(--card)", border: "none", color: "var(--foreground)" }}
                            labelStyle={{ color: "var(--foreground)" }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="income" 
                            stroke="var(--primary)" 
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Actions Card */}
                  <Card className="col-span-1 flex flex-col bg-card">
                    <CardHeader>
                      <CardTitle>Actions rapides</CardTitle>
                      <CardDescription>Accès aux fonctionnalités principales</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="grid grid-cols-1 gap-4">
                        <Link href="/properties" passHref>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <IconHome className="size-5" />
                            Ajouter une propriété
                          </Button>
                        </Link>
                        <Link href="/chat" passHref>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <IconUsers className="size-5" />
                            Discuter avec les locataires
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Tabs for Properties and Contracts */}
                <Tabs defaultValue="properties" className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="properties">Mes propriétés</TabsTrigger>
                    <TabsTrigger value="contracts">Contrats actifs</TabsTrigger>
                  </TabsList>
                  
                  {/* Properties Tab */}
                  <TabsContent value="properties" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Propriétés récentes</h3>
                      <Link href="/properties" passHref>
                        <Button variant="outline" size="sm">
                          Voir toutes
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="rounded-md border">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 font-medium border-b">
                        <div>Adresse</div>
                        <div className="text-right">Surface</div>
                        <div className="text-right">Loyer mensuel</div>
                        <div className="text-right">Chambres</div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        {sortedProperties.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Aucune propriété trouvée
                          </div>
                        ) : (
                          sortedProperties.map(property => (
                            <Link href={`/properties/${property.id}`} key={property.id} passHref>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 hover:bg-muted/40 border-b last:border-b-0 transition-colors">
                                <div className="font-medium">{property.address}</div>
                                <div className="text-right">{property.surfaceArea} m²</div>
                                <div className="text-right">{Math.round(property.rent || 0).toLocaleString("fr-FR")} €</div>
                                <div className="text-right">{property.numberOfBedrooms || "N/A"}</div>
                              </div>
                            </Link>
                          ))
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  
                  {/* Contracts Tab */}
                  <TabsContent value="contracts" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Contrats actifs</h3>
                      <Link href="/properties" passHref>
                        <Button variant="outline" size="sm">
                          Voir tous
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="rounded-md border">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 font-medium border-b">
                        <div>Propriété</div>
                        <div>Locataire</div>
                        <div className="text-right">Loyer</div>
                        <div className="text-right">Période</div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        {recentContracts.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Aucun contrat trouvé
                          </div>
                        ) : (
                          recentContracts.map(item => (
                            <Link href={`/properties/${item.property.id}`} key={item.contract.id} passHref>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 hover:bg-muted/40 border-b last:border-b-0 transition-colors">
                                <div className="font-medium">{item.property.address}</div>
                                <div>{item.tenants.length > 0 ? item.tenants[0].name : "N/A"}</div>
                                <div className="text-right">{Math.round(item.contract.monthlyRent).toLocaleString("fr-FR")} €</div>
                                <div className="text-right">
                                  {new Date(item.contract.startDate).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
