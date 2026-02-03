import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ServiceItem = {
    title: string;
    imageSrc?: string;
};

const services: ServiceItem[] = [
    { title: 'Advertising Copy', imageSrc: '/image-services.png' },
    { title: 'Product Description', imageSrc: '/image-services.png' },
    { title: 'Social Media', imageSrc: '/image-services.png' },
    { title: 'Content Marketing', imageSrc: '/image-services.png' },
    { title: 'Email Campaigns', imageSrc: '/image-services.png' },
    { title: 'SEO Content', imageSrc: '/image-services.png' },
];

const ServicesSection: React.FC = () => {
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

    const handleServiceClick = (serviceTitle: string) => {
        navigate('/work/shop', { state: { initialService: serviceTitle } });
    };

    return (
        <section ref={sectionRef} className="w-full py-12 md:py-16">
            <div className={`mx-auto max-w-6xl fade-up ${inView ? 'in-view' : ''}`}>
                {/* <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                    Popular Services
                </h2> */}

                <div className="mt-14 -mx-4 md:mx-0">
                    <div
                        className="services-scroll flex gap-4 md:gap-6 overflow-x-auto pb-2 px-4 md:px-0"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {services.map((service) => (
                            <article
                                key={service.title}
                                className="min-w-[260px] md:min-w-[280px] flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-6 md:py-8 shadow-sm/5 hover:shadow-md transition-shadow duration-150 cursor-pointer"
                                onClick={() => handleServiceClick(service.title)}
                            >
                                <div className="flex h-20 w-full items-center justify-center mb-4">
                                    {service.imageSrc ? (
                                        <img
                                            src={service.imageSrc}
                                            alt={service.title}
                                            className="h-20 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-2xl bg-slate-100" />
                                    )}
                                </div>
                                <p className="mt-1 text-lg font-medium text-slate-900 text-center">
                                    {service.title}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`
                .services-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default ServicesSection;

