"use client";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Trash2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export default function ChatInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history
  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    queryFn: async () => {
      const response = await fetch("/api/chat/history");
      if (!response.ok) {
        return { messages: [] };
      }
      return response.json();
    },
    retry: false,
    staleTime: 30 * 1000,
    onSuccess: (data) => {
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }
      return response.json();
    },
    onMutate: async (content) => {
      // Optimistically add user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Add loading message
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMessage]);
    },
    onSuccess: (data) => {
      // Remove loading message and add actual response
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: data.id || `msg-${Date.now()}`,
            role: "assistant",
            content: data.response || data.message || "No response received",
            timestamp: new Date(data.timestamp || Date.now()),
          },
        ];
      });
      setInput("");
      inputRef.current?.focus();
    },
    onError: (error: any) => {
      // Remove loading message on error
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/chat/clear", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to clear chat");
      }
      return response.json();
    },
    onSuccess: () => {
      setMessages([]);
      toast({
        title: "Chat Cleared",
        description: "All messages have been cleared",
      });
    },
    onError: () => {
      // Clear locally even if API fails
      setMessages([]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b0d]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111318]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#0a0b0d]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#f5f5f7]">AI Assistant</h2>
            <p className="text-xs text-[#8e919a]">Ask me anything about your leads, analytics, or platform</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchHistory()}
            className="text-[#8e919a] hover:text-[#f5f5f7] hover:bg-[#181b22]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearChatMutation.mutate()}
            className="text-[#8e919a] hover:text-[#f5f5f7] hover:bg-[#181b22]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#0a0b0d]" />
            </div>
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-[#8e919a] max-w-md">
              Ask me about your leads, conversion rates, analytics, or anything else about your platform.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
              {[
                "Show me recent leads",
                "What's my conversion rate?",
                "Analyze my top performing sources",
                "Generate a report",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="p-3 text-sm text-left bg-[#14161c] border border-white/5 rounded-lg hover:border-[#00d4aa]/30 hover:bg-[#181b22] transition-all text-[#8e919a] hover:text-[#f5f5f7]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[#0a0b0d]" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d]"
                    : "bg-[#14161c] border border-white/5 text-[#f5f5f7]"
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-[#0a0b0d]/70"
                          : "text-[#8e919a]"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-[#111318]">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1 bg-[#181b22] border-white/5 text-[#f5f5f7] placeholder:text-[#5a5d66] focus:border-[#00d4aa]/30"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-[#5a5d66] mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
