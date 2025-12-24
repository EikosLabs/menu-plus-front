import React from 'react';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="w-full relative z-10 border-t-2 border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🍽️</span>
                        <span className="text-sm font-bold text-gray-800">MenuPlus</span>
                        <span className="text-xs text-gray-400">© {year}</span>
                    </div>

                    {/* Support & Contact */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                        <a
                            href="tel:+59891402350"
                            className="flex items-center gap-1.5 text-gray-600 hover:text-neo-flame transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Soporte: +598 91 402 350</span>
                        </a>
                        <a
                            href="https://wa.me/59891402350"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
                        >
                            <span className="text-sm">💬</span>
                            <span>WhatsApp</span>
                        </a>
                    </div>

                    {/* Powered by */}
                    <a
                        href="https://eikoslabs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neo-flame transition-colors"
                    >
                        <span>Hecho por</span>
                        <span className="font-bold">Eikos Labs</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}

