import React, { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  FileText,
  ReceiptText,
  MessagesSquare,
  Users,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

export type AdminSidebarItemKey =
  | "dashboard"
  | "landing"
  | "portfolio"
  | "shop"
  | "transactions"
  | "blog"
  | "chat"
  | "users";

type LandingSubKey =
  | "hero"
  | "travel"
  | "about"
  | "services"
  | "portfolio"
  | "testimonials"
  | "contact"
  | "footer"
  | "certServices"
  | "experience"
  | "faq";

interface AdminSidebarProps {
  active: AdminSidebarItemKey;
  onNavigate?: (key: AdminSidebarItemKey) => void;
  landingActiveKey?: LandingSubKey;
  onNavigateLandingSub?: (key: LandingSubKey) => void;
}

const menuItems: { key: AdminSidebarItemKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "landing", label: "Landing Page", icon: Layers },
  { key: "shop", label: "Shop", icon: ShoppingBag },
  { key: "transactions", label: "Transactions", icon: ReceiptText },
  { key: "blog", label: "Blog Articles", icon: FileText },
  { key: "chat", label: "Chat", icon: MessagesSquare },
  { key: "users", label: "User List", icon: Users },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  active,
  onNavigate,
  landingActiveKey,
  onNavigateLandingSub,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Submenu Landing dianggap "terbuka" hanya ketika
  // sedang berada di salah satu halaman Landing (active === "landing")
  // dan ada landingActiveKey yang dikirim dari halaman tersebut.
  const isLandingOpen = active === "landing" && !!landingActiveKey;

  return (
    <aside
      className={`relative h-screen bg-white border-r border-slate-100 flex flex-col py-6 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute -right-3 top-14 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-md transition-colors border border-slate-200 bg-white"
      >
        <ChevronLeft
          className={`h-4 w-4 transform transition-transform duration-300 text-slate-600 ${
            isCollapsed ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Header Section */}
      <div className="px-3 flex justify-center">
        <div
          className={`flex w-full items-center rounded-xl ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white text-[11px] font-semibold">
            R
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">Rizwords</div>
              <div className="mt-0.5 text-[11px] text-slate-500 truncate">Admin Panel</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-b border-slate-100" />

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => {
                  onNavigate?.(item.key);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center min-w-0">
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />

                  {/* Label, hidden when collapsed */}
                  <span
                    className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                      isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Arrow for items with submenu (Landing) */}
                {item.key === "landing" && !isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                      isLandingOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                )}
              </button>

              {/* Landing Page sub menu */}
              {item.key === "landing" && !isCollapsed && isLandingOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  {/* Hero */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("hero")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "hero"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>Hero</span>
                  </button>

                  {/* Travel Journal */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("travel")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "travel"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>Travel Journal</span>
                  </button>

                  {/* About */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("about")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "about"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>About</span>
                  </button>

                  {/* Portfolio */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("portfolio")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "portfolio"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>Portfolio</span>
                  </button>

                  {/* Certifications & Services */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("certServices")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "certServices"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>Certifications & Services</span>
                  </button>

                  {/* Experience */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("experience")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "experience"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>Experience</span>
                  </button>

                  {/* FAQ */}
                  <button
                    type="button"
                    onClick={() => onNavigateLandingSub?.("faq")}
                    className={`flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      landingActiveKey === "faq"
                        ? "bg-blue-500/10 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>FAQ</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
