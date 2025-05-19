"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

async function fetchAccountData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const res = await fetch(`${apiUrl}/api/users/me`, { credentials: "include" });
  if (res.status === 401) throw new Error("401");
  if (res.status === 404) throw new Error("404");
  if (!res.ok) throw new Error("GENERIC");
  return await res.json();
}

async function updateAccountData({ name, telephone }: { name: string; telephone: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const res = await fetch(`${apiUrl}/api/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, telephone }),
  });
  if (res.status === 401) throw new Error("401");
  if (res.status === 404) throw new Error("404");
  if (!res.ok) throw new Error("GENERIC");
  return await res.json();
}

export default function AccountPage() {
  const [data, setData] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountData()
      .then(setData)
      .catch((e) => {
        if (e instanceof Error) {
          if (e.message === "401") setError("Vous n'êtes pas connecté. Merci de vous connecter.");
          else if (e.message === "404") setError("Profil utilisateur introuvable.");
          else setError("Une erreur est survenue lors du chargement du compte.");
        } else {
          setError("Une erreur est survenue lors du chargement du compte.");
        }
      });
  }, []);

  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!data) return <div className="p-8 text-center">Chargement...</div>;
  const { user, properties } = data;

  // Ouvre le dialog d'édition et préremplit les champs
  function openEdit() {
    setEditName(user.name);
    setEditPhone(user.telephone);
    setEditOpen(true);
  }

  // Sauvegarde les modifications utilisateur
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAccountData({ name: editName, telephone: editPhone });
      setData((prev: any) => ({ ...prev, user: { ...prev.user, ...updated.user } }));
      setEditOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "401") setError("Vous n'êtes pas connecté. Merci de vous connecter.");
        else if (e.message === "404") setError("Profil utilisateur introuvable.");
        else setError("Erreur lors de la sauvegarde");
      } else {
        setError("Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="max-w-3xl mx-auto py-10 px-4 md:px-0">
          <Card className="mb-8 bg-card text-foreground">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold mb-1">{user.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{user.email}</span>
                  {user.emailVerified && (
                    <Badge variant="outline" className="border-primary text-primary">Email vérifié</Badge>
                  )}
                </div>
                <div className="text-muted-foreground text-sm mt-1">{user.telephone}</div>
                <Button variant="outline" className="mt-3 border-primary text-primary" size="sm" onClick={openEdit}>
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-4 mt-2">
                <div>
                  <span className="block text-xs text-muted-foreground">Inscrit le</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Dernière mise à jour</span>
                  <span className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Type d'utilisateur</span>
                  <span className="font-medium">{user.userTypeId === 1 ? "Propriétaire" : "Utilisateur"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Abonnement</span>
                  <span className="font-medium">{user.subscriptionId === 2 ? "Premium" : "Standard"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-foreground">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Mes propriétés</CardTitle>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-muted-foreground">Aucune propriété enregistrée.</div>
              ) : (
                <div className="grid gap-4">
                  {properties.map((prop: any) => (
                    <a
                      key={prop.id}
                      href={`/properties/${prop.id}`}
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div>
                        <div className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{prop.address}</div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{prop.surfaceArea} m²</span>
                          <span>{prop.numberOfBedrooms} chambres</span>
                          <span>Loyer: <span className="text-foreground font-semibold">{prop.rent} €</span></span>
                          <span>Charges: {prop.estimatedCharges} €</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 md:mt-0 border-primary text-primary" size="sm">
                        Voir
                      </Button>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog édition utilisateur */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier mes informations</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="default" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
