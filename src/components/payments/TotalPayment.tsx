import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TotalPaymentProps {
    subtotal: number;
    serviceFee: number;
    total: number;
    itemTitle: string;
    orderPackageTitle: string;
    deliveryLabel?: string;
    quantity: number;
    paymentMethodLabel: string | null;
    onPayment?: () => void;
    isProcessing?: boolean;
    canPay?: boolean;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const TotalPayment: React.FC<TotalPaymentProps> = ({
    subtotal,
    serviceFee,
    total,
    itemTitle,
    orderPackageTitle,
    deliveryLabel,
    quantity,
    paymentMethodLabel,
    onPayment,
    isProcessing = false,
    canPay = false,
}) => {
    const navigate = useNavigate();
    
    const handleConfirmAndPay = () => {
        if (onPayment) {
            onPayment();
        } else {
            navigate('/shop/payment/payment-success', {
                state: {
                    subtotal,
                    serviceFee,
                    total,
                    itemTitle,
                    orderPackageTitle,
                    deliveryLabel,
                    quantity,
                    paymentMethodLabel,
                },
            });
        }
    };
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Total</h2>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(total)}</p>
            </div>

            <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={!canPay || isProcessing}
                className={`w-full rounded-full text-sm font-semibold py-2.5 shadow-sm transition-colors ${
                    !canPay || isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
            >
                {isProcessing ? 'Processing...' : 'Confirm & Pay'}
            </button>

            <p className="text-[11px] text-gray-500 leading-relaxed">
                By clicking the button, you agree to our
                <span className="text-sky-500"> Terms of Service</span> and
                <span className="text-sky-500"> Payment Terms</span>.
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-700 border-t border-gray-200 pt-3">
                <CheckCircle2 className="h-4 w-4 text-sky-500" />
                <span>Safe and secure payment</span>
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-600">
                <p className="font-semibold text-gray-900">Price summary</p>
                <div className="flex items-center justify-between">
                    <span>Selected package</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Service fee</span>
                    <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default TotalPayment;
