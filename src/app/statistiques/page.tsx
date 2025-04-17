"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  IconHome,
  IconBuildingEstate,
  IconCreditCard,
  IconWreckingBall,
  IconKey,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

// Données simplifiées
const properties = [
  {
    name: "Appartement Paris",
    icon: <IconHome className="h-4 w-4" />,
    credit: { total: 350000, paid: 120000, monthly: 1250, rate: 1.8 },
    rent: 1800,
    expenses: 480,
  },
  {
    name: "Maison Bordeaux",
    icon: <IconBuildingEstate className="h-4 w-4" />,
    credit: { total: 220000, paid: 45000, monthly: 850, rate: 2.1 },
    rent: 1050,
    expenses: 360,
  },
];

// Catégories de dépenses
const expenseCategories = [
  {
    name: "Crédits",
    color: "bg-blue-500",
    icon: <IconCreditCard className="h-4 w-4" />,
  },
  {
    name: "Entretien",
    color: "bg-yellow-500",
    icon: <IconWreckingBall className="h-4 w-4" />,
  },
  {
    name: "Assurances",
    color: "bg-red-500",
    icon: <IconHome className="h-4 w-4" />,
  },
];

export default function StatistiquesPage() {
  const [timeframe] = useState("current");

  // Calcul du total des loyers
  const totalRent = properties.reduce((sum, prop) => sum + prop.rent, 0);

  // Calcul du total des dépenses
  const totalExpenses = properties.reduce(
    (sum, prop) => sum + prop.expenses,
    0
  );

  // Calcul du résultat net
  const netIncome = totalRent - totalExpenses;

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
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Statistiques Immobilières
            </h1>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            {/* VUE D'ENSEMBLE */}
            <TabsContent value="overview" className="space-y-4">
              {/* Résumé en chiffres */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      $1,250.00
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        +12.5%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Trending up this month{" "}
                      <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Visitors for the last 6 months
                    </div>
                  </CardFooter>
                </Card>
                <Card className="bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Dépenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalExpenses.toLocaleString("fr-FR")} €
                    </div>
                    <p className="text-xs text-muted-foreground">par mois</p>
                  </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Résultat Net
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {netIncome.toLocaleString("fr-FR")} €
                    </div>
                    <p className="text-xs text-muted-foreground">par mois</p>
                  </CardContent>
                </Card>
              </div>

              {/* Répartition par bien */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Rendement par bien</CardTitle>
                </CardHeader>
                <CardContent>
                  {properties.map((property, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/20 p-1 rounded-md">
                            {property.icon}
                          </div>
                          <span>{property.name}</span>
                        </div>
                        <span className="text-sm">
                          {property.rent - property.expenses} € /mois
                        </span>
                      </div>
                      <Progress
                        value={
                          ((property.rent - property.expenses) /
                            property.rent) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
