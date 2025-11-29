import React, { useState } from 'react';
import { MapPin, Minus, Hexagon, Trash2, Palette } from 'lucide-react';
import Button from '../shared/Button';

const DrawingTools = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [color, setColor] = useState('#3b82f6');

    const tools = [
        { id: 'point', icon: <MapPin size={16} />, label: 'Point' },
        { id: 'line', icon: <Minus size={16} />, label: 'Line' },
        { id: 'polygon', icon: <Hexagon size={16} />, label: 'Polygon' },
    ];

    const colors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#8b5cf6', // Purple
        '#ec4899', // Pink
    ];

    return (
        <div className="space-y-4">
            {/* Tools Grid */}
            <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => (
                    <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? 'primary' : 'secondary'}
                        onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                        className="flex-col gap-1 py-3 h-auto"
                    >
                        {tool.icon}
                        <span className="text-[10px]">{tool.label}</span>
                    </Button>
                ))}
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Palette size={14} />
                    <span>Color</span>
                </div>
                <div className="flex gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-700/50">
                <Button
                    variant="ghost"
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    leftIcon={<Trash2 size={16} />}
                >
                    Clear All Drawings
                </Button>
            </div>
        </div>
    );
};

export default DrawingTools;
