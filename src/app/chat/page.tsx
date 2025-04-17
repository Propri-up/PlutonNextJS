"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  IconSend,
  IconPlus,
  IconRefresh,
  IconUser,
  IconRobot,
  IconMenu2,
  IconChevronLeft,
  IconWifi,
  IconWifiOff,
} from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Types pour l'interface de chat
 */
interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// URL de l'API définie dans .env
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Page de Chat - Interface de discussion avec l'assistant IA
 * 
 * Cette page permet de:
 * - Créer de nouvelles conversations
 * - Visualiser l'historique des conversations
 * - Envoyer des messages et recevoir des réponses
 * - Fonctionner en mode hors ligne/en ligne
 */
export default function ChatPage() {
  // États principaux
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // États de l'interface
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Référence pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Gestion du défilement et du verrouillage de la page
   */
  useEffect(() => {
    // Empêche le défilement du body
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Défilement automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  /**
   * Détection de l'état de la connexion internet
   */
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Réinitialisation de l'erreur et rechargement des données quand la connexion revient
  useEffect(() => {
    if (isOnline && error?.includes("connexion internet")) {
      fetchChats();
    }
  }, [isOnline, error]);

  /**
   * Gestion responsive du sidebar
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(false); // Fermer le sidebar mobile en mode desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Récupère toutes les conversations depuis l'API
   */
  const fetchChats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Vérification de la connexion internet
      if (!isOnline) {
        throw new Error("Pas de connexion internet");
      }
      
      const response = await fetch(`${API_URL}/conversations`);
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(data);
      
      // Sélectionner la première conversation si aucune n'est active
      if (data.length > 0 && !currentChat) {
        await switchConversation(data[0].id);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des conversations:", err);
      setError(err instanceof Error ? err.message : "Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des conversations
  useEffect(() => {
    fetchChats();
  }, []);

  /**
   * Crée une nouvelle conversation
   */
  const createNewConversation = async () => {
    // Vérification de connexion
    if (!isOnline) {
      setError("Pas de connexion internet");
      return;
    }

    try {
      setLoading(true);
      
      // Appel API pour créer une conversation
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "Nouvelle conversation" }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      // Mise à jour de l'interface
      const newChat = await response.json();
      setConversations((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);
      setShowSidebar(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer une conversation");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change la conversation active
   */
  const switchConversation = async (id: string) => {
    if (id === currentChat?.id) return;

    try {
      setLoading(true);
      
      // Utilisation du cache si disponible
      const cachedConversation = conversations.find(c => c.id === id);
      if ((cachedConversation?.messages ?? []).length > 0) {
        setCurrentChat(cachedConversation ?? null);
        setShowSidebar(false);
        setLoading(false);
        return;
      }
      
      // Récupération des messages depuis l'API
      const response = await fetch(`${API_URL}/conversations/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const fullConversation = await response.json();
      
      // Mise à jour de l'état et du cache
      setCurrentChat(fullConversation);
      setConversations(prevConvs => 
        prevConvs.map(conv => conv.id === id ? fullConversation : conv)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la conversation");
    } finally {
      setLoading(false);
      setShowSidebar(false);
    }
  };

  /**
   * Envoie un message et récupère la réponse de l'assistant
   */
  const handleSendMessage = async () => {
    // Validations
    if (!newMessage.trim() || !currentChat || !isOnline) {
      if (!isOnline) setError("Pas de connexion internet");
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage(""); // Vider l'input immédiatement
    setSending(true);

    try {
      // Mise à jour optimiste de l'interface (afficher le message immédiatement)
      const tempId = `temp_${Date.now()}`;
      const userMessage: ChatMessage = {
        id: tempId,
        content: messageContent,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      // Ajout temporaire du message à l'interface
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
      };
      setCurrentChat(updatedChat);

      // Envoi du message à l'API
      const response = await fetch(`${API_URL}/conversations/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      // Mise à jour avec la réponse de l'assistant
      const updatedConversation = await response.json();
      
      // Mise à jour de l'interface avec la conversation complète
      setCurrentChat(updatedConversation);
      setConversations((prevConvs) =>
        prevConvs.map((conv) => (conv.id === currentChat.id ? updatedConversation : conv))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message");
      setNewMessage(messageContent); // Restaurer le message en cas d'erreur
    } finally {
      setSending(false);
    }
  };

  /**
   * Formatte une date pour l'affichage
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  // Indicateurs d'état de l'interface
  const isConversationsEmpty = conversations.length === 0;
  const isMessagesEmpty = !currentChat?.messages?.length;
  const isInputDisabled = loading || !currentChat || sending || !isOnline;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
      className="bg-[#0A0A22] text-white h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <SiteHeader />

        <div className="flex flex-1 h-[calc(100vh-var(--header-height))] overflow-hidden flex-col md:flex-row">
          {/* Panneau latéral - Liste des conversations */}
          <div
            className={cn(
              "border-r border-border flex flex-col overflow-hidden transition-all duration-300",
              "md:w-64 md:block md:static md:min-h-0",
              showSidebar
                ? "fixed inset-0 z-50 bg-[#0A0A22] w-full h-full"
                : "hidden"
            )}
          >
            {/* En-tête du panneau latéral */}
            <div className="p-3 border-b border-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden h-8 w-8"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-medium">Conversations</h2>
              </div>
              <div className="flex items-center gap-1">
                {/* Indicateur de connexion */}
                {isOnline ? 
                  <IconWifi className="h-4 w-4 text-green-400" /> : 
                  <IconWifiOff className="h-4 w-4 text-red-400" />
                }
                {/* Bouton nouvelle conversation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={createNewConversation}
                  disabled={loading || !isOnline}
                  className="h-8 w-8"
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
              {!isConversationsEmpty ? (
                <div className="p-2 space-y-1">
                  {conversations.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-accent/50",
                        currentChat?.id === chat.id
                          ? "bg-accent text-accent-foreground"
                          : ""
                      )}
                      onClick={() => switchConversation(chat.id)}
                    >
                      <div className="font-medium truncate">{chat.title}</div>
                      <div className="text-xs opacity-75 truncate">
                        {formatDate(chat.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {loading ? "Chargement..." : "Aucune conversation"}
                </div>
              )}
            </div>
          </div>

          {/* Zone principale - Messages et saisie */}
          <div className="flex flex-1 flex-col h-full overflow-hidden">
            {/* En-tête mobile */}
            <div className="md:hidden p-3 border-b border-border flex items-center justify-between shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="flex items-center gap-2"
              >
                <IconMenu2 className="h-4 w-4" />
                <span className="truncate">
                  {currentChat?.title || "Sélectionner une conversation"}
                </span>
              </Button>
              {/* Indicateur de connexion mobile */}
              {isOnline ? 
                <IconWifi className="h-4 w-4 text-green-400" /> : 
                <IconWifiOff className="h-4 w-4 text-red-400" />
              }
            </div>

            {/* Zone d'affichage des messages */}
            <div
              className="flex-1 overflow-y-auto p-3 md:p-4"
              id="messagesContainer"
            >
              {/* États: Chargement, Erreur, Messages */}
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={fetchChats}
                    className="flex items-center gap-2"
                    disabled={!isOnline && error.includes("connexion internet")}
                  >
                    <IconRefresh className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              ) : !isMessagesEmpty ? (
                <div className="space-y-3 md:space-y-4 pb-2">
                  {/* Liste des messages */}
                  {currentChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 md:gap-3",
                        "max-w-[85%] md:max-w-[80%]",
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      {/* Avatar de l'utilisateur ou de l'assistant */}
                      <Avatar
                        className={cn(
                          "h-7 w-7 md:h-8 md:w-8",
                          msg.sender === "user" ? "bg-primary" : "bg-secondary"
                        )}
                      >
                        <AvatarFallback>
                          {msg.sender === "user" ? (
                            <IconUser className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          ) : (
                            <IconRobot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {/* Bulle de message */}
                      <div
                        className={cn(
                          "rounded-lg p-2 md:p-3",
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm md:text-base">
                          {msg.content}
                        </p>
                        <p className="text-[10px] md:text-xs opacity-75 mt-1">
                          {formatDate(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicateur de chargement pendant l'envoi */}
                  {sending && (
                    <div className="flex items-start gap-2 md:gap-3">
                      <Avatar className="h-7 w-7 md:h-8 md:w-8 bg-secondary">
                        <AvatarFallback>
                          <IconRobot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-2 md:p-3 bg-secondary text-secondary-foreground min-w-[60px] flex items-center justify-center">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Élément pour le défilement automatique */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  {currentChat ? (
                    <p>Commencez la conversation</p>
                  ) : (
                    <>
                      <p>Aucune conversation sélectionnée</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={createNewConversation}
                        disabled={!isOnline}
                      >
                        Nouvelle conversation
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Zone de saisie des messages */}
            <div className="border-t border-border p-3 md:p-4 shrink-0 bg-[#0A0A22]">
              {/* Afficher l'erreur en cas de problème */}
              {error && (
                <div className="text-destructive text-xs mb-2">{error}</div>
              )}
              
              {/* Formulaire d'envoi */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isInputDisabled}
                  className="flex-1 h-9 md:h-10 text-sm md:text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isInputDisabled || !newMessage.trim()}
                  className="h-9 md:h-10 px-3 md:px-4 flex-shrink-0"
                  size="sm"
                >
                  <IconSend className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Envoyer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}