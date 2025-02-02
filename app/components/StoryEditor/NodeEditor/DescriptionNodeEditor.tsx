import React, { useRef } from 'react';
import type {
    StoryNode,
    StoryNodeData,
    DescriptionNodeData,
    Step,
    TextInsertionPoint,
    ConditionalBranch
} from '~/types';
import { CollapsiblePanel } from './CollapsiblePanel';
import { ConditionalTextEditor } from './ConditionalTextEditor';
import { NavigationBranchEditor } from './NavigationBranchEditor';

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
        let id = `condition_${counter}`;

        while (existingPoints.some(point => point.id === id)) {
            counter++;
            id = `condition_${counter}`;
        }

        const newInsertionPoint: TextInsertionPoint = {
            id,
            variants: [{
                condition: {
                    variableName: '',
                    operator: '==',
                    value: ''
                },
                text: ''
            }]
        };

        const textarea = textareaRef.current;
        const currentText = node.data.text || '';
        let insertPosition = currentText.length;

        if (textarea) {
            insertPosition = textarea.selectionStart || currentText.length;
        }

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

    const removeInsertionPoint = (index: number) => {
        const newInsertionPoints = [...(node.data.insertionPoints || [])];
        const pointToRemove = newInsertionPoints[index];
        newInsertionPoints.splice(index, 1);

        // Remove this point's placeholder from the text
        const newText = (node.data.text || '').replace(
            new RegExp(`{{${pointToRemove.id}}}`, 'g'),
            ''
        );

        onUpdateNodeData(node.id, {
            insertionPoints: newInsertionPoints,
            text: newText
        });
    };

    const addConditionalBranch = () => {
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
    };

    const updateConditionalBranch = (index: number, updates: Partial<ConditionalBranch>) => {
        const newBranches = [...(node.data.conditionalBranches || [])];
        newBranches[index] = { ...newBranches[index], ...updates };
        onUpdateNodeData(node.id, { conditionalBranches: newBranches });
    };

    const removeConditionalBranch = (index: number) => {
        const newBranches = [...(node.data.conditionalBranches || [])];
        newBranches.splice(index, 1);
        onUpdateNodeData(node.id, { conditionalBranches: newBranches });
    };

    return (
        <div className="space-y-6">
            <CollapsiblePanel title="Base Text" defaultOpen={true}>
        <textarea
            ref={textareaRef}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
            value={node.data.text}
            onChange={(e) => {
                const newText = e.target.value;
                const placeholderRegex = /{{([^}]+)}}/g;
                const newPlaceholders = Array.from(newText.matchAll(placeholderRegex))
                    .map(match => match[1]);

                const currentPoints = [...(node.data.insertionPoints || [])];
                const currentIds = currentPoints.map(point => point.id);

                const updatedPoints: TextInsertionPoint[] = newPlaceholders.map(placeholder => {
                    const oldPointIndex = newPlaceholders.indexOf(placeholder);
                    if (oldPointIndex < currentIds.length) {
                        const oldPoint = currentPoints[oldPointIndex];
                        if (oldPoint) {
                            return {
                                ...oldPoint,
                                id: placeholder
                            };
                        }
                    }

                    const existingPoint = currentPoints.find(p => p.id === placeholder);
                    if (existingPoint) {
                        return existingPoint;
                    }

                    return {
                        id: placeholder,
                        variants: [{
                            condition: {
                                variableName: '',
                                operator: '==' as const,
                                value: ''
                            },
                            text: ''
                        }]
                    };
                });

                onUpdateNodeData(node.id, {
                    text: newText,
                    insertionPoints: updatedPoints
                });
            }}
            rows={4}
        />
            </CollapsiblePanel>

            <CollapsiblePanel
                title="Conditional Text"
                defaultOpen={false}
                rightElement={
                    <button
                        onClick={addInsertionPoint}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Condition
                    </button>
                }
            >
                {node.data.insertionPoints?.map((point, index) => (
                    <ConditionalTextEditor
                        key={index}
                        point={point}
                        onUpdate={(updates) => updateInsertionPoint(index, updates)}
                        onRemove={() => removeInsertionPoint(index)}
                    />
                ))}
            </CollapsiblePanel>

            <CollapsiblePanel
                title="Conditional Navigation"
                defaultOpen={false}
                rightElement={
                    <button
                        onClick={addConditionalBranch}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Branch
                    </button>
                }
            >
                {node.data.conditionalBranches?.map((branch, index) => (
                    <NavigationBranchEditor
                        key={index}
                        branchData={branch}  // Changed from branch to branchData
                        index={index}
                        availableNodes={availableNodes}
                        onUpdate={(updates) => updateConditionalBranch(index, updates)}
                        onRemove={() => removeConditionalBranch(index)}
                    />
                ))}
            </CollapsiblePanel>

            <CollapsiblePanel title="Default Next Node" defaultOpen={false}>
                <select
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
            </CollapsiblePanel>
        </div>
    );
};