import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";

export type ReceiptTransactionStatus = "paid" | "processing" | "refunded" | "cancelled";
export type ReceiptPaymentMethod = "bank_transfer" | "qris" | "credit_card" | "ewallet";

export type ReceiptTransaction = {
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
  status: ReceiptTransactionStatus;
  paymentMethod: ReceiptPaymentMethod;
  paidStatus: "paid" | "unpaid";
  date: string;
};

type TransactionReceiptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: ReceiptTransaction | null;
  formatCurrency: (value: number) => string;
  statusControl?: React.ReactNode;
};

const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  formatCurrency,
  statusControl,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const paymentLabel: Record<ReceiptPaymentMethod, string> = {
    bank_transfer: "Transfer Bank",
    qris: "QRIS",
    credit_card: "Kartu Kredit",
    ewallet: "E-Wallet",
  };

  const statusMap: Record<ReceiptTransactionStatus, { label: string; cls: string }> = {
    paid: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    processing: { label: "Dalam Proses", cls: "bg-blue-50 text-blue-700 border-blue-100" },
    refunded: { label: "Refund", cls: "bg-amber-50 text-amber-800 border-amber-100" },
    cancelled: { label: "Dibatalkan", cls: "bg-rose-50 text-rose-700 border-rose-100" },
  };

  const statusMeta = statusMap[transaction.status] ?? statusMap.processing;

  const paidLabel = transaction.paidStatus === "paid" ? "Lunas" : "Belum";
  const totalBayar = transaction.grossAmount + transaction.adminFee;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-[1101] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Detail Pesanan</p>
              <p className="mt-1 text-[11px] text-slate-500">No Resi: {transaction.trxCode}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-900">Info Pengiriman</p>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Kode Order</p>
                <p className="text-[11px] font-semibold text-slate-900">{transaction.orderCode}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Pembeli</p>
                <p className="text-[11px] font-semibold text-slate-900">{transaction.buyerName}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Email</p>
                <p className="text-[11px] font-semibold text-slate-900">{transaction.buyerEmail}</p>
              </div>
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] text-slate-500">Penyedia</p>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-900">{transaction.sellerName}</p>
                  <p className="mt-1 text-[11px] text-slate-600 whitespace-normal break-words line-clamp-4">
                    {transaction.sellerService}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-900">Rincian Pembayaran</p>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Metode Pembayaran</p>
                <p className="text-[11px] font-semibold text-slate-900">{paymentLabel[transaction.paymentMethod]}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Status Pembayaran</p>
                <p className="text-[11px] font-semibold text-slate-900">{paidLabel}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Tanggal</p>
                <p className="text-[11px] font-semibold text-slate-900">{transaction.date}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Status Pesanan</p>
                {statusControl ? (
                  <div>{statusControl}</div>
                ) : (
                  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium ${statusMeta.cls}`}>
                    {statusMeta.label}
                  </span>
                )}
              </div>

              <div className="my-3 border-t border-dashed border-slate-200" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Total Harga</p>
                <p className="text-[11px] font-semibold text-slate-900">{formatCurrency(transaction.grossAmount)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">Biaya Admin</p>
                <p className="text-[11px] font-semibold text-slate-900">{formatCurrency(transaction.adminFee)}</p>
              </div>

              <div className="my-3 border-t border-dashed border-slate-200" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold text-slate-900">Total Bayar</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalBayar)}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransactionReceiptModal;
