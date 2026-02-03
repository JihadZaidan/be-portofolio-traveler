import React from 'react'
import { useNavigate } from 'react-router-dom'

const AboutSection: React.FC = () => {
    const navigate = useNavigate()

    return (
        <section id="about" className="py-20 bg-white overflow-hidden mt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

                    {/* Left Column */}
                    <div className="relative w-full md:w-2/5 flex justify-center items-center">
                        <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] z-0">

                            {/* Layer 1 */}
                            <div className="absolute top-0 right-[-10%] w-full h-full bg-[#E0F2FE] rounded-full z-0 pointer-events-none" />

                            {/* Layer 2 */}
                            <div className="absolute inset-0 m-auto w-full h-full rounded-full border border-cyan-400/80 scale-[1.03] z-10 pointer-events-none rotate-[-12deg] left-[-10%] -mt-4">
                                {/* Planet 1 */}
                                <div className="absolute top-[10%] right-[-4%] w-16 h-16 md:w-20 md:h-20 bg-cyan-400 rounded-full shadow-md" />

                                {/* Planet 2 */}
                                <div className="absolute top-[50%] -left-[3%] w-6 h-6 bg-cyan-400 rounded-full shadow-sm" />

                                {/* Planet 3 */}
                                <div className="absolute bottom-[23%] left-[0%] w-8 h-8 md:w-9 md:h-9 bg-cyan-300 rounded-full shadow-sm" />
                            </div>

                            {/* Layer 3 */}
                            <div className="relative w-full h-full rounded-full overflow-hidden z-10">
                                <img
                                    src="/rizwords-nomad.jpg"
                                    alt="Working in Bali"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full md:w-3/5 text-left">
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                            Why You <span className="text-sky-500">Hire Me</span> for <br />
                            Your Next Projects?
                        </h2>

                        <p className="mt-6 text-slate-500 text-sm leading-relaxed">
                            With over 5 years of experience and a deep understanding of copywriting psychology, marketing funnel, stages of awareness, and market sophistication I'll connect your brand with your target audience's pain points through ads and content. Then present your product as the perfect solution for their problems.
                        </p>

                        {/* Stats Pills */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="bg-sky-50 px-6 py-2 rounded-full flex items-center gap-2">
                                <span className="text-sky-500 text-xl font-bold">5+</span>
                                <span className="text-slate-700 font-medium text-sm">Years Experience</span>
                            </div>
                            <div className="bg-sky-50 px-6 py-3 rounded-full flex items-center gap-2">
                                <span className="text-sky-500 text-xl font-bold">100+</span>
                                <span className="text-slate-700 font-medium text-sm">Projects</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/work/shop')}
                                className="px-8 py-3 rounded-full border-2 border-sky-500 text-sm text-sky-500 font-semibold hover:bg-sky-500 hover:text-white transition-colors duration-300"
                            >
                                Hire Me
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default AboutSection
