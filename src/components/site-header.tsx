"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

export function SiteHeader({ title }: { title?: string }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  // Fonction pour obtenir le titre de la page à partir du pathname
  const getPageTitle = () => {
    if (title) return title
    // Extrait le dernier segment du chemin et capitalise la première lettre
    const path = pathname.split("/").filter(Boolean).pop() || "dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="flex h-[calc(var(--header-height))] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(var(--header-height))]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium text-foreground">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Bouton de changement de thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Changer de thème"
            className="relative text-foreground"
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
            <span className="sr-only">Changer de thème</span>
          </Button>
        </div>
      </div>
    </header>
  )
}