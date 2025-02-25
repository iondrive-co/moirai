import React, {useEffect, useState} from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData, DescriptionNodeData, ChoiceNodeData, SceneTransitionNodeData, ImageNodeData } from '~/types';

export const DialogueNode: React.FC<NodeProps<DialogueNodeData>> = ({ data }) => (
    <div className="bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
        <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
        />

        <div className="bg-gray-700 p-2 rounded-t-lg border-b border-blue-500 drag-handle">
            <h3 className="text-sm font-medium text-blue-300">{data.stepId}</h3>
            <p className="text-xs text-blue-400">Speaker: {data.speaker}</p>
        </div>
        <div className="p-3">
            <p className="text-sm text-white whitespace-pre-wrap">{data.text}</p>
            {data.next && (
                <p className="text-xs text-gray-400 mt-2">Next: {data.next}</p>
            )}
        </div>

        <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#555' }}
        />
    </div>
);

export const DescriptionNode: React.FC<NodeProps<DescriptionNodeData>> = ({ data }) => (
    <div className="bg-gray-800 border-2 border-green-500 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
        <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
        />

        <div className="bg-gray-700 p-2 rounded-t-lg border-b border-green-500 drag-handle">
            <h3 className="text-sm font-medium text-green-300">{data.stepId}</h3>
        </div>
        <div className="p-3">
            <p className="text-sm text-white whitespace-pre-wrap">{data.text}</p>
            {data.next && !data.conditionalBranches?.length && (
                <p className="text-xs text-gray-400 mt-2">Next: {data.next}</p>
            )}
            {data.conditionalBranches && data.conditionalBranches.length > 0 && (
                <div className="mt-2">
                    <p className="text-xs text-gray-400">Conditional Branches:</p>
                    {data.conditionalBranches.map((branch, index) => (
                        <p key={index} className="text-xs text-gray-400 ml-2">
                            If {branch.condition.variableName} {branch.condition.operator} {String(branch.condition.value)} → {branch.next}
                        </p>
                    ))}
                </div>
            )}
        </div>

        <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#555' }}
        />
    </div>
);

export const ChoiceNode: React.FC<NodeProps<ChoiceNodeData>> = ({ data }) => (
    <div className="bg-gray-800 border-2 border-purple-500 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
        <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
        />

        <div className="bg-gray-700 p-2 rounded-t-lg border-b border-purple-500 drag-handle">
            <h3 className="text-sm font-medium text-purple-300">{data.stepId}</h3>
        </div>
        <div className="p-3">
            <ul className="text-sm list-disc pl-4">
                {data.choices?.map((choice, index) => (
                    <li key={index} className="mb-2">
                        <div>
                            <div className="text-white whitespace-pre-wrap">
                                {choice.isDialogue ? `"${choice.text}"` : choice.text}
                                <span className="text-purple-300 text-xs ml-1">
                                    ({choice.isDialogue ? 'dialogue' : 'descriptive'})
                                </span>
                            </div>
                            {choice.historyText && (
                                <div className="text-gray-400 text-xs italic ml-2">
                                    History: {choice.historyIsDialogue ? `"${choice.historyText}"` : choice.historyText}
                                    <span className="text-purple-300 ml-1">
                                        ({choice.historyIsDialogue ? 'dialogue' : 'descriptive'})
                                    </span>
                                </div>
                            )}
                            <div className="text-xs text-gray-400">→ {choice.next}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#555' }}
        />
    </div>
);

export const SceneTransitionNode: React.FC<NodeProps<SceneTransitionNodeData>> = ({ data }) => (
    <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
        <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
        />

        <div className="bg-gray-700 p-2 rounded-t-lg border-b border-yellow-500 drag-handle">
            <h3 className="text-sm font-medium text-yellow-300">{data.stepId}</h3>
        </div>
        <div className="p-3">
            <p className="text-sm text-white whitespace-pre-wrap">{data.text}</p>
            <p className="text-xs text-gray-400 mt-2">Next Scene: {data.nextScene}</p>
        </div>

        <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#555' }}
        />
    </div>
);

export const ImageNode: React.FC<NodeProps<ImageNodeData>> = ({ data }) => {
    const [previewKey, setPreviewKey] = useState(0);

    // Force refresh when path changes
    useEffect(() => {
        setPreviewKey(prev => prev + 1);
    }, [data.image.path]);

    return (
        <div className="bg-gray-800 border-2 border-pink-500 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555' }}
            />

            <div className="bg-gray-700 p-2 rounded-t-lg border-b border-pink-500 drag-handle">
                <h3 className="text-sm font-medium text-pink-300">{data.stepId}</h3>
                <p className="text-xs text-pink-400">Image Node</p>
            </div>
            <div className="p-3">
                {data.image.path && (
                    <div className="mb-2">
                        <img
                            key={previewKey}
                            src={data.image.path}
                            alt={data.image.alt || 'Image preview'}
                            className="max-h-32 mx-auto object-contain rounded border border-gray-600"
                            onError={(e) => {
                                e.currentTarget.src = '/api/placeholder-image';
                                e.currentTarget.alt = 'Image not found';
                            }}
                        />
                    </div>
                )}
                <p className="text-xs text-gray-400">Path: {data.image.path || 'Not set'}</p>
                <p className="text-xs text-gray-400">Position: {data.image.position}</p>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555' }}
            />
        </div>
    );
};

export const nodeTypes = {
    dialogue: DialogueNode,
    description: DescriptionNode,
    choice: ChoiceNode,
    sceneTransition: SceneTransitionNode,
    image: ImageNode,
};