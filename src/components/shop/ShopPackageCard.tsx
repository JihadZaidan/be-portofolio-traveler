import React, { useMemo, useState } from 'react';
import { Check, Timer } from 'lucide-react';
import type { OrderPackage } from '../order/sidebarOrder';

export type PackageKey = 'basic' | 'standard' | 'premium';

export type ShopPackageCardProps = {
    basePrice?: number;
    deliveryTime?: string;
    onOrderClick?: (pkg: OrderPackage) => void;
};

const ShopPackageCard: React.FC<ShopPackageCardProps> = ({ basePrice = 20, deliveryTime, onOrderClick }) => {
    const [selectedPackage, setSelectedPackage] = useState<PackageKey>('standard');

    const packagePresets = useMemo(
        () => ({
            basic: {
                label: 'Basic',
                badge: 'Starter',
                description: 'Short-form SEO content for quick tasks and smaller projects.',
                features: ['1 Article', 'SEO-optimized title', 'Proofreading'],
                defaultWords: 500,
            },
            standard: {
                label: 'Standart',
                badge: 'Advance',
                description: 'SEO-Friendly Website Content, Blog Posts, Web Pages, Product Descriptions & More.',
                features: ['1 Article', 'Plagiarism check', 'References & citations', 'Include keyword research'],
                defaultWords: 1000,
            },
            premium: {
                label: 'Premium',
                badge: 'Premium Plus',
                description: 'Long-form content package with advanced research and multiple revisions.',
                features: [
                    '2 Long-form articles',
                    'In-depth keyword research',
                    'SEO content strategy outline',
                    '2 rounds of revisions',
                ],
                defaultWords: 1500,
            },
        }),
        [],
    );

    // basePrice diasumsikan untuk 1000 kata
    const pricePerWord = (basePrice || 20) / 1000;

    const [currentWords, setCurrentWords] = useState<number>(packagePresets.standard.defaultWords);

    const currentPreset = packagePresets[selectedPackage];
    const currentPrice = Math.max(1, Math.round(pricePerWord * currentWords));

    const handleContinue = () => {
        if (!onOrderClick) return;

        const orderPackage: OrderPackage = {
            id: selectedPackage,
            title: currentPreset.label,
            price: currentPrice,
            shortDescription: currentPreset.description,
            packageLabel: `${currentPreset.label} package`,
            deliveryLabel: deliveryTime,
        };

        onOrderClick(orderPackage);
    };

    return (
        <aside className="lg:sticky lg:top-24">
            {/* Package tabs */}
            <div className="mb-4 flex rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPackage('basic');
                        setCurrentWords(packagePresets.basic.defaultWords);
                    }}
                    className={`flex-1 rounded-xl py-2 transition-colors ${
                        selectedPackage === 'basic'
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-500 hover:text-sky-500'
                    }`}
                >
                    Basic
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPackage('standard');
                        setCurrentWords(packagePresets.standard.defaultWords);
                    }}
                    className={`flex-1 rounded-xl py-2 transition-colors ${
                        selectedPackage === 'standard'
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-500 hover:text-sky-500'
                    }`}
                >
                    Standart
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPackage('premium');
                        setCurrentWords(packagePresets.premium.defaultWords);
                    }}
                    className={`flex-1 rounded-xl py-2 transition-colors ${
                        selectedPackage === 'premium'
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-500 hover:text-sky-500'
                    }`}
                >
                    Premium
                </button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm w-[380px] mx-auto">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-900">{currentPreset.badge}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-[260px] mx-auto">
                        {currentPreset.description}
                    </p>

                    <div className="mt-6 inline-flex items-start justify-center gap-1">
                        <span className="text-xs text-slate-300 leading-none pt-0.5">$</span>
                        <span className="text-5xl font-semibold text-slate-900 leading-none">
                            {currentPrice}
                        </span>
                    </div>
                </div>

                {deliveryTime && (
                    <div className="mt-7 flex items-center gap-2">
                        <Timer className="h-5 w-5 text-sky-500" />
                        <p className="text-sm font-medium text-slate-500">{deliveryTime}</p>
                    </div>
                )}

                <div className="mt-7 rounded-2xl bg-slate-50 px-6 py-6">
                    <ul className="space-y-5 text-sm text-slate-800">
                        {currentPreset.features.map((feat) => (
                            <li key={feat} className="flex items-center gap-3">
                                <span className="h-6 w-6 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                                    <Check className="h-4 w-4 text-white" />
                                </span>
                                <span className="font-medium">{feat}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-7 flex items-center justify-between">
                        <p className="text-sm text-slate-400">Number of words</p>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            value={currentWords}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (Number.isNaN(value)) return;
                                setCurrentWords(Math.max(1, value));
                            }}
                            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-auto [&::-webkit-outer-spin-button]:appearance-auto"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleContinue}
                        className="mt-7 w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-sky-600 shadow-md hover:shadow-lg transition-shadow"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ShopPackageCard;
