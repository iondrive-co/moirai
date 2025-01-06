import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData, DescriptionNodeData, ChoiceNodeData } from '~/data/story.types';

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
                        <div className="text-white whitespace-pre-wrap">{choice.text}</div>
                        <div className="text-xs text-gray-400">→ {choice.next}</div>
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

export const nodeTypes = {
    dialogue: DialogueNode,
    description: DescriptionNode,
    choice: ChoiceNode,
};