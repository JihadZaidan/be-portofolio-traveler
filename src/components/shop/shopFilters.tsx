import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type BudgetState =
    | { type: 'any' }
    | { type: 'under'; value: number }
    | { type: 'range'; min: number; max: number }
    | { type: 'upTo'; value: number | '' };

type ShopFiltersProps = {
    initialServiceLabel?: string;
    onServiceChange?: (value: string) => void;
    onDeliveryChange?: (value: string) => void;
    onBudgetApply?: (value: BudgetState) => void;
};

const serviceOptions = [
    'Service Options',
    'SEO Content',
    'Blog Writing',
    'Product Description',
    'Social Media Copy',
];

const deliveryOptions = ['Delivery Time', '24 Hours', '3 Days', '7 Days', '14 Days'];

const ShopFilters: React.FC<ShopFiltersProps> = ({
    initialServiceLabel,
    onServiceChange,
    onDeliveryChange,
    onBudgetApply,
}) => {
    const [serviceOpen, setServiceOpen] = useState(false);
    const [budgetOpen, setBudgetOpen] = useState(false);
    const [deliveryOpen, setDeliveryOpen] = useState(false);

    const [selectedService, setSelectedService] = useState<string>(
        initialServiceLabel || 'Service Options',
    );
    const [selectedDelivery, setSelectedDelivery] = useState<string>('Delivery Time');

    const [budgetDraft, setBudgetDraft] = useState<BudgetState>({ type: 'any' });
    const [budgetApplied, setBudgetApplied] = useState<BudgetState>({ type: 'any' });

    const filtersRef = useRef<HTMLDivElement | null>(null);

    const budgetLabel = useMemo(() => {
        const b = budgetApplied;
        if (b.type === 'any') return 'Budget';
        if (b.type === 'under') return `Under $${b.value}`;
        if (b.type === 'range') return `$${b.min} - $${b.max}`;
        if (b.type === 'upTo') {
            if (b.value === '' || b.value === 0) return 'Budget';
            return `Up to $${b.value}`;
        }
        return 'Budget';
    }, [budgetApplied]);

    const closeAll = () => {
        setServiceOpen(false);
        setBudgetOpen(false);
        setDeliveryOpen(false);
    };

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!filtersRef.current) return;
            if (!filtersRef.current.contains(target)) {
                closeAll();
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    const toggleService = () => {
        setServiceOpen((v) => !v);
        setBudgetOpen(false);
        setDeliveryOpen(false);
    };

    const toggleBudget = () => {
        setBudgetOpen((v) => {
            const next = !v;
            if (next) setBudgetDraft(budgetApplied);
            return next;
        });
        setServiceOpen(false);
        setDeliveryOpen(false);
    };

    const toggleDelivery = () => {
        setDeliveryOpen((v) => !v);
        setBudgetOpen(false);
        setServiceOpen(false);
    };

    return (
        <div ref={filtersRef} className="flex flex-wrap items-center gap-3 relative">
            <div className="relative">
                <button
                    type="button"
                    onClick={toggleService}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                    <span className="whitespace-nowrap">{selectedService}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {serviceOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                        {serviceOptions.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    setSelectedService(opt);
                                    onServiceChange?.(opt);
                                    setServiceOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                    selectedService === opt
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={toggleBudget}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                    <span className="whitespace-nowrap">{budgetLabel}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {budgetOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg z-30 overflow-hidden">
                        <div className="p-4">
                            <p className="text-sm font-semibold text-slate-900">Budget</p>

                            <div className="mt-4 space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budgetDraft.type === 'any'}
                                        onChange={() => setBudgetDraft({ type: 'any' })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm text-slate-900">Any</p>
                                        <p className="text-xs text-slate-500">No budget limit</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budgetDraft.type === 'under' && budgetDraft.value === 50}
                                        onChange={() => setBudgetDraft({ type: 'under', value: 50 })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm text-slate-900">Under $50</p>
                                        <p className="text-xs text-slate-500">Best for small tasks</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budgetDraft.type === 'range' && budgetDraft.min === 50 && budgetDraft.max === 100}
                                        onChange={() => setBudgetDraft({ type: 'range', min: 50, max: 100 })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm text-slate-900">$50 - $100</p>
                                        <p className="text-xs text-slate-500">Most popular range</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budgetDraft.type === 'range' && budgetDraft.min === 100 && budgetDraft.max === 200}
                                        onChange={() => setBudgetDraft({ type: 'range', min: 100, max: 200 })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm text-slate-900">$100 - $200</p>
                                        <p className="text-xs text-slate-500">For bigger projects</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budgetDraft.type === 'upTo'}
                                        onChange={() => setBudgetDraft({ type: 'upTo', value: '' })}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900">Custom</p>
                                        <div className="mt-2">
                                            <p className="text-xs text-slate-500">Up to</p>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 h-11">
                                                <span className="text-slate-500">$</span>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    min={0}
                                                    placeholder="0"
                                                    value={budgetDraft.type === 'upTo' ? budgetDraft.value : ''}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const val = raw === '' ? '' : Number(raw);
                                                        setBudgetDraft({ type: 'upTo', value: val });
                                                    }}
                                                    className="w-full outline-none text-sm text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-white">
                            <button
                                type="button"
                                onClick={() => {
                                    setBudgetDraft({ type: 'any' });
                                    setBudgetApplied({ type: 'any' });
                                    onBudgetApply?.({ type: 'any' });
                                    setBudgetOpen(false);
                                }}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Clear all
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setBudgetApplied(budgetDraft);
                                    onBudgetApply?.(budgetDraft);
                                    setBudgetOpen(false);
                                }}
                                className="h-10 px-5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={toggleDelivery}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                    <span className="whitespace-nowrap">{selectedDelivery}</span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {deliveryOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2 z-30">
                        {deliveryOptions.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    setSelectedDelivery(opt);
                                    onDeliveryChange?.(opt);
                                    setDeliveryOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                    selectedDelivery === opt
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopFilters;
