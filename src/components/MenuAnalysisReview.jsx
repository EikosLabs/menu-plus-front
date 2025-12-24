import React, { useState } from 'react';
import aiService from '../services/aiService';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ui/ErrorAlert';

export default function MenuAnalysisReview({
    analysisData,
    onBack,
    onComplete,
    menuId,
    foodBusinessId
}) {
    const [mergedSections, setMergedSections] = useState(analysisData.sections || analysisData.mergedSections || []);
    const [editingSection, setEditingSection] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSections, setSelectedSections] = useState(new Set());
    const [selectedItems, setSelectedItems] = useState(new Set());

    const toggleSectionSelection = (sectionId) => {
        const newSelected = new Set(selectedSections);
        if (newSelected.has(sectionId)) {
            newSelected.delete(sectionId);
        } else {
            newSelected.add(sectionId);
        }
        setSelectedSections(newSelected);
    };

    const toggleItemSelection = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const selectAll = () => {
        const allSectionIds = mergedSections.map(section => section.id);
        const allItemIds = mergedSections.flatMap(section =>
            section.items.map(item => item.id)
        );
        setSelectedSections(new Set(allSectionIds));
        setSelectedItems(new Set(allItemIds));
    };

    const deselectAll = () => {
        setSelectedSections(new Set());
        setSelectedItems(new Set());
    };

    const updateSection = (sectionId, updates) => {
        setMergedSections(prev => prev.map(section =>
            section.id === sectionId ? { ...section, ...updates } : section
        ));
    };

    const updateItem = (itemId, updates) => {
        setMergedSections(prev => prev.map(section => ({
            ...section,
            items: section.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            )
        })));
    };

    const deleteSection = (sectionId) => {
        setMergedSections(prev => prev.filter(section => section.id !== sectionId));
    };

    const deleteItem = (itemId) => {
        setMergedSections(prev => prev.map(section => ({
            ...section,
            items: section.items.filter(item => item.id !== itemId)
        })));
    };

    const handleSave = async () => {
        if (selectedSections.size === 0 && selectedItems.size === 0) {
            setError('Por favor, selecciona al menos una sección o elemento para guardar');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Filter sections and items to send only selected ones
            // We need to reconstruct the structure expected by backend
            // Typically backend expects: { sections: [ { ..., items: [...] } ] }
            const sectionsToSend = mergedSections
                .filter(section => selectedSections.has(section.id))
                .map(section => ({
                    ...section,
                    items: section.items.filter(item => selectedItems.has(item.id))
                }));

            // Ensure items that are selected but their section is NOT selected are also handled?
            // Current UI logic implies you select section AND/OR items. 
            // If section is not selected, we probably shouldn't send it, even if items are selected?
            // Or we should include the section but ONLY with the selected items?
            // Let's assume we include section if it has selected items OR is explicitly selected.

            const sectionsWithSelectedItems = mergedSections
                .map(section => ({
                    ...section,
                    items: section.items.filter(item => selectedItems.has(item.id))
                }))
                .filter(section => selectedSections.has(section.id) || section.items.length > 0);

            const result = await aiService.createFromAnalysis(
                menuId,
                sectionsWithSelectedItems
            );

            onComplete(result.data);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos del menú');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return '';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-6xl mx-auto relative">
            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-neo-flame border-2 border-black z-10"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neo-lavender border-2 border-black z-10"></div>

            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                            Revisión de Análisis
                        </h2>
                        <p className="text-gray-600 font-medium">
                            Revisa, edita y selecciona los platos extraídos antes de guardar.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 border-2 border-black bg-neo-mint hover:bg-green-300 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            Seleccionar Todo
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            Deseleccionar
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border-2 border-black p-3 font-bold text-sm flex justify-between items-center">
                    <span>RESUMEN DE SELECCIÓN:</span>
                    <span className="bg-black text-white px-2 py-1 rounded text-xs">
                        {selectedSections.size} SECCIONES • {selectedItems.size} PLATOS
                    </span>
                </div>
            </div>

            {error && (
                <ErrorAlert error={error} onClose={() => setError(null)} />
            )}

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {mergedSections.map((section) => (
                    <div key={section.id} className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5">
                        {/* Section Header */}
                        <div className="flex items-start justify-between mb-6 border-b-2 border-gray-100 pb-4">
                            <div className="flex items-center gap-4 flex-1">
                                <label className="relative flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSections.has(section.id)}
                                        onChange={() => toggleSectionSelection(section.id)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-6 h-6 border-2 border-black bg-white peer-checked:bg-neo-flame transition-colors flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </label>

                                <div className="flex-1">
                                    {editingSection === section.id ? (
                                        <input
                                            type="text"
                                            value={section.name}
                                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                            onBlur={() => setEditingSection(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                                            className="w-full border-2 border-black px-3 py-2 font-black text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            autoFocus
                                            placeholder="Nombre de la sección"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 group">
                                            <h3
                                                className="text-xl font-black uppercase cursor-pointer hover:text-blue-600"
                                                onClick={() => setEditingSection(section.id)}
                                            >
                                                {section.name}
                                            </h3>
                                            <button
                                                onClick={() => setEditingSection(section.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 border border-gray-300 rounded">
                                    {section.items.length} ITEMS
                                </span>
                                <button
                                    onClick={() => deleteSection(section.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                    title="Eliminar sección"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {section.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-start gap-4 p-4 border-2 transition-all ${selectedItems.has(item.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-400'
                                        }`}
                                >
                                    <label className="relative flex items-center cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 border-2 border-black bg-white peer-checked:bg-blue-500 transition-colors flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </label>

                                    <div className="flex-1 min-w-0">
                                        {editingItem === item.id ? (
                                            <div className="grid gap-3 animate-fadeIn">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                                        className="flex-1 border-2 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="Nombre del plato"
                                                        autoFocus
                                                    />
                                                    <div className="relative w-32">
                                                        <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                                                        <input
                                                            type="number"
                                                            value={item.price || ''}
                                                            onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) })}
                                                            className="w-full border-2 border-black pl-6 pr-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={item.description || ''}
                                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                    className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    placeholder="Descripción del plato"
                                                    rows={2}
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => setEditingItem(null)}
                                                        className="text-xs font-bold uppercase text-blue-600 hover:underline"
                                                    >
                                                        Terminar Edición
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setEditingItem(item.id)}
                                                className="cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                                                        {item.name}
                                                    </h4>
                                                    <span className="font-black text-lg whitespace-nowrap bg-yellow-200 px-2 border border-black transform -rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        {formatPrice(item.price) || 'N/A'}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed border-l-2 border-gray-300 pl-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        Editar
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Eliminar plato"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t-4 border-black">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 border-2 border-black bg-white text-black font-bold uppercase tracking-wide hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50"
                >
                    Volver
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading || (selectedSections.size === 0 && selectedItems.size === 0)}
                    className="w-full sm:w-auto px-8 py-3 border-2 border-black bg-blue-500 text-white font-black uppercase tracking-wide hover:bg-blue-400 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="small" color="white" />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            <span>Guardar Menú</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
