import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpRight, X } from 'lucide-react'

interface PortfolioItem {
    id: number
    image: string
    title: string
}

interface Category {
    id: string
    name: string
    items: PortfolioItem[]
}

const portfolioData: Category[] = [
    {
        id: 'product-description',
        name: 'PRODUCT DESCRIPTION',
        items: [
            { id: 1, image: '/Williams-Sonoma-Lunar.png', title: 'Williams Sonoma Lunar Dinnerware Set' },
            { id: 2, image: '/Dr-Bronners-Pure.png', title: 'Dr. Bronner\'s Pure Castile Peppermint' }
        ]
    },
    {
        id: 'social-media',
        name: 'SOCIAL MEDIA',
        items: [
            { id: 3, image: '/Sudio-K2.png', title: 'Summer Vibes Collection' },
            { id: 4, image: '/Alphalete-Elite.png', title: 'Viral Travel Series' }
        ]
    },
    {
        id: 'landing-page',
        name: 'LANDING PAGE',
        items: [
            { id: 5, image: '/flowtrack.png', title: 'SaaS Product Launch Page' },
            { id: 6, image: '/truebotanicals.png', title: 'Fashion Brand Homepage' }
        ]
    },
    {
        id: 'ads-copy',
        name: 'ADS COPY',
        items: [
            { id: 7, image: '/foto 7.jpg', title: 'High-Converting Ad Campaign' },
            { id: 8, image: '/foto 1.jpg', title: 'Retargeting Campaign Copy' }
        ]
    },
    {
        id: 'articles',
        name: 'ARTICLES',
        items: [
            { id: 9, image: '/foto 2.jpg', title: 'Hidden Gems of Southeast Asia' },
            { id: 10, image: '/foto 3.jpg', title: 'The Art of Slow Travel' }
        ]
    },
    {
        id: 'email',
        name: 'EMAIL',
        items: [
            { id: 11, image: '/foto 4.jpg', title: 'Weekly Travel Digest' },
            { id: 12, image: '/foto 5.jpg', title: 'Flash Sale Campaign' }
        ]
    }
]

// Image Modal Component
const ImageModal: React.FC<{
    image: string
    title: string
    onClose: () => void
}> = ({ image, title, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'auto'
        }
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 text-white hover:scale-110 transition-transform bg-white/10 rounded-full backdrop-blur-sm"
            >
                <X size={28} />
            </button>

            {/* Image Container */}
            <div
                className="relative max-w-4xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image}
                    alt={title}
                    className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                <p className="text-white text-center mt-4 text-lg font-medium">{title}</p>
            </div>
        </div>
    )
}

const PortfolioSection: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState(0)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedImage, setSelectedImage] = useState<{ image: string; title: string } | null>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const isScrolling = useRef(false)

    const totalSlides = portfolioData.length

    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        const handleScroll = () => {
            if (isScrolling.current) return

            const scrollLeft = slider.scrollLeft
            const slideWidth = slider.clientWidth
            const newSlide = Math.round(scrollLeft / slideWidth)

            if (newSlide !== currentSlide && newSlide >= 0 && newSlide < totalSlides) {
                setCurrentSlide(newSlide)
                setActiveCategory(newSlide)
            }
        }

        slider.addEventListener('scroll', handleScroll)
        return () => slider.removeEventListener('scroll', handleScroll)
    }, [currentSlide, totalSlides])

    const scrollToSlide = (index: number) => {
        if (sliderRef.current) {
            isScrolling.current = true
            const slideWidth = sliderRef.current.clientWidth
            sliderRef.current.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            })
            setCurrentSlide(index)
            setActiveCategory(index)
            setTimeout(() => {
                isScrolling.current = false
            }, 500)
        }
    }

    const handlePrev = () => {
        if (currentSlide > 0) {
            scrollToSlide(currentSlide - 1)
        }
    }

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            scrollToSlide(currentSlide + 1)
        }
    }

    const handleCategoryClick = (index: number) => {
        scrollToSlide(index)
    }

    const handleImageClick = (image: string, title: string) => {
        setSelectedImage({ image, title })
    }

    return (
        <section className="py-16 bg-white" id="portfolio">
            {/* Image Modal */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage.image}
                    title={selectedImage.title}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                        Let's Have a Look at<br />
                        my <span className="text-sky-500">Portfolio</span>.
                    </h2>
                    <button className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-full font-semibold text-sm hover:bg-sky-600 transition-colors">
                        Show More
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Slider Container */}
                <div className="relative">
                    {/* Navigation Arrows */}
                    <button
                        className={`absolute left-22 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-17 h-17 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 border border-white border-3 ${currentSlide === 0 ? 'cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        onClick={handlePrev}
                        disabled={currentSlide === 0}
                    >
                        <ChevronLeft size={56} />
                    </button>

                    <div
                        ref={sliderRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {portfolioData.map((category) => (
                            <div className="min-w-full snap-start px-8" key={category.id}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-14 max-w-5xl mx-auto">
                                    {category.items.map((item) => (
                                        <div
                                            className="relative group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 border-2 bg-white transition-all duration-300"
                                            key={item.id}
                                            onClick={() => handleImageClick(item.image, item.title)}
                                        >
                                            {/* Image Container - Fixed Size */}
                                            <div className="w-full h-72 md:h-80 overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Overlay on Hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center px-4">
                                                    <p className="font-semibold text-lg">{item.title}</p>
                                                    <p className="text-sm mt-2 text-white/80">Click to view</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className={`absolute right-22 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-17 h-17 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 border border-white border-3 ${currentSlide === totalSlides - 1 ? 'cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        onClick={handleNext}
                        disabled={currentSlide === totalSlides - 1}
                    >
                        <ChevronRight size={56} />
                    </button>
                </div>

                {/* Category Tags */}
                <div className="flex justify-center gap-3 mt-14 flex-wrap">
                    {portfolioData.map((category, index) => (
                        <button
                            key={category.id}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${activeCategory === index
                                ? 'bg-[#E0F2FE] text-[#0EA5E9]'
                                : 'bg-gray-100 text-gray-600 hover:bg-[#E0F2FE] hover:text-[#0EA5E9]'
                                }`}
                            onClick={() => handleCategoryClick(index)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* My Latest Project Section */}
                <div className="text-center mt-10">
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-900 inline-flex items-center gap-2">
                        My Latest Project
                        <span className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3 text-white" />
                        </span>
                    </h3>
                    <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque cursus finibus
                        arcu sit amet tempor. Praesent consequat, dolor vestibulum euismod blandit,
                        ligula urna blandit felis, gravida facilisis nunc enim a arcu.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default PortfolioSection
