import React, { useState, useEffect, useCallback } from 'react'

interface Experience {
    id: number
    logo: string
    logoAlt: string
    title: string
    company: string
    period: string
    duration: string
}

const experiences: Experience[] = [
    {
        id: 1,
        logo: '/welocalize_logo.jpeg',
        logoAlt: 'Welocalize',
        title: 'Ads Quality Rater',
        company: 'Welocalize',
        period: 'Mar 2023 hingga Mei 2025',
        duration: '2 thn 3 bln'
    },
    {
        id: 2,
        logo: '/ginitalent.jpeg',
        logoAlt: 'Gini Talent',
        title: 'Search Quality Improvement Lead',
        company: 'Gini Talent',
        period: 'Jun 2025 hingga Saat ini',
        duration: '8 bln'
    },
    {
        id: 3,
        logo: '/indpendent_logo.jpeg',
        logoAlt: 'Self Employed',
        title: 'Copywriter',
        company: 'Self Employed',
        period: 'Jan 2020 hingga Saat ini',
        duration: '6 thn 1 bln'
    }
]

const ExperienceSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const getVisibleCards = useCallback(() => {
        const total = experiences.length
        const prev = (activeIndex - 1 + total) % total
        const next = (activeIndex + 1) % total
        return { prev, active: activeIndex, next }
    }, [activeIndex])

    const handleCardClick = (experienceId: number) => {
        const index = experiences.findIndex(exp => exp.id === experienceId)
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                setIsAnimating(true)
                setActiveIndex((prev) => (prev + 1) % experiences.length)
                setTimeout(() => setIsAnimating(false), 500)
            }
        }, 8000)

        return () => clearInterval(interval)
    }, [isAnimating])

    const handleDotClick = (index: number) => {
        if (!isAnimating && index !== activeIndex) {
            setIsAnimating(true)
            setActiveIndex(index)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }

    const { prev, active, next } = getVisibleCards()

    const getCardStyle = (position: 'left' | 'center' | 'right') => {
        const baseStyle = {
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }

        switch (position) {
            case 'left':
                return {
                    ...baseStyle,
                    transform: 'translateX(-10%) scale(0.90)',
                    opacity: 1,
                    zIndex: 1,
                }
            case 'center':
                return {
                    ...baseStyle,
                    transform: 'translateX(0) scale(1.2)',
                    opacity: 1,
                    zIndex: 10,
                }
            case 'right':
                return {
                    ...baseStyle,
                    transform: 'translateX(10%) scale(0.90)',
                    opacity: 1,
                    zIndex: 1,
                }
        }
    }

    const renderCard = (experience: Experience, position: 'left' | 'center' | 'right') => {
        const isCenter = position === 'center'

        return (
            <div
                key={`${experience.id}-${position}`}
                onClick={() => !isCenter && handleCardClick(experience.id)}
                className={`absolute bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible
                    ${isCenter ? 'w-80 md:w-96' : 'w-64 md:w-72 cursor-pointer hover:opacity-90'}
                `}
                style={{
                    ...getCardStyle(position),
                    left: position === 'left' ? '5%' : position === 'center' ? '50%' : 'auto',
                    right: position === 'right' ? '5%' : 'auto',
                    marginLeft: position === 'center' ? '-12rem' : 0,
                }}
            >
                {/* Logo Circle - positioned above the card */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center shadow-md
                        ${isCenter ? 'w-20 h-20 -top-10' : 'w-16 h-16 -top-8'}
                    `}
                >
                    <img
                        src={experience.logo}
                        alt={experience.logoAlt}
                        className={`object-contain ${isCenter ? 'w-20 h-20 rounded-full' : 'w-16 h-16 rounded-full'}`}
                    />
                </div>

                {/* Card Content */}
                <div className={`pt-14 pb-6 px-6 ${isCenter ? 'pt-16 pb-8' : ''}`}>
                    <h3 className={`font-semibold text-slate-800 text-center mb-2 ${isCenter ? 'text-lg' : 'text-sm'}`}>
                        {experience.title}
                    </h3>
                    <p className={`text-gray-400 text-center mb-6 ${isCenter ? 'text-sm' : 'text-xs'}`}>
                        {experience.period} · {experience.duration}
                    </p>
                    <button
                        className={`w-full py-3 rounded-full text-white font-semibold bg-sky-500 hover:bg-sky-600 transition-colors
                            ${isCenter ? 'text-sm' : 'text-xs py-2.5'}
                        `}
                    >
                        {experience.company}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="py-20 bg-white" id="experience">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                        My Experience
                    </h2>
                    <p className="text-gray-500 text-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden">
                    {/* Cards */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {renderCard(experiences[prev], 'left')}
                        {renderCard(experiences[active], 'center')}
                        {renderCard(experiences[next], 'right')}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-1.5 mt-8">
                    {experiences.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className="rounded-full transition-all duration-300 focus:outline-none p-0 border-none"
                            style={{
                                width: index === activeIndex ? '12px' : '10px',
                                height: index === activeIndex ? '12px' : '10px',
                                padding: 0,
                                border: 'none',
                                backgroundColor: index === activeIndex ? '#22252aff' : '#d4d4d8',
                                opacity: index === activeIndex ? 0.9 : 0.7,
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* CSS for smooth animations */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    )
}

export default ExperienceSection
