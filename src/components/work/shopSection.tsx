import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ShopCard } from '../ui/shopCards';
import type { ShopItem } from '../ui/shopCards';

const shopItems: ShopItem[] = [
    {
        id: 1,
        title: 'I will be SEO content writer for article writing or blog writing',
        imageSrc: '/bg-shopCards.jpg',
        price: '$20',
        deliveryTime: '2 Days Delivery',
    },
    {
        id: 2,
        title: 'I will write human SEO blogs and articles',
        imageSrc: '/bg-shopCards.jpg',
        price: '$100',
        deliveryTime: '3 Days Delivery',
    },
    {
        id: 3,
        title: 'I will write SEO blog posts and articles as your content writer',
        imageSrc: '/bg-shopCards.jpg',
        price: '$100',
        deliveryTime: '4 Days Delivery',
    },
    {
        id: 4,
        title: 'I will be SEO content writer for article writing or blog writing',
        imageSrc: '/bg-shopCards.jpg',
        price: '$20',
        deliveryTime: '2 Days Delivery',
    },
    {
        id: 5,
        title: 'I will write human SEO blogs and articles',
        imageSrc: '/bg-shopCards.jpg',
        price: '$100',
        deliveryTime: '5 Days Delivery',
    },
    {
        id: 6,
        title: 'I will write SEO blog posts and articles as your content writer',
        imageSrc: '/bg-shopCards.jpg',
        price: '$100',
        deliveryTime: '7 Days Delivery',
    },
];

const ShopSection: React.FC = () => {
    const navigate = useNavigate();
    const sectionRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return (
        <section ref={sectionRef} className="w-full py-16 md:py-20">
            <div className={`mx-auto max-w-6xl fade-up ${inView ? 'in-view' : ''}`}>
                <div className="grid gap-12 md:grid-cols-3">
                    {shopItems.map((item) => (
                        <ShopCard key={item.id} item={item} />
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button
                        variant="outline"
                        className="rounded-xl border-slate-300 text-slate-900 hover:bg-slate-50 px-6 py-3 text-xs md:text-sm flex items-center gap-2"
                        onClick={() => navigate('/work/shop')}
                    >
                        <span>Show more shop</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ShopSection;

