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
    const [mergedSections, setMergedSections] = useState(analysisData.mergedSections || []);
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
            const selectedData = {
                sections: mergedSections.filter(section => selectedSections.has(section.id)),
                items: mergedSections.flatMap(section => 
                    section.items.filter(item => selectedItems.has(item.id))
                        .map(item => ({ ...item, sectionId: section.id }))
                )
            };

            const result = await aiService.createFromAnalysis(
                selectedData,
                menuId,
                foodBusinessId
            );

            onComplete(result.data);
        } catch (err) {
            setError(err.message || 'Error al guardar los datos del menú');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    return (
        <div className="neo-card bg-white p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="neo-heading neo-h2 text-2xl mb-2">Revisión de Análisis</h2>
                <p className="neo-text text-neo-gray mb-4">
                    Revisa y edita los datos extraídos antes de guardar. Selecciona las secciones y elementos que deseas crear.
                </p>
                
                <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={selectAll}
                            className="neo-button-secondary px-4 py-2 text-sm"
                        >
                            Seleccionar Todo
                        </button>
                        <button
                            onClick={deselectAll}
                            className="neo-button-secondary px-4 py-2 text-sm"
                        >
                            Deseleccionar Todo
                        </button>
                    </div>
                    <div className="neo-text-sm text-neo-gray">
                        {selectedSections.size} secciones, {selectedItems.size} elementos seleccionados
                    </div>
                </div>
            </div>

            {error && (
                <ErrorAlert error={error} onClose={() => setError(null)} />
            )}

            <div className="space-y-6 max-h-96 overflow-y-auto">
                {mergedSections.map((section) => (
                    <div key={section.id} className="border border-neo-gray rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedSections.has(section.id)}
                                    onChange={() => toggleSectionSelection(section.id)}
                                    className="w-4 h-4 text-neo-flame border-neo-gray rounded focus:ring-neo-flame"
                                />
                                {editingSection === section.id ? (
                                    <input
                                        type="text"
                                        value={section.name}
                                        onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                        onBlur={() => setEditingSection(null)}
                                        onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                        className="neo-form-input px-2 py-1 text-lg font-semibold"
                                        autoFocus
                                    />
                                ) : (
                                    <h3 
                                        className="neo-heading neo-h3 text-lg font-semibold cursor-pointer"
                                        onClick={() => setEditingSection(section.id)}
                                    >
                                        {section.name}
                                    </h3>
                                )}
                                <span className="neo-text-sm text-neo-gray bg-neo-gray bg-opacity-20 px-2 py-1 rounded">
                                    {section.items.length} elementos
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingSection(section.id)}
                                    className="text-neo-gray hover:text-neo-flame"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => deleteSection(section.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {section.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-neo-gray bg-opacity-10 rounded">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                            className="w-4 h-4 text-neo-flame border-neo-gray rounded focus:ring-neo-flame"
                                        />
                                        <div className="flex-1">
                                            {editingItem === item.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                                        className="neo-form-input px-2 py-1 w-full"
                                                        placeholder="Nombre del plato"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.price || ''}
                                                        onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) })}
                                                        className="neo-form-input px-2 py-1 w-full"
                                                        placeholder="Precio"
                                                        step="0.01"
                                                    />
                                                    <textarea
                                                        value={item.description || ''}
                                                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                        className="neo-form-input px-2 py-1 w-full"
                                                        placeholder="Descripción"
                                                        rows={2}
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    {item.price && (
                                                        <div className="neo-text-sm text-neo-gray">
                                                            {formatPrice(item.price)}
                                                        </div>
                                                    )}
                                                    {item.description && (
                                                        <div className="neo-text-sm text-neo-gray mt-1">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                                            className="text-neo-gray hover:text-neo-flame"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-neo-gray">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="neo-button-secondary px-6 py-2 disabled:opacity-50"
                >
                    Volver
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading || (selectedSections.size === 0 && selectedItems.size === 0)}
                    className="neo-button-primary px-6 py-2 disabled:opacity-50"
                >
                    {loading ? (
                        <LoadingSpinner size="small" />
                    ) : (
                        `Guardar ${selectedSections.size + selectedItems.size} elementos`
                    )}
                </button>
            </div>
        </div>
    );
}