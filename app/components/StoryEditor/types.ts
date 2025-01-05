import { Edge, Node, MarkerType } from 'reactflow';
import type { StoryNodeData } from '~/data/story.types';

interface EdgeData {
}

export type StoryNode = Node<StoryNodeData>;
export type StoryEdge = Edge<EdgeData>;

export const defaultEdgeOptions = {
    type: 'smoothstep' as const,
    animated: true,
    style: {
        strokeWidth: 2,
        stroke: '#94a3b8'
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
    }
};