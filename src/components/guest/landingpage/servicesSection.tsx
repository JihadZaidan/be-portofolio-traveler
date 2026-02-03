import React from 'react'
import { StarIcon } from 'lucide-react'

const services = [
    'Video Script',
    'Custom Copywriting',
    'Brand Storytelling',
    'Email Campaigns',
    'Content Marketing',
    'Social Media',
    'Product Description',
    'Landing Page',
    'Ads Copy',
    'SEO Content'
]

const ServicesSection: React.FC = () => {
    // Duplicate services
    const duplicatedServices = [...services, ...services, ...services]

    return (
        <section className="relative py-12 overflow-hidden bg-white" id="services">
            {/* Blue Rectangle Background */}
            <div className="relative mx-auto w-full">
                <div className="relative h-28 md:h-32 bg-sky-500 rounded-4xl overflow-hidden">
                </div>
            </div>

            {/* Diagonal White Banner with Scrolling Text */}
            <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-white py-6 shadow-xl mt-8"
                style={{
                    transform: 'translateY(-50%) rotate(-4deg)',
                    width: '120%',
                    marginLeft: '-10%'
                }}
            >
                {/* Marquee Container */}
                <div className="overflow-hidden whitespace-nowrap">
                    <div
                        className="inline-flex animate-marquee"
                        style={{
                            animation: 'marquee 30s linear infinite'
                        }}
                    >
                        {duplicatedServices.map((service, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center mx-6"
                            >
                                <span className="text-slate-800 font-semibold text-lg md:text-xl">
                                    {service}
                                </span>
                                <StarIcon className="w-6 h-6 text-sky-500 ml-10 border border-sky-500 rounded-full p-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CSS for Marquee Animation */}
            <style>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.33%);
                    }
                }
            `}</style>
        </section>
    )
}

export default ServicesSection
