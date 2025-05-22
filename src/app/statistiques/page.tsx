"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconTrendingUp, IconTrendingDown, IconCreditCard, IconHome, IconBuilding, IconChartBar, IconUsers, IconMessage } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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

type PaymentStats = {
  totalPayments: number;
  totalAmount: number;
  paymentsByMethod: {
    method: string;
    count: number;
    amount: number;
  }[];
};

export default function StatistiquesPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        
        // Dashboard overview statistics
        const resDashboard = await fetch(`${apiUrl}/api/statistics/dashboard`, { 
          credentials: "include" 
        });
        if (!resDashboard.ok) throw new Error("Erreur lors du chargement des statistiques générales");
        const dashboardData = await resDashboard.json();
        setDashboardStats(dashboardData.statistics);
        
        // Property statistics
        const resProperties = await fetch(`${apiUrl}/api/statistics/properties`, { 
          credentials: "include" 
        });
        if (!resProperties.ok) throw new Error("Erreur lors du chargement des statistiques des propriétés");
        const propertiesData = await resProperties.json();
        setPropertyStats(propertiesData.properties);
        
        // Monthly income statistics
        const resMonthly = await fetch(`${apiUrl}/api/statistics/income/monthly`, { 
          credentials: "include" 
        });
        if (!resMonthly.ok) throw new Error("Erreur lors du chargement des revenus mensuels");
        const monthlyData = await resMonthly.json();
        setMonthlyIncome(monthlyData.monthlyIncome);
        
        // Payment statistics
        const resPayments = await fetch(`${apiUrl}/api/statistics/payments`, { 
          credentials: "include" 
        });
        if (!resPayments.ok) throw new Error("Erreur lors du chargement des statistiques de paiement");
        const paymentsData = await resPayments.json();
        setPaymentStats(paymentsData);
        
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des données statistiques");
        console.error("Error fetching statistics:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllStats();
  }, []);

  // Format monthlyIncome data for chart display
  const chartData = monthlyIncome.map(item => ({
    month: `${item.month.substring(0, 3)} ${item.year}`,
    income: item.income
  }));

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
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Chargement des statistiques...</div>
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
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
                {/* Total Rental Income */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Revenus locatifs</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {dashboardStats?.totalRentalIncome.toLocaleString("fr-FR")} €
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconCreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Mensuel</span>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Property Count */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Propriétés</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {dashboardStats?.propertyCount}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconHome className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Total</span>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Average Rent */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Loyer moyen</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {Math.round(dashboardStats?.averageRent || 0).toLocaleString("fr-FR")} €
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconChartBar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Par propriété</span>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Occupancy Rate */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Taux d'occupation</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {Math.round(dashboardStats?.occupancyRate || 0)}%
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconBuilding className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Global</span>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Tenant Count */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Locataires</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {dashboardStats?.tenantCount}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconUsers className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Total</span>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Message Count */}
                <Card className="@container/card relative" data-slot="card">
                  <CardHeader>
                    <CardDescription>Messages</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {dashboardStats?.messageCount}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 mt-2">
                    <div className="rounded-full bg-muted p-2">
                      <IconMessage className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>Non lus</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Monthly Income Chart */}
                <Card className="col-span-2 bg-card">
                  <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                    <CardDescription>Évolution sur 12 mois</CardDescription>
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
                
                {/* Property Stats List */}
                <Card className="col-span-1 flex flex-col bg-card">
                  <CardHeader>
                    <CardTitle>Mes propriétés</CardTitle>
                    <CardDescription>Performance par propriété</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-[300px]">
                    <ScrollArea className="h-[300px] pr-2">
                      {propertyStats.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Aucune propriété trouvée.</div>
                      ) : (
                        propertyStats.map((property) => (
                          <div key={property.id} className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0">
                            <div className="font-medium leading-tight">{property.address}</div>
                            <div className="grid grid-cols-3 text-xs text-muted-foreground">
                              <div>
                                <div className="font-semibold">Revenus</div>
                                <div>{property.totalIncome.toLocaleString("fr-FR")} €</div>
                              </div>
                              <div>
                                <div className="font-semibold">Occupation</div>
                                <div>{property.occupancyRate}%</div>
                              </div>
                              <div>
                                <div className="font-semibold">Messages</div>
                                <div>{property.messageCount}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment Methods Chart */}
              {paymentStats && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>Méthodes de paiement</CardTitle>
                    <CardDescription>Répartition des paiements par méthode</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart 
                            data={paymentStats.paymentsByMethod} 
                            className="text-white"
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--muted-foreground)" />
                            <YAxis 
                              type="category" 
                              dataKey="method" 
                              stroke="var(--muted-foreground)"
                              width={100}
                            />
                            <Tooltip
                              contentStyle={{ background: "var(--card)", border: "none", color: "var(--foreground)" }}
                              cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                              formatter={(value: any) => [`${value} €`, "Montant"]}
                            />
                            <Bar 
                              dataKey="amount" 
                              fill="var(--primary)" 
                              radius={[0, 4, 4, 0]} 
                              barSize={20} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="grid gap-2">
                          <div className="bg-card/50 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Total des paiements</div>
                            <div className="text-2xl font-semibold">{paymentStats.totalPayments}</div>
                          </div>
                          <div className="bg-card/50 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">Montant total</div>
                            <div className="text-2xl font-semibold">{paymentStats.totalAmount.toLocaleString("fr-FR")} €</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
