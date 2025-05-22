import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DashboardStats = {
  propertyCount: number;
  totalRentalIncome: number;
  averageRent: number;
  occupancyRate: number;
  tenantCount: number;
  messageCount: number;
} | null;

interface SectionCardsProps {
  dashboardStats?: DashboardStats;
}

export function SectionCards({ dashboardStats }: SectionCardsProps) {
  // Round values for better display
  const roundedOccupancyRate = dashboardStats?.occupancyRate ? Math.round(dashboardStats.occupancyRate) : 0;
  const roundedAverageRent = dashboardStats?.averageRent ? Math.round(dashboardStats.averageRent) : 0;
  
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Revenus Locatifs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {dashboardStats?.totalRentalIncome?.toLocaleString("fr-FR") || "0"} €
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenus mensuels
          </div>
          <div className="text-muted-foreground">
            Loyers totaux perçus ce mois
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Propriétés</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {dashboardStats?.propertyCount || "0"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total de biens
          </div>
          <div className="text-muted-foreground">
            Biens en gestion
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Taux d'occupation</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {roundedOccupancyRate}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Occupation des propriétés
          </div>
          <div className="text-muted-foreground">Occupation optimisée</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Loyer moyen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {roundedAverageRent.toLocaleString("fr-FR")} €
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Moyenne de tous les biens
          </div>
          <div className="text-muted-foreground">Conforme aux projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
