import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import aiService from '../services/aiService';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ui/ErrorAlert';

// Configure PDF.js worker using unpkg which hosts npm packages
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function MultiImageMenuScanner({
    onAnalysisComplete,
    onCancel,
    menuId,
    foodBusinessId
}) {
    const [files, setFiles] = useState([]); // { id, type: 'image'|'pdf', url, name, size, file, pageNumber? }
    const [loading, setLoading] = useState(false);
    const [processingPdf, setProcessingPdf] = useState(false);
    const [error, setError] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [currentAnalysisMessage, setCurrentAnalysisMessage] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [analysisPhase, setAnalysisPhase] = useState(''); // 'preparing', 'analyzing', 'processing', 'finalizing'
    const fileInputRef = useRef(null);

    // Messages for different analysis phases
    const analysisMessages = {
        preparing: [
            'Preparando la imagen...',
            'Optimizando calidad...',
            'Iniciando análisis...'
        ],
        analyzing: [
            'Detectando secciones del menú...',
            'Identificando platos...',
            'Extrayendo precios...',
            'Leyendo descripciones...',
            'Analizando ingredientes...'
        ],
        processing: [
            'Procesando resultados...',
            'Organizando secciones...',
            'Verificando datos...'
        ],
        finalizing: [
            'Finalizando análisis...',
            'Preparando vista previa...',
            '¡Casi listo!'
        ]
    };

    // Extract pages from PDF as images
    const extractPdfPages = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 2; // Higher scale for better quality
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const imageUrl = canvas.toDataURL('image/png');
            pages.push({
                id: `pdf_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'pdf-page',
                url: imageUrl,
                name: `${file.name} - Página ${i}`,
                size: file.size / pdf.numPages,
                pageNumber: i,
                totalPages: pdf.numPages,
                originalFile: file.name
            });
        }

        return pages;
    };

    const handleFileUpload = async (inputFiles) => {
        const fileArray = Array.from(inputFiles);

        for (const file of fileArray) {
            // Check if it's a PDF
            if (file.type === 'application/pdf') {
                if (file.size > 50 * 1024 * 1024) {
                    setError('Los PDFs no deben superar 50MB');
                    continue;
                }

                setProcessingPdf(true);
                try {
                    const pages = await extractPdfPages(file);
                    setFiles(prev => [...prev, ...pages]);
                } catch (err) {
                    setError(`Error al procesar PDF: ${err.message}`);
                } finally {
                    setProcessingPdf(false);
                }
            }
            // Check if it's an image
            else if (file.type.startsWith('image/')) {
                if (file.size > 10 * 1024 * 1024) {
                    setError('Las imágenes no deben superar 10MB cada una');
                    continue;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    setFiles(prev => [...prev, {
                        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'image',
                        url: e.target.result,
                        name: file.name,
                        size: file.size,
                        file: file
                    }]);
                };
                reader.readAsDataURL(file);
            } else {
                setError('Formato no soportado. Usa imágenes (JPG, PNG, WebP) o PDF.');
            }
        }
    };

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    }, []);

    const handleFileSelect = useCallback((e) => {
        handleFileUpload(e.target.files);
    }, []);

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFiles([]);
        setError(null);
    };

    const moveFile = (fromIndex, toIndex) => {
        const newFiles = [...files];
        const [movedFile] = newFiles.splice(fromIndex, 1);
        newFiles.splice(toIndex, 0, movedFile);
        setFiles(newFiles);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleItemDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        moveFile(draggedIndex, dropIndex);
        setDraggedIndex(null);
    };

    const handleAnalyze = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setError(null);
        setOverallProgress(0);
        setCurrentImageIndex(0);

        // Helper function to cycle through messages
        const cycleMessages = (phase) => {
            const messages = analysisMessages[phase];
            let messageIndex = 0;
            return setInterval(() => {
                setCurrentAnalysisMessage(messages[messageIndex % messages.length]);
                messageIndex++;
            }, 2000);
        };

        try {
            const allSections = [];
            const progressPerImage = 85 / files.length;

            // Initial preparation phase
            setAnalysisPhase('preparing');
            setCurrentAnalysisMessage('Preparando análisis...');
            setOverallProgress(5);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Process each image individually
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setCurrentImageIndex(i + 1);
                setOverallProgress(10 + (i * progressPerImage));

                // Set analyzing phase with message cycling
                setAnalysisPhase('analyzing');
                const messageCycler = cycleMessages('analyzing');

                try {
                    const analysis = await aiService.analyzeMenuImage(
                        file.url,
                        menuId,
                        foodBusinessId
                    );

                    clearInterval(messageCycler);

                    // Merge sections from this image
                    if (analysis.success && analysis.data?.sections) {
                        setAnalysisPhase('processing');
                        setCurrentAnalysisMessage('Procesando resultados...');

                        for (const section of analysis.data.sections) {
                            // Check if section already exists
                            const existingSection = allSections.find(
                                s => s.name.toLowerCase() === section.name.toLowerCase()
                            );

                            if (existingSection) {
                                // Add items to existing section, avoiding duplicates
                                for (const item of section.items || []) {
                                    const isDuplicate = existingSection.items.some(
                                        existing => existing.name.toLowerCase() === item.name.toLowerCase()
                                    );
                                    if (!isDuplicate) {
                                        existingSection.items.push(item);
                                    }
                                }
                            } else {
                                // Add new section
                                allSections.push({
                                    ...section,
                                    items: section.items || []
                                });
                            }
                        }
                    }
                } catch (imgError) {
                    clearInterval(messageCycler);
                    console.warn(`Error processing image ${i + 1}:`, imgError);
                    // Continue with other images even if one fails
                }
            }

            // Finalizing phase
            setAnalysisPhase('finalizing');
            setCurrentAnalysisMessage('Finalizando análisis...');
            setOverallProgress(95);

            if (allSections.length === 0) {
                throw new Error('No se pudieron extraer datos del menú de las imágenes');
            }

            // Add unique IDs to sections and items for the review component
            const sectionsWithIds = allSections.map((section, sectionIndex) => ({
                ...section,
                id: section.id || `section_${Date.now()}_${sectionIndex}_${Math.random().toString(36).substr(2, 9)}`,
                items: (section.items || []).map((item, itemIndex) => ({
                    ...item,
                    id: item.id || `item_${Date.now()}_${sectionIndex}_${itemIndex}_${Math.random().toString(36).substr(2, 9)}`
                }))
            }));

            // Return merged result
            onAnalysisComplete({ sections: sectionsWithIds });
        } catch (err) {
            setError(err.message || 'Error al procesar los archivos');
        } finally {
            setLoading(false);
            setOverallProgress(0);
        }
    };

    const getFileIcon = (type) => {
        if (type === 'pdf-page') {
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border-4 border-black">
            {/* Header with title and close button */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-orange-500 to-red-500">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                        <span className="text-xl">📋</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wide">
                            Escanear Menú
                        </h2>
                        <p className="text-white/80 text-xs font-medium">
                            Digitaliza tu menú con inteligencia artificial
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Cerrar"
                >
                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Main content area - scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Loading State - Inside Modal */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        {/* Animated food icons background */}
                        <div className="relative mb-8">
                            {/* Floating emojis around the main icon */}
                            <div className="absolute -inset-12 pointer-events-none">
                                {['🍕', '🍔', '🍜', '🥗', '🍰', '☕'].map((emoji, i) => (
                                    <span
                                        key={i}
                                        className="absolute text-2xl opacity-60"
                                        style={{
                                            left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                                            top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                                            transform: 'translate(-50%, -50%)',
                                            animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`
                                        }}
                                    >
                                        {emoji}
                                    </span>
                                ))}
                            </div>

                            {/* Main animated icon */}
                            <div className="relative">
                                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center border-4 border-black shadow-xl">
                                    <span className="text-6xl" style={{ animation: 'bounce 1s ease-in-out infinite' }}>👨‍🍳</span>
                                </div>
                                {/* Spinning ring */}
                                <div
                                    className="absolute -inset-3 border-4 border-dashed border-orange-400 rounded-full"
                                    style={{ animation: 'spin 10s linear infinite' }}
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wider">
                            Analizando Menú
                        </h3>

                        {/* Image counter */}
                        <div className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full font-bold text-sm mb-6 border-2 border-orange-300">
                            📸 Imagen {currentImageIndex} de {files.length}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full max-w-md mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-600">Progreso</span>
                                <span className="text-lg font-black text-orange-600">{Math.round(overallProgress)}%</span>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full transition-all duration-500 relative"
                                    style={{ width: `${overallProgress}%` }}
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                        style={{ animation: 'shimmer 1.5s infinite' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic message box */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 w-full max-w-md border-2 border-gray-200 mb-6">
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-3xl"
                                    style={{
                                        animation: analysisPhase === 'analyzing'
                                            ? 'bounce 0.5s ease-in-out infinite'
                                            : 'pulse 1.5s ease-in-out infinite'
                                    }}
                                >
                                    {analysisPhase === 'preparing' && '🔧'}
                                    {analysisPhase === 'analyzing' && '🔍'}
                                    {analysisPhase === 'processing' && '⚙️'}
                                    {analysisPhase === 'finalizing' && '✨'}
                                    {!analysisPhase && '⏳'}
                                </span>
                                <div>
                                    <p className="font-bold text-gray-800">{currentAnalysisMessage || 'Iniciando...'}</p>
                                    <p className="text-xs text-gray-500">Por favor espera, esto puede tomar unos segundos</p>
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="text-center text-sm text-gray-500 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                            💡 <span className="font-medium">Tip:</span> Cuanto más clara sea la imagen, mejor será el resultado
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Error Alert */}
                        {error && (
                            <ErrorAlert error={error} onClose={() => setError(null)} />
                        )}

                        {/* Processing PDF indicator */}
                        {processingPdf && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-xl flex items-center gap-3 border-2 border-blue-200">
                                <LoadingSpinner size="small" />
                                <span className="font-medium text-blue-700">Extrayendo páginas del PDF...</span>
                            </div>
                        )}

                        {/* Empty state - Drop zone */}
                        {!files.length ? (
                            <div
                                className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer group"
                                onDrop={handleFileDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex justify-center gap-6 mb-6">
                                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center transition-colors border-2 border-gray-200 group-hover:border-orange-300">
                                        <svg className="h-8 w-8 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors border-2 border-gray-200 group-hover:border-red-300">
                                        <svg className="h-8 w-8 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-700 mb-2">
                                    Arrastra y suelta tus archivos aquí
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    o haz clic para seleccionar desde tu dispositivo
                                </p>
                                <div className="flex justify-center gap-4 text-xs text-gray-400">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">📷 JPG, PNG, WebP (10MB)</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">📄 PDF (50MB)</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* File counter and clear button */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm border border-orange-200">
                                            {files.length} archivo{files.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-gray-400 text-sm">seleccionado{files.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <button
                                        onClick={clearAll}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Limpiar todo
                                    </button>
                                </div>

                                {/* File grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                    {files.map((file, index) => (
                                        <div
                                            key={file.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleItemDrop(e, index)}
                                            className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50 scale-95' : ''} transition-all`}
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-colors bg-gray-100 shadow-sm hover:shadow-md">
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* File type badge */}
                                                <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm ${file.type === 'pdf-page'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-blue-500 text-white'
                                                    }`}>
                                                    {getFileIcon(file.type)}
                                                    {file.type === 'pdf-page' ? `P${file.pageNumber}` : 'IMG'}
                                                </div>
                                                {/* Order number */}
                                                <div className="absolute bottom-2 right-2 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <p className="mt-2 text-xs text-gray-500 truncate text-center">{file.name}</p>
                                        </div>
                                    ))}

                                    {/* Add more button */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center cursor-pointer group"
                                    >
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
                                                <svg className="h-6 w-6 text-gray-400 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-gray-500 group-hover:text-orange-600 font-medium">Agregar más</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Footer with action buttons - only visible when not loading */}
            {!loading && files.length > 0 && (
                <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-sm text-gray-500">
                        <span className="font-medium">💡 Tip:</span> Arrastra las imágenes para reordenarlas
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 border-2 border-gray-300 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={files.length === 0}
                            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 border-2 border-black shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Analizar con IA
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}