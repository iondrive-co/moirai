import React from 'react';
import type { ConditionalBranch, Step } from '~/types';

interface NavigationBranchEditorProps {
    branchData: ConditionalBranch;
    index: number;
    availableNodes: [string, Step][];
    onUpdate: (updates: Partial<ConditionalBranch>) => void;
    onRemove: () => void;
}

export const NavigationBranchEditor: React.FC<NavigationBranchEditorProps> = ({
                                                                                  branchData,
                                                                                  index,
                                                                                  availableNodes,
                                                                                  onUpdate,
                                                                                  onRemove
                                                                              }) => {
    return (
        <div className="mb-4 p-3 border border-gray-600 rounded">
            <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-300">
          Branch {index + 1}
        </span>
                <button
                    onClick={onRemove}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Remove
                </button>
            </div>

            <div className="space-y-2">
                <input
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                    placeholder="Variable name"
                    value={branchData.condition.variableName}
                    onChange={(e) => {
                        onUpdate({
                            condition: {
                                ...branchData.condition,
                                variableName: e.target.value
                            }
                        });
                    }}
                />

                <div className="flex gap-2">
                    <select
                        className="w-20 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                        value={branchData.condition.operator}
                        onChange={(e) => {
                            onUpdate({
                                condition: {
                                    ...branchData.condition,
                                    operator: e.target.value as ConditionalBranch['condition']['operator']
                                }
                            });
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
                        value={String(branchData.condition.value)}
                        onChange={(e) => {
                            onUpdate({
                                condition: {
                                    ...branchData.condition,
                                    value: e.target.value
                                }
                            });
                        }}
                    />
                </div>

                <select
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                    value={branchData.next}
                    onChange={(e) => {
                        onUpdate({ next: e.target.value });
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
    );
};