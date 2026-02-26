import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import type { ShopItem } from '../../components/ui/shopCards';
import type { OrderPackage } from '../../components/order/sidebarOrder';
import OrderDetails from '../../components/payments/OrderDetails';
import PaymentMethods from '../../components/payments/PaymentMethods';
import TotalPayment from '../../components/payments/TotalPayment';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { ShopPaymentPageSkeleton } from '../../components/ui/skeletons';
import paymentService from '../../services/payment.service';

interface PaymentLocationState {
    item?: ShopItem;
    orderPackage?: OrderPackage;
    quantity?: number;
}

const ShopPaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state as PaymentLocationState | null) ?? null;

    const fallbackItem: ShopItem = {
        id: state?.item?.id ?? 0,
        title:
            state?.item?.title ?? 'I will be SEO content writer for article writing or blog writing',
        imageSrc: state?.item?.imageSrc ?? '/bg-shopCards.jpg',
        price: state?.item?.price ?? '$20',
        deliveryTime: state?.item?.deliveryTime ?? '1-day delivery',
    };

    const fallbackPackage: OrderPackage = {
        id: state?.orderPackage?.id ?? 'standard',
        title: state?.orderPackage?.title ?? 'Standard',
        price: state?.orderPackage?.price ?? 20,
        shortDescription:
            state?.orderPackage?.shortDescription ??
            'SEO-friendly content package for your article or blog writing needs.',
        packageLabel: state?.orderPackage?.packageLabel ?? 'Standard package',
        deliveryLabel: state?.orderPackage?.deliveryLabel ?? fallbackItem.deliveryTime,
    };

    const item = state?.item ?? fallbackItem;
    const orderPackage = state?.orderPackage ?? fallbackPackage;
    const [quantity] = useState<number>(state?.quantity && state.quantity > 0 ? state.quantity : 1);
    const [selectedPaymentMethodLabel, setSelectedPaymentMethodLabel] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const unitPrice = orderPackage.price;
    const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

    const serviceFee = useMemo(() => {
        if (!subtotal) return 0;
        return Math.max(3.25, Math.round(subtotal * 0.15 * 100) / 100);
    }, [subtotal]);

    const total = subtotal + serviceFee;

    const handlePaymentDataChange = (data: any) => {
        setPaymentData(data);
    };

    const handlePayment = async () => {
        if (!paymentData?.isValid) {
            alert('Silakan lengkapi detail pembayaran terlebih dahulu.');
            return;
        }

        setIsProcessing(true);
        try {
            const paymentRequest = {
                method: paymentData.method === 'paypal' ? 'credit_card' : paymentData.method,
                amount: total,
                currency: 'USD',
                description: `${item.title} - ${orderPackage.title}`,
                customerInfo: {
                    name: paymentData.cardDetails?.cardholderName,
                    email: 'user@example.com',
                    phone: '+1234567890',
                    cardDetails: paymentData.cardDetails
                }
            };

            const response = await paymentService.processPayment(paymentRequest);
            
            if (response.success) {
                navigate('/shop/payment/payment-success', {
                    state: {
                        subtotal,
                        serviceFee,
                        total,
                        itemTitle: item.title,
                        orderPackageTitle: orderPackage.title,
                        deliveryLabel: orderPackage.deliveryLabel,
                        quantity,
                        paymentMethodLabel: selectedPaymentMethodLabel,
                        paymentId: response.data?.paymentId
                    },
                });
            } else {
                alert('Pembayaran gagal: ' + response.message);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert('Terjadi kesalahan saat memproses pembayaran: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <InitialShimmer delayMs={850} skeleton={<ShopPaymentPageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white">
                <NavbarShop />

                <main className="flex-1">
                    <section className="mx-auto max-w-6xl px-4 md:px-0 py-8 md:py-10">

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
                            <div className="space-y-6">
                                <OrderDetails
                                    item={item}
                                    orderPackage={orderPackage}
                                    quantity={quantity}
                                    subtotal={subtotal}
                                />
                                <PaymentMethods 
                                    onPaymentMethodChange={setSelectedPaymentMethodLabel}
                                    onPaymentDataChange={handlePaymentDataChange}
                                />
                            </div>

                            <aside className="space-y-4 lg:sticky lg:top-24">
                                <TotalPayment
                                    subtotal={subtotal}
                                    serviceFee={serviceFee}
                                    total={total}
                                    itemTitle={item.title}
                                    orderPackageTitle={orderPackage.title}
                                    deliveryLabel={orderPackage.deliveryLabel}
                                    quantity={quantity}
                                    paymentMethodLabel={selectedPaymentMethodLabel}
                                    onPayment={handlePayment}
                                    isProcessing={isProcessing}
                                    canPay={paymentData?.isValid || false}
                                />
                            </aside>
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default ShopPaymentPage;
