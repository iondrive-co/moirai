import React from 'react';
import type {
    ChoiceNodeData,
    DescriptionNodeData,
    DialogueNodeData,
    ImageNodeData,
    SceneTransitionNodeData,
    StoryData,
    StoryNode,
    StoryNodeData
} from '~/types';
import {ChoiceNodeEditor} from "~/components/StoryEditor/NodeEditor/ChoiceNodeEditor";
import {DescriptionNodeEditor} from "~/components/StoryEditor/NodeEditor/DescriptionNodeEditor";
import {DialogueNodeEditor} from "~/components/StoryEditor/NodeEditor/DialogueNodeEditor";
import {ImageNodeEditor} from '~/components/StoryEditor/NodeEditor/ImageNodeEditor';
import {SceneTransitionNodeEditor} from '~/components/StoryEditor/NodeEditor/SceneTransitionNodeEditor';

interface NodeEditorProps {
    selectedNode: StoryNode | null;
    storyData: StoryData;
    currentScene: string;
    onUpdateNodeId: (oldId: string, newId: string) => void;
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    onDeleteNode: (nodes: StoryNode[]) => void;
}

const isChoiceNode = (node: StoryNode): node is StoryNode & { data: ChoiceNodeData } =>
    node.data.type === 'choice';

const isDialogueNode = (node: StoryNode): node is StoryNode & { data: DialogueNodeData } =>
    node.data.type === 'dialogue';

const isDescriptionNode = (node: StoryNode): node is StoryNode & { data: DescriptionNodeData } =>
    node.data.type === 'description';

const isImageNode = (node: StoryNode): node is StoryNode & { data: ImageNodeData } =>
    node.data.type === 'image';

const isSceneTransitionNode = (node: StoryNode): node is StoryNode & { data: SceneTransitionNodeData } =>
    node.data.type === 'sceneTransition';

export const NodeEditor: React.FC<NodeEditorProps> = ({
                                                          selectedNode,
                                                          storyData,
                                                          currentScene,
                                                          onUpdateNodeId,
                                                          onUpdateNodeData,
                                                          onDeleteNode
                                                      }) => {
    if (!selectedNode) {
        return <p className="text-gray-400">Select a node to edit its contents</p>;
    }

    return (
        <div className="space-y-4">
            <div>
                <button
                    onClick={() => onDeleteNode([selectedNode])}
                    className="w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mb-2"
                >
                    Delete Node
                </button>
                <h3 className="font-medium text-white border-b border-gray-700 pb-2">
                    Edit Node: {selectedNode.data.stepId}
                </h3>
            </div>

            <div className="space-y-2">
                <label htmlFor="nodeId" className="text-sm font-medium text-gray-300">Node ID</label>
                <input
                    id="nodeId"
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                    value={selectedNode.data.stepId}
                    onChange={(e) => {
                        const newId = e.target.value.trim();
                        if (newId && newId !== selectedNode.data.stepId) {
                            onUpdateNodeId(selectedNode.data.stepId, newId);
                        }
                    }}
                />
            </div>


            {isChoiceNode(selectedNode) && (
                <ChoiceNodeEditor
                    node={selectedNode}
                    onUpdateNodeData={onUpdateNodeData}
                    availableNodes={Object.entries(storyData[currentScene].steps)
                        .filter(([id]) => id !== selectedNode.id)}
                />
            )}

            {isDescriptionNode(selectedNode) && (
                <DescriptionNodeEditor
                    node={selectedNode}
                    onUpdateNodeData={onUpdateNodeData}
                    availableNodes={Object.entries(storyData[currentScene].steps)
                        .filter(([id]) => id !== selectedNode.id)}
                />
            )}

            {isDialogueNode(selectedNode) && (
                <DialogueNodeEditor
                    node={selectedNode}
                    onUpdateNodeData={onUpdateNodeData}
                    availableNodes={Object.entries(storyData[currentScene].steps)
                        .filter(([id]) => id !== selectedNode.id)}
                />
            )}

            {isImageNode(selectedNode) && (
                <ImageNodeEditor
                    node={selectedNode}
                    onUpdateNodeData={onUpdateNodeData}
                    availableNodes={Object.entries(storyData[currentScene].steps)
                        .filter(([id]) => id !== selectedNode.id)}
                />
            )}

            {isSceneTransitionNode(selectedNode) && (
                <SceneTransitionNodeEditor
                    node={selectedNode}
                    onUpdateNodeData={onUpdateNodeData}
                    availableNodes={Object.entries(storyData[currentScene].steps)
                        .filter(([id]) => id !== selectedNode.id)}
                />
            )}
        </div>
    );
};