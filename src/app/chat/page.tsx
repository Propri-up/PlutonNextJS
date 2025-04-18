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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Types pour l'interface de chat
 */
interface ChatMessage {
  id?: number;
  nonce?: number;
  content: string;
  sendDate: string;
  chatId: number;
  userId: string;
  isRead: boolean;
}

interface ChatParticipant {
  id: number;
  chatId: number;
  userId: string;
}

interface ChatConversation {
  id: number;
  chatType: string;
  propertyId: number;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  messages?: ChatMessage[];
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
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // États de l'interface
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Ajout d'un état pour les messages échoués
  const [failedMessages, setFailedMessages] = useState<ChatMessage[]>([]);

  // Référence pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Onglet sélectionné : "property" ou "private"
  const [selectedTab, setSelectedTab] = useState<'property' | 'private'>('property');

  // Conversations filtrées selon l'onglet
  const filteredConversations = conversations.filter(
    (c) => c.chatType === selectedTab
  );

  // Ajout d'un état pour la modale de sélection de participants
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [privateEmail, setPrivateEmail] = useState("");

  // Récupération de l'ID de l'utilisateur actuel
  // (pour l'affichage des messages)
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUserId(userData.user.id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    getCurrentUser();
  }, []);

  /**
   * Gestion du défilement et du verrouillage de la page
   */
  useEffect(() => {
    // Empêche le défilement du body
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
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

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
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

      const response = await fetch(`${API_URL}/api/chat/list`, {
        credentials: "include",
      });

      if (!response.ok) {
        let errMsg = `Erreur serveur: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setConversations(data);

      // Sélectionner la première conversation si aucune n'est active
      if (data.length > 0 && !currentChat) {
        await switchConversation(data[0].id);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des conversations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les conversations"
      );
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
    if (!isOnline) {
      setError("Pas de connexion internet");
      return;
    }
    try {
      setLoading(true);
      // Création selon l'onglet sélectionné
      const body: any = { chatType: selectedTab };
      if (selectedTab === 'property') {
        body.propertyId = 0;
        body.participantIds = [currentUserId];
      } else {
        // Pour une discussion privée, pas de propertyId, mais il faut au moins le user courant
        body.propertyId = null;
        body.participantIds = [currentUserId];
      }
      const response = await fetch(`${API_URL}/api/chat/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        let errMsg = `Erreur serveur: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }
      const resp = await response.json();
      const newChat = resp.chat;
      setConversations((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);
      setShowSidebar(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer une conversation"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour ouvrir la modale de création privée (remplace la sélection)
   */
  const openPrivateChatDialog = () => {
    setShowParticipantDialog(true);
    setPrivateEmail("");
  };

  /**
   * Change la conversation active
   */
  const switchConversation = async (id: number) => {
    if (id === currentChat?.id) return;

    try {
      setLoading(true);

      // Utilisation du cache si disponible
      const response = await fetch(`${API_URL}/api/chat/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        let errMsg = `Erreur serveur: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const fullConversation = await response.json();

      // Mise à jour de l'état et du cache
      setCurrentChat(fullConversation);
      setConversations((prevConvs) =>
        prevConvs.map((conv) =>
          conv.id === id
            ? { ...conv, messages: fullConversation.messages }
            : conv
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la conversation"
      );
    } finally {
      setLoading(false);
      setShowSidebar(false);
    }
  };

  /**
   * Envoie un message et ajoute la réponse de l'API sans re-fetch toute la discussion
   */
  const handleSendMessage = async (retryMessage?: ChatMessage) => {
    // Si retryMessage est fourni, on retente l'envoi de ce message
    const messageContent = retryMessage ? retryMessage.content : newMessage.trim();
    if (!messageContent || !currentChat || !isOnline) {
      if (!isOnline) setError("Pas de connexion internet");
      return;
    }

    setSending(true);
    if (!retryMessage) setNewMessage("");

    // Utiliser le même id/nonce si retry, sinon générer un nouveau
    // Correction : nonce doit être un int32 (max 2_147_483_647)
    const MAX_INT32 = 2_147_483_647;
    const tempId = retryMessage
      ? retryMessage.id
      : Math.floor(Math.random() * MAX_INT32);
    const userMessage: ChatMessage = {
      id: tempId,
      content: messageContent,
      sendDate: retryMessage ? retryMessage.sendDate : new Date().toISOString(),
      chatId: currentChat.id,
      userId: currentUserId,
      isRead: false,
    };

    // Ajout optimiste si ce n'est pas un retry
    if (!retryMessage) {
      const updatedChat = {
        ...currentChat,
        messages: [...(currentChat.messages || []), userMessage],
      };
      setCurrentChat(updatedChat);
    }

    try {
      if (!API_URL) {
        throw new Error("API_URL n'est pas défini. Vérifiez votre configuration.");
      }
      // Envoi à l'API
      const response = await fetch(
        `${API_URL}/api/chat/${currentChat.id}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: messageContent, nonce: tempId }),
        }
      );

      if (!response.ok) {
        let errMsg = `Erreur serveur: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      // Ajout du message réel retourné par l'API (remplace le message optimiste si même nonce, sinon ajoute)
      const resp = await response.json();
      if (!resp.message) {
        throw new Error("Réponse inattendue de l'API: pas de message retourné");
      }
      const apiMessage = resp.message;
      setCurrentChat((prev) => {
        if (!prev) return prev;
        // Retirer le message optimiste si même nonce
        const filtered = (prev.messages || []).filter(
          (m) => m.id !== tempId
        );
        return {
          ...prev,
          messages: [...filtered, apiMessage],
        };
      });
      // Retirer le message des échecs si c'était un retry
      setFailedMessages((prev) => prev.filter((m) => m.id !== tempId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer le message"
      );
      // Ajouter le message à la liste des échecs si ce n'est pas déjà le cas
      setFailedMessages((prev) => {
        if (prev.some((m) => m.id === tempId)) return prev;
        return [...prev, userMessage];
      });
      if (!retryMessage) setNewMessage(messageContent); // Restaurer le message en cas d'erreur
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
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
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
                {/* Bouton nouvelle conversation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={selectedTab === 'private' ? openPrivateChatDialog : createNewConversation}
                  disabled={loading || !isOnline}
                  className="h-8 w-8"
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Onglets de type de discussion */}
            <div className="flex gap-2 p-2 border-b border-border">
              <Button
                variant={selectedTab === 'property' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('property')}
              >
                Propriétés
              </Button>
              <Button
                variant={selectedTab === 'private' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('private')}
              >
                Privées
              </Button>
            </div>

            {/* Liste des conversations filtrées */}
            <div className="flex-1 overflow-y-auto">
              {!filteredConversations.length ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {loading ? "Chargement..." : "Aucune conversation"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredConversations.map((chat) => (
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
                      <div className="font-medium truncate">
                        {chat.chatType === "property"
                          ? `Propriété #${chat.propertyId}`
                          : "Conversation"}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {chat.lastMessage ? (
                          <>
                            <span>{formatDate(chat.lastMessage.sendDate)}</span>
                            <span className="ml-1">•</span>
                            <span className="ml-1 truncate">
                              {chat.lastMessage.content}
                            </span>
                          </>
                        ) : (
                          "Nouvelle conversation"
                        )}
                      </div>
                    </div>
                  ))}
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
                  {currentChat
                    ? currentChat.chatType === "property"
                      ? `Propriété #${currentChat.propertyId}`
                      : "Conversation"
                    : "Sélectionner une conversation"}
                </span>
              </Button>
              {/* Indicateur de connexion mobile */}
              {isOnline ? (
                <IconWifi className="h-4 w-4 text-green-400" />
              ) : (
                <IconWifiOff className="h-4 w-4 text-red-400" />
              )}
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
                  {[...(currentChat.messages || []), ...failedMessages]
                    .slice()
                    .sort((a, b) => new Date(a.sendDate).getTime() - new Date(b.sendDate).getTime())
                    .map((msg) => {
                      const isFailed = failedMessages.some((m) => m.id === msg.id);
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-start gap-2 md:gap-3",
                            msg.userId === currentUserId ? "ml-auto flex-row-reverse" : ""
                          )}
                        >
                          <Avatar
                            className={cn(
                              "h-7 w-7 md:h-8 md:w-8",
                              msg.userId === currentUserId ? "bg-primary" : "bg-secondary"
                            )}
                          >
                            <AvatarFallback>
                              {msg.userId === currentUserId ? (
                                <IconUser className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              ) : (
                                <IconRobot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "rounded-lg p-2 md:p-3",
                              msg.userId === currentUserId
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground",
                              isFailed && "border border-destructive"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm md:text-base">
                              {msg.content}
                            </p>
                            <p className="text-[10px] md:text-xs opacity-75 mt-1">
                              {formatDate(msg.sendDate)}
                              {isFailed && (
                                <span className="text-destructive ml-2">Échec</span>
                              )}
                            </p>
                            {isFailed && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="mt-1 text-xs py-1 h-7"
                                onClick={() => handleSendMessage(msg)}
                                disabled={sending || !isOnline}
                              >
                                Réessayer
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}

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
                  onClick={() => handleSendMessage()}
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

      {/* Modale de saisie d'email pour discussion privée */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle discussion privée</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email du participant</label>
            <Input
              type="email"
              placeholder="exemple@domaine.com"
              value={privateEmail}
              onChange={e => setPrivateEmail(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setShowParticipantDialog(false);
                if (!privateEmail) return;
                setLoading(true);
                try {
                  const body = {
                    chatType: "private",
                    propertyId: null,
                    participantIds: [currentUserId],
                    participantEmail: privateEmail,
                  };
                  const response = await fetch(`${API_URL}/api/chat/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                  });
                  if (!response.ok) {
                    let errMsg = `Erreur serveur: ${response.status}`;
                    try {
                      const errData = await response.json();
                      if (errData && errData.error) errMsg = errData.error;
                    } catch {}
                    throw new Error(errMsg);
                  }
                  const resp = await response.json();
                  const newChat = resp.chat;
                  setConversations((prev) => [newChat, ...prev]);
                  setCurrentChat(newChat);
                  setShowSidebar(false);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Impossible de créer une conversation"
                  );
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!privateEmail || loading}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
