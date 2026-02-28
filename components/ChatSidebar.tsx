"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, UserCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    fetchMessagesAction,
    sendMessageAction,
    markConversationReadAction,
    transferFundsAction
} from "@/app/chat-actions";
import { formatDistanceToNow } from "date-fns";
import qs from "query-string";

export type ChatUser = {
    id: string;
    username: string | null;
    discordUsername: string | null;
    discordAvatar: string | null;
    discordId: string | null;
};

export type MessageItem = {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date | null;
    isRead: boolean | null;
};

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string | null;
    currentUserId: string | null;
    otherUser: ChatUser | null;
    status: "pending" | "open" | "completed";
    productName: string | null;
    isBuyer: boolean;
}

export function ChatSidebar({
    isOpen,
    onClose,
    conversationId,
    currentUserId,
    otherUser,
    status,
    productName,
    isBuyer
}: ChatSidebarProps) {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [inputText, setInputText] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isOpen || !conversationId) return;

        let mounted = true;

        const loadMessages = async () => {
            try {
                if (loading && messages.length === 0) return;
                if (messages.length === 0) setLoading(true);

                const data = await fetchMessagesAction(conversationId);
                if (mounted) {
                    setMessages(data);
                    setLoading(false);
                    await markConversationReadAction(conversationId);
                }
            } catch (e) {
                console.error("Failed to load messages", e);
                if (mounted) setLoading(false);
            }
        };

        loadMessages();

        // Short-polling to simulate real-time chat (every 3 seconds)
        const interval = setInterval(loadMessages, 3000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [isOpen, conversationId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !conversationId) return;

        const tempId = `temp-${Date.now()}`;
        const newMsg: MessageItem = {
            id: tempId,
            content: inputText,
            senderId: currentUserId || "",
            createdAt: new Date(),
            isRead: false,
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputText("");
        setSending(true);

        try {
            const savedMsg = await sendMessageAction(conversationId, newMsg.content);
            setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMsg : m)));
        } catch (e) {
            console.error("Failed to send message", e);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
        } finally {
            setSending(false);
            scrollToBottom();
        }
    };

    const handleTransferFunds = async () => {
        if (!conversationId || !isBuyer) return;

        // In a real app this would trigger Stripe checkout or crypto transfer
        // Here we simulate it
        const confirmed = window.confirm("Are you sure you want to transfer simulated funds to this seller? This assumes you have received the item.");
        if (!confirmed) return;

        setTransferring(true);
        try {
            // Simulate transfer for the UX demo
            await transferFundsAction(conversationId, Number((Math.random() * 50 + 10).toFixed(2))); // random amount for demo
            window.location.reload(); // Refresh to see completed state
        } catch (err) {
            console.error(err);
            alert("Failed to transfer funds");
        } finally {
            setTransferring(false);
        }
    };

    const avatarUrl = otherUser?.discordAvatar && otherUser?.discordId
        ? `https://cdn.discordapp.com/avatars/${otherUser.discordId}/${otherUser.discordAvatar}.png?size=128`
        : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl sm:w-[400px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full border border-zinc-200 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                                        <UserCircle2 className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-semibold text-zinc-900 leading-tight">
                                        {otherUser?.username || "Unknown"}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] text-zinc-500">
                                            {otherUser?.discordUsername ? `@${otherUser.discordUsername}` : "Active"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-600">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Context bar */}
                        {productName && (
                            <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-100 flex items-center gap-2">
                                <span className="rounded-md bg-indigo-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                    RE
                                </span>
                                <span className="truncate text-xs font-medium text-zinc-700">
                                    {productName}
                                </span>
                            </div>
                        )}

                        {/* Status bar */}
                        {status === "completed" && (
                            <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-emerald-100">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-800">
                                    Order Completed & Funds Transferred
                                </span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-[#fafafa]">
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center opacity-60">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                        <Send className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-600">No messages yet</p>
                                        <p className="text-xs text-zinc-400 px-8">Send a message to start the conversation.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderId === currentUserId;
                                        const isSystem = msg.content.startsWith("💸");

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id} className="flex justify-center my-6">
                                                    <div className="bg-amber-50 border border-amber-200/50 rounded-2xl px-4 py-2 flex items-center gap-2 max-w-[90%] shadow-sm">
                                                        <span className="text-xs font-medium text-amber-800 text-center leading-relaxed">
                                                            {msg.content}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${isMe
                                                            ? "bg-indigo-600 text-white rounded-tr-sm"
                                                            : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-sm"
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="mt-1 px-1 text-[9px] text-zinc-400 font-medium">
                                                    {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {status !== "completed" ? (
                            <div className="bg-white px-4 py-3 border-t border-zinc-100">
                                <form
                                    onSubmit={handleSend}
                                    className="flex items-end gap-2"
                                >
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all scrollbar-hide"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e as any);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!inputText.trim() || sending}
                                        size="icon"
                                        className="h-11 w-11 rounded-full bg-indigo-600 shrink-0 hover:bg-indigo-500 transition-colors shadow-sm"
                                    >
                                        {sending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 ml-0.5" />
                                        )}
                                    </Button>
                                </form>

                                {isBuyer && status === "open" && (
                                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                                        <p className="text-[10px] text-zinc-400 leading-tight">
                                            Waiting for seller to deliver the item via Discord or chat.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={handleTransferFunds}
                                            disabled={transferring}
                                            className="shrink-0 rounded-full h-8 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-sm border border-amber-600/20"
                                        >
                                            {transferring ? "Processing..." : "Release Funds"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-zinc-50 px-4 py-4 border-t border-zinc-100 text-center">
                                <p className="text-xs text-zinc-500 font-medium">This order has been completed and locked.</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
