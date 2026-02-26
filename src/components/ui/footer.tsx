import React from 'react';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const footerColumns = [
    {
        title: 'Company',
        links: ['About', 'Features', 'Works', 'Career'],
    },
    {
        title: 'Help',
        links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'],
    },
    {
        title: 'FAQ',
        links: ['Account', 'Manage Deliveries', 'Orders', 'Payments'],
    },
    {
        title: 'Resources',
        links: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist'],
    },
];

const Footer: React.FC = () => {
    return (
        <footer id="contact" className="w-full bg-[#e8f3fb]">
            <div className="mx-auto max-w-6xl py-12 md:py-16">
                <div className="grid gap-10 md:grid-cols-[1.4fr_3fr] items-start">
                    {/* Brand + description */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Rizwords</h2>
                            <p className="mt-2 max-w-xs text-sm text-slate-600">
                                We have clothes that suits your style and which you're proud to wear. From
                                women to men.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
                                aria-label="Github"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="grid gap-8 md:grid-cols-4 text-sm">
                        {footerColumns.map((column) => (
                            <div key={column.title} className="space-y-3">
                                <h3 className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    {column.title}
                                </h3>
                                <ul className="space-y-2">
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="text-sm text-slate-700 hover:text-slate-900 transition-colors"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>Rizwords © 2026-2027, All Rights Reserved</p>

                    <div className="flex items-center gap-0">
                        <img src="/icon-visa.png" alt="Visa" className="h-15 w-auto" />
                        <img src="/icon-mastercard.png" alt="Mastercard" className="h-15 w-auto" />
                        <img src="/icon-paypal.png" alt="Paypal" className="h-15 w-auto" />
                        <img src="/icon-applepay.png" alt="Apple Pay" className="h-15 w-auto" />
                        <img src="/icon-googlepay.png" alt="Google Pay" className="h-15 w-auto" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
