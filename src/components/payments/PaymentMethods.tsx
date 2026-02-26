import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethodsProps {
	onPaymentMethodChange?: (methodLabel: string | null) => void;
	onPaymentDataChange?: (paymentData: any) => void;
}

interface CardDetails {
	cardNumber: string;
	expiryDate: string;
	securityCode: string;
	cardholderName: string;
	nameOnCard: string;
	saveCard: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ onPaymentMethodChange, onPaymentDataChange }) => {
    const [activeMethod, setActiveMethod] = useState<'card' | 'ewallet'>('card');
    const [selectedCard, setSelectedCard] = useState<'paypal' | 'bri' | 'bca' | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<'gopay' | 'qris' | null>(null);
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardNumber: '',
        expiryDate: '',
        securityCode: '',
        cardholderName: '',
        nameOnCard: '',
        saveCard: false
    });

    const validateCardDetails = () => {
        if (!selectedCard) return false;
        if (!cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) return false;
        if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) return false;
        if (!cardDetails.securityCode.match(/^\d{3,4}$/)) return false;
        if (!cardDetails.cardholderName.trim()) return false;
        if (!cardDetails.nameOnCard.trim()) return false;
        return true;
    };

    const handleCardDetailChange = (field: keyof CardDetails, value: string | boolean) => {
        const updatedDetails = { ...cardDetails, [field]: value };
        setCardDetails(updatedDetails);
        
        if (onPaymentDataChange) {
            onPaymentDataChange({
                method: selectedCard,
                cardDetails: updatedDetails,
                isValid: validateCardDetails()
            });
        }
    };

    return (
        <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Payment methods</h2>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveMethod('card');
                                setSelectedWallet(null);
                            }}
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                                activeMethod === 'card' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                        >
                            <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                                    activeMethod === 'card' ? 'border-gray-900' : 'border-gray-400'
                                }`}
                            >
                                <div
                                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                        activeMethod === 'card' ? 'bg-gray-900' : 'bg-gray-300'
                                    }`}
                                />
                            </div>
                            <span>Credit & Debit Cards</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveMethod('ewallet');
                                setSelectedCard(null);
                                onPaymentMethodChange?.(null);
                            }}
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                                activeMethod === 'ewallet' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                        >
                            <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                                    activeMethod === 'ewallet' ? 'border-gray-900' : 'border-gray-400'
                                }`}
                            >
                                <div
                                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                        activeMethod === 'ewallet' ? 'bg-gray-900' : 'bg-gray-300'
                                    }`}
                                />
                            </div>
                            <span>E-Wallet & QRIS</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                        <span className="inline-flex items-center justify-center">
                            <img src="/icon-visa.png" alt="Visa" className="h-12" />
                        </span>
                        <span className="inline-flex items-center justify-center">
                            <img src="/icon-mastercard.png" alt="Mastercard" className="h-12" />
                        </span>
                        <span className="inline-flex items-center justify-center">
                            <img src="/icon-paypal.png" alt="PayPal" className="h-12" />
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {activeMethod === 'card' ? (
                        <>
                            <div>
                                <p className="mb-2 text-xs font-medium text-gray-700">Pilih metode kartu</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                    {[{ id: 'paypal', label: 'PayPal', helper: 'Credit / Debit Card', logo: '/icon-paypal.png' },
                                    { id: 'bri', label: 'Bank BRI', helper: 'Kartu kredit / debit' },
                                    { id: 'bca', label: 'Bank BCA', helper: 'Kartu kredit / debit' },
                                    ].map((card) => (
                                        <button
                                            key={card.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCard(card.id as 'paypal' | 'bri' | 'bca');
                                                setSelectedWallet(null);
                                                onPaymentMethodChange?.(card.label);
                                                handleCardDetailChange('cardNumber', cardDetails.cardNumber);
                                            }}
                                            className={`h-16 rounded-xl border px-3 py-2 text-left shadow-sm transition-colors flex flex-col justify-center gap-1 ${
                                                selectedCard === card.id
                                                    ? 'border-sky-500 bg-white'
                                                    : 'border-gray-200 bg-gray-50 hover:border-sky-400 hover:bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-gray-900">{card.label}</span>
                                                {card.logo && <img src={card.logo} alt={card.label} className="h-5" />}
                                            </div>
                                            <span className="text-[10px] text-gray-500">{card.helper}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedCard ? (
                                <div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-700">Card number</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400">
                                                <CreditCard className="h-4 w-4" />
                                            </span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardDetails.cardNumber}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\s/g, '');
                                                    if (value.length <= 16) {
                                                        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                        handleCardDetailChange('cardNumber', value);
                                                    }
                                                }}
                                                className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                                    cardDetails.cardNumber && !cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/) ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-2 mt-4 block text-xs font-medium text-gray-700">Expiration date</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiryDate}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length >= 2) {
                                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                    }
                                                    handleCardDetailChange('expiryDate', value);
                                                }}
                                                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                                    cardDetails.expiryDate && !cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/) ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 mt-4 block text-xs font-medium text-gray-700">Security code</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="123"
                                                value={cardDetails.securityCode}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    handleCardDetailChange('securityCode', value);
                                                }}
                                                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                                    cardDetails.securityCode && !cardDetails.securityCode.match(/^\d{3,4}$/) ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 mt-4 block text-xs font-medium text-gray-700">Cardholder's name</label>
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            value={cardDetails.cardholderName}
                                            onChange={(e) => handleCardDetailChange('cardholderName', e.target.value)}
                                            className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                                cardDetails.cardholderName && !cardDetails.cardholderName.trim() ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 mt-4 block text-xs font-medium text-gray-700">As written on card</label>
                                        <input
                                            type="text"
                                            placeholder="Exact name on card"
                                            value={cardDetails.nameOnCard}
                                            onChange={(e) => handleCardDetailChange('nameOnCard', e.target.value)}
                                            className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                                cardDetails.nameOnCard && !cardDetails.nameOnCard.trim() ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <label className="mt-4 inline-flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={cardDetails.saveCard}
                                            onChange={(e) => handleCardDetailChange('saveCard', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                                        />
                                        <span>Save this card for future payments</span>
                                    </label>
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-500">
                                    Silakan pilih kartu terlebih dahulu untuk melanjutkan pembayaran.
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <div>
                                <p className="mb-2 text-xs font-medium text-gray-700">Pilih e-wallet atau QRIS</p>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    {[{ id: 'gopay', label: 'GoPay' },
                                    { id: 'qris', label: 'QRIS' },
                                    ].map((wallet) => (
                                        <button
                                            key={wallet.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedWallet(wallet.id as 'gopay' | 'qris');
                                                setSelectedCard(null);
                                                onPaymentMethodChange?.(wallet.label);
                                                if (onPaymentDataChange) {
                                                    onPaymentDataChange({
                                                        method: wallet.id,
                                                        isValid: true
                                                    });
                                                }
                                            }}
                                            className={`h-14 rounded-xl border px-3 py-2 text-left shadow-sm transition-colors flex items-center justify-between gap-2 ${
                                                selectedWallet === wallet.id
                                                    ? 'border-sky-500 bg-white'
                                                    : 'border-gray-200 bg-gray-50 hover:border-sky-400 hover:bg-white'
                                            }`}
                                        >
                                            <span className="text-xs font-semibold text-gray-900">{wallet.label}</span>
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    selectedWallet === wallet.id ? 'bg-emerald-500' : 'bg-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedWallet && (
                                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {selectedWallet === 'gopay' ? 'GoPay' : 'QRIS'}
                                        </p>
                                    </div>

                                    <div className="mx-auto flex items-center justify-center">
                                        <div className="h-40 w-40 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                                            <img
                                                src="/qris.png"
                                                alt="QRIS GoPay"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-500 text-center">NMID: IDXXXXXXXXXX</p>

                                    {/* <button
                                        type="button"
                                        className="mt-1 w-full rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 transition-colors"
                                    >
                                        Saya sudah bayar
                                    </button> */}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PaymentMethods;
