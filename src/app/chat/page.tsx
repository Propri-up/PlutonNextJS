"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { IconSend, IconPaperclip, IconMicrophone, IconRefresh, IconPlus } from "@tabler/icons-react"
import { useEffect, useState, useRef } from "react"
// --- MOCK DATA ---
const mockConversations: ChatConversation[] = [
  {
    id: "1",
    title: "Démo Pluton",
    messages: [
      {
        id: "m1",
        content: "Bonjour, comment puis-je vous aider ?",
        sender: "assistant",
        timestamp: new Date().toISOString(),
      },
      {
        id: "m2",
        content: "Peux-tu me donner la météo ?",
        sender: "user",
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: string
}

interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentChat, setCurrentChat] = useState<ChatConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // --- MOCK fetchChats ---
  const fetchChats = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setConversations(mockConversations);
      setCurrentChat(mockConversations[0]);
      setLoading(false);
    }, 300);
  }

  
  // Récupérer la liste des conversations
  useEffect(() => {
    fetchChats()
  }, [])
  
  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentChat?.messages])
  
  // --- MOCK createNewConversation ---
  const createNewConversation = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const newConv: ChatConversation = {
        id: Date.now().toString(),
        title: `Nouvelle conversation ${conversations.length + 1}`,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setCurrentChat(newConv);
      setLoading(false);
    }, 200);
  }

  
  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChat || sendingMessage) return;
    // Optimistic update with mock assistant reply
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setCurrentChat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, tempMessage],
      };
    });
    setSendingMessage(true);
    setNewMessage("");
    setTimeout(() => {
      setCurrentChat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: (Date.now() + 1).toString(),
              content: "Ceci est une réponse simulée de Pluton.",
              sender: "assistant",
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
      setSendingMessage(false);
    }, 1000);
  }

  
  // --- MOCK switchConversation ---
  const switchConversation = (id: string) => {
    if (id === currentChat?.id) return;
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const found = conversations.find((conv) => conv.id === id) || null;
      setCurrentChat(found);
      setLoading(false);
    }, 200);
  }

  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="bg-[#0A0A22] text-white min-h-screen"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col h-[calc(100vh-var(--header-height))]">
          <div className="flex h-full">
            {/* Liste des conversations */}
            <div className="w-64 border-r border-slate-800 overflow-y-auto">
              <div className="p-4 flex justify-between items-center border-b border-slate-800">
                <h2 className="font-semibold">Conversations</h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full hover:bg-slate-800"
                  onClick={createNewConversation}
                  disabled={loading}
                >
                  <IconPlus className="h-5 w-5" />
                </Button>
              </div>
              {conversations.length > 0 ? (
                <div className="space-y-1 p-2">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`px-3 py-2 rounded-md cursor-pointer text-sm truncate hover:bg-slate-800 ${
                        currentChat?.id === conv.id ? 'bg-slate-800' : ''
                      }`}
                      onClick={() => switchConversation(conv.id)}
                    >
                      {conv.title}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  {loading ? "Chargement..." : "Aucune conversation"}
                </div>
              )}
            </div>
            
            {/* Zone de chat */}
            <div className="flex-1 flex flex-col">
              {/* Chat container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-2"
                    >
                      <IconRefresh className="h-4 w-4" />
                      Réessayer
                    </Button>
                  </div>
                ) : currentChat?.messages?.length ? (
                  <>
                    {currentChat.messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex items-start gap-3 max-w-[80%] ${
                          msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className={`h-8 w-8 border ${
                          msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800'
                        }`}>
                          <span>{msg.sender === 'user' ? 'U' : 'P'}</span>
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {sendingMessage && (
                      <div className="text-center py-2">
                        <span className="inline-block animate-pulse text-gray-400">Pluton réfléchit...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>Commencez une nouvelle conversation</p>
                    <p className="text-sm mt-2">Posez une question à Pluton</p>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="border-t border-slate-800 p-4">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <IconPaperclip className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Écrivez votre message..." 
                      className="bg-slate-800 border-slate-700 pr-10 focus-visible:ring-blue-500"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={loading || sendingMessage || !currentChat}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-0 top-0 h-full"
                      disabled={loading || sendingMessage || !currentChat}
                    >
                      <IconMicrophone className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendMessage}
                    disabled={loading || sendingMessage || !newMessage.trim() || !currentChat}
                  >
                    <IconSend className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}