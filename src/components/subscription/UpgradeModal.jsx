import React, { useState } from 'react';
import { useTranslation } from '../../i18n/utils';

export default function UpgradeModal({ isOpen, onClose, trigger = "feature" }) {
    const { t } = useTranslation();
    const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly, annual, lifetime

    if (!isOpen) return null;

    const handleUpgrade = (plan) => {
        // Redirect to backend checkout or show Stripe element
        // For now, redirect to a checkout initiation endpoint which redirects to Stripe
        // Or just link to a page that handles it
        // Let's assume we have a checkout route in frontend that handles API call
        window.location.href = `/checkout?plan=${plan}`;
    };

    const benefits = [
        { text: "Crear negocios y menús ilimitados", icon: "🚀" },
        { text: "Escaneo de menús con Inteligencia Artificial", icon: "✨" },
        { text: "Sin marca de agua en tus menús", icon: "💎" },
        { text: "Generador de Flyers y Cartas PDF", icon: "📄" },
        { text: "Soporte prioritario", icon: "❤️" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-4 border-neo-black shadow-neo-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-card relative animate-slide-up">

                {/* Header */}
                <div className="bg-neo-lavender p-6 border-b-4 border-neo-black flex justify-between items-start">
                    <div className='pr-8'>
                        <h2 className="text-2xl md:text-3xl font-black text-neo-black mb-2">
                            🚀 Desbloquea todo el potencial
                        </h2>
                        <p className="text-neo-black font-medium">
                            Has alcanzado el límite de tu plan gratuito. Actualiza para continuar creciendo.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-red-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-neo-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className='space-y-4'>
                            <h3 className="font-black text-lg text-neo-black mb-4 border-b-2 border-neo-black inline-block">Beneficios Pro</h3>
                            <ul className="space-y-3">
                                {benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-xl">{b.icon}</span>
                                        <span className="font-bold text-neo-gray text-sm md:text-base">{b.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pricing Options */}
                        <div className="bg-gray-50 p-4 border-2 border-neo-black neo-shadow-sm">
                            <div className="flex bg-white border-2 border-neo-black mb-4 p-1">
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`flex-1 py-2 font-black text-sm transition-all ${billingPeriod === 'monthly' ? 'bg-neo-black text-white' : 'text-neo-black hover:bg-gray-100'}`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('annual')}
                                    className={`flex-1 py-2 font-black text-sm transition-all ${billingPeriod === 'annual' ? 'bg-neo-black text-white' : 'text-neo-black hover:bg-gray-100'}`}
                                >
                                    Anual
                                </button>
                            </div>

                            {billingPeriod === 'monthly' ? (
                                <div className="text-center mb-4">
                                    <div className="text-4xl font-black text-neo-black">$10<span className="text-lg font-normal text-neo-gray">/mes</span></div>
                                    <p className="text-xs text-neo-gray font-bold mt-1">Cancela cuando quieras</p>
                                </div>
                            ) : (
                                <div className="text-center mb-4">
                                    <div className="text-4xl font-black text-neo-black">$79<span className="text-lg font-normal text-neo-gray">/año</span></div>
                                    <p className="text-xs text-green-600 font-black mt-1 bg-green-100 inline-block px-2 py-1 border border-green-600 rounded">Ahorras 35%</p>
                                </div>
                            )}

                            <button
                                onClick={() => handleUpgrade(billingPeriod === 'monthly' ? 'pro_monthly' : 'pro_annual')}
                                className="w-full py-3 bg-neo-flame text-white font-black border-2 border-neo-black shadow-neo hover:translate-y-px hover:shadow-none transition-all flex justify-center items-center gap-2"
                            >
                                <span>⚡ Actualizar Ahora</span>
                            </button>

                            <div className='text-center mt-3'>
                                <button onClick={() => handleUpgrade('lifetime')} className='text-xs font-bold text-neo-black hover:underline'>
                                    O obtén acceso de por vida por $199
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
