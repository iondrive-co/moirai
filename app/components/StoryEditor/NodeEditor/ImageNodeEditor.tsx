import React, { useRef } from 'react';
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

    // Fix the handleImageChange function to avoid using 'any'
    const handleImageChange = <K extends keyof SceneImage>(key: K, value: SceneImage[K]) => {
        const updatedImage = { ...node.data.image, [key]: value };
        onUpdateNodeData(node.id, { image: updatedImage });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const placeholderPath = '/api/placeholder-image';
        handleImageChange('path', placeholderPath);
        console.log('Selected file:', file.name);
        console.log('Using placeholder path:', placeholderPath);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onUpdateNodeData(node.id, {
            image: {
                ...node.data.image,
                path: placeholderPath
            }
        });
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
                            Alt Text
                        </label>
                        <input
                            type="text"
                            value={node.data.image.alt || ''}
                            onChange={(e) => handleImageChange('alt', e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                            placeholder="Descriptive text for screen readers"
                        />
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

                    {node.data.image.path && (
                        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
                            <p className="text-sm text-gray-300 mb-2">Image Preview:</p>
                            <img
                                src={node.data.image.path}
                                alt={node.data.image.alt || 'Preview'}
                                className="max-h-48 mx-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder-image';
                                    e.currentTarget.alt = 'Image not found';
                                }}
                            />
                        </div>
                    )}
                </div>
            </CollapsiblePanel>
        </div>
    );
};