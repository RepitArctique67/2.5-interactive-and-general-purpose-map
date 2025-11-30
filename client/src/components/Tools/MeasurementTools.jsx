import React, { useState } from 'react';
import { Ruler, BoxSelect, Trash2 } from 'lucide-react';
import Button from '../shared/Button';
import { useDraw } from '../../hooks/useDraw';

const MeasurementTools = () => {
    const [mode, setMode] = useState(null); // 'distance', 'area'
    const { changeMode, deleteAll, measurements } = useDraw();

    const handleModeChange = (newMode) => {
        if (mode === newMode) {
            setMode(null);
            changeMode('simple_select');
        } else {
            setMode(newMode);
            if (newMode === 'distance') {
                changeMode('draw_line_string');
            } else if (newMode === 'area') {
                changeMode('draw_polygon');
            }
        }
    };

    const handleClear = () => {
        deleteAll();
        setMode(null);
        changeMode('simple_select');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant={mode === 'distance' ? 'primary' : 'secondary'}
                    onClick={() => handleModeChange('distance')}
                    leftIcon={<Ruler size={16} />}
                    className="w-full justify-start"
                >
                    Distance
                </Button>
                <Button
                    variant={mode === 'area' ? 'primary' : 'secondary'}
                    onClick={() => handleModeChange('area')}
                    leftIcon={<BoxSelect size={16} />}
                    className="w-full justify-start"
                >
                    Area
                </Button>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Results</span>
                    {measurements.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                            <Trash2 size={12} /> Clear
                        </button>
                    )}
                </div>

                {measurements.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                        Select a tool and click on the map to measure
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {measurements.map((m, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span className="text-slate-300">{m.type}</span>
                                <span className="font-mono text-blue-400">{m.value}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="text-xs text-slate-500">
                <p>• Click to add points</p>
                <p>• Double-click to finish measurement</p>
            </div>
        </div>
    );
};

export default MeasurementTools;
