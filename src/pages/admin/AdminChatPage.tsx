import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ChatMessage from "../../components/AIchatbot/ChatMessage";

interface MessagePreview {
  id: number;
  name: string;
  lastMessage: string;
  avatarUrl?: string;
  isActive?: boolean;
}

interface ChatThreadMessage {
  id: number;
  role: "user" | "admin";
  content: string;
  timestamp?: string;
}

type MessagesByUserId = Record<number, ChatThreadMessage[]>;

const dummyRecentMessages: MessagePreview[] = [
  {
    id: 1,
    name: "Faris Meika Adz-daky",
    lastMessage: "cur iki yopo cur",
    avatarUrl:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "M Rasya Zildan",
    lastMessage: "wuhuhuhu",
    avatarUrl:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    name: "Fawwaz",
    lastMessage: "😂😂😂😂😂😂",
    avatarUrl:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    name: "Revina Okta",
    lastMessage: "kak tolong cek di menu landing page nya karena ada salah di penggunaan color pallete nya",
    avatarUrl:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const dummyThreadMessages: ChatThreadMessage[] = [
  {
    id: 1,
    role: "user",
    content: "Halo kak, saya mau tanya tentang paket liburan di Bali.",
    timestamp: "10:21",
  },
  {
    id: 2,
    role: "admin",
    content: "Halo, selamat siang! Untuk paket Bali yang mana ya kak?",
    timestamp: "10:22",
  },
  {
    id: 3,
    role: "user",
    content: "Yang 3 hari 2 malam kak, yang ada Ubud dan Nusa Penida.",
    timestamp: "10:23",
  },
  {
    id: 4,
    role: "admin",
    content: "Baik, saya kirim detail itinerary dan harganya di sini ya kak.",
    timestamp: "10:24",
  },
];

const initialMessagesByUser: MessagesByUserId = {
  1: [
    {
      id: 1,
      role: "user",
      content: "cur iki yopo cur",
      timestamp: "09:50",
    },
    {
      id: 2,
      role: "admin",
      content: "Halo kak, boleh ceritain sedikit detailnya?",
      timestamp: "09:51",
    },
  ],
  2: dummyThreadMessages,
  3: [
    {
      id: 1,
      role: "user",
      content: "😂😂😂😂😂😂",
      timestamp: "11:05",
    },
  ],
  4: [
    {
      id: 1,
      role: "user",
      content: "kak tolong cek di menu landing page nya karena ada salah di penggunaan color pallete nya",
      timestamp: "08:30",
    },
    {
      id: 2,
      role: "admin",
      content: "Baik kak, nanti saya cek ulang section landing page-nya ya.",
      timestamp: "08:32",
    },
  ],
};

const AdminChatPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("chat");
  const [activeUser, setActiveUser] = useState<number>(2);
  const [messagesByUser, setMessagesByUser] = useState<MessagesByUserId>(
    initialMessagesByUser
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigate = useNavigate();

  const activeUserData = dummyRecentMessages.find((u) => u.id === activeUser);

   const currentThread = messagesByUser[activeUser] ?? [];

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setMessagesByUser((prev) => {
      const prevThread = prev[activeUser] ?? [];
      const nextMessage: ChatThreadMessage = {
        id: prevThread.length ? prevThread[prevThread.length - 1].id + 1 : 1,
        role: "admin",
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      return {
        ...prev,
        [activeUser]: [...prevThread, nextMessage],
      };
    });
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        active={activeMenu}
        landingActiveKey={activeMenu === "landing" ? "hero" : undefined}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "landing") {
            navigate("/admin/landing/hero");
          } else if (key === "users") {
            navigate("/admin/users");
          } else if (key === "shop") {
            navigate("/admin/shop");
          } else if (key === "blog") {
            navigate("/admin/blog");
          } else if (key === "transactions") {
            navigate("/admin/transactions");
          }
        }}
        onNavigateLandingSub={(subKey) => {
          if (subKey === "hero") {
            setActiveMenu("landing");
            navigate("/admin/landing/hero");
          }
        }}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
        {/* Header */}
        <AdminHeader title="Chat" />

        {/* Search */}
        <div className="mb-5 max-auto w-full">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-slate-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Main chat card */}
        <div className="flex flex-1 min-h-0 gap-4">
          {/* Recent messages */}
          <div className="flex w-72 flex-col rounded-3xl bg-white shadow-lg border border-slate-100 h-full">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Recent Message
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {dummyRecentMessages.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {dummyRecentMessages
                .filter((item) => {
                  const query = searchQuery.trim().toLowerCase();
                  if (!query) return true;

                  const nameMatch = item.name.toLowerCase().includes(query);
                  const thread = messagesByUser[item.id] ?? [];
                  const textMatch = thread.some((msg) =>
                    msg.content.toLowerCase().includes(query)
                  );

                  return nameMatch || textMatch;
                })
                .map((item) => {
                const isActive = item.id === activeUser;
                const thread = messagesByUser[item.id] ?? [];
                const last = thread[thread.length - 1];

                const lastText = last?.content ?? item.lastMessage;
                const lastTime = last?.timestamp ?? "";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveUser(item.id)}
                    className={`group flex w-full items-center px-4 py-2.5 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="relative mr-3 h-9 w-9 flex-shrink-0">
                      <div
                        className={`h-9 w-9 rounded-full border shadow-sm overflow-hidden ${
                          isActive
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-100 bg-slate-200"
                        }`}
                      >
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                          isActive ? "bg-emerald-400" : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {item.name}
                        </span>
                        {lastTime && !isActive && (
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-500">
                            {lastTime}
                          </span>
                        )}
                      </div>
                      <div
                        className={`truncate text-[11px] mt-0.5 ${
                          isActive ? "text-blue-50" : "text-slate-400"
                        }`}
                      >
                        {lastText}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col min-w-0 min-h-0">
            {/* Chat header */}
            <div className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-800">
              {activeUserData?.name ?? "Select a user"}
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-6 py-4 text-sm">
              {currentThread.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.content}
                  role={msg.role}
                  name={msg.role === "user" ? activeUserData?.name ?? "User" : "Admin"}
                  timestamp={msg.timestamp}
                  avatar={
                    msg.role === "user"
                      ? activeUserData?.avatarUrl
                      : "/rizwords-nomad.jpg"
                  }
                  align={msg.role === "admin" ? "right" : "left"}
                  theme="light"
                />
              ))}
            </div>

            {/* Input area */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center rounded-full bg-slate-50 px-4 py-2">
                <input
                  type="text"
                  placeholder="Type here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
