"use client"
import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconHome2,
  IconInnerShadowTop,
  IconMessage2,
  IconPlanet,
  IconReport,
  IconSettings,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "In",
    email: "",
    avatar: "",
  },
  navMain: [
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Besoin d'aide ?",
      url: "#",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      name: "Propriétés",
      url: "/properties",
      icon: IconHome2,
    },
    {
      name: "Chat",
      url: "/chat",
      icon: IconMessage2,
    },
    {
      name: "Documents",
      url: "/documents",
      icon: IconFileWord,
    },
    {
      name:"Statistiques",
      url: "/statistiques",
      icon: IconChartBar, 
    }
  ],
}

import { useRouter } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const router = useRouter()

  // On part d'un user par défaut (anonyme)
  const defaultUser = React.useMemo(() => ({
    name: "Inconnu",
    email: "",
    avatar: "",
  }), []);
  const [user, setUser] = React.useState<typeof defaultUser>(defaultUser);

  // Fonction pour charger le user depuis la session
  const loadUserFromSession = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
        credentials: "include"
      });
      const session = await res.json() as { user: { name: string, email: string, avatar: string } };
      if (!session || !session.user) {
        return;
      }
      setUser({
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.avatar,
      });
      return;
    } catch (e) {
      console.error("Failed to load user from session:", e);
    }
  }, []);

  // Charger au mount
  React.useEffect(() => {
    loadUserFromSession();
  }, [loadUserFromSession]);

  const handleNavigation = (url: string) => {
    router.push(url)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={() => router.push("/")}
            >
              <a>
                <IconPlanet className="!size-10" />
                <span className="text-base font-semibold">Pluton</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain}/> */}
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
