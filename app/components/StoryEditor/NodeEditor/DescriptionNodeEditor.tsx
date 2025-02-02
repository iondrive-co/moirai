import React, { useRef } from 'react';
import type {
    StoryNode,
    StoryNodeData,
    DescriptionNodeData,
    Step
} from '~/types';
import { NodeSelect } from './Common';
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

    return (
        <div className="space-y-6">
            <CollapsiblePanel title="Base Text" defaultOpen={true}>
                <textarea
                    ref={textareaRef}
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={node.data.text}
                    onChange={(e) => {
                        onUpdateNodeData(node.id, {
                            text: e.target.value
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
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Condition
                    </button>
                }
            >
                <div className="space-y-4">
                    {node.data.insertionPoints?.map((point, index) => (
                        <ConditionalTextEditor
                            key={index}
                            point={point}
                            onUpdate={(updates) => {
                                const newInsertionPoints = [...(node.data.insertionPoints || [])];
                                newInsertionPoints[index] = { ...point, ...updates };
                                onUpdateNodeData(node.id, { insertionPoints: newInsertionPoints });
                            }}
                            onRemove={() => {
                                const newInsertionPoints = [...(node.data.insertionPoints || [])];
                                newInsertionPoints.splice(index, 1);
                                onUpdateNodeData(node.id, { insertionPoints: newInsertionPoints });
                            }}
                        />
                    ))}
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel
                title="Conditional Navigation"
                defaultOpen={false}
                rightElement={
                    <button
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Add Branch
                    </button>
                }
            >
                <div className="space-y-4">
                    {node.data.conditionalBranches?.map((branch, index) => (
                        <NavigationBranchEditor
                            key={index}
                            branchData={branch}
                            index={index}
                            availableNodes={availableNodes}
                            onUpdate={(updates) => {
                                const newBranches = [...(node.data.conditionalBranches || [])];
                                newBranches[index] = { ...branch, ...updates };
                                onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                            }}
                            onRemove={() => {
                                const newBranches = [...(node.data.conditionalBranches || [])];
                                newBranches.splice(index, 1);
                                onUpdateNodeData(node.id, { conditionalBranches: newBranches });
                            }}
                        />
                    ))}
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Default Next Node" defaultOpen={false}>
                <NodeSelect
                    value={node.data.next || ''}
                    onChange={(value) => onUpdateNodeData(node.id, { next: value || undefined })}
                    availableNodes={availableNodes}
                    placeholder="Select default next node"
                />
            </CollapsiblePanel>
        </div>
    );
};