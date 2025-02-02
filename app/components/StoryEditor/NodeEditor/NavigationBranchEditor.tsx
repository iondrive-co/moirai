import React from 'react';
import type { ConditionalBranch, Step } from '~/types';
import { ConditionEditor, NodeSelect } from './Common';
import { CollapsiblePanel } from './CollapsiblePanel';

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
        <CollapsiblePanel
            title={`Branch ${index + 1}`}
            defaultOpen={true}
            rightElement={
                <button
                    onClick={onRemove}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Remove
                </button>
            }
        >
            <div className="mb-4 p-3 border border-gray-600 rounded">
                <div className="space-y-4">
                    <ConditionEditor
                        condition={branchData.condition}
                        onChange={(updates) => {
                            onUpdate({
                                condition: {
                                    ...branchData.condition,
                                    ...updates
                                }
                            });
                        }}
                    />

                    <NodeSelect
                        value={branchData.next || ''}
                        onChange={(value) => onUpdate({ next: value })}
                        availableNodes={availableNodes}
                        placeholder="Select next node"
                    />
                </div>
            </div>
        </CollapsiblePanel>
    );
};