"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircleMore, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Contact
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Get in touch
        </h1>
        <p className="text-sm text-zinc-600">
          Send us a message and we’ll get back to you as soon as we can. For urgent help, open a ticket in our Discord.
        </p>
      </header>

      {status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-emerald-900">Message sent</h2>
              <p className="mt-1 text-emerald-800">
                Thanks for reaching out. We’ll reply to {email} as soon as we can. You can also join our Discord for faster support.
              </p>
              <Link
                href="/discord"
                className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:underline"
              >
                <MessageCircleMore className="h-4 w-4" />
                Join Discord
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-[11px] font-medium text-zinc-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="Your name"
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-[11px] font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="you@example.com"
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label htmlFor="subject" className="text-[11px] font-medium text-zinc-700">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="What is this about?"
              disabled={status === "sending"}
            />
          </div>

          <div>
            <label htmlFor="message" className="text-[11px] font-medium text-zinc-700">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="Your message..."
              disabled={status === "sending"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={status === "sending"}
              className="rounded-full px-4"
            >
              {status === "sending" ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send message
                </>
              )}
            </Button>
            <Link
              href="/support"
              className="text-xs text-zinc-500 hover:text-zinc-900"
            >
              Back to support
            </Link>
          </div>
        </form>
      )}

      <p className="text-xs text-zinc-500">
        Need faster help?{" "}
        <Link href="/discord" className="font-medium text-indigo-600 hover:underline">
          Join our Discord
        </Link>{" "}
        and open a support ticket.
      </p>
    </div>
  );
}
