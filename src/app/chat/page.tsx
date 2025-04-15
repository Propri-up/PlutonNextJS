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
  IconX,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Données mock pour simuler les conversations
const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "c1",
    title: "Investissements immobiliers",
    messages: [
      {
        id: "m1",
        content:
          "Bonjour, j'aimerais en savoir plus sur l'investissement locatif",
        sender: "user" as "user",
        timestamp: "2023-04-10T14:22:00Z",
      },
      {
        id: "m2",
        content:
          "Bonjour ! Je serais ravi de vous conseiller sur l'investissement locatif. Avez-vous déjà un projet en tête ?",
        sender: "assistant" as "assistant",
        timestamp: "2023-04-10T14:23:00Z",
      },
      {
        id: "m3",
        content:
          "Je cherche à investir dans une ville moyenne avec un bon rendement",
        sender: "user",
        timestamp: "2023-04-10T14:24:30Z",
      },
      {
        id: "m4",
        content:
          "Excellent choix ! Les villes moyennes offrent souvent les meilleurs rendements. Je vous recommande de regarder du côté de Limoges, Orléans ou Saint-Étienne où les prix sont encore raisonnables avec des rendements entre 7 et 9%.",
        sender: "assistant",
        timestamp: "2023-04-10T14:26:00Z",
      },
    ],
    createdAt: "2023-04-10T14:22:00Z",
    updatedAt: "2023-04-10T14:26:00Z",
  },
  {
    id: "c2",
    title: "Assurance vie",
    messages: [
      {
        id: "m1",
        content: "Quels sont les meilleurs fonds euros actuellement ?",
        sender: "user",
        timestamp: "2023-04-12T09:15:00Z",
      },
      {
        id: "m2",
        content:
          "Les meilleurs fonds euros offrent actuellement entre 2% et 3%. Je vous recommande particulièrement ceux proposés par Spirica et Suravenir qui ont bien performé l'année dernière.",
        sender: "assistant",
        timestamp: "2023-04-12T09:16:30Z",
      },
    ],
    createdAt: "2023-04-12T09:15:00Z",
    updatedAt: "2023-04-12T09:16:30Z",
  },
];

// Types
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

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verrouiller le défilement de la page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Charger les conversations
  const fetchChats = () => {
    setLoading(true);
    setError(null);

    try {
      setConversations(MOCK_CONVERSATIONS);
      if (MOCK_CONVERSATIONS.length > 0 && !currentChat) {
        switchConversation(MOCK_CONVERSATIONS[0].id);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des conversations:", err);
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les conversations au chargement
  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);

  // Fermer le sidebar en mode mobile quand on change de conversation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Créer une nouvelle conversation
  const createNewConversation = () => {
    const newChat: ChatConversation = {
      id: `c${Date.now()}`,
      title: "Nouvelle conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setCurrentChat(newChat);
    setShowSidebar(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChat) return;

    // Message de l'utilisateur
    const userMessage: ChatMessage = {
      id: `m${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    // Mise à jour de la conversation
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    // Mise à jour de l'état
    setCurrentChat(updatedChat);
    setConversations((prevConvs) =>
      prevConvs.map((conv) => (conv.id === currentChat.id ? updatedChat : conv))
    );

    // Réinitialiser le champ de message
    setNewMessage("");
  };

  // Changer de conversation
  const switchConversation = (id: string) => {
    if (id === currentChat?.id) return;

    const chat = conversations.find((c) => c.id === id) || null;
    setCurrentChat(chat);
    setShowSidebar(false); // Fermer le sidebar en mode mobile
  };

  // Formatter la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Date invalide");

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Erreur de formatage de date:", e);
      return "Date inconnue";
    }
  };

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
          <div
            className={cn(
              "border-r border-border flex flex-col overflow-hidden transition-all duration-300",
              "md:w-64 md:block md:static md:min-h-0",
              showSidebar
                ? "fixed inset-0 z-50 bg-[#0A0A22] w-full h-full"
                : "hidden"
            )}
          >
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
              <Button
                variant="ghost"
                size="icon"
                onClick={createNewConversation}
                disabled={loading}
                className="h-8 w-8"
              >
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
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

          <div className="flex flex-1 flex-col h-full overflow-hidden">
            <div className="md:hidden p-3 border-b border-border flex items-center shrink-0">
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
            </div>

            <div
              className="flex-1 overflow-y-auto p-3 md:p-4"
              id="messagesContainer"
            >
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
                  >
                    <IconRefresh className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              ) : currentChat?.messages?.length ? (
                <div className="space-y-3 md:space-y-4 pb-2">
                  {currentChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 md:gap-3",
                        "max-w-[85%] md:max-w-[80%]",
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
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
                      >
                        Nouvelle conversation
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-border p-3 md:p-4 shrink-0 bg-[#0A0A22]">
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
                  disabled={loading || !currentChat}
                  className="flex-1 h-9 md:h-10 text-sm md:text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim() || !currentChat}
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
