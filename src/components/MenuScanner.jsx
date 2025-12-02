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
        <div className="neo-card bg-white p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Escanear Menú</h2>
                <p className="text-gray-600">
                    Sube una imagen de tu menú y nuestra IA extraerá automáticamente las secciones y platos
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button onClick={() => setError(null)} className="float-right font-bold">×</button>
                </div>
            )}

            {!imagePreview ? (
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Menu preview"
                            className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Analizando imagen...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Analizando...' : 'Analizar Menú'}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
