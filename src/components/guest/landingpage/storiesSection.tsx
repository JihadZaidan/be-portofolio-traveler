import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, Heart, Send, MoreHorizontal } from 'lucide-react'

interface StoryItem {
    id: number
    type: 'image' | 'video'
    url: string
    duration?: number
}

interface Highlight {
    id: number
    label: string
    coverImage: string
    timestamp: string
    stories: StoryItem[]
}

const highlights: Highlight[] = [
    {
        id: 1,
        label: 'Bali',
        coverImage: '/foto 2.jpg',
        timestamp: '54w',
        stories: [
            { id: 101, type: 'image', url: '/foto 2.jpg' },
            { id: 102, type: 'image', url: '/foto 5.jpg' },
            { id: 103, type: 'image', url: '/foto 7.jpg' }
        ]
    },
    {
        id: 2,
        label: 'Tokyo',
        coverImage: '/foto 1.jpg',
        timestamp: '12w',
        stories: [
            { id: 201, type: 'image', url: '/foto 1.jpg' }
        ]
    },
    {
        id: 3,
        label: 'Alps',
        coverImage: '/foto 3.jpg',
        timestamp: '8w',
        stories: [
            { id: 301, type: 'image', url: '/foto 3.jpg' },
            { id: 302, type: 'image', url: '/foto 4.jpg' }
        ]
    },
    {
        id: 4,
        label: 'NYC',
        coverImage: '/foto 4.jpg',
        timestamp: '4w',
        stories: [
            { id: 401, type: 'image', url: '/foto 4.jpg' }
        ]
    },
    {
        id: 5,
        label: 'Iceland',
        coverImage: '/foto 5.jpg',
        timestamp: '2w',
        stories: [
            { id: 501, type: 'image', url: '/foto 5.jpg' }
        ]
    },
    {
        id: 6,
        label: 'Marrakech',
        coverImage: '/foto 6.jpg',
        timestamp: '1w',
        stories: [
            { id: 601, type: 'image', url: '/foto 6.jpg' }
        ]
    },
    {
        id: 7,
        label: 'Paris',
        coverImage: '/foto 7.jpg',
        timestamp: '3d',
        stories: [
            { id: 701, type: 'image', url: '/foto 7.jpg' }
        ]
    },
]

const StoryViewer: React.FC<{
    highlights: Highlight[]
    initialHighlightIndex: number
    onClose: () => void
}> = ({ highlights, initialHighlightIndex, onClose }) => {
    // State for which Highlight we are in
    const [currentHighlightIndex, setCurrentHighlightIndex] = useState(initialHighlightIndex)
    // State for which Story Item within the Highlight we are showing
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
    // Progress of the current story item
    const [progress, setProgress] = useState(0)

    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    const STORY_DURATION = 5000

    // Current Data context
    const currentHighlight = highlights[currentHighlightIndex]
    const currentStoryItem = currentHighlight.stories[currentStoryIndex]

    // --- NAVIGATION LOGIC ---

    const handleNextStory = () => {
        if (currentStoryIndex < currentHighlight.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
            setProgress(0)
        } else {
            handleNextHighlight()
        }
    }

    const handlePrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
            setProgress(0)
        } else {
            handlePrevHighlight()
        }
    }

    const handleNextHighlight = () => {
        if (currentHighlightIndex < highlights.length - 1) {
            setCurrentHighlightIndex(prev => prev + 1)
            setCurrentStoryIndex(0)
            setProgress(0)
        } else {
            onClose()
        }
    }

    const handlePrevHighlight = () => {
        if (currentHighlightIndex > 0) {
            setCurrentHighlightIndex(prev => prev - 1)
            setCurrentStoryIndex(0)
            setProgress(0)
        }
    }

    useEffect(() => {
        setProgress(0)
        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNextStory()
                    return 0
                }
                return prev + (100 / (STORY_DURATION / 100))
            })
        }, 100)

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHighlightIndex, currentStoryIndex])

    // --- PREVIEWS ---
    const prevHighlight = currentHighlightIndex > 0 ? highlights[currentHighlightIndex - 1] : null
    const nextHighlight = currentHighlightIndex < highlights.length - 1 ? highlights[currentHighlightIndex + 1] : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 z-50">
                <img src="/logo-white.png" alt="" className="h-8 opacity-0" />
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 text-white hover:scale-110 transition-transform"
            >
                <X size={28} />
            </button>

            {/* Main Layout: Prev Preview | Main Story | Next Preview */}
            <div className="relative flex items-center w-full max-w-6xl h-full p-4 gap-4 md:gap-12 justify-center">

                {/* Prev Highlight Preview / Button */}
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={handlePrevHighlight}>
                    {prevHighlight ? (
                        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                            <img src={prevHighlight.coverImage} className="w-full h-full object-cover grayscale" alt="Prev" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <ChevronLeft className="text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium">{prevHighlight.label}</div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[9/16]" />
                    )}
                </div>

                {/* --- CENTRAL STORY --- */}
                <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl shrink-0">

                    {/* Header & Progress */}
                    <div className="absolute top-0 left-0 right-0 z-20 pt-3 px-3 bg-gradient-to-b from-black/60 to-transparent pb-12">
                        {/* Progress Bars */}
                        <div className="flex gap-1 mb-3">
                            {currentHighlight.stories.map((_, idx) => (
                                <div key={idx} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentStoryIndex ? 'w-full' : idx === currentStoryIndex ? '' : 'w-0'
                                            }`}
                                        style={{ width: idx === currentStoryIndex ? `${progress}%` : undefined }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* User Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img src="/foto 6.jpg" alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm font-semibold text-shadow-sm">Rizqi Maulana</span>
                                    <span className="text-white/60 text-xs font-medium">{currentHighlight.timestamp}</span>
                                </div>
                            </div>
                            <button className="text-white hover:opacity-80">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <img
                        src={currentStoryItem.url}
                        alt={currentHighlight.label}
                        className="w-full h-full object-cover"
                    />

                    {/* Touch Navigation Zones (Internal Story Nav) */}
                    <div className="absolute inset-y-0 left-0 w-1/4 z-10" onClick={handlePrevStory} />
                    <div className="absolute inset-y-0 right-0 w-1/4 z-10" onClick={handleNextStory} />

                    {/* Footer Interactive Area */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Reply to Rizqi...`}
                                className="w-full bg-transparent border border-white/40 rounded-full py-2.5 px-4 text-white text-sm placeholder:text-white/70 focus:outline-none focus:border-white"
                            />
                        </div>
                        <button className="p-2 text-white hover:scale-110 transition-transform">
                            <Heart size={28} />
                        </button>
                        <button className="p-2 text-white hover:scale-110 transition-transform">
                            <Send size={26} className="-rotate-12 translate-y-[-2px]" />
                        </button>
                    </div>
                </div>

                {/* Next Highlight Preview / Button */}
                <div className="hidden md:flex flex-col items-center justify-center w-[200px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer transform scale-75" onClick={handleNextHighlight}>
                    {nextHighlight ? (
                        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                            <img src={nextHighlight.coverImage} className="w-full h-full object-cover grayscale" alt="Next" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <ChevronRight className="text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium">{nextHighlight.label}</div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[9/16] flex items-center justify-center">
                            <div onClick={onClose} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                                <X />
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Buttons */}
                <button onClick={handlePrevStory} className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm text-white z-20">
                    <ChevronLeft />
                </button>
                <button onClick={handleNextStory} className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full backdrop-blur-sm text-white z-20">
                    <ChevronRight />
                </button>
            </div>
        </div>
    )
}

const StoriesSection: React.FC = () => {
    const scrollContainer = useRef<HTMLDivElement>(null)
    const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = 300
            scrollContainer.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="py-8 bg-gray-100 mt-16" id="stories">
            {/* Viewer Modal */}
            {selectedHighlightIndex !== null && (
                <StoryViewer
                    highlights={highlights}
                    initialHighlightIndex={selectedHighlightIndex}
                    onClose={() => setSelectedHighlightIndex(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-3xl font-semibold text-slate-900">Travel Journal</h2>
                    <p className="text-slate-500 mt-2">Snippets from my global adventures.</p>
                </div>

                {/* Carousel Container */}
                <div className="relative group flex items-center">
                    {/* Controls - Always visible */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 z-10 w-15 h-15 -ml-4 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors shadow-sm"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-full h-full text-gray-900" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 z-10 w-15 h-15 -mr-4 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:bg-gray-200 transition-colors shadow-sm"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-full h-full text-gray-900" />
                    </button>

                    {/* Scroll Area */}
                    <div
                        ref={scrollContainer}
                        className="flex gap-8 justify-center overflow-x-auto pb-4 pt-2 px-8 w-full mx-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {highlights.map((highlight, index) => (
                            <div
                                key={highlight.id}
                                className="flex-none cursor-pointer group/story flex flex-col items-center gap-3"
                                onClick={() => setSelectedHighlightIndex(index)}
                            >
                                {/* Highlight Ring */}
                                <div className="relative p-[3.5px] rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-pink-500 transition-transform duration-300 group-hover/story:scale-105">
                                    <div className="bg-white p-[5px] rounded-full">
                                        <div className="w-24 h-36 md:w-28 md:h-40 rounded-full overflow-hidden relative">
                                            <img
                                                src={highlight.coverImage}
                                                alt={highlight.label}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/story:scale-110"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <span className="text-sm font-medium text-slate-700">{highlight.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StoriesSection
