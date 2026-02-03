import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";
import { ChevronDown } from "lucide-react";
import TransactionReceiptModal from "../../../components/admin/TransactionReceiptModal";

type TransactionStatus = "paid" | "processing" | "refunded" | "cancelled";

type PaymentMethod = "bank_transfer" | "qris" | "credit_card" | "ewallet";

type TransactionRow = Record<string, unknown> & {
  id: number;
  trxCode: string;
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerService: string;
  grossAmount: number;
  adminFee: number;
  netAmount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  paidStatus: "paid" | "unpaid";
  date: string;
};

const StatusDropdownCell: React.FC<{
  id: number;
  value: TransactionStatus;
  openStatusId: number | null;
  setOpenStatusId: React.Dispatch<React.SetStateAction<number | null>>;
  setStatusOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateTransactionStatus: (id: number, nextStatus: TransactionStatus) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({
  id,
  value,
  openStatusId,
  setOpenStatusId,
  setStatusOpen,
  setRangeOpen,
  updateTransactionStatus,
  setCurrentPage,
}) => {
  const map: Record<TransactionStatus, { label: string; cls: string }> = {
    paid: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    processing: { label: "Dalam Proses", cls: "bg-blue-50 text-blue-700 border-blue-100" },
    refunded: { label: "Refund", cls: "bg-amber-50 text-amber-800 border-amber-100" },
    cancelled: { label: "Dibatalkan", cls: "bg-rose-50 text-rose-700 border-rose-100" },
  };

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const isOpen = openStatusId === id;
  const m = map[value] ?? map.processing;

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = btnRef.current;
    if (!el) return;

    const updatePos = () => {
      const r = el.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 8, width: r.width });
    };

    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isOpen]);

  return (
    <>
      <div data-status-dropdown="true" className="relative inline-flex">
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            setOpenStatusId((prev) => (prev === id ? null : id));
            setStatusOpen(false);
            setRangeOpen(false);
          }}
          className={`relative h-8 rounded-full border px-2.5 pr-7 text-[9px] font-medium shadow-xs hover:opacity-90 transition-colors inline-flex items-center gap-2 ${m.cls}`}
        >
          <span className="whitespace-nowrap">{m.label}</span>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-3 w-3" />
          </span>
        </button>
      </div>

      {isOpen &&
        pos &&
        createPortal(
          <div
            data-status-dropdown="true"
            className="fixed z-[1000] w-44 rounded-2xl border border-slate-200 bg-white shadow-lg p-2"
            style={{ left: pos.left, top: pos.top }}
          >
            {(
              [
                { label: "Dalam Proses", value: "processing" as const },
                { label: "Selesai", value: "paid" as const },
                { label: "Refund", value: "refunded" as const },
                { label: "Dibatalkan", value: "cancelled" as const },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateTransactionStatus(id, opt.value);
                  setCurrentPage(1);
                  setOpenStatusId(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                  value === opt.value ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

const formatRupiah = (value: number) => {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
};

const AdminTransactionsPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("transactions");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [rangeFilter, setRangeFilter] = useState<"7d" | "30d" | "this_month" | "all">("7d");

  const [statusOpen, setStatusOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  const [openStatusId, setOpenStatusId] = useState<number | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptId, setReceiptId] = useState<number | null>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (target instanceof Element) {
        if (target.closest('[data-status-dropdown="true"]')) return;
      }

      setOpenStatusId(null);

      if (!filtersRef.current) return;
      if (!filtersRef.current.contains(target)) {
        setStatusOpen(false);
        setRangeOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const [transactions, setTransactions] = useState<TransactionRow[]>([
    {
      id: 1,
      trxCode: "TRX-2025-001",
      orderCode: "ORD-20250121-001",
      buyerName: "John Doe",
      buyerEmail: "john@example.com",
      sellerName: "Khan Ahsam",
      sellerService: "SEO content writer untuk penulisan artikel",
      grossAmount: 843750,
      adminFee: 84375,
      netAmount: 759375,
      status: "paid",
      paymentMethod: "credit_card",
      paidStatus: "paid",
      date: "21 Jan 2025",
    },
    {
      id: 2,
      trxCode: "TRX-2025-002",
      orderCode: "ORD-20250121-002",
      buyerName: "Sarah Wilson",
      buyerEmail: "sarah@example.com",
      sellerName: "Design Studio",
      sellerService: "Desain logo profesional",
      grossAmount: 2250000,
      adminFee: 225000,
      netAmount: 2025000,
      status: "paid",
      paymentMethod: "ewallet",
      paidStatus: "paid",
      date: "21 Jan 2025",
    },
    {
      id: 3,
      trxCode: "TRX-2025-003",
      orderCode: "ORD-20250120-003",
      buyerName: "Michael Chen",
      buyerEmail: "michael@example.com",
      sellerName: "WebDev Pro",
      sellerService: "Pengembangan website landing page",
      grossAmount: 7500000,
      adminFee: 750000,
      netAmount: 6750000,
      status: "processing",
      paymentMethod: "bank_transfer",
      paidStatus: "paid",
      date: "20 Jan 2025",
    },
    {
      id: 4,
      trxCode: "TRX-2025-004",
      orderCode: "ORD-20250120-004",
      buyerName: "Emma Johnson",
      buyerEmail: "emma@example.com",
      sellerName: "Social Media Expert",
      sellerService: "Manajemen media sosial (1 bulan)",
      grossAmount: 1125000,
      adminFee: 112500,
      netAmount: 1012500,
      status: "cancelled",
      paymentMethod: "credit_card",
      paidStatus: "unpaid",
      date: "20 Jan 2025",
    },
    {
      id: 5,
      trxCode: "TRX-2025-005",
      orderCode: "ORD-20250119-005",
      buyerName: "David Lee",
      buyerEmail: "david@example.com",
      sellerName: "Video Pro Studio",
      sellerService: "Editing video cinematic",
      grossAmount: 3000000,
      adminFee: 300000,
      netAmount: 2700000,
      status: "paid",
      paymentMethod: "ewallet",
      paidStatus: "paid",
      date: "19 Jan 2025",
    },
    {
      id: 6,
      trxCode: "TRX-2025-006",
      orderCode: "ORD-20250119-006",
      buyerName: "Lisa Anderson",
      buyerEmail: "lisa@example.com",
      sellerName: "SEO Specialist",
      sellerService: "Optimasi SEO on-page",
      grossAmount: 1800000,
      adminFee: 180000,
      netAmount: 1620000,
      status: "refunded",
      paymentMethod: "qris",
      paidStatus: "paid",
      date: "19 Jan 2025",
    },
  ]);

  const updateTransactionStatus = useCallback((id: number, nextStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: nextStatus,
        };
      })
    );
  }, []);

  const receiptData = useMemo(() => {
    if (receiptId == null) return null;
    return transactions.find((t) => t.id === receiptId) ?? null;
  }, [receiptId, transactions]);

  const referenceNow = useMemo(() => {
    const parsed = transactions
      .map((x) => new Date(x.date))
      .filter((d) => !Number.isNaN(d.getTime()));

    if (parsed.length === 0) return new Date();

    parsed.sort((a, b) => b.getTime() - a.getTime());
    return parsed[0];
  }, [transactions]);

  const rangeMatch = useCallback(
    (dateText: string) => {
      if (rangeFilter === "all") return true;
      const now = referenceNow;

      const parsed = new Date(dateText);
      const date = Number.isNaN(parsed.getTime()) ? null : parsed;
      if (!date) return true;

      if (rangeFilter === "7d") {
        const from = new Date(now);
        from.setDate(from.getDate() - 7);
        return date >= from && date <= now;
      }

      if (rangeFilter === "30d") {
        const from = new Date(now);
        from.setDate(from.getDate() - 30);
        return date >= from && date <= now;
      }

      if (rangeFilter === "this_month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return date >= from && date <= to;
      }

      return true;
    },
    [rangeFilter, referenceNow]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!rangeMatch(t.date)) return false;

      if (!q) return true;
      const haystack = `${t.trxCode} ${t.orderCode} ${t.buyerName} ${t.buyerEmail} ${t.sellerName} ${t.sellerService}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rangeMatch, search, statusFilter, transactions]);

  const columns: Column[] = useMemo(
    () => [
      {
        header: "Transaksi",
        accessor: "trxCode",
        type: "text",
        render: (value, row) => (
          <div className="min-w-[200px]">
            <button
              type="button"
              onClick={() => {
                setReceiptId(row.id as number);
                setReceiptOpen(true);
              }}
              className="text-left text-[11px] font-semibold text-slate-800 hover:text-blue-600"
            >
              {String(value)}
            </button>
            <div className="mt-0.5 text-[10px] text-slate-400">{String(row.orderCode ?? "")}</div>
          </div>
        ),
      },
      {
        header: "Pembeli",
        accessor: "buyerName",
        type: "text",
        render: (value, row) => (
          <div className="min-w-[180px]">
            <div className="text-[11px] font-semibold text-slate-800">{String(value)}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">{String(row.buyerEmail ?? "")}</div>
          </div>
        ),
      },
      {
        header: "Penyedia",
        accessor: "sellerName",
        type: "textarea",
        render: (value, row) => (
          <div className="w-full">
            <div className="text-[11px] font-semibold text-slate-800">{String(value)}</div>
            <div className="mt-0.5 text-[10px] text-slate-400 whitespace-normal break-words line-clamp-4">
              {String(row.sellerService ?? "")}
            </div>
          </div>
        ),
      },
      {
        header: "Nominal",
        accessor: "grossAmount",
        type: "text",
        render: (value, row) => {
          const gross = Number(value ?? 0);
          const adminFee = Number(row.adminFee ?? 0);
          const totalBayar = gross + adminFee;

          return (
            <div className="min-w-[160px]">
              <div className="text-[11px] font-semibold text-slate-800">{formatRupiah(totalBayar)}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">Harga: {formatRupiah(gross)}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">Biaya Admin: {formatRupiah(adminFee)}</div>
            </div>
          );
        },
      },
      {
        header: "Status",
        accessor: "status",
        type: "text",
        render: (value, row) => {
          const v = String(value) as TransactionStatus;
          const id = Number(row.id);
          return (
            <StatusDropdownCell
              id={id}
              value={v}
              openStatusId={openStatusId}
              setOpenStatusId={setOpenStatusId}
              setStatusOpen={setStatusOpen}
              setRangeOpen={setRangeOpen}
              updateTransactionStatus={updateTransactionStatus}
              setCurrentPage={setCurrentPage}
            />
          );
        },
      },
      {
        header: "Pembayaran",
        accessor: "paymentMethod",
        type: "text",
        render: (value, row) => {
          const method = String(value) as PaymentMethod;
          const paid = String(row.paidStatus ?? "unpaid") === "paid";

          const methodLabel: Record<PaymentMethod, string> = {
            bank_transfer: "Transfer Bank",
            qris: "QRIS",
            credit_card: "Kartu Kredit",
            ewallet: "E-Wallet",
          };

          return (
            <div className="min-w-[140px]">
              <div className="text-[11px] font-medium text-slate-700">{methodLabel[method] ?? method}</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    paid ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {paid ? "Lunas" : "Belum"}
                </span>
              </div>
            </div>
          );
        },
      },
      { header: "Tanggal", accessor: "date", type: "date" },
    ],
    [openStatusId, updateTransactionStatus]
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-44" rows={7} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
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
            setActiveMenu("landing");
            if (subKey === "hero") {
              navigate("/admin/landing/hero");
            } else if (subKey === "travel") {
              navigate("/admin/landing/travel-journal");
            } else if (subKey === "about") {
              navigate("/admin/landing/about");
            } else if (subKey === "portfolio") {
              navigate("/admin/landing/portfolio");
            } else if (subKey === "certServices") {
              navigate("/admin/landing/cert-services");
            } else if (subKey === "experience") {
              navigate("/admin/landing/experience");
            } else if (subKey === "faq") {
              navigate("/admin/landing/faq");
            }
          }}
        />

        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <div>
            <AdminHeader title="Manajemen Transaksi" />
            <p className="-mt-4 text-xs text-slate-500">Kelola semua transaksi dan pembayaran</p>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
            <section className="rounded-2xl border border-slate-100 bg-white shadow-xs p-4">
              <AdminTableHeader
                placeholder="Cari transaksi, pembeli, penyedia..."
                onSearchChange={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                onExportClick={() => {}}
                rightSlot={
                  <div ref={filtersRef} className="relative flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusOpen((v) => !v);
                          setRangeOpen(false);
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="whitespace-nowrap">
                          {statusFilter === "all"
                            ? "Semua Status"
                            : statusFilter === "paid"
                              ? "Selesai"
                              : statusFilter === "processing"
                                ? "Dalam Proses"
                                : statusFilter === "refunded"
                                  ? "Refund"
                                  : "Dibatalkan"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </button>

                      {statusOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                          {(
                            [
                              { label: "Semua Status", value: "all" as const },
                              { label: "Selesai", value: "paid" as const },
                              { label: "Dalam Proses", value: "processing" as const },
                              { label: "Refund", value: "refunded" as const },
                              { label: "Dibatalkan", value: "cancelled" as const },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setCurrentPage(1);
                                setStatusOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                statusFilter === opt.value
                                  ? "bg-sky-50 text-sky-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setRangeOpen((v) => !v);
                          setStatusOpen(false);
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="whitespace-nowrap">
                          {rangeFilter === "7d"
                            ? "7 Hari Terakhir"
                            : rangeFilter === "30d"
                              ? "30 Hari Terakhir"
                              : rangeFilter === "this_month"
                                ? "Bulan Ini"
                                : "Semua Waktu"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </button>

                      {rangeOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                          {(
                            [
                              { label: "7 Hari Terakhir", value: "7d" as const },
                              { label: "30 Hari Terakhir", value: "30d" as const },
                              { label: "Bulan Ini", value: "this_month" as const },
                              { label: "Semua Waktu", value: "all" as const },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setRangeFilter(opt.value);
                                setCurrentPage(1);
                                setRangeOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                rangeFilter === opt.value
                                  ? "bg-sky-50 text-sky-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                }
              />

              <AdminTable
                columns={columns}
                data={filtered}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={(p: number) => {
                  setCurrentPage(p);
                }}
                onItemsPerPageChange={(n: number) => {
                  setItemsPerPage(n);
                  setCurrentPage(1);
                }}
              />
            </section>
          </div>
        </div>
      </div>
      <TransactionReceiptModal
        isOpen={receiptOpen}
        transaction={receiptData}
        formatCurrency={formatRupiah}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptId(null);
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTransactionsPage;
