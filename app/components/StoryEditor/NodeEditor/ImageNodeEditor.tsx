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

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Fit Mode
                        </label>
                        <select
                            value={node.data.image.fitMode || 'natural'}
                            onChange={(e) => handleImageChange('fitMode', e.target.value as 'natural' | 'stretch')}
                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                        >
                            <option value="natural">Natural (preserve aspect ratio)</option>
                            <option value="stretch">Stretch (fill area completely)</option>
                        </select>
                        <p className="text-xs text-gray-400">
                            How the image should fit in its container
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Alignment
                        </label>
                        <select
                            value={node.data.image.alignment || 'center'}
                            onChange={(e) => handleImageChange('alignment', e.target.value as 'start' | 'center' | 'end')}
                            className={`w-full p-2 bg-gray-700 text-white border border-gray-600 rounded ${
                                node.data.image.fitMode === 'stretch' ? 'opacity-50' : ''
                            }`}
                            disabled={node.data.image.fitMode === 'stretch'}
                        >
                            {node.data.image.position === 'left' || node.data.image.position === 'right' ? (
                                <>
                                    <option value="start">Top</option>
                                    <option value="center">Center</option>
                                    <option value="end">Bottom</option>
                                </>
                            ) : (
                                <>
                                    <option value="start">Left</option>
                                    <option value="center">Center</option>
                                    <option value="end">Right</option>
                                </>
                            )}
                        </select>
                        <p className="text-xs text-gray-400">
                            {node.data.image.fitMode === 'stretch' ?
                                'Alignment not applicable in stretch mode' :
                                node.data.image.position === 'left' || node.data.image.position === 'right' ?
                                    'How to align the image vertically' :
                                    'How to align the image horizontally'
                            }
                        </p>
                    </div>

                    {previewUrl && (
                        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
                            <p className="text-sm text-gray-300 mb-2">Image Preview:</p>
                            <img
                                key={previewKey}
                                src={previewUrl}
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