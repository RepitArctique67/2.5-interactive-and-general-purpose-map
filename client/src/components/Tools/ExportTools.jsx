import React, { useState } from 'react';
import { Camera, FileDown, Image } from 'lucide-react';
import Button from '../shared/Button';

const ExportTools = () => {
    const [isCapturing, setIsCapturing] = useState(false);

    const handleScreenshot = async () => {
        setIsCapturing(true);
        // Simulate capture delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsCapturing(false);
        // TODO: Implement Cesium screenshot
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Screenshot</h4>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleScreenshot}
                        isLoading={isCapturing}
                        leftIcon={<Image size={16} />}
                    >
                        PNG
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleScreenshot}
                        isLoading={isCapturing}
                        leftIcon={<Image size={16} />}
                    >
                        JPG
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Export Data</h4>
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<FileDown size={16} />}
                >
                    Export GeoJSON
                </Button>
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<FileDown size={16} />}
                >
                    Export KML
                </Button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                    Screenshots will capture the current view including all active layers and drawings.
                </p>
            </div>
        </div>
    );
};

export default ExportTools;
