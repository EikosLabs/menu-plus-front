import React, { useState } from 'react';
import OnboardingStep from '../OnboardingStep';
import MultiImageMenuScanner from '../../MultiImageMenuScanner';

/**
 * Paso 6: Escaneo de Menú (Opcional)
 * Permite digitalizar el menú usando IA
 */
export default function StepScanMenu({
    formData,
    updateFormData,
    onOpenScanner,
    isActive
}) {
    const icon = (
        <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
        </svg>
    );

    const scannedCount = formData.scannedSections?.reduce((acc, section) => acc + (section.items?.length || 0), 0) || 0;

    return (
        <OnboardingStep
            title="Digitaliza tu Menú"
            description="Sube fotos de tu menú físico y nuestra IA extraerá los platos automáticamente mientras continúas"
            icon={icon}
            isActive={isActive}
        >
            <div className="flex flex-col items-center gap-6 py-4">
                {formData.isScanning ? (
                    <div className="text-center space-y-4 w-full">
                        <div className="bg-orange-50 border-2 border-orange-500 p-6 rounded-2xl shadow-neo-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-flame mx-auto mb-4"></div>
                            <h3 className="text-neo-black font-black uppercase mb-2">Análisis en curso</h3>
                            <p className="text-sm text-gray-600 mb-4">Estamos digitalizando tu menú. Puedes seguir con los siguientes pasos mientras terminamos.</p>
                            <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black overflow-hidden">
                                <div
                                    className="bg-neo-flame h-full transition-all duration-500"
                                    style={{ width: `${formData.scanProgress}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-xs font-black text-neo-flame">{Math.round(formData.scanProgress)}%</p>
                        </div>
                    </div>
                ) : !formData.scannedSections ? (
                    <div className="text-center space-y-4">
                        <div className="bg-neo-lavender-dark p-6 rounded-2xl border-2 border-black shadow-neo-sm">
                            <p className="text-neo-black font-bold mb-4 italic">
                                "¿Tienes tu menú en papel o en un PDF? Digitalízalo ahora y nosotros hacemos el trabajo."
                            </p>
                            <button
                                type="button"
                                onClick={onOpenScanner}
                                className="neo-btn neo-btn-primary px-8 py-3 flex items-center justify-center gap-2 mx-auto"
                            >
                                <span>Escanear ahora con IA</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="bg-green-50 border-2 border-green-500 p-4 rounded-xl flex items-center justify-between shadow-neo-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-black">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-neo-black font-black uppercase text-sm">Menú Extraído con Éxito</p>
                                    <p className="text-xs text-green-700 font-bold">{formData.scannedSections.length} secciones y {scannedCount} platos detectados</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onOpenScanner}
                                className="text-xs font-black uppercase text-neo-flame hover:underline"
                            >
                                Volver a escanear
                            </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto border-2 border-black rounded-xl p-2 bg-gray-50">
                            {formData.scannedSections.map((section, idx) => (
                                <div key={idx} className="mb-2 p-2 bg-white border border-gray-200 rounded-lg flex justify-between items-center shadow-sm">
                                    <span className="text-sm font-bold text-gray-800">{section.name}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold">{section.items?.length || 0} ítems</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </OnboardingStep>
    );
}
