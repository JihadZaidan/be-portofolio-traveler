import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Navbar from '../../components/ui/navbar';
import FooterSection from '../../components/ui/footer';
import type { ShopItem } from '../../components/ui/shopCards';
import type { OrderPackage } from '../../components/order/sidebarOrder';
import EditAvatarModal from '../../components/profile/EditAvatarModal';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ProfileContent from '../../components/profile/ProfileContent';
import InitialShimmer from '../../components/ui/InitialShimmer';
import { UserProfilePageSkeleton } from '../../components/ui/skeletons';

type OrderStatus = 'process' | 'success' | 'cancel';

type UserProfile = {
    name: string;
    email: string;
    password: string;
    avatarUrl: string;
};

type UserOrder = {
    id: string;
    status: OrderStatus;
    createdAtLabel: string;
    estimateCompleteLabel: string;
    paymentMethod: string;
    item: ShopItem;
    orderPackage: OrderPackage;
    quantity: number;
    totalAmount: number;
};

const UserProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'general' | 'orders'>('general');
    const [cropOpen, setCropOpen] = useState(false);
    const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatarUrl');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authProvider');
        window.dispatchEvent(new Event('auth:changed'));
        navigate('/work', { replace: true });
    };

    const [profile, setProfile] = useState<UserProfile>(() => {
        const fallback: UserProfile = {
            name: 'Rose Seravina Alveric',
            email: 'roseseravina@gmail.com',
            password: 'password',
            avatarUrl:
                'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300',
        };

        if (typeof window === 'undefined') return fallback;

        const savedAvatar = localStorage.getItem('userAvatarUrl');
        const savedEmail = localStorage.getItem('userEmail');
        const savedName = localStorage.getItem('userName');
        
        return {
            ...fallback,
            avatarUrl: savedAvatar || fallback.avatarUrl,
            email: savedEmail || fallback.email,
            name: savedName || fallback.name,
        };
    });

    const handlePickAvatar = (imageSrc: string) => {
        setPendingAvatarSrc(imageSrc);
        setCropOpen(true);
    };

    const handleCloseAvatarModal = () => {
        setCropOpen(false);
        setPendingAvatarSrc(null);
    };

    const handleSaveAvatar = (avatarDataUrl: string) => {
        localStorage.setItem('userAvatarUrl', avatarDataUrl);
        window.dispatchEvent(new Event('auth:changed'));
        setProfile((prev) => ({ ...prev, avatarUrl: avatarDataUrl }));
        handleCloseAvatarModal();
    };

    // Listen for auth changes and update profile
    useEffect(() => {
        const handleAuthChange = () => {
            const savedName = localStorage.getItem('userName');
            const savedEmail = localStorage.getItem('userEmail');
            const savedAvatar = localStorage.getItem('userAvatarUrl');
            
            setProfile(prev => ({
                ...prev,
                name: savedName || prev.name,
                email: savedEmail || prev.email,
                avatarUrl: savedAvatar || prev.avatarUrl,
            }));
        };

        window.addEventListener('auth:changed', handleAuthChange);
        return () => window.removeEventListener('auth:changed', handleAuthChange);
    }, []);

    const orders: UserOrder[] = useMemo(
        () => [
            {
                id: '26486740765',
                status: 'success',
                createdAtLabel: '19 Jan 2025',
                estimateCompleteLabel: '20 Jan 2025',
                paymentMethod: 'Credit Card',
                item: {
                    id: 1,
                    title: 'I will be SEO content writer for article writing or blog writing',
                    imageSrc: '/bg-shopCards.jpg',
                    price: '$100',
                    deliveryTime: '2 Days Delivery',
                    serviceCategory: 'SEO Content',
                },
                orderPackage: {
                    id: 'standard',
                    title: 'Standard',
                    price: 100,
                    shortDescription: 'SEO-friendly content package for your article or blog writing needs.',
                    packageLabel: 'Standard package',
                    deliveryLabel: '2 Days Delivery',
                },
                quantity: 1,
                totalAmount: 100,
            },
            {
                id: '26486740766',
                status: 'process',
                createdAtLabel: '22 Jan 2025',
                estimateCompleteLabel: '25 Jan 2025',
                paymentMethod: 'PayPal',
                item: {
                    id: 2,
                    title: 'I will write human SEO blogs and articles',
                    imageSrc: '/bg-shopCards.jpg',
                    price: '$100',
                    deliveryTime: '3 Days Delivery',
                    serviceCategory: 'Blog Writing',
                },
                orderPackage: {
                    id: 'premium',
                    title: 'Premium',
                    price: 120,
                    shortDescription: 'Long-form content package with advanced research and multiple revisions.',
                    packageLabel: 'Premium package',
                    deliveryLabel: '3 Days Delivery',
                },
                quantity: 1,
                totalAmount: 120,
            },
            {
                id: '26486740767',
                status: 'cancel',
                createdAtLabel: '28 Jan 2025',
                estimateCompleteLabel: '—',
                paymentMethod: 'Bank Transfer',
                item: {
                    id: 3,
                    title: 'I will write SEO blog posts and articles as your content writer',
                    imageSrc: '/bg-shopCards.jpg',
                    price: '$100',
                    deliveryTime: '4 Days Delivery',
                    serviceCategory: 'Product Description',
                },
                orderPackage: {
                    id: 'basic',
                    title: 'Basic',
                    price: 60,
                    shortDescription: 'Short-form SEO content for quick tasks and smaller projects.',
                    packageLabel: 'Basic package',
                    deliveryLabel: '4 Days Delivery',
                },
                quantity: 1,
                totalAmount: 60,
            },
        ],
        [],
    );

    return (
        <InitialShimmer delayMs={850} skeleton={<UserProfilePageSkeleton />}>
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />

                <EditAvatarModal
                    open={cropOpen}
                    imageSrc={pendingAvatarSrc}
                    onClose={handleCloseAvatarModal}
                    onSave={handleSaveAvatar}
                />

                <main className="flex-1">
                    <section className="mx-auto max-w-7xl px-4 md:px-0 py-10">
                        <div className="grid gap-6 lg:grid-cols-[56px_360px_1fr] items-start lg:items-stretch lg:h-[calc(100vh-220px)]">
                            <div className="lg:col-start-1 lg:flex lg:justify-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 lg:w-10 lg:px-0 lg:justify-center"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="lg:hidden">Kembali</span>
                                </button>
                            </div>

                            <ProfileSidebar profile={profile} onPickAvatar={handlePickAvatar} onLogout={handleLogout} />
                            <ProfileContent
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                profile={profile}
                                onProfileChange={setProfile}
                                orders={orders}
                            />
                        </div>
                    </section>
                </main>

                <FooterSection />
            </div>
        </InitialShimmer>
    );
};

export default UserProfilePage;
