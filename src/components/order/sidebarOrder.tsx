import { Folders, Minus, Plus, Timer } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export type OrderPackage = {
    id: string;
    title: string;
    price: number;
    shortDescription: string;
    packageLabel?: string; // e.g. "Standard package"
    deliveryLabel?: string; // e.g. "1-day delivery"
};

export type SidebarOrderProps = {
    open: boolean;
    selectedPackage: OrderPackage | null;
    onClose?: () => void;
    onContinue?: (payload: { package: OrderPackage; quantity: number }) => void;
};

const SidebarOrder: React.FC<SidebarOrderProps> = ({ open, selectedPackage, onClose, onContinue }) => {
    const [quantity, setQuantity] = useState(1);

    // Harga per paket
    const formattedPrice = useMemo(() => {
        if (!selectedPackage) return '$0';
        return `$${selectedPackage.price}`;
    }, [selectedPackage]);

    // Total harga berdasarkan quantity
    const totalPrice = useMemo(() => {
        if (!selectedPackage) return '$0';
        return `$${selectedPackage.price * quantity}`;
    }, [selectedPackage, quantity]);

    const handleBackdropClick = () => {
        onClose?.();
    };

    const handleInnerClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    const handleContinue = () => {
        if (!selectedPackage) return;
        onContinue?.({ package: selectedPackage, quantity });
    };

    if (!open || !selectedPackage) return null;

    return (
        <div
            className="fixed inset-0 z-[90] flex justify-end bg-black/40 backdrop-blur-[1px]"
            onClick={handleBackdropClick}
        >
            <div
                className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                onClick={handleInnerClick}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">Order Options</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        aria-label="Close order sidebar"
                    >
                        <span className="text-lg leading-none">×</span>
                    </button>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Selected package summary */}
                    <section>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {selectedPackage.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 leading-snug">
                                    {selectedPackage.shortDescription}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{formattedPrice}</p>
                        </div>
                        <div className="mt-4 h-px w-full bg-gray-200" />
                    </section>

                    {/* Frequency / quantity section */}
                    <section className="space-y-3">
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                            How often do you need this order?
                        </p>

                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-gray-900">
                                    {selectedPackage.title}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">{formattedPrice}</p>
                            </div>

                            <div className="mt-3 h-px w-full bg-gray-200" />

                            <div className="mt-3 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-700">Gig Quantity</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-[1.5rem] text-center text-sm font-medium text-gray-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Order summary card */}
                    <section>
                        <div className="rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{totalPrice}</p>
                            <p className="mt-1 text-xs text-gray-600">
                                {quantity === 1 ? 'Single order' : `${quantity} orders`}
                            </p>

                            <div className="mt-3 h-px w-full bg-gray-200" />

                            <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                                {selectedPackage.packageLabel && (
                                    <div className="flex items-center gap-2">
                                        <Folders className="h-4 w-4" />
                                        <span>{selectedPackage.packageLabel}</span>
                                    </div>
                                )}
                                {selectedPackage.deliveryLabel && (
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4" />
                                        <span>{selectedPackage.deliveryLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Bottom action bar */}
                <div className="border-t border-gray-200 px-6 py-3 bg-white">
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="w-full h-11 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold shadow-sm transition-colors"
                    >
                        Continue ({totalPrice})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SidebarOrder;

