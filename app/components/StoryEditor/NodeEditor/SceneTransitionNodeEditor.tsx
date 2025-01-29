import React from 'react';
import type { StoryNode, StoryNodeData, SceneTransitionNodeData, Step } from '~/types';

interface SceneTransitionNodeEditorProps {
    node: StoryNode & { data: SceneTransitionNodeData };
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    availableNodes: [string, Step][];
}

export const SceneTransitionNodeEditor: React.FC<SceneTransitionNodeEditorProps> = ({
    node,
    onUpdateNodeData,
}) => {
    return (
        <>
            <div className="space-y-2">
                <label htmlFor="nodeText" className="text-sm font-medium text-gray-300">
                    Transition Text
                </label>
                <textarea
                    id="nodeText"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={node.data.text}
                    onChange={(e) => {
                        onUpdateNodeData(node.id, { text: e.target.value });
                    }}
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="nextScene" className="text-sm font-medium text-gray-300">
                    Next Scene
                </label>
                <input
                    id="nextScene"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={node.data.nextScene}
                    onChange={(e) => {
                        onUpdateNodeData(node.id, { nextScene: e.target.value });
                    }}
                />
            </div>
        </>
    );
};