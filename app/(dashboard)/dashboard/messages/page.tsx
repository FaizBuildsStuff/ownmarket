"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatStatus = "OPEN" | "IN_PROGRESS" | "CLOSED"

type Thread = {
  id: string
  status: ChatStatus
  updatedAt: string
  product: { id: string; title: string; image?: string | null }
  buyer: { id: string; name: string | null; email: string | null }
  seller: { id: string; name: string | null; email: string | null }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    senderId: string
    senderName: string | null
  } | null
}

type ChatMessage = {
  id: string
  content: string
  createdAt: string
  senderId: string
  senderName: string | null
}

export default function MessagesPage() {
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<ChatStatus>("OPEN")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "SELLER" | "BUYER" | null>(null)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [sending, setSending] = useState(false)

  const loadThreads = async () => {
    try {
      const res = await fetch("/api/chat/threads", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setThreads(data.threads ?? [])
      setCurrentUserId(data.currentUserId)
      setCurrentRole(data.currentUserRole)

      if (!selectedId && data.threads?.length) {
        setSelectedId(data.threads[0].id)
      }
    } catch {
      // ignore
    } finally {
      setLoadingThreads(false)
    }
  }

  const loadMessages = async (threadId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?threadId=${threadId}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages ?? [])
      setStatus(data.thread?.status ?? "OPEN")
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadThreads()
    const interval = setInterval(loadThreads, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) return
    loadMessages(selectedId)
    const interval = setInterval(() => loadMessages(selectedId), 3000)
    return () => clearInterval(interval)
  }, [selectedId])

  const grouped = {
    pending: threads.filter((t) => t.status === "OPEN"),
    inProgress: threads.filter((t) => t.status === "IN_PROGRESS"),
    closed: threads.filter((t) => t.status === "CLOSED"),
  }

  const handleSend = async () => {
    if (!selectedId || !input.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedId, content: input.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setInput("")
        setMessages((prev) => [...prev, data.message])
      } else {
        alert(data.message || "Could not send message")
      }
    } catch {
      alert("Could not send message")
    } finally {
      setSending(false)
    }
  }

  const handleChangeStatus = async (next: ChatStatus) => {
    if (!selectedId) return
    try {
      const res = await fetch("/api/chat/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedId, status: next }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(data.thread.status)
        loadThreads()
      } else {
        alert(data.message || "Could not update status")
      }
    } catch {
      alert("Could not update status")
    }
  }

  const isSeller = currentRole === "SELLER" || currentRole === "ADMIN"

  const renderThreadItem = (t: Thread) => {
    const isActive = t.id === selectedId
    const lastSnippet = t.lastMessage?.content ?? "No messages yet"
    const buyerName = t.buyer.name || t.buyer.email || "Buyer"

    return (
      <button
        key={t.id}
        onClick={() => setSelectedId(t.id)}
        className={`w-full text-left px-3 py-2 rounded-2xl border transition-all mb-1 ${
          isActive
            ? "border-black bg-black text-white shadow-md"
            : "border-transparent bg-white hover:border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-[#111827]"}`}>
            {buyerName}
          </p>
          {t.status === "IN_PROGRESS" && (
            <Badge className="bg-amber-500/10 text-amber-700 border-none h-5 text-[10px]">
              In progress
            </Badge>
          )}
          {t.status === "OPEN" && (
            <Badge className="bg-blue-500/10 text-blue-700 border-none h-5 text-[10px]">
              Pending
            </Badge>
          )}
          {t.status === "CLOSED" && (
            <Badge className="bg-emerald-500/10 text-emerald-700 border-none h-5 text-[10px]">
              Closed
            </Badge>
          )}
        </div>
        <p className={`text-[11px] truncate ${isActive ? "text-gray-100" : "text-gray-500"}`}>
          {t.product.title}
        </p>
        <p className={`mt-1 text-[10px] line-clamp-1 ${isActive ? "text-gray-200" : "text-gray-400"}`}>
          {lastSnippet}
        </p>
      </button>
    )
  }

  const selectedThread = threads.find((t) => t.id === selectedId) || null

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex selection:bg-[#48E44B]/30 font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-100 bg-white/70 backdrop-blur-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-[#111827] uppercase tracking-[0.22em]">
              Seller Inbox
            </p>
            <p className="text-[11px] text-[#6b7280] font-medium">
              Conversations with buyers
            </p>
          </div>
        </div>

        <Input
          placeholder="Search by buyer or product..."
          className="h-8 text-xs rounded-xl bg-gray-50 border-gray-100"
        />

        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
              Pending
            </p>
            {grouped.pending.length === 0 && (
              <p className="text-[11px] text-gray-400 mb-2">No pending threads</p>
            )}
            {grouped.pending.map(renderThreadItem)}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
              In progress
            </p>
            {grouped.inProgress.length === 0 && (
              <p className="text-[11px] text-gray-400 mb-2">No active orders</p>
            )}
            {grouped.inProgress.map(renderThreadItem)}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
              Closed
            </p>
            {grouped.closed.length === 0 && (
              <p className="text-[11px] text-gray-400 mb-2">No closed threads</p>
            )}
            {grouped.closed.map(renderThreadItem)}
          </div>
        </div>
      </aside>

      {/* Main conversation panel */}
      <main className="flex-1 p-8 flex flex-col gap-4">
        {loadingThreads && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading threads…</p>
          </div>
        )}

        {!loadingThreads && !selectedThread && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
            <MessageSquare size={36} className="mb-3" />
            <p className="text-sm font-semibold">No conversations yet</p>
            <p className="text-xs mt-1 max-w-xs">
              When buyers start a chat from your product pages or cart, they will appear here.
            </p>
          </div>
        )}

        {selectedThread && (
          <div className="flex-1 flex flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFB]">
              <div>
                <p className="text-xs font-bold text-[#111827]">
                  {selectedThread.buyer.name || selectedThread.buyer.email || "Buyer"}
                </p>
                <p className="text-[11px] text-[#6b7280]">
                  {selectedThread.product.title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {status === "CLOSED" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 size={14} /> Closed
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock size={12} />{" "}
                  {new Date(selectedThread.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-2 bg-white">
              {messages.map((m) => {
                const mine = currentUserId && m.senderId === currentUserId
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs ${
                        mine
                          ? "bg-[#111827] text-white rounded-br-sm"
                          : "bg-[#F4F4F5] text-[#111827] rounded-bl-sm"
                      }`}
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[10px] font-semibold text-[#6b7280]">
                          {m.senderName || "Buyer"}
                        </p>
                      )}
                      <p>{m.content}</p>
                    </div>
                  </div>
                )
              })}

              {messages.length === 0 && (
                <p className="text-[11px] text-gray-400 text-center mt-10">
                  No messages yet. Say hello to the buyer to get started.
                </p>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-3 bg-white">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={status === "CLOSED" ? "Thread is closed" : "Reply to buyer…"}
                className="h-9 text-xs"
                disabled={status === "CLOSED"}
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-[#111827] text-white"
                onClick={handleSend}
                disabled={sending || !input.trim() || status === "CLOSED"}
              >
                <MessageSquare size={14} />
              </Button>
            </div>

            {/* Footer actions */}
            <div className="px-4 pb-3 flex items-center justify-between text-[11px] text-gray-500 bg-white">
              {isSeller && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-6 rounded-full text-[10px]"
                    onClick={() => handleChangeStatus("IN_PROGRESS")}
                    disabled={status !== "OPEN"}
                  >
                    Start order
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-6 rounded-full text-[10px]"
                    onClick={() => handleChangeStatus("CLOSED")}
                    disabled={status === "CLOSED"}
                  >
                    Close thread
                  </Button>
                </div>
              )}
              <span>Status: {status.replace("_", " ").toLowerCase()}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

