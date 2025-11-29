import React, { useState } from 'react';
import { Ruler, PenTool, Download, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import MeasurementTools from './MeasurementTools';
import DrawingTools from './DrawingTools';
import ExportTools from './ExportTools';
import SettingsPanel from './SettingsPanel';
import Tooltip from '../shared/Tooltip';
import { clsx } from 'clsx';
import './Tools.css';

const ToolsPanel = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const tools = [
        { id: 'measure', icon: <Ruler size={20} />, label: 'Measurement', component: MeasurementTools },
        { id: 'draw', icon: <PenTool size={20} />, label: 'Drawing', component: DrawingTools },
        { id: 'export', icon: <Download size={20} />, label: 'Export', component: ExportTools },
        { id: 'settings', icon: <Settings size={20} />, label: 'Settings', component: SettingsPanel },
    ];

    const handleToolClick = (toolId) => {
        if (activeTool === toolId) {
            setActiveTool(null);
            setIsExpanded(false);
        } else {
            setActiveTool(toolId);
            setIsExpanded(true);
        }
    };

    const ActiveComponent = tools.find(t => t.id === activeTool)?.component;

    return (
        <div className="tools-container">
            <div className="flex items-start gap-2">
                {/* Toolbar */}
                <div className="glass-panel rounded-xl p-2 flex flex-col gap-2">
                    {tools.map((tool) => (
                        <Tooltip key={tool.id} content={tool.label} position="left">
                            <button
                                onClick={() => handleToolClick(tool.id)}
                                className={clsx(
                                    "p-3 rounded-lg transition-all duration-200",
                                    activeTool === tool.id
                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                )}
                            >
                                {tool.icon}
                            </button>
                        </Tooltip>
                    ))}
                </div>

                {/* Tool Panel */}
                <div
                    className={clsx(
                        "glass-panel rounded-xl overflow-hidden transition-all duration-300 ease-in-out origin-top-right",
                        isExpanded ? "w-80 opacity-100 scale-100" : "w-0 opacity-0 scale-95 pointer-events-none"
                    )}
                >
                    {activeTool && (
                        <div className="p-4 min-w-[320px]">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                                <h3 className="font-semibold text-slate-100">
                                    {tools.find(t => t.id === activeTool)?.label}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsExpanded(false);
                                        setActiveTool(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/50"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {ActiveComponent && <ActiveComponent />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToolsPanel;
