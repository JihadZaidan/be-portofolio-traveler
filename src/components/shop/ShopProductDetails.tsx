import React, { useState } from 'react';

const FULL_TEXT =
    "Hello, I'm Rizqi, a professional SEO content writer with 7 years of industry experience. I hold an MBA degree and specialize in creating content that not only informs but drives results. My expertise spans SEO writing, digital content strategy, and crafting high-converting copy for websites, blogs, and marketing campaigns. I'm passionate about helping businesses boost their online presence and connect with their audience through well-crafted engaging content. Reach out today, and let's bring your vision to life with content that converts!";

const ShopProductDetails: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-12 space-y-4 text-sm text-slate-700 max-w-3xl">
            <p className="font-semibold text-slate-900 text-lg md:text-xl">
                Professional Copywriting and Content Writing
            </p>
            <p
                className={`text-base md:text-lg text-slate-700 ${
                    expanded ? 'line-clamp-none' : 'line-clamp-4 overflow-hidden'
                }`}
            >
                {FULL_TEXT}
            </p>

            {FULL_TEXT.length > 220 && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-xs font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
                >
                    {expanded ? 'Read less' : 'Read more'}
                </button>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <span className="text-xs text-slate-500">Trusted by:</span>
                <div className="flex flex-wrap items-center gap-4">
                    <img
                        src="/Amazon-Logo 1.png"
                        alt="Amazon logo"
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/Hilton-Logo 1.png"
                        alt="Hilton logo"
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/Verizon-Logo 1.png"
                        alt="Verizon logo"
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/Williams-Sonoma-Logo 1.png"
                        alt="Williams Sonoma logo"
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/Dr-Bronners-Logo 1.png"
                        alt="Dr Bronners logo"
                        className="h-12 w-auto object-contain"
                    />
                    <img
                        src="/Purina-Logo 1.png"
                        alt="Purina logo"
                        className="h-12 w-auto object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default ShopProductDetails;
