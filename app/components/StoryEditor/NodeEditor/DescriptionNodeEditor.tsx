import React, { useRef } from 'react';
import type {
    StoryNode,
    StoryNodeData,
    DescriptionNodeData,
    Step,
    Condition,
    ConditionalBranch,
    TextInsertionPoint,
    TextVariant
} from '~/types';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const addInsertionPoint = () => {
        const existingPoints = node.data.insertionPoints || [];
        let counter = 1;
        let defaultName = `Condition ${counter}`;

        while (existingPoints.some(point => point.name === defaultName)) {
            counter++;
            defaultName = `Condition ${counter}`;
        }

        const newInsertionPoint: TextInsertionPoint = {
            id: defaultName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            name: defaultName,
            variants: [{
                condition: {
                    variableName: '',
                    operator: '==',
                    value: ''
                },
                text: ''
            }]
        };

        // Get cursor position or end of text
        const textarea = textareaRef.current;
        const currentText = node.data.text || '';
        let insertPosition = currentText.length;

        if (textarea) {
            insertPosition = textarea.selectionStart || currentText.length;
        }

        // Insert the placeholder at the cursor position or end
        const placeholder = `{{${newInsertionPoint.id}}}`;
        const newText = currentText.slice(0, insertPosition) + placeholder + currentText.slice(insertPosition);

        const newInsertionPoints = [...(node.data.insertionPoints || []), newInsertionPoint];
        onUpdateNodeData(node.id, {
            insertionPoints: newInsertionPoints,
            text: newText
        });
    };

    const updateInsertionPoint = (index: number, updates: Partial<TextInsertionPoint>) => {
        const newInsertionPoints = [...(node.data.insertionPoints || [])];
        const oldPoint = newInsertionPoints[index];
        newInsertionPoints[index] = { ...oldPoint, ...updates };

        // If the ID changed, update the placeholder in the text
        if (updates.id && updates.id !== oldPoint.id) {
            const newText = (node.data.text || '').replace(
                new RegExp(`{{${oldPoint.id}}}`, 'g'),
                `{{${updates.id}}}`
            );
            onUpdateNodeData(node.id, {
                insertionPoints: newInsertionPoints,
                text: newText
            });
        } else {
            onUpdateNodeData(node.id, {
                insertionPoints: newInsertionPoints
            });
        }
    };

    return (
        <>
            {/* Base text field */}
            <div className="space-y-2">
                <label htmlFor="nodeText" className="text-sm font-medium text-gray-300">Base Text</label>
                <div className="relative">
                    <textarea
                        id="nodeText"
                        ref={textareaRef}
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                        value={node.data.text}
                        onChange={(e) => {
                            onUpdateNodeData(node.id, { text: e.target.value });
                        }}
                        rows={4}
                    />
                </div>
            </div>

            {/* Conditional Text Section */}
            <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-t border-gray-600 pt-4">
                    <label className="text-sm font-medium text-gray-300">Conditional Text</label>
                    <button
                        onClick={addInsertionPoint}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Condition
                    </button>
                </div>

                {node.data.insertionPoints?.map((point, index) => (
                    <div key={index} className="space-y-2 p-3 border border-gray-600 rounded">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <input
                                type="text"
                                className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                placeholder="Condition Name"
                                value={point.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    updateInsertionPoint(index, {
                                        name: newName,
                                        id: newName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                                    });
                                }}
                            />
                            <button
                                onClick={() => {
                                    const newInsertionPoints = [...(node.data.insertionPoints || [])];
                                    newInsertionPoints.splice(index, 1);

                                    // Remove this point's placeholder from the text
                                    const newText = (node.data.text || '').replace(
                                        new RegExp(`{{${point.id}}}`, 'g'),
                                        ''
                                    );

                                    onUpdateNodeData(node.id, {
                                        insertionPoints: newInsertionPoints,
                                        text: newText
                                    });
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="space-y-4">
                            {point.variants.map((variant, variantIndex) => (
                                <div key={variantIndex} className="p-2 border border-gray-700 rounded">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-300">Variant {variantIndex + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const newVariants = [...point.variants];
                                                    newVariants.splice(variantIndex, 1);
                                                    updateInsertionPoint(index, { variants: newVariants });
                                                }}
                                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                            >
                                                Remove Variant
                                            </button>
                                        </div>

                                        <input
                                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                            placeholder="Variable name"
                                            value={variant.condition.variableName}
                                            onChange={(e) => {
                                                const newVariants = [...point.variants];
                                                newVariants[variantIndex] = {
                                                    ...variant,
                                                    condition: {
                                                        ...variant.condition,
                                                        variableName: e.target.value
                                                    }
                                                };
                                                updateInsertionPoint(index, { variants: newVariants });
                                            }}
                                        />

                                        <div className="flex gap-2">
                                            <select
                                                className="w-24 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                                value={variant.condition.operator}
                                                onChange={(e) => {
                                                    const newVariants = [...point.variants];
                                                    newVariants[variantIndex] = {
                                                        ...variant,
                                                        condition: {
                                                            ...variant.condition,
                                                            operator: e.target.value as Condition['operator']
                                                        }
                                                    };
                                                    updateInsertionPoint(index, { variants: newVariants });
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
                                                value={String(variant.condition.value)}
                                                onChange={(e) => {
                                                    const newVariants = [...point.variants];
                                                    newVariants[variantIndex] = {
                                                        ...variant,
                                                        condition: {
                                                            ...variant.condition,
                                                            value: e.target.value
                                                        }
                                                    };
                                                    updateInsertionPoint(index, { variants: newVariants });
                                                }}
                                            />
                                        </div>

                                        <textarea
                                            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                            placeholder="Text for this condition"
                                            value={variant.text}
                                            onChange={(e) => {
                                                const newVariants = [...point.variants];
                                                newVariants[variantIndex] = {
                                                    ...variant,
                                                    text: e.target.value
                                                };
                                                updateInsertionPoint(index, { variants: newVariants });
                                            }}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    const newVariant: TextVariant = {
                                        condition: {
                                            variableName: '',
                                            operator: '==',
                                            value: ''
                                        },
                                        text: ''
                                    };
                                    updateInsertionPoint(index, {
                                        variants: [...point.variants, newVariant]
                                    });
                                }}
                                className="w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                                Add Text Variant
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Conditional Navigation Section */}
            <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-t border-gray-600 pt-4">
                    <label className="text-sm font-medium text-gray-300">Conditional Navigation</label>
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

                {node.data.conditionalBranches?.map((branch, index) => (
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

            {/* Default Next Node */}
            <div className="space-y-2 mt-6">
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