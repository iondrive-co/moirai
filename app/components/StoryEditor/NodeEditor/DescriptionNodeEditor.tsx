import React, { useRef } from 'react';
import type {
    StoryNode,
    StoryNodeData,
    DescriptionNodeData,
    Step,
    Condition,
    ConditionalText, ConditionalBranch
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

    const addConditionalText = () => {
        const existingNames = node.data.conditionalTexts?.map(ct => ct.name) || [];
        let counter = 1;
        let defaultName = `Condition ${counter}`;

        while (existingNames.includes(defaultName)) {
            counter++;
            defaultName = `Condition ${counter}`;
        }

        const newConditionalText: ConditionalText = {
            id: defaultName,
            name: defaultName,
            condition: {
                variableName: '',
                operator: '==',
                value: ''
            },
            text: ''
        };

        // Get cursor position or end of text
        const textarea = textareaRef.current;
        const currentText = node.data.text || '';
        let insertPosition = currentText.length;

        if (textarea) {
            insertPosition = textarea.selectionStart || currentText.length;
        }

        // Insert the placeholder at the cursor position or end
        const placeholder = `{{${defaultName}}}`;
        const newText = currentText.slice(0, insertPosition) + placeholder + currentText.slice(insertPosition);

        const newConditionalTexts = [...(node.data.conditionalTexts || []), newConditionalText];
        onUpdateNodeData(node.id, {
            conditionalTexts: newConditionalTexts,
            text: newText
        });
    };

    const updateConditionalTextId = (oldId: string, newName: string, index: number) => {
        // Make sure the new name is unique
        const existingNames = node.data.conditionalTexts?.map(ct => ct.name) || [];
        let uniqueName = newName;
        let counter = 1;
        while (existingNames.filter((name, i) => i !== index).includes(uniqueName)) {
            uniqueName = `${newName} ${counter}`;
            counter++;
        }

        // Update the ID in the condition
        const newConditionalTexts = [...(node.data.conditionalTexts || [])];
        newConditionalTexts[index] = {
            ...newConditionalTexts[index],
            id: uniqueName,
            name: uniqueName
        };

        // Update all occurrences of the old placeholder in the text
        const newText = (node.data.text || '').replace(
            new RegExp(`{{${oldId}}}`, 'g'),
            `{{${uniqueName}}}`
        );

        onUpdateNodeData(node.id, {
            conditionalTexts: newConditionalTexts,
            text: newText
        });

        return uniqueName;
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
                    <label className="text-sm font-medium text-gray-300">Conditional Text Sections</label>
                    <button
                        onClick={addConditionalText}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Conditional Text
                    </button>
                </div>

                {node.data.conditionalTexts?.map((conditionalText, index) => (
                    <div key={index} className="space-y-2 p-3 border border-gray-600 rounded">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                    placeholder="Condition Name"
                                    value={conditionalText.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        const newId = updateConditionalTextId(conditionalText.id, newName, index);
                                        const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                        newConditionalTexts[index] = {
                                            ...conditionalText,
                                            id: newId,
                                            name: newName
                                        };
                                        onUpdateNodeData(node.id, { conditionalTexts: newConditionalTexts });
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    // Remove this condition's placeholder from the text
                                    const newText = (node.data.text || '').replace(
                                        new RegExp(`{{${conditionalText.id}}}`, 'g'),
                                        ''
                                    );

                                    const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                    newConditionalTexts.splice(index, 1);
                                    onUpdateNodeData(node.id, {
                                        conditionalTexts: newConditionalTexts,
                                        text: newText
                                    });
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
                                value={conditionalText.condition.variableName}
                                onChange={(e) => {
                                    const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                    newConditionalTexts[index] = {
                                        ...conditionalText,
                                        condition: {
                                            ...conditionalText.condition,
                                            variableName: e.target.value
                                        }
                                    };
                                    onUpdateNodeData(node.id, { conditionalTexts: newConditionalTexts });
                                }}
                            />

                            <div className="flex gap-2">
                                <select
                                    className="w-24 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                    value={conditionalText.condition.operator}
                                    onChange={(e) => {
                                        const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                        newConditionalTexts[index] = {
                                            ...conditionalText,
                                            condition: {
                                                ...conditionalText.condition,
                                                operator: e.target.value as Condition['operator']
                                            }
                                        };
                                        onUpdateNodeData(node.id, { conditionalTexts: newConditionalTexts });
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
                                    value={String(conditionalText.condition.value)}
                                    onChange={(e) => {
                                        const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                        newConditionalTexts[index] = {
                                            ...conditionalText,
                                            condition: {
                                                ...conditionalText.condition,
                                                value: e.target.value
                                            }
                                        };
                                        onUpdateNodeData(node.id, { conditionalTexts: newConditionalTexts });
                                    }}
                                />
                            </div>

                            <textarea
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                placeholder="Text to show when condition is met"
                                value={conditionalText.text}
                                onChange={(e) => {
                                    const newConditionalTexts = [...(node.data.conditionalTexts || [])];
                                    newConditionalTexts[index] = {
                                        ...conditionalText,
                                        text: e.target.value
                                    };
                                    onUpdateNodeData(node.id, { conditionalTexts: newConditionalTexts });
                                }}
                                rows={2}
                            />
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
                            onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                                    onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                                    onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                                        onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                                        onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                                    onUpdateNodeData(node.id, {conditionalBranches: newBranches});
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
                        onUpdateNodeData(node.id, {next: e.target.value || undefined});
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