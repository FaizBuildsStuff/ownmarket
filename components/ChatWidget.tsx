"use client"

import { useEffect, useRef, useState } from "react"
import { MessageSquare, X, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatMessage = {
  id: string
  content: string
  createdAt: string
  senderId: string
  senderName: string | null
}

type ChatStatus = "OPEN" | "IN_PROGRESS" | "CLOSED"

type Props = {
  productId: string
  sellerId: string
  sellerName?: string | null
}

export function ChatWidget({ productId, sellerId, sellerName }: Props) {
  const [open, setOpen] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<ChatStatus>("OPEN")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "SELLER" | "BUYER" | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/messages?threadId=${id}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages ?? [])
      if (data.thread?.status) setStatus(data.thread.status)
    } catch {
      // ignore
    }
  }

  const startOrOpenChat = async () => {
    if (threadId) {
      setOpen(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, sellerId }),
      })
      const data = await res.json()
      if (res.ok) {
        setThreadId(data.thread.id)
        setMessages(data.messages ?? [])
        setStatus(data.thread.status)
        setCurrentUserId(data.currentUserId)
        setCurrentRole(data.currentUserRole)
        setOpen(true)
      } else {
        alert(data.message || "Unable to start chat")
      }
    } catch {
      alert("Unable to start chat")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!threadId || !input.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content: input.trim() }),
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
    if (!threadId) return
    try {
      const res = await fetch("/api/chat/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, status: next }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(data.thread.status)
      } else {
        alert(data.message || "Could not update status")
      }
    } catch {
      alert("Could not update status")
    }
  }

  useEffect(() => {
    if (!open || !threadId) return

    // initial fetch
    fetchMessages(threadId).then(scrollToBottom)

    pollRef.current = setInterval(() => {
      fetchMessages(threadId)
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, threadId])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages.length])

  const isSeller = currentRole === "SELLER" || currentRole === "ADMIN"

  return (
    <>
      <Button
        variant="outline"
        className="h-20 w-20 rounded-[24px] border-gray-100 hover:bg-gray-50 shrink-0"
        onClick={startOrOpenChat}
        disabled={loading}
      >
        <MessageSquare size={24} />
      </Button>

      {open && (
        <div className="fixed bottom-4 right-4 z-[120] w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#FAFAFB]">
            <div>
              <p className="text-xs font-bold text-[#767F88] uppercase tracking-[0.16em]">
                Chat with seller
              </p>
              <p className="text-sm font-semibold text-[#141519] truncate max-w-[200px]">
                {sellerName || "Seller"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {status === "CLOSED" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#16a34a]">
                  <CheckCircle2 size={12} /> Closed
                </span>
              )}
              <button
                className="text-gray-400 hover:text-black"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 px-3 py-2 overflow-y-auto max-h-80 space-y-2 text-sm">
            {messages.map((m) => {
              const mine = currentUserId && m.senderId === currentUserId
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                      mine
                        ? "bg-[#141519] text-white rounded-br-sm"
                        : "bg-[#F4F4F5] text-[#141519] rounded-bl-sm"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-semibold text-[#6b7280]">
                        {m.senderName || "Seller"}
                      </p>
                    )}
                    <p>{m.content}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 px-3 py-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={status === "CLOSED" ? "Chat is closed" : "Type a message…"}
                className="h-9 text-xs"
                disabled={status === "CLOSED"}
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-[#141519] text-white"
                onClick={handleSend}
                disabled={sending || !input.trim() || status === "CLOSED"}
              >
                <ArrowRight size={14} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {isSeller ? (
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 rounded-full text-[10px]"
                  onClick={() => handleChangeStatus("IN_PROGRESS")}
                  disabled={status !== "OPEN"}
                >
                  Start order
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 rounded-full text-[10px]"
                  onClick={() => handleChangeStatus("CLOSED")}
                  disabled={status === "CLOSED"}
                >
                  Mark as received & close
                </Button>
              )}
              <span className="text-[9px] text-[#9ca3af]">
                Status: {status.replace("_", " ").toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

