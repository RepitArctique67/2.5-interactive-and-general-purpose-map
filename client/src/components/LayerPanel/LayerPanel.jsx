import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Layers, Filter } from 'lucide-react';
import LayerItem from './LayerItem';
import LayerGroup from './LayerGroup';
import LayerSearch from './LayerSearch';
import Spinner from '../shared/Spinner';
import './LayerPanel.css';

const LayerPanel = ({ layers: initialLayers, onLayerToggle, isLoading, error }) => {
    const [layers, setLayers] = useState(initialLayers || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // all, active, historical

    // Update local state when props change
    React.useEffect(() => {
        if (initialLayers) {
            setLayers(initialLayers);
        }
    }, [initialLayers]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setLayers((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleOpacityChange = (id, opacity) => {
        setLayers(layers.map(layer =>
            layer.id === id ? { ...layer, opacity } : layer
        ));
        // TODO: Propagate to parent/Cesium
    };

    const filteredLayers = useMemo(() => {
        return layers.filter(layer => {
            const matchesSearch = layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                layer.description?.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeFilter === 'active') return layer.is_active;
            if (activeFilter === 'historical') return layer.is_historical;

            return true;
        });
    }, [layers, searchQuery, activeFilter]);

    // Group layers by category
    const groupedLayers = useMemo(() => {
        const groups = {};
        filteredLayers.forEach(layer => {
            const category = layer.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(layer);
        });
        return groups;
    }, [filteredLayers]);

    if (isLoading) {
        return (
            <div className="layer-panel glass-panel p-6 flex flex-col items-center justify-center min-h-[200px]">
                <Spinner size="lg" />
                <p className="mt-4 text-slate-400 text-sm">Loading layers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="layer-panel glass-panel p-6 border-red-500/20">
                <div className="text-red-400 text-center">
                    <p className="font-medium">Error loading layers</p>
                    <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="layer-panel glass-panel flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Layers className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-100">Layers</h2>
                            <p className="text-xs text-slate-400">{layers.length} available</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-800/50 rounded-lg p-1">
                        {['all', 'active', 'historical'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-all ${activeFilter === filter
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <LayerSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {Object.entries(groupedLayers).map(([category, categoryLayers]) => (
                        <LayerGroup
                            key={category}
                            title={category}
                            count={categoryLayers.length}
                        >
                            <SortableContext
                                items={categoryLayers.map(l => l.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {categoryLayers.map((layer) => (
                                        <LayerItem
                                            key={layer.id}
                                            layer={layer}
                                            onToggle={onLayerToggle}
                                            onOpacityChange={handleOpacityChange}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </LayerGroup>
                    ))}

                    {filteredLayers.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <Filter size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No layers found</p>
                        </div>
                    )}
                </DndContext>
            </div>
        </div>
    );
};

export default LayerPanel;
