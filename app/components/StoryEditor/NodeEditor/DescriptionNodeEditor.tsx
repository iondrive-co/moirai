import React from 'react';
import type { StoryNode, StoryNodeData, DescriptionNodeData, Step, Condition, ConditionalBranch } from '~/types';

interface DescriptionNodeEditorProps {
    node: StoryNode & { data: DescriptionNodeData };
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    availableNodes: [string, Step][];
}

export const DescriptionNodeEditor: React.FC<DescriptionNodeEditorProps> = ({
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

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Conditional Branches</label>
                    <button
                        onClick={() => {
                            const newBranch: ConditionalBranch = {
                                condition: {
                                    variableName: '',
                                    operator: '==',
                                    value: ''
                                },
                                next: ''
                            };
                            const newBranches = [...(node.data.conditionalBranches || []), newBranch];
                            onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                        }}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Branch
                    </button>
                </div>

                {node.data.conditionalBranches?.map((branch: ConditionalBranch, index: number) => (
                    <div key={index} className="space-y-2 p-3 border border-gray-600 rounded">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-sm font-medium text-gray-300">Branch {index + 1}</span>
                            <button
                                onClick={() => {
                                    const newBranches = [...(node.data.conditionalBranches || [])];
                                    newBranches.splice(index, 1);
                                    onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="space-y-2">
                            <input
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                placeholder="Variable name"
                                value={branch.condition.variableName}
                                onChange={(e) => {
                                    const newBranches = [...(node.data.conditionalBranches || [])];
                                    newBranches[index] = {
                                        ...branch,
                                        condition: {
                                            ...branch.condition,
                                            variableName: e.target.value
                                        }
                                    };
                                    onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                                }}
                            />

                            <div className="flex gap-2">
                                <select
                                    className="w-24 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                    value={branch.condition.operator}
                                    onChange={(e) => {
                                        const newBranches = [...(node.data.conditionalBranches || [])];
                                        newBranches[index] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                operator: e.target.value as Condition['operator']
                                            }
                                        };
                                        onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                                    }}
                                >
                                    <option value="==">=</option>
                                    <option value="!=">≠</option>
                                    <option value=">">&gt;</option>
                                    <option value="<">&lt;</option>
                                    <option value=">=">&gt;=</option>
                                    <option value="<=">&lt;=</option>
                                </select>

                                <input
                                    className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                    placeholder="Value"
                                    value={String(branch.condition.value)}
                                    onChange={(e) => {
                                        const newBranches = [...(node.data.conditionalBranches || [])];
                                        newBranches[index] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                value: e.target.value
                                            }
                                        };
                                        onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                                    }}
                                />
                            </div>

                            <select
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                value={branch.next}
                                onChange={(e) => {
                                    const newBranches = [...(node.data.conditionalBranches || [])];
                                    newBranches[index] = {
                                        ...branch,
                                        next: e.target.value
                                    };
                                    onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                                }}
                            >
                                <option value="">Select next node</option>
                                {availableNodes.map(([id, step]: [string, Step]) => (
                                    <option key={id} value={id}>
                                        {id} ({step.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <label htmlFor="nodeNext" className="text-sm font-medium text-gray-300">Default Next Node</label>
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