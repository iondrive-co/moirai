import React from 'react';
import type { StoryData, StoryNodeData } from '~/types';
import type { Node } from 'reactflow';
import { NodeEditor } from './NodeEditor/index';

interface StoryEditorLayoutProps {
    storyData: StoryData;
    currentScene: string;
    selectedNode: Node<StoryNodeData> | null;
    hasChanges: boolean;
    onSceneChange: (scene: string) => void;
    onStartingStepChange: (stepId: string) => void;
    onAddNode: (type: 'dialogue' | 'description' | 'choice') => void;
    onSave: () => Promise<void>;
    onUpdateNodeId: (oldId: string, newId: string) => void;
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    onDeleteNode: (nodes: Node<StoryNodeData>[]) => void;
    children: React.ReactNode;
}

export const StoryEditorLayout: React.FC<StoryEditorLayoutProps> = ({
                                                                        storyData,
                                                                        currentScene,
                                                                        selectedNode,
                                                                        hasChanges,
                                                                        onSceneChange,
                                                                        onStartingStepChange,
                                                                        onAddNode,
                                                                        onSave,
                                                                        onUpdateNodeId,
                                                                        onUpdateNodeData,
                                                                        onDeleteNode,
                                                                        children
                                                                    }) => {
    return (
        <div className="h-screen flex">
            <div className="flex-1 h-full">
                <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
                    <label htmlFor="sceneSelect" className="text-white">Scene:</label>
                    <select
                        id="sceneSelect"
                        value={currentScene}
                        onChange={(e) => onSceneChange(e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded"
                    >
                        {Object.keys(storyData).map((scene) => (
                            <option key={scene} value={scene}>{scene}</option>
                        ))}
                    </select>
                    <label htmlFor="startingStep" className="text-white ml-4">Starting Step:</label>
                    <select
                        id="startingStep"
                        value={storyData[currentScene].startingStep}
                        onChange={(e) => onStartingStepChange(e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded min-w-[200px]"
                    >
                        <option value="">Select Starting Step</option>
                        {Object.entries(storyData[currentScene].steps).map(([id, step]) => (
                            <option key={id} value={id}>
                                {id} ({step.type})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => onAddNode('dialogue')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Dialogue
                    </button>
                    <button
                        onClick={() => onAddNode('description')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Description
                    </button>
                    <button
                        onClick={() => onAddNode('choice')}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Add Choice
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!hasChanges}
                        className={`px-3 py-1 rounded ${
                            hasChanges
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-gray-600 text-gray-400'
                        }`}
                    >
                        Save Changes
                    </button>
                </div>
                <div className="h-[calc(100%-3rem)]">
                    {children}
                </div>
            </div>

            <div className="w-64 p-4 border-l border-gray-700 bg-gray-800">
                <NodeEditor
                    selectedNode={selectedNode}
                    storyData={storyData}
                    currentScene={currentScene}
                    onUpdateNodeId={onUpdateNodeId}
                    onUpdateNodeData={onUpdateNodeData}
                    onDeleteNode={onDeleteNode}
                />
            </div>
        </div>
    );
};