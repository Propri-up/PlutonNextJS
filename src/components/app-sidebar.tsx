"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
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
    name: "Zabil",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
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
      name: "Chat",
      url: "/chat",
      icon: IconMessage2,
    },
    {
      name:"Statistiques",
      url: "/Statistiques",
      icon: IconChartBar, 
    }
  ],
}

import Cookies from "js-cookie";
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

  // Fonction pour charger le user depuis le cookie
  const loadUserFromCookie = React.useCallback(() => {
    const sessionStr = Cookies.get("pluton_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const realUser = session?.user;
        if (realUser) {
          setUser({
            name: realUser.name || "Inconnu",
            email: realUser.email || "",
            avatar: realUser.avatar || realUser.image || "",
          });
          return;
        }
      } catch (e) {
        // Optionnel: log error
      }
    }
    setUser(defaultUser);
  }, [defaultUser]);

  // Charger au mount et à chaque changement du cookie pluton_session
  React.useEffect(() => {
    loadUserFromCookie();
    // On écoute les changements du cookie (si modifié ailleurs dans l'app)
    const interval = setInterval(loadUserFromCookie, 2000);
    return () => clearInterval(interval);
  }, [loadUserFromCookie]);

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
        <NavMain items={data.navMain}/>
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
