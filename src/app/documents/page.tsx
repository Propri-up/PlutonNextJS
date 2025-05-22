"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PdfPreviewModal } from "@/components/pdf-preview-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchDocs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        // Récupère tous les documents
        const res = await fetch(`${apiUrl}/api/documents`, { credentials: "include" });
        if (!res.ok) throw new Error("Erreur lors du chargement des documents");
        const data = await res.json();
        // On suppose que data.data est un tableau
        setDocuments(data.data || []);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
    console.log("Documents fetched:", documents);
  }, []);

  useEffect(() => {
    // Récupère les types de documents pour le filtre
    const fetchTypes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/documents/types`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          // L'API renvoie data.data qui est un tableau de types
          console.log("Types de documents:", data);
          setDocTypes(data.data || data.types || []);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des types de documents:", err);
      }
    };
    fetchTypes();
  }, []);

  // État pour stocker les informations sur les propriétés
  const [properties, setProperties] = useState<Record<number, any>>({});

  // Charger les informations des propriétés associées aux documents
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // On récupère les IDs uniques des propriétés dans les documents
        const propertyIds = [...new Set(documents.filter(doc => doc.propertyId).map(doc => doc.propertyId))];
        if (propertyIds.length === 0) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const propertiesData: Record<number, any> = {};
        
        // Pour chaque propriété, on récupère ses informations
        for (const propId of propertyIds) {
          try {
            const res = await fetch(`${apiUrl}/api/properties/${propId}`, { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              if (data.property) {
                propertiesData[propId] = data.property;
              }
            }
          } catch (err) {
            console.error(`Erreur lors du chargement de la propriété ${propId}:`, err);
          }
        }
        
        setProperties(propertiesData);
      } catch (err) {
        console.error("Erreur lors du chargement des propriétés:", err);
      }
    };
    
    if (documents.length > 0) {
      fetchProperties();
    }
  }, [documents]);

  // Helper to get property info by id
  const getProperty = (propertyId: number) => properties[propertyId];

  // Helper to get type object by id
  const getType = (typeId: number) => docTypes.find((t: any) => t.id === typeId);
  
  // Helper pour vérifier si un document correspond à la recherche par adresse
  const matchesByAddress = (doc: any, searchText: string) => {
    if (!searchText || !doc.propertyId) return false;
    const property = getProperty(doc.propertyId);
    const propertyAddress = property?.address || '';
    const displayName = getDocumentDisplayName(doc);
    return !displayName.toLowerCase().includes(searchText.toLowerCase()) && 
           propertyAddress.toLowerCase().includes(searchText.toLowerCase());
  };
  
  // Helper pour vérifier si un document correspond à la recherche par nom
  const matchesByName = (doc: any, searchText: string) => {
    if (!searchText) return true;
    const displayName = getDocumentDisplayName(doc);
    return displayName.toLowerCase().includes(searchText.toLowerCase());
  };

  // Mapping pour afficher des noms lisibles pour les types de documents
  const documentTypeLabels: Record<string, string> = {
    "lease-contract": "Contrat de location",
    "rent-receipt": "Quittance de loyer",
    "property-inspection": "État des lieux"
  };

  // Fonction pour obtenir un nom lisible pour le document
  const getDocumentDisplayName = (doc: any) => {
    // Si on a le type de document, on l'utilise en priorité
    if (doc.documentTypeName && documentTypeLabels[doc.documentTypeName]) {
      return documentTypeLabels[doc.documentTypeName];
    }
    
    // Sinon on utilise les autres propriétés disponibles
    return doc.title || doc.name || (doc.filePath ? doc.filePath.split("/").pop().replace(/document_\d+\.pdf/, "Document") : `Document #${doc.id}`);
  };

  const filteredDocuments = documents.filter((doc) => {
    // Recherche par nom ou par adresse de propriété
    const matchesSearch = matchesByName(doc, search) || matchesByAddress(doc, search);
    
    // Pour le filtrage par type, on vérifie par ID ou par nom
    const matchesType = filter 
      ? (String(doc.documentTypeId) === filter || 
         (docTypes.find(t => String(t.id) === filter)?.name === doc.documentTypeName))
      : true;
      
    return matchesSearch && matchesType;
  });

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
      className="bg-background text-foreground min-h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Mes documents" />
        {/* === HEADER & ACTIONS === */}
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes documents</h1>
            </div>
          </div>
          {/* === FILTRES === */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
            <div className="relative max-w-md">
              <Input
                placeholder="Rechercher par nom ou adresse..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-md pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
                {search && (
                  <button 
                    onClick={() => setSearch("")} 
                    className="mr-2 hover:text-foreground"
                    aria-label="Effacer la recherche"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </button>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            <Select value={filter ?? "all"} onValueChange={v => setFilter(v === "all" ? null : v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {docTypes.length > 0 ? docTypes.map((type: any) => {
                  // On récupère un nom lisible pour le type
                  const displayName = documentTypeLabels[type.name] || type.description || type.name || String(type.id);
                  return (
                    <SelectItem key={type.id || type} value={String(type.id || type)}>
                      <div className="flex items-center">
                        {displayName}
                      </div>
                    </SelectItem>
                  );
                }) : null}
              </SelectContent>
            </Select>
          </div>
          
          {/* === QUICK FILTER PAR ADRESSE === */}
          {!search && Object.values(properties).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-1">
              <span className="text-sm text-muted-foreground mr-1">Adresses :</span>
              {Array.from(new Set(Object.values(properties).map((p: any) => p.address)))
                .slice(0, 5) // Limite à 5 adresses pour éviter l'encombrement
                .map((address: string, index) => (
                <button
                  key={index}
                  onClick={() => setSearch(address)}
                  className="text-xs rounded-full bg-muted hover:bg-muted/80 px-3 py-1 text-foreground"
                >
                  {address.length > 25 ? address.substring(0, 22) + '...' : address}
                </button>
              ))}
              {Object.values(properties).length > 5 && (
                <span className="text-xs text-muted-foreground self-center">+ {Object.values(properties).length - 5} autres...</span>
              )}
            </div>
          )}
          
          {/* === RÉSULTATS DE RECHERCHE === */}
          {search && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredDocuments.length} {filteredDocuments.length > 1 ? 'documents trouvés' : 'document trouvé'}
                {filteredDocuments.length > 0 ? ` pour "${search}"` : ''}
              </div>
              {filteredDocuments.length > 0 && (
                <div className="text-xs text-primary">
                  {filteredDocuments.filter(doc => matchesByAddress(doc, search)).length} trouvé(s) par adresse
                </div>
              )}
            </div>
          )}
          
          {/* === GRILLE DE DOCUMENTS === */}
          <div className="grid gap-x-4 gap-y-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-40">Chargement...</div>
            ) : error ? (
              <div className="col-span-full text-red-500 text-center">{error}</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="col-span-full text-muted-foreground text-sm">Aucun document trouvé.</div>
            ) : (
              filteredDocuments.map((doc) => {
                const typeObj = getType(doc.documentTypeId);
                const property = doc.propertyId ? getProperty(doc.propertyId) : null;
                const displayName = getDocumentDisplayName(doc);
                
                // Vérifie si ce document a été trouvé via l'adresse de la propriété
                const foundByAddress = search && matchesByAddress(doc, search);
                
                return (
                  <Card key={doc.id} className="group flex flex-col h-full w-full bg-card border border-border shadow-sm hover:shadow-lg transition-shadow rounded-2xl overflow-hidden p-0 relative">
                    {foundByAddress && search && (
                      <div className="absolute right-2 top-2 bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        Trouvé par adresse
                      </div>
                    )}
                    <div className="bg-muted flex items-center justify-center h-32 border-b border-border">
                      <span className="text-4xl text-primary/80 group-hover:scale-110 transition-transform">📄</span>
                    </div>
                    <div className="flex flex-col gap-1 px-7 pt-5 pb-2">
                      <div className="font-semibold truncate text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                        {getDocumentDisplayName(doc)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {doc.propertyId && (
                          <span 
                            className={`capitalize font-medium px-2 py-0.5 rounded ${
                              search && property?.address?.toLowerCase().includes(search.toLowerCase())
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted/60'
                            }`} 
                            title={getProperty(doc.propertyId)?.address || `Bien #${doc.propertyId}`}
                          >
                            {getProperty(doc.propertyId)?.address 
                              ? `${getProperty(doc.propertyId).address.substring(0, 15)}${getProperty(doc.propertyId).address.length > 15 ? '...' : ''}`
                              : `Bien #${doc.propertyId}`}
                          </span>
                        )}
                        {doc.contractId && !doc.propertyId && (
                          <span className="capitalize font-medium bg-muted/60 px-2 py-0.5 rounded">Contrat #{doc.contractId}</span>
                        )}
                        <span className="ml-auto">{doc.creationDate ? new Date(doc.creationDate).toLocaleDateString("fr-FR") : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {doc.size && <span>{doc.size}</span>}
                        {doc.documentTypeName && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{documentTypeLabels[doc.documentTypeName] || doc.documentTypeName}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 px-7 pb-6 pt-5 mt-auto">
                      <Button size="sm" variant="default" className="w-1/2 rounded-md font-medium" onClick={() => { 
                        // On transfère toutes les propriétés du document à la modale
                        const property = doc.propertyId ? getProperty(doc.propertyId) : null;
                        setPreviewDoc({ 
                          ...doc, 
                          url: doc.signedUrl,
                          displayName: getDocumentDisplayName(doc),
                          propertyAddress: property?.address
                        });
                        setShowPreview(true); 
                      }}>
                        Prévisualiser
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-1/2 rounded-md font-medium" 
                        onClick={() => {
                          if (doc.signedUrl) {
                            try {
                              // Création d'un lien temporaire pour le téléchargement
                              const link = document.createElement('a');
                              link.href = doc.signedUrl;
                              const fileName = `${getDocumentDisplayName(doc)} - ${doc.creationDate ? new Date(doc.creationDate).toLocaleDateString('fr-FR') : 'Document'}.pdf`;
                              link.setAttribute('download', fileName);
                              link.setAttribute('target', '_blank');
                              document.body.appendChild(link);
                              
                              toast.success("Téléchargement démarré", {
                                description: fileName,
                                duration: 3000
                              });
                              
                              link.click();
                              document.body.removeChild(link);
                            } catch (err) {
                              console.error("Erreur lors du téléchargement", err);
                              toast.error("Erreur lors du téléchargement", {
                                description: "Veuillez réessayer ultérieurement.",
                                duration: 5000
                              });
                            }
                          } else {
                            console.error("URL de téléchargement non disponible");
                            toast.error("URL de téléchargement non disponible", {
                              description: "Veuillez réessayer ultérieurement.",
                              duration: 5000
                            });
                          }
                        }}
                      >
                        Télécharger
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </SidebarInset>
      <PdfPreviewModal open={showPreview} onClose={() => setShowPreview(false)} doc={previewDoc} />
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
