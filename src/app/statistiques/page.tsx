"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconTrendingUp, IconTrendingDown, IconCreditCard, IconHome, IconBuilding, IconChartBar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function StatistiquesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        // Propriétés
        const resProps = await fetch(`${apiUrl}/api/users/me`, { credentials: "include" });
        if (!resProps.ok) throw new Error("Erreur lors du chargement des propriétés");
        const dataProps = await resProps.json();
        setProperties(dataProps.properties || []);
        // Contrats (pour locataires)
        const resContracts = await fetch(`${apiUrl}/api/contracts/owner`, { credentials: "include" });
        if (!resContracts.ok) throw new Error("Erreur lors du chargement des contrats");
        const dataContracts = await resContracts.json();
        setContracts(dataContracts.contracts || []);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // KPIs
  const totalRent = properties.reduce((sum, prop) => sum + (prop.rent || 0), 0);
  const totalCharges = properties.reduce((sum, prop) => sum + (prop.estimatedCharges || 0), 0);
  const netIncome = totalRent - totalCharges;
  const propertyCount = properties.length;
  const avgRent = propertyCount ? Math.round(totalRent / propertyCount) : 0;
  const avgCharges = propertyCount ? Math.round(totalCharges / propertyCount) : 0;

  // Pour l'évolution, on simule une variation (à remplacer par calcul réel si tu veux)
  const kpiDelta = {
    rent: { value: "+2.1%", up: true },
    charges: { value: "-1.2%", up: false },
    net: { value: "+1.7%", up: true },
    avg: { value: "+0.5%", up: true },
  };

  // BarChart mensuel (loyers/charges/net par mois)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return d;
  });
  const monthLabels = months.map(d => d.toLocaleString("fr-FR", { month: "short" }));
  // Simule la répartition par mois (si tu as des dates réelles, adapte ici)
  const barData = months.map((d, i) => ({
    month: monthLabels[i],
    rent: totalRent, // à remplacer par la somme réelle par mois si dispo
    charges: totalCharges, // idem
    net: netIncome, // idem
  }));

  // Liste des logements (propriétés)
  const logements = properties.map((prop: any) => ({
    id: prop.id,
    address: prop.address,
    rent: prop.rent,
    charges: prop.estimatedCharges,
    net: (prop.rent || 0) - (prop.estimatedCharges || 0),
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* KPI Card 1 */}
            <Card className="relative overflow-hidden group bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Total loyers perçus</CardDescription>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs flex items-center gap-1">
                    <IconTrendingUp className="h-4 w-4 text-green-400" /> {kpiDelta.rent.value}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="rounded-full bg-muted p-2">
                    <IconCreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums">{totalRent.toLocaleString("fr-FR")} €</CardTitle>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                  <span>{propertyCount} logement{propertyCount > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Total mensuel</span>
                </div>
              </CardHeader>
            </Card>
            {/* KPI Card 2 */}
            <Card className="relative overflow-hidden group bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Charges estimées</CardDescription>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs flex items-center gap-1">
                    <IconTrendingDown className="h-4 w-4 text-red-400" /> {kpiDelta.charges.value}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="rounded-full bg-muted p-2">
                    <IconHome className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums">{totalCharges.toLocaleString("fr-FR")} €</CardTitle>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                  <span>Moyenne: {avgCharges.toLocaleString("fr-FR")} €</span>
                  <span>•</span>
                  <span>par logement</span>
                </div>
              </CardHeader>
            </Card>
            {/* KPI Card 3 */}
            <Card className="relative overflow-hidden group bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Résultat Net</CardDescription>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs flex items-center gap-1">
                    <IconTrendingUp className="h-4 w-4 text-green-400" /> {kpiDelta.net.value}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="rounded-full bg-muted p-2">
                    <IconBuilding className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums">{netIncome.toLocaleString("fr-FR")} €</CardTitle>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                  <span>Moyenne: {(avgRent - avgCharges).toLocaleString("fr-FR")} €</span>
                  <span>•</span>
                  <span>par logement</span>
                </div>
              </CardHeader>
            </Card>
            {/* KPI Card 4 */}
            <Card className="relative overflow-hidden group bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Loyer moyen</CardDescription>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs flex items-center gap-1">
                    <IconTrendingUp className="h-4 w-4 text-green-400" /> {kpiDelta.avg.value}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="rounded-full bg-muted p-2">
                    <IconChartBar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums">{avgRent.toLocaleString("fr-FR")} €</CardTitle>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                  <span>{propertyCount} logement{propertyCount > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>par logement</span>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* BarChart Overview */}
            <Card className="col-span-2 bg-card">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} className="text-white">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "none", color: "var(--foreground)" }}
                      cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar dataKey="rent" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Liste à droite : logements */}
            <Card className="col-span-1 flex flex-col bg-card">
              <CardHeader>
                <CardTitle>Mes logements</CardTitle>
                <CardDescription>Ce que chaque logement me génère</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px]">
                <ScrollArea className="h-[300px] pr-2">
                  {logements.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Aucun logement trouvé.</div>
                  ) : (
                    logements.map((logement) => (
                      <div key={logement.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium leading-tight">{logement.address}</div>
                          <div className="text-xs text-muted-foreground">Loyer: {logement.rent?.toLocaleString("fr-FR")} €</div>
                          <div className="text-xs text-muted-foreground">Charges: {logement.charges?.toLocaleString("fr-FR")} €</div>
                        </div>
                        <div className="font-mono font-semibold text-right text-muted-foreground">
                          {logement.net?.toLocaleString("fr-FR")} €
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
