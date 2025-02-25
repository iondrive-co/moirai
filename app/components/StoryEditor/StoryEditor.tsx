import { ReactFlow, Background, Controls, addEdge, useNodesState, useEdgesState, Connection, MarkerType } from 'reactflow';
import { useState, useCallback, useEffect } from 'react';
import 'reactflow/dist/style.css';
import type {StoryData, StoryNodeData, ChoiceStep, StoryNode, StoryEdge, ImageStep, Step} from '~/types';
import { NodeEditor } from './NodeEditor';
import { nodeTypes } from './NodeTypes';

const defaultEdgeOptions = {
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

const calculateNodePosition = (index: number) => ({
    x: (index % 3) * 400 + 50,
    y: Math.floor(index / 3) * 300 + 50
});

const initialStoryData: StoryData = {
    intro: {
        startingStep: '',
        steps: {}
    }
};

export const StoryEditor = () => {
    const [currentScene, setCurrentScene] = useState('intro');
    const [nodes, setNodes, onNodesChange] = useNodesState<StoryNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
    const [storyData, setStoryData] = useState<StoryData>(initialStoryData);
    const [hasChanges, setHasChanges] = useState(false);

    const updateNodesAndEdges = useCallback(() => {
        const newNodes: StoryNode[] = [];
        const newEdges: StoryEdge[] = [];
        const scene = storyData[currentScene];

        if (!scene) return;

        Object.entries(scene.steps).forEach(([stepId, step], index) => {
            const position = scene.nodePositions?.[stepId] || calculateNodePosition(index);

            const nodeData: StoryNodeData = {
                ...step,
                stepId
            };

            newNodes.push({
                id: stepId,
                type: step.type,
                position,
                data: nodeData,
                dragHandle: '.drag-handle'
            });

            if ('next' in step && step.next) {
                newEdges.push({
                    id: `${stepId}-${step.next}`,
                    source: stepId,
                    target: step.next,
                    ...defaultEdgeOptions
                } as StoryEdge);
            }

            if (step.type === 'description' && step.conditionalBranches) {
                step.conditionalBranches.forEach((branch, branchIndex) => {
                    if (branch.next) {
                        newEdges.push({
                            id: `${stepId}-${branch.next}-condition-${branchIndex}`,
                            source: stepId,
                            target: branch.next,
                            ...defaultEdgeOptions,
                            style: {
                                ...defaultEdgeOptions.style,
                                stroke: '#10b981' // Green color for conditional branches
                            }
                        } as StoryEdge);
                    }
                });
            }

            if (step.type === 'choice') {
                (step as ChoiceStep).choices.forEach((choice, choiceIndex) => {
                    if (choice.next) {
                        newEdges.push({
                            id: `${stepId}-${choice.next}-${choiceIndex}`,
                            source: stepId,
                            target: choice.next,
                            ...defaultEdgeOptions,
                            style: {
                                ...defaultEdgeOptions.style,
                                stroke: '#a855f7'
                            }
                        } as StoryEdge);
                    }
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [currentScene, storyData, setNodes, setEdges]);

    const onNodeDragStop = useCallback((_: React.MouseEvent, node: StoryNode) => {
        setStoryData(prev => {
            const newData = { ...prev };
            const scene = newData[currentScene];

            if (!scene.nodePositions) {
                scene.nodePositions = {};
            }

            scene.nodePositions[node.id] = {
                x: node.position.x,
                y: node.position.y
            };

            return newData;
        });

        setHasChanges(true);
    }, [currentScene]);

    const handleNodesDelete = useCallback((nodesToDelete: StoryNode[]) => {
        // First, collect any image paths that need to be deleted
        const imagePathsToDelete: string[] = [];

        nodesToDelete.forEach((node) => {
            if (node.data.type === 'image' && node.data.image?.path) {
                // Extract filename from path
                const filename = node.data.image.path.split('/').pop();
                if (filename) {
                    imagePathsToDelete.push(filename);
                }
            }
        });

        // Delete the actual nodes from the story data
        setStoryData((prev) => {
            const newData = { ...prev };
            const scene = newData[currentScene];

            nodesToDelete.forEach((node) => {
                delete scene.steps[node.id];

                Object.values(scene.steps).forEach((step) => {
                    if ('next' in step && step.next === node.id) {
                        step.next = undefined;
                    }
                    if (step.type === 'choice') {
                        step.choices = step.choices.filter(choice => choice.next !== node.id);
                    }
                    if ('conditionalBranches' in step && step.conditionalBranches) {
                        step.conditionalBranches = step.conditionalBranches.filter(
                            branch => branch.next !== node.id
                        );
                    }
                });

                if (scene.startingStep === node.id) {
                    scene.startingStep = '';
                }
            });

            return newData;
        });

        // Delete the image files from KV storage
        if (imagePathsToDelete.length > 0) {
            // Fire and forget - we don't need to wait for this
            fetch('/api/delete-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filenames: imagePathsToDelete })
            }).catch(err => console.error('Failed to delete image files:', err));
        }

        if (selectedNode && nodesToDelete.some(node => node.id === selectedNode.id)) {
            setSelectedNode(null);
        }

        setHasChanges(true);
    }, [currentScene, selectedNode]);

    const onConnect = useCallback((params: Connection) => {
        const source = params.source;
        const target = params.target;
        if (!source || !target) return;

        const newEdge = {
            ...params,
            ...defaultEdgeOptions,
            source,
            target
        } as StoryEdge;

        setEdges((eds) => addEdge(newEdge, eds));

        setStoryData((prev) => {
            const newData = { ...prev };
            const sourceStep = newData[currentScene].steps[source];

            if (sourceStep.type === 'choice') {
                sourceStep.choices = [
                    ...sourceStep.choices,
                    {
                        text: 'New Choice',
                        next: target,
                        isDialogue: false,
                        historyIsDialogue: false,
                        setVariables: []
                    }
                ];
            } else if ('next' in sourceStep) {
                sourceStep.next = target;
            }

            return newData;
        });

        setHasChanges(true);
    }, [setEdges, currentScene]);

    const updateNodeData = useCallback((nodeId: string, newData: Partial<StoryNodeData>) => {
        setStoryData((prev) => {
            const newStoryData = { ...prev };
            const currentStep = newStoryData[currentScene].steps[nodeId];
            const currentNodePositions = newStoryData[currentScene].nodePositions || {};

            if (currentStep.type === 'image') {
                newStoryData[currentScene].steps[nodeId] = {
                    ...currentStep,
                    ...newData
                } as ImageStep;
            } else {
                newStoryData[currentScene].steps[nodeId] = {
                    ...currentStep,
                    ...newData
                } as Step;
            }

            newStoryData[currentScene].nodePositions = currentNodePositions;
            return newStoryData;
        });

        setSelectedNode((prev) => {
            if (!prev || prev.id !== nodeId) return prev;
            const updatedData = {
                ...prev.data,
                ...newData,
                stepId: nodeId
            };
            return {
                ...prev,
                data: updatedData
            } as StoryNode;
        });

        setHasChanges(true);
        updateNodesAndEdges();
    }, [currentScene, updateNodesAndEdges]);

    const updateNodeId = useCallback((oldId: string, newId: string) => {
        if (oldId === newId) return;
        if (storyData[currentScene].steps[newId]) {
            alert('A node with this ID already exists');
            return;
        }

        setStoryData((prev) => {
            const newData = { ...prev };
            const steps = newData[currentScene].steps;

            const nodeData = steps[oldId];
            delete steps[oldId];
            steps[newId] = nodeData;

            Object.values(steps).forEach((step) => {
                if ('next' in step && step.next === oldId) {
                    step.next = newId;
                }
                if (step.type === 'choice') {
                    step.choices = step.choices.map(choice =>
                        choice.next === oldId ? { ...choice, next: newId } : choice
                    );
                }
                if ('conditionalBranches' in step && step.conditionalBranches) {
                    step.conditionalBranches = step.conditionalBranches.map(branch =>
                        branch.next === oldId ? { ...branch, next: newId } : branch
                    );
                }
            });

            if (newData[currentScene].startingStep === oldId) {
                newData[currentScene].startingStep = newId;
            }

            return newData;
        });

        setSelectedNode(prev => prev ? {
            ...prev,
            id: newId,
            data: { ...prev.data, stepId: newId }
        } : null);

        setHasChanges(true);
        updateNodesAndEdges();
    }, [currentScene, storyData, updateNodesAndEdges]);

    const addNewNode = useCallback((type: 'dialogue' | 'description' | 'choice' | 'sceneTransition' | 'image') => {
        const newId = `${type}_${Date.now()}`;

        setStoryData((prev) => {
            const newData = { ...prev };
            const scene = newData[currentScene];
            const isFirstNode = Object.keys(scene.steps).length === 0;

            if (type === 'dialogue') {
                scene.steps[newId] = {
                    type: 'dialogue',
                    text: 'New dialogue',
                    speaker: 'Speaker'
                };
            } else if (type === 'choice') {
                scene.steps[newId] = {
                    type: 'choice',
                    choices: [{
                        text: 'New Choice',
                        next: '',
                        isDialogue: false,
                        historyIsDialogue: false,
                        setVariables: []
                    }]
                };
            } else if (type === 'sceneTransition') {
                scene.steps[newId] = {
                    type: 'sceneTransition',
                    text: 'New transition',
                    nextScene: ''
                };
            } else if (type === 'image') {
                scene.steps[newId] = {
                    type: 'image',
                    image: {
                        path: '',
                        position: 'right',
                        alt: ''
                    }
                };
            } else {
                scene.steps[newId] = {
                    type: 'description',
                    text: 'New description'
                };
            }

            if (isFirstNode && type !== 'image') {
                scene.startingStep = newId;
            }

            return newData;
        });

        setHasChanges(true);
        updateNodesAndEdges();
    }, [currentScene, updateNodesAndEdges]);

    useEffect(() => {
        const loadStoryData = async () => {
            try {
                const response = await fetch('/api/story-data');
                if (response.ok) {
                    const data = await response.json() as StoryData;
                    setStoryData(data);
                }
            } catch (error) {
                console.error('Error loading story:', error);
            }
        };
        loadStoryData();
    }, []);

    useEffect(() => {
        updateNodesAndEdges();
    }, [currentScene, updateNodesAndEdges]);

    const handleSave = async () => {
        try {
            const response = await fetch('/api/story-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storyData)
            });

            if (!response.ok) {
                const errorData = await response.json() as { error: string };
                throw new Error(errorData.error || 'Failed to save story');
            }

            await response.json();
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving story:', error);
            alert('Failed to save story: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    if (!storyData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-screen flex">
            <div className="flex-1 h-full">
                <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
                    <label htmlFor="sceneSelect" className="text-white">Scene:</label>
                    <select
                        id="sceneSelect"
                        value={currentScene}
                        onChange={(e) => setCurrentScene(e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded"
                    >
                        {Object.keys(storyData).map((scene) => (
                            <option key={scene} value={scene}>{scene}</option>
                        ))}
                    </select>
                    <label htmlFor="startingStep" className="text-white ml-4">Starting Step:</label>
                    <select
                        id="startingStep"
                        value={storyData[currentScene].startingStep}
                        onChange={(e) => {
                            setStoryData((prev) => ({
                                ...prev,
                                [currentScene]: {
                                    ...prev[currentScene],
                                    startingStep: e.target.value
                                }
                            }));
                            setHasChanges(true);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded min-w-[200px]"
                    >
                        <option value="">Select Starting Step</option>
                        {Object.entries(storyData[currentScene].steps).map(([id, step]) => (
                            <option key={id} value={id}>
                                {id} ({step.type})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => addNewNode('dialogue')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Dialogue
                    </button>
                    <button
                        onClick={() => addNewNode('description')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Description
                    </button>
                    <button
                        onClick={() => addNewNode('choice')}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Add Choice
                    </button>
                    <button
                        onClick={() => addNewNode('image')}
                        className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                        Add Image
                    </button>
                    <button
                        onClick={() => addNewNode('sceneTransition')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Add Transition
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`px-3 py-1 rounded ${
                            hasChanges
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-gray-600 text-gray-400'
                        }`}
                    >
                        Save Changes
                    </button>
                </div>
                <div className="h-[calc(100%-3rem)]">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onNodeDragStop={onNodeDragStop}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodesDelete={handleNodesDelete}
                        nodeTypes={nodeTypes}
                        onNodeClick={(_, node: StoryNode) => {
                            const currentNodeData = storyData[currentScene].steps[node.id];
                            const updatedNode = {
                                ...node,
                                data: {
                                    ...currentNodeData,
                                    stepId: node.id
                                }
                            };
                            setSelectedNode(updatedNode);
                        }}
                        deleteKeyCode={['Delete', 'Backspace']}
                        fitView
                        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                            if (event.key === 'Delete' || event.key === 'Backspace') {
                                if (selectedNode) {
                                    handleNodesDelete([selectedNode]);
                                }
                            }
                        }}
                    >
                        <Background/>
                        <Controls/>
                    </ReactFlow>
                </div>
            </div>

            <div className="w-96 border-l border-gray-700 bg-gray-800 flex flex-col">
                <div className="p-4 overflow-y-auto flex-1">
                    <NodeEditor
                        selectedNode={selectedNode}
                        storyData={storyData}
                        currentScene={currentScene}
                        onUpdateNodeId={updateNodeId}
                        onUpdateNodeData={updateNodeData}
                        onDeleteNode={handleNodesDelete}
                    />
                </div>
            </div>
        </div>
    );
};

export default StoryEditor;