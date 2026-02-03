import React, { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import NavbarShop from '../../components/ui/navbarShop';
import FooterSection from '../../components/ui/footer';
import SignUpNotification from '../../components/ui/signUpNotification';
import AuthModal from '../../components/auth/AuthModal';
import type { ShopItem } from '../../components/ui/shopCards';
import { Home, Globe2, MapPin, FileCheck2 } from 'lucide-react';
import ShopPackageCard from '../../components/shop/ShopPackageCard';
import ContactChatModal from '../../components/shop/ContactChatModal';
import ShopProductDetails from '../../components/shop/ShopProductDetails';
import ShopReviews from '../../components/shop/ShopReviews';
import SidebarOrder, { type OrderPackage } from '../../components/order/sidebarOrder';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { ShopDetailPageSkeleton } from '../../components/ui/skeletons';

interface LocationState {
    item?: ShopItem;
}

const ShopDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;

    const fallbackItem: ShopItem = {
        id: Number(id) || 0,
        title: 'I will be SEO content writer for article writing or blog writing',
        imageSrc: '/bg-shopCards.jpg',
        price: '$20',
        deliveryTime: '2 Days Delivery',
    };

    const item = state?.item ?? fallbackItem;
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<OrderPackage | null>(null);

    return (
        <InitialShimmer delayMs={85} skeleton={<ShopDetailPageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white">
                <SignUpNotification onCtaClick={() => setAuthOpen(true)} />
                <NavbarShop />

                <AuthModal
                    open={authOpen}
                    mode="signup"
                    closable
                    onClose={() => setAuthOpen(false)}
                    onSuccess={() => setAuthOpen(false)}
                />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl py-8 px-4 md:px-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link to="/" className="hover:text-slate-800 transition-colors flex items-center gap-1">
                                <Home className="w-4 h-4" />
                                <span>Home</span>
                            </Link>
                            <span>/</span>
                            <Link to="/work/shop" className="hover:text-slate-800 transition-colors">
                                Shop
                            </Link>
                            <span>/</span>
                            <span className="text-slate-800 truncate max-w-[160px] md:max-w-xs" title={item.title}>
                                Advertising Copy
                            </span>
                        </div>

                        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] items-start">
                            {/* Left column: seller + details */}
                            <div>
                                {/* Title */}
                                <p className="mt-4 text-3xl md:text-4xl font-semibold text-slate-900 max-w-3xl mb-12">
                                    {item.title}
                                </p>

                                {/* Seller card */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200">
                                            <img
                                                src="/rizwords-nomad.jpg"
                                                alt="Seller avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">Rizqi Maulana</p>
                                            <p className="text-sm text-slate-500">Advertising Copy</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="w-4.5 h-4.5" />
                                                    Indonesia
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Globe2 className="w-4.5 h-4.5" />
                                                    I&apos;m speak English
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <FileCheck2 className="w-4.5 h-4.5" />
                                                    1440 Orders completed
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsContactOpen(true)}
                                        className="inline-flex items-center justify-center rounded-full border border-sky-500 px-5 py-2 text-xs font-medium text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
                                    >
                                        Contact Me
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="mt-12 border-b border-slate-200 flex gap-0 text-lg md:text-base">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                        className={`flex-1 pb-3 text-center font-medium transition-colors border-b-2 ${
                                            activeTab === 'details'
                                                ? 'border-slate-900 text-slate-900'
                                                : 'border-transparent text-slate-400 hover:text-slate-700'
                                        }`}
                                    >
                                        Product Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('reviews')}
                                        className={`flex-1 pb-3 text-center font-medium transition-colors border-b-2 ${
                                            activeTab === 'reviews'
                                                ? 'border-slate-900 text-slate-900'
                                                : 'border-transparent text-slate-400 hover:text-slate-700'
                                        }`}
                                    >
                                        Reviews
                                    </button>
                                </div>

                                {activeTab === 'details' ? <ShopProductDetails /> : <ShopReviews />}
                            </div>

                            {/* Right column: package card */}
                            <ShopPackageCard
                                basePrice={Number(item.price.replace('$', '')) || 20}
                                deliveryTime={item.deliveryTime}
                                onOrderClick={(pkg) => {
                                    setSelectedPackage(pkg);
                                    setOrderOpen(true);
                                }}
                            />
                        </div>
                    </section>
                </main>

                <FooterSection />

                <ContactChatModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />

                <SidebarOrder
                    open={orderOpen}
                    selectedPackage={selectedPackage}
                    onClose={() => setOrderOpen(false)}
                    onContinue={({ package: orderPackage, quantity }) => {
                        setOrderOpen(false);
                        if (!orderPackage) return;
                        navigate('/shop/payment', {
                            state: {
                                item,
                                orderPackage,
                                quantity,
                            },
                        });
                    }}
                />
            </div>
        </InitialShimmer>
    );
};

export default ShopDetailPage;
