import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, Connection, Node } from 'reactflow';
import { useState, useCallback, useEffect } from 'react';
import 'reactflow/dist/style.css';
import type {
    StoryData,
    StoryNodeData,
    Choice,
    ChoiceStep,
    DialogueNodeData,
    DescriptionNodeData,
} from '~/types';
import { nodeTypes } from './NodeTypes';
import { StoryNode, StoryEdge, defaultEdgeOptions } from './types';
import { calculateNodePosition } from './utils';

const initialStoryData: StoryData = {
    intro: {
        startingStep: '',
        steps: {}
    }
};

const StoryEditor = () => {
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
            // Ensure we're using saved positions correctly
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

            if (step.type === 'choice') {
                (step as ChoiceStep).choices.forEach((choice, choiceIndex) => {
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
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [currentScene, storyData, setNodes, setEdges]);

    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node<StoryNodeData>) => {
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

    const updateNodeId = (oldId: string, newId: string) => {
        if (oldId === newId) return;
        if (storyData[currentScene].steps[newId]) {
            alert('A node with this ID already exists');
            return;
        }

        setStoryData((prev) => {
            const newData = { ...prev };
            const steps = newData[currentScene].steps;

            // Update the node's ID
            const nodeData = steps[oldId];
            delete steps[oldId];
            steps[newId] = nodeData;

            // Update all references to this node
            Object.values(steps).forEach((step) => {
                if ('next' in step && step.next === oldId) {
                    step.next = newId;
                }
                if (step.type === 'choice') {
                    step.choices = step.choices.map(choice =>
                        choice.next === oldId ? { ...choice, next: newId } : choice
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
    };

    useEffect(() => {
        updateNodesAndEdges();
    }, [currentScene, updateNodesAndEdges]);

    const handleNodesDelete = (nodesToDelete: StoryNode[]) => {
        setStoryData((prev) => {
            const newData = { ...prev };
            const scene = newData[currentScene];

            nodesToDelete.forEach((node) => {
                // Delete the node itself
                delete scene.steps[node.id];

                // Remove any references to this node from other nodes
                Object.values(scene.steps).forEach((step) => {
                    if ('next' in step && step.next === node.id) {
                        step.next = undefined;
                    }
                    if (step.type === 'choice') {
                        step.choices = step.choices.filter(choice => choice.next !== node.id);
                    }
                });

                // If this was the starting step, clear it
                if (scene.startingStep === node.id) {
                    scene.startingStep = '';
                }
            });

            return newData;
        });

        // Clear selected node if it was deleted
        if (selectedNode && nodesToDelete.some(node => node.id === selectedNode.id)) {
            setSelectedNode(null);
        }

        setHasChanges(true);
    };

    const onConnect = useCallback((params: Connection) => {
        if (!params.source || !params.target) return;

        const newEdge = {
            ...params,
            ...defaultEdgeOptions,
            source: params.source,
            target: params.target
        } as StoryEdge;

        setEdges((eds) => addEdge(newEdge, eds));

        setStoryData((prev) => {
            const newData = { ...prev };
            const source = params.source;
            if (!source) return prev;

            const sourceStep = newData[currentScene].steps[source];

            if (sourceStep.type === 'choice') {
                (sourceStep as ChoiceStep).choices = [
                    ...(sourceStep as ChoiceStep).choices,
                    { text: 'New Choice', next: params.target as string }
                ];
            } else if (params.target) {
                if ('next' in sourceStep && sourceStep.next) {
                    sourceStep.next = params.target;
                }
            }

            return newData;
        });

        setHasChanges(true);
    }, [setEdges, currentScene]);


    const updateNodeData = (nodeId: string, newData: Partial<StoryNodeData>) => {
        setStoryData((prev) => {
            const newStoryData = { ...prev };
            const currentStep = newStoryData[currentScene].steps[nodeId];
            // Keep the existing node positions when updating data
            const currentNodePositions = newStoryData[currentScene].nodePositions || {};

            newStoryData[currentScene].steps[nodeId] = {
                ...currentStep,
                ...newData
            } as StoryNodeData;

            // Ensure we keep the node positions
            newStoryData[currentScene].nodePositions = currentNodePositions;

            return newStoryData;
        });

        setSelectedNode((prev: StoryNode | null): StoryNode | null => {
            if (!prev || prev.id !== nodeId) return prev;
            const currentNodeData = storyData[currentScene].steps[nodeId];
            return {
                ...prev,
                data: {
                    ...currentNodeData,
                    ...newData,
                    stepId: nodeId
                }
            } as StoryNode;
        });

        setHasChanges(true);
        updateNodesAndEdges();
    };

    const addNewNode = (type: 'dialogue' | 'description' | 'choice') => {
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
                    choices: [{ text: 'New Choice', next: '' }]
                };
            } else {
                scene.steps[newId] = {
                    type: 'description',
                    text: 'New description'
                };
            }

            if (isFirstNode) {
                scene.startingStep = newId;
            }

            return newData;
        });

        setHasChanges(true);
        updateNodesAndEdges();
    };

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

    if (!storyData) {
        return <div>Loading...</div>;
    }

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
                            setSelectedNode({
                                ...node,
                                data: {...currentNodeData, stepId: node.id}
                            });
                        }}
                        deleteKeyCode="Delete"
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>

            <div className="w-64 p-4 border-l border-gray-700 bg-gray-800">
                {selectedNode ? (
                    <div className="space-y-4">
                        <h3 className="font-medium text-white">Edit Node: {selectedNode.data.stepId}</h3>
                        <div className="space-y-2">
                            <label htmlFor="nodeId" className="text-sm font-medium text-gray-300">Node ID</label>
                            <input
                                id="nodeId"
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={selectedNode.data.stepId}
                                onChange={(e) => {
                                    const newId = e.target.value.trim();
                                    if (newId && newId !== selectedNode.data.stepId) {
                                        updateNodeId(selectedNode.data.stepId, newId);
                                    }
                                }}
                            />
                        </div>

                        {selectedNode.data.type !== 'choice' && (
                            <div className="space-y-2">
                                <label htmlFor="nodeText" className="text-sm font-medium text-gray-300">Text</label>
                                <textarea
                                    id="nodeText"
                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                    value={selectedNode.data.text}
                                    onChange={(e) => {
                                        updateNodeData(selectedNode.id, {text: e.target.value});
                                    }}
                                    rows={4}
                                />
                            </div>
                        )}

                        {(selectedNode.data.type === 'dialogue' || selectedNode.data.type === 'description') && (
                            <div className="space-y-2">
                                <label htmlFor="nodeNext" className="text-sm font-medium text-gray-300">Next Node</label>
                                <select
                                    id="nodeNext"
                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                    value={(selectedNode.data as DialogueNodeData | DescriptionNodeData).next || ''}
                                    onChange={(e) => {
                                        updateNodeData(selectedNode.id, {next: e.target.value || undefined});
                                    }}
                                >
                                    <option value="">None</option>
                                    {Object.entries(storyData[currentScene].steps)
                                        .filter(([id]) => id !== selectedNode.id)
                                        .map(([id, step]) => (
                                            <option key={id} value={id}>
                                                {id} ({step.type})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        {selectedNode.data.type === 'dialogue' && (
                            <div className="space-y-2">
                                <label htmlFor="nodeSpeaker"
                                       className="text-sm font-medium text-gray-300">Speaker</label>
                                <input
                                    id="nodeSpeaker"
                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                    value={(selectedNode.data as DialogueNodeData).speaker}
                                    onChange={(e) => {
                                        updateNodeData(selectedNode.id, {speaker: e.target.value});
                                    }}
                                />
                            </div>
                        )}

                        {selectedNode?.data.type === 'choice' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium text-gray-300">Choices</h4>
                                    <button
                                        onClick={() => {
                                            const newChoices = [...(selectedNode.data as ChoiceStep).choices];
                                            newChoices.push({ text: 'New Choice', next: '', historyText: '' });
                                            updateNodeData(selectedNode.id, { choices: newChoices });
                                        }}
                                        className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                    >
                                        Add Choice
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(selectedNode.data as ChoiceStep).choices.map((choice, index) => (
                                        <div key={index} className="space-y-2 p-2 border border-gray-600 rounded">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-400">Choice {index + 1}</span>
                                                <button
                                                    onClick={() => {
                                                        const newChoices = [...(selectedNode.data as ChoiceStep).choices];
                                                        newChoices.splice(index, 1);
                                                        updateNodeData(selectedNode.id, { choices: newChoices });
                                                    }}
                                                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Choice Text */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-400">Choice Text (shown in choices)</label>
                                                <input
                                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                                    value={choice.text}
                                                    onChange={(e) => {
                                                        const newChoices = [...(selectedNode.data as ChoiceStep).choices];
                                                        newChoices[index] = {
                                                            ...choice,
                                                            text: e.target.value
                                                        };
                                                        updateNodeData(selectedNode.id, { choices: newChoices });
                                                    }}
                                                    placeholder="Choice text"
                                                />
                                            </div>

                                            {/* History Text */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-400">History Text (shown in story)</label>
                                                <input
                                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                                    value={choice.historyText || ''}
                                                    onChange={(e) => {
                                                        const newChoices = [...(selectedNode.data as ChoiceStep).choices];
                                                        newChoices[index] = {
                                                            ...choice,
                                                            historyText: e.target.value || undefined
                                                        };
                                                        updateNodeData(selectedNode.id, { choices: newChoices });
                                                    }}
                                                    placeholder="Optional: Custom text to show in history"
                                                />
                                            </div>

                                            {/* Next Node Selection */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-400">Next Step</label>
                                                <select
                                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                                    value={choice.next || ''}
                                                    onChange={(e) => {
                                                        const newChoices = [...(selectedNode.data as ChoiceStep).choices];
                                                        newChoices[index] = {
                                                            ...choice,
                                                            next: e.target.value
                                                        };
                                                        updateNodeData(selectedNode.id, { choices: newChoices });
                                                    }}
                                                >
                                                    <option value="">Select next node</option>
                                                    {Object.entries(storyData[currentScene].steps)
                                                        .filter(([id]) => id !== selectedNode.id)
                                                        .map(([id, step]) => (
                                                            <option key={id} value={id}>
                                                                {id} ({step.type})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400">Select a node to edit its contents</p>
                )}
            </div>
        </div>
    );
};

export default StoryEditor;