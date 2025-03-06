import React, { useRef, useState, useEffect } from 'react';
import type { StoryNode, StoryNodeData, ImageNodeData, Step, SceneImage } from '~/types';
import { CollapsiblePanel } from './CollapsiblePanel';

interface ImageNodeEditorProps {
    node: StoryNode & { data: ImageNodeData };
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    availableNodes: [string, Step][];
}

export const ImageNodeEditor: React.FC<ImageNodeEditorProps> = ({
                                                                    node,
                                                                    onUpdateNodeData,
                                                                }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewKey, setPreviewKey] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(node.data.image.path || '');

    useEffect(() => {
        setPreviewUrl(node.data.image.path || '');
    }, [node.data.image.path]);

    const handleImageChange = <K extends keyof SceneImage>(key: K, value: SceneImage[K]) => {
        const updatedImage = { ...node.data.image, [key]: value };
        onUpdateNodeData(node.id, { image: updatedImage });

        if (key === 'path') {
            setPreviewUrl(value as string);
            setPreviewKey(prev => prev + 1);
        }
    };

    interface UploadResponse {
        imagePath?: string;
        error?: string;
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json() as UploadResponse;
            if (result.error) {
                throw new Error(result.error);
            }

            if (result.imagePath) {
                handleImageChange('path', result.imagePath);
                setPreviewUrl(result.imagePath);
                setPreviewKey(prev => prev + 1);
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        }
    };

    return (
        <div className="space-y-6">
            <CollapsiblePanel title="Image Settings" defaultOpen={true}>
                <div className="space-y-4">
                    {/* File Upload Button */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Upload Image
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                {node.data.image.path ? 'Change Image' : 'Upload Image'}
                            </button>
                            {node.data.image.path && (
                                <span className="text-sm text-gray-400">
                                    Current: {node.data.image.path.split('/').pop()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Manual Path Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Image Path
                        </label>
                        <input
                            type="text"
                            value={node.data.image.path}
                            onChange={(e) => handleImageChange('path', e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                            placeholder="/images/example.jpg"
                        />
                        <p className="text-xs text-gray-400">
                            Relative to your public directory
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Position
                        </label>
                        <select
                            value={node.data.image.position}
                            onChange={(e) => handleImageChange('position', e.target.value as 'left' | 'right' | 'top' | 'bottom')}
                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                        >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Horizontal Stretch (%)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="500"
                                value={node.data.image.horizontalStretch || 100}
                                onBlur={(e) => {
                                    // Apply constraints only on blur, allows typing
                                    const inputValue = parseInt(e.target.value) || 100;
                                    const boundedValue = Math.max(Math.min(inputValue, 500), 10);
                                    if (boundedValue !== inputValue) {
                                        handleImageChange('horizontalStretch', boundedValue);
                                    }
                                }}
                                onChange={(e) => {
                                    // During typing, accept any value
                                    const inputValue = parseInt(e.target.value);
                                    if (!isNaN(inputValue)) {
                                        handleImageChange('horizontalStretch', inputValue);
                                    }
                                }}
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Vertical Stretch (%)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="500"
                                value={node.data.image.verticalStretch || 100}
                                onBlur={(e) => {
                                    // Apply constraints only on blur, allows typing
                                    const inputValue = parseInt(e.target.value) || 100;
                                    const boundedValue = Math.max(Math.min(inputValue, 500), 10);
                                    if (boundedValue !== inputValue) {
                                        handleImageChange('verticalStretch', boundedValue);
                                    }
                                }}
                                onChange={(e) => {
                                    // During typing, accept any value
                                    const inputValue = parseInt(e.target.value);
                                    if (!isNaN(inputValue)) {
                                        handleImageChange('verticalStretch', inputValue);
                                    }
                                }}
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                            />
                        </div>
                    </div>

                    {previewUrl && (
                        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
                            <p className="text-sm text-gray-300 mb-2">Image Preview:</p>
                            <div className="flex justify-center items-center overflow-hidden" style={{
                                position: 'relative',
                                width: '100%',
                                height: '12rem'
                            }}>
                                <div style={{
                                    width: `${node.data.image.horizontalStretch || 100}%`,
                                    height: `${node.data.image.verticalStretch || 100}%`,
                                    maxWidth: '100%',
                                    maxHeight: '12rem',
                                    position: 'relative'
                                }}>
                                    <img
                                        key={previewKey}
                                        src={previewUrl}
                                        alt={node.data.image.alt || 'Preview'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = '/api/placeholder-image';
                                            e.currentTarget.alt = 'Image not found';
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-gray-400">Horizontal: {node.data.image.horizontalStretch || 100}%</p>
                                <p className="text-xs text-gray-400">Vertical: {node.data.image.verticalStretch || 100}%</p>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsiblePanel>
        </div>
    );
};