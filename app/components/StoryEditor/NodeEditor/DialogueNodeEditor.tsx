import React from 'react';
import type { StoryNode, StoryNodeData, DialogueNodeData, Step } from '~/types';

interface DialogueNodeEditorProps {
    node: StoryNode & { data: DialogueNodeData };
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    availableNodes: [string, Step][];
}

export const DialogueNodeEditor: React.FC<DialogueNodeEditorProps> = ({
                                                                          node,
                                                                          onUpdateNodeData,
                                                                          availableNodes
                                                                      }) => {
    return (
        <>
            <div className="space-y-2">
                <label htmlFor="nodeText" className="text-sm font-medium text-gray-300">Text</label>
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
                <label htmlFor="nodeSpeaker" className="text-sm font-medium text-gray-300">Speaker</label>
                <input
                    id="nodeSpeaker"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={node.data.speaker}
                    onChange={(e) => {
                        onUpdateNodeData(node.id, { speaker: e.target.value });
                    }}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="nodeNext" className="text-sm font-medium text-gray-300">Next Node</label>
                <select
                    id="nodeNext"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={node.data.next || ''}
                    onChange={(e) => {
                        onUpdateNodeData(node.id, { next: e.target.value || undefined });
                    }}
                >
                    <option value="">None</option>
                    {availableNodes.map(([id, step]: [string, Step]) => (
                        <option key={id} value={id}>
                            {id} ({step.type})
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};