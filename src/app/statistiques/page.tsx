"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  IconHome, 
  IconBuildingEstate,
  IconCreditCard, 
  IconWreckingBall, 
  IconKey 
} from "@tabler/icons-react";

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
  { name: "Crédits", color: "bg-blue-500", icon: <IconCreditCard className="h-4 w-4" /> },
  { name: "Entretien", color: "bg-yellow-500", icon: <IconWreckingBall className="h-4 w-4" /> },
  { name: "Assurances", color: "bg-red-500", icon: <IconHome className="h-4 w-4" /> },
];

export default function StatistiquesPage() {
  const [timeframe] = useState("current");
  
  // Calcul du total des loyers
  const totalRent = properties.reduce((sum, prop) => sum + prop.rent, 0);
  
  // Calcul du total des dépenses
  const totalExpenses = properties.reduce((sum, prop) => sum + prop.expenses, 0);
  
  // Calcul du résultat net
  const netIncome = totalRent - totalExpenses;

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
      className="bg-[#0A0A22] text-white min-h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Statistiques Immobilières</h1>
            <p className="text-muted-foreground">
              Aperçu de votre portefeuille immobilier
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="properties">Propriétés</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>
            
            {/* VUE D'ENSEMBLE */}
            <TabsContent value="overview" className="space-y-4">
              {/* Résumé en chiffres */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Loyers Perçus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRent.toLocaleString('fr-FR')} €</div>
                    <p className="text-xs text-muted-foreground">par mois</p>
                  </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalExpenses.toLocaleString('fr-FR')} €</div>
                    <p className="text-xs text-muted-foreground">par mois</p>
                  </CardContent>
                </Card>
                <Card className="bg-card text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{netIncome.toLocaleString('fr-FR')} €</div>
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
                        <span className="text-sm">{property.rent - property.expenses} € /mois</span>
                      </div>
                      <Progress 
                        value={((property.rent - property.expenses) / property.rent) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* PROPRIÉTÉS */}
            <TabsContent value="properties" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {properties.map((property, index) => (
                  <Card key={index} className="bg-card text-card-foreground">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/20 p-2 rounded-md">
                          {property.icon}
                        </div>
                        <CardTitle className="text-sm font-medium">
                          {property.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Progression du crédit</p>
                          <Progress value={(property.credit.paid / property.credit.total) * 100} className="h-2 mb-1" />
                          <div className="flex justify-between text-xs">
                            <span>{property.credit.paid.toLocaleString('fr-FR')} €</span>
                            <span>{property.credit.total.toLocaleString('fr-FR')} €</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Loyer</p>
                            <p className="font-medium">{property.rent} € /mois</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Crédit</p>
                            <p className="font-medium">{property.credit.monthly} € /mois</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* FINANCES */}
            <TabsContent value="finances" className="space-y-4">
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-2">
                  <CardTitle>Répartition des dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                        <div className={`${category.color} p-2 rounded-md`}>
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {index === 0 ? "2100 €" : index === 1 ? "450 €" : "280 €"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-2">
                  <CardTitle>Échéancier des crédits</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Bien</th>
                        <th className="text-right p-2">Mensualité</th>
                        <th className="text-right p-2">Fin prévue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{property.name}</td>
                          <td className="text-right p-2">{property.credit.monthly} €</td>
                          <td className="text-right p-2">Déc. 2034</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}