import React, { useState } from 'react';
import { MapPin, Minus, Hexagon, Trash2, Palette } from 'lucide-react';
import Button from '../shared/Button';
import { useDraw } from '../../hooks/useDraw';

const DrawingTools = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [color, setColorState] = useState('#3b82f6');
    const { changeMode, deleteAll, setColor } = useDraw();

    const tools = [
        { id: 'point', icon: <MapPin size={16} />, label: 'Point', mode: 'draw_point' },
        { id: 'line', icon: <Minus size={16} />, label: 'Line', mode: 'draw_line_string' },
        { id: 'polygon', icon: <Hexagon size={16} />, label: 'Polygon', mode: 'draw_polygon' },
    ];

    const colors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#8b5cf6', // Purple
        '#ec4899', // Pink
    ];

    const handleToolClick = (tool) => {
        if (activeTool === tool.id) {
            setActiveTool(null);
            changeMode('simple_select');
        } else {
            setActiveTool(tool.id);
            changeMode(tool.mode);
        }
    };

    const handleColorChange = (newColor) => {
        setColorState(newColor);
        setColor(newColor);
    };

    return (
        <div className="space-y-4">
            {/* Tools Grid */}
            <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => (
                    <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? 'primary' : 'secondary'}
                        onClick={() => handleToolClick(tool)}
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
                            onClick={() => handleColorChange(c)}
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
                    onClick={deleteAll}
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
