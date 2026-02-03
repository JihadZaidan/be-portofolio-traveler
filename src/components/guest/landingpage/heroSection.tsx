
import React from 'react'
import { Star } from 'lucide-react'
import { Button } from '../../ui/button'

const HeroSection: React.FC = () => {
  return (
    <main className="max-w-7xl flex flex-col md:flex-row items-center md:items-start md:justify-between gap-8 px-4 mx-auto py-16">
      {/* Left Content */}
      <section className="flex-1 space-y-6" id="home">
        <div className="inline-flex items-center gap-3 rounded-full bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
            <Star className="h-3.5 w-3.5" />
          </span>
          <span className="tracking-wide uppercase text-gray-400">Digital Nomad & Creative Strategist</span>
        </div>

        <h1 className="text-[40px] md:text-[54px] font-semibold leading-tight text-slate-900 tracking-tight">
          Crafting narratives
          <br />
          that
          <span className="text-sky-500"> move the world.</span>
        </h1>

        <p className="max-w-xl text-[15px] leading-relaxed text-slate-500">
          Bridging the gap between global marketing strategy and authentic storytelling. Based in Bali, working globally.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            size="lg"
            className=" hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            View Work
          </Button>
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-transparent text-gray-900 hover:bg-slate-100"
            onClick={() => {
              const target = document.getElementById('stories')
              if (target) {
                const yOffset = -140
                const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
                window.scrollTo({ top: y, behavior: 'smooth' })
              }
            }}
          >
            <span>Explore Stories</span>
            <span className="text-lg">→</span>
          </Button>
        </div>

        {/* Featured brands */}
        {(() => {
          const brands = [
            { src: '/Amazon-Logo 1.png', alt: 'Amazon logo' },
            { src: '/Hilton-Logo 1.png', alt: 'Hilton logo' },
            { src: '/Verizon-Logo 1.png', alt: 'Verizon logo' },
            { src: '/Williams-Sonoma-Logo 1.png', alt: 'Williams Sonoma logo' },
            { src: '/Dr-Bronners-Logo 1.png', alt: 'Dr. Bronners logo' },
            { src: '/Purina-Logo 1.png', alt: 'Purina logo' },
          ]
          const MAX_VISIBLE = 11
          const visibleBrands = brands.slice(0, MAX_VISIBLE)
          const remainingCount = brands.length - MAX_VISIBLE

          return (
            <div className="mt-30 space-y-1">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {visibleBrands.map((brand, index) => (
                  <img
                    key={index}
                    src={brand.src}
                    alt={brand.alt}
                    className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  />
                ))}
                {remainingCount > 0 && (
                  <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </section>

      {/* Right Image Grid */}
      <section className="relative flex-1 hidden md:block">
        <div className="relative mx-auto w-full max-w-[600px]">

          <div className="flex gap-4 items-end justify-center">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[230px] rounded-tl-[100px] overflow-hidden">
                <img src="/foto 2.jpg" alt="Gallery 1" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[170px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 1.jpg" alt="Gallery 2" className="w-full h-full object-cover" />
              </div>
              {/* Image 3 */}
              <div className="h-[190px] rounded-tr-[100px] overflow-hidden">
                <img src="/foto 3.jpg" alt="Gallery 3" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[250px] rounded-t-[30px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 4.jpg" alt="Gallery 4" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[250px] rounded-tl-[100px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 5.jpg" alt="Gallery 5" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 w-[180px]">
              {/* Image 1 */}
              <div className="h-[210px] rounded-l-[100px] rounded-br-[100px] overflow-hidden">
                <img src="/foto 6.jpg" alt="Gallery 6" className="w-full h-full object-cover" />
              </div>
              {/* Image 2 */}
              <div className="h-[220px] rounded-tl-[100px] rounded-bl-[30px] overflow-hidden">
                <img src="/foto 7.jpg" alt="Gallery 7" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HeroSection

