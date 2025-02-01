import React from 'react';
import type {Condition, TextBranch, TextInsertionPoint} from '~/types';

interface InsertionPointEditorProps {
    insertionPoint: TextInsertionPoint;
    onUpdate: (updates: Partial<TextInsertionPoint>) => void;
    onDelete: () => void;
}

export const InsertionPointEditor: React.FC<InsertionPointEditorProps> = ({
                                                                              insertionPoint,
                                                                              onUpdate,
                                                                              onDelete
                                                                          }) => {
    return (
        <div className="space-y-2 p-3 border border-gray-600 rounded">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <input
                    type="text"
                    className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                    value={insertionPoint.name}
                    onChange={(e) => {
                        const newName = e.target.value;
                        // Keep id and name in sync, preserving the {{}} format in text
                        onUpdate({
                            name: newName,
                            id: newName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                        });
                    }}
                    placeholder="Insertion Point Name"
                />
                <button
                    onClick={onDelete}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Remove
                </button>
            </div>

            <div className="space-y-4">
                {insertionPoint.branches.map((branch, index) => (
                    <div key={index} className="p-2 border border-gray-700 rounded">
                        <div className="space-y-2">
                            <input
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                placeholder="Variable name"
                                value={branch.condition.variableName}
                                onChange={(e) => {
                                    const newBranches = [...insertionPoint.branches];
                                    newBranches[index] = {
                                        ...branch,
                                        condition: {
                                            ...branch.condition,
                                            variableName: e.target.value
                                        }
                                    };
                                    onUpdate({ branches: newBranches });
                                }}
                            />

                            <div className="flex gap-2">
                                <select
                                    className="w-24 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                    value={branch.condition.operator}
                                    onChange={(e) => {
                                        const newBranches = [...insertionPoint.branches];
                                        newBranches[index] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                operator: e.target.value as Condition['operator']
                                            }
                                        };
                                        onUpdate({ branches: newBranches });
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
                                        const newBranches = [...insertionPoint.branches];
                                        newBranches[index] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                value: e.target.value
                                            }
                                        };
                                        onUpdate({ branches: newBranches });
                                    }}
                                />
                            </div>

                            <textarea
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                placeholder="Text for this condition"
                                value={branch.text}
                                onChange={(e) => {
                                    const newBranches = [...insertionPoint.branches];
                                    newBranches[index] = {
                                        ...branch,
                                        text: e.target.value
                                    };
                                    onUpdate({ branches: newBranches });
                                }}
                                rows={2}
                            />

                            <button
                                onClick={() => {
                                    const newBranches = [...insertionPoint.branches];
                                    newBranches.splice(index, 1);
                                    onUpdate({ branches: newBranches });
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                                Remove Branch
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    const newBranch: TextBranch = {
                        condition: {
                            variableName: '',
                            operator: '==',
                            value: ''
                        },
                        text: ''
                    };
                    onUpdate({
                        branches: [...insertionPoint.branches, newBranch]
                    });
                }}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
                Add Branch
            </button>
        </div>
    );
};