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

                    {/* Powered by */}
                    <a
                        href="https://eikoslabs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neo-flame transition-colors"
                    >
                        <span>Desarrollado por</span>
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

