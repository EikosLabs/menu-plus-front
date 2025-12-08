import { useState, useRef } from 'react';
import aiService from '../services/aiService';
import menuService from '../services/menuService';

export default function MenuScanner({ onAnalysisComplete, onCancel, menuId, foodBusinessId }) {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleImageUpload = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Por favor, sube un archivo de imagen válido');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('La imagen es demasiado grande. Máximo 10MB');
            return;
        }

        setError(null);
        setImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);
        setProgress(10);

        try {
            // First, upload image to MinIO to get the key
            setProgress(20);
            const imageKey = await menuService.uploadImage(image);
            
            if (!imageKey) {
                throw new Error('No se pudo subir la imagen');
            }

            // Send imageKey with special prefix so backend knows to generate presigned URL
            const imageIdentifier = `minio://${imageKey}`;
            
            setProgress(50);
            const analysis = await aiService.analyzeMenuImage(imageIdentifier, menuId, foodBusinessId);
            
            setProgress(90);

            if (analysis.success) {
                setProgress(100);
                onAnalysisComplete(analysis.data);
            } else {
                setError(analysis.error || 'Error al analizar el menú');
            }
        } catch (err) {
            setError(err.message || 'Error al procesar la imagen');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 max-w-2xl w-full mx-auto relative z-[10000]">
            {/* Decorative corner */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 border-2 border-black z-10"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-400 border-2 border-black z-10"></div>

            {/* Close Button */}
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-500 hover:text-black hover:scale-110 transition-transform p-2 z-50"
                title="Cerrar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="mb-6 sm:mb-8 text-center pt-4">
                <h2 className="text-2xl sm:text-3xl font-black mb-3 uppercase tracking-tight break-words">
                    Escanear Menú
                </h2>
                <p className="text-gray-600 font-medium text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                    Sube una foto de tu menú y nuestra IA extraerá mágicamente todos los platos
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 relative animate-pulse">
                    <p className="font-bold">¡Ups! Algo salió mal</p>
                    <p>{error}</p>
                    <button 
                        onClick={() => setError(null)} 
                        className="absolute top-2 right-2 text-red-700 hover:text-red-900 font-bold text-xl"
                    >
                        ×
                    </button>
                </div>
            )}

            {!imagePreview ? (
                <div
                    className="border-4 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 sm:p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group touch-manipulation"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        <svg
                            className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-gray-400 group-hover:text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <p className="mb-2 text-lg sm:text-xl font-bold text-gray-700 group-hover:text-blue-600">
                        Arrastra tu menú aquí
                    </p>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">o haz clic para buscar en tu equipo</p>
                    <p className="text-xs text-gray-400 mt-4 font-mono bg-gray-200 inline-block px-2 py-1 rounded">
                        Soporta: PNG, JPG, WEBP (Máx 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-lg"></div>
                        <img
                            src={imagePreview}
                            alt="Menu preview"
                            className="relative w-full h-80 object-contain bg-gray-100 border-2 border-black rounded-lg"
                        />
                        <button
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="absolute top-4 right-4 bg-white border-2 border-black text-black rounded-full p-2 hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20"
                            title="Eliminar imagen"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {loading && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                                <span className="animate-pulse text-blue-600">
                                    {progress < 30 ? 'Subiendo imagen...' : 
                                     progress < 80 ? 'Analizando con IA...' : 
                                     'Extrayendo platos...'}
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 border-2 border-black rounded-full h-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/20 z-10 bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(0,0,0,.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,.1)_50%,rgba(0,0,0,.1)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]"></div>
                                <div
                                    className="bg-blue-500 h-full transition-all duration-500 ease-out border-r-2 border-black"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border-2 border-black bg-white text-black font-bold rounded-lg hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-center"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="flex-[2] bg-blue-500 text-white border-2 border-black py-3 px-6 rounded-lg font-black uppercase tracking-wide hover:bg-blue-400 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 text-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span>Analizar Menú</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
