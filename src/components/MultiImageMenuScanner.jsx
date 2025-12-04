import React, { useState, useRef, useCallback } from 'react';
import aiService from '../services/aiService';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ui/ErrorAlert';

export default function MultiImageMenuScanner({ 
    onAnalysisComplete, 
    onCancel, 
    menuId, 
    foodBusinessId 
}) {
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const [imageProgress, setImageProgress] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (files) => {
        const newImages = [];
        const newPreviews = [];

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Por favor, sube solo archivos de imagen');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError('Las imágenes no deben superar 10MB cada una');
                return;
            }

            newImages.push(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push({
                    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    url: e.target.result,
                    name: file.name,
                    size: file.size,
                    status: 'pending'
                });
                
                if (newPreviews.length === files.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                    setImages(prev => [...prev, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    }, []);

    const handleFileSelect = useCallback((e) => {
        const files = e.target.files;
        handleImageUpload(files);
    }, []);

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[imagePreviews[index]?.id];
            return newProgress;
        });
    };

    const moveImage = (fromIndex, toIndex) => {
        const newPreviews = [...imagePreviews];
        const [movedImage] = newPreviews.splice(fromIndex, 1);
        newPreviews.splice(toIndex, 0, movedImage);
        setImagePreviews(newPreviews);
        
        const newImages = [...images];
        const [movedImg] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImg);
        setImages(newImages);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleImageDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        
        moveImage(draggedIndex, dropIndex);
        setDraggedIndex(null);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAnalyze = async () => {
        if (images.length === 0) return;

        setLoading(true);
        setError(null);
        setOverallProgress(10);

        try {
            // Convert all images to base64
            setOverallProgress(20);
            const imageBase64Array = await Promise.all(
                images.map(img => convertToBase64(img))
            );

            // Analyze with AI
            setOverallProgress(30);
            const analysis = await aiService.analyzeMultipleMenuImages(
                imageBase64Array, 
                menuId, 
                foodBusinessId
            );

            setOverallProgress(90);
            onAnalysisComplete(analysis.data);
        } catch (err) {
            setError(err.message || 'Error al procesar las imágenes');
        } finally {
            setLoading(false);
            setOverallProgress(0);
        }
    };

    return (
        <div className="neo-card bg-white p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="neo-heading neo-h2 text-2xl mb-2">Escanear Menú Múltiple</h2>
                <p className="neo-text text-neo-gray mb-4">
                    Sube varias imágenes de tu menú para un análisis completo. Puedes reordenarlas antes de procesar.
                </p>
            </div>

            {error && (
                <ErrorAlert error={error} onClose={() => setError(null)} />
            )}

            {!imagePreviews.length ? (
                <div
                    className="border-2 border-dashed border-neo-gray rounded-lg p-8 text-center hover:border-neo-flame transition-colors cursor-pointer"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg
                        className="mx-auto h-12 w-12 text-neo-gray mb-4"
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
                    <p className="neo-text text-neo-gray mb-2">
                        Arrastra y suelta imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="neo-text-sm text-neo-gray">
                        Formatos: JPG, PNG, WebP (máx. 10MB por imagen)
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div
                                key={preview.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleImageDrop(e, index)}
                                className="relative group cursor-move"
                            >
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-neo-gray hover:border-neo-flame transition-colors">
                                    <img
                                        src={preview.url}
                                        alt={preview.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="mt-2">
                                    <p className="neo-text-sm text-neo-gray truncate">{preview.name}</p>
                                    <p className="neo-text-xs text-neo-gray">
                                        {(preview.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-neo-gray hover:border-neo-flame transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <div className="text-center">
                                <svg
                                    className="mx-auto h-8 w-8 text-neo-gray mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <p className="neo-text-sm text-neo-gray">Agregar imagen</p>
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="neo-text-sm text-neo-gray">Procesando imágenes...</span>
                                <span className="neo-text-sm text-neo-gray">{overallProgress}%</span>
                            </div>
                            <div className="w-full bg-neo-gray rounded-full h-2">
                                <div
                                    className="bg-neo-flame h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="neo-button-secondary px-6 py-2 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || images.length === 0}
                            className="neo-button-primary px-6 py-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                `Analizar ${images.length} imagen${images.length !== 1 ? 'es' : ''}`
                            )}
                        </button>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}