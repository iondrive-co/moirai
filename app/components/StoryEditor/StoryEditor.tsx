import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, Connection } from 'reactflow';
import { useState, useCallback, useEffect } from 'react';
import 'reactflow/dist/style.css';
import type { StoryData, StoryNodeData, Choice, ChoiceStep, DialogueNodeData } from '~/types';
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
            const position = calculateNodePosition(index);

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

    useEffect(() => {
        updateNodesAndEdges();
    }, [currentScene, updateNodesAndEdges]);

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
            newStoryData[currentScene].steps[nodeId] = {
                ...currentStep,
                ...newData
            } as StoryNodeData;
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
            if (type === 'dialogue') {
                newData[currentScene].steps[newId] = {
                    type: 'dialogue',
                    text: 'New dialogue',
                    speaker: 'Speaker'
                };
            } else if (type === 'choice') {
                newData[currentScene].steps[newId] = {
                    type: 'choice',
                    text: 'Make your choice',
                    choices: []
                };
            } else {
                newData[currentScene].steps[newId] = {
                    type: 'description',
                    text: 'New description'
                };
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
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onNodeClick={(_, node: StoryNode) => {
                            const currentNodeData = storyData[currentScene].steps[node.id];
                            setSelectedNode({
                                ...node,
                                data: { ...currentNodeData, stepId: node.id }
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
                            <label htmlFor="nodeText" className="text-sm font-medium text-gray-300">Text</label>
                            <textarea
                                id="nodeText"
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={selectedNode.data.text}
                                onChange={(e) => {
                                    updateNodeData(selectedNode.id, { text: e.target.value });
                                }}
                                rows={4}
                            />
                        </div>
                        {selectedNode.data.type === 'dialogue' && (
                            <div className="space-y-2">
                                <label htmlFor="nodeSpeaker" className="text-sm font-medium text-gray-300">Speaker</label>
                                <input
                                    id="nodeSpeaker"
                                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                    value={(selectedNode.data as DialogueNodeData).speaker}
                                    onChange={(e) => {
                                        updateNodeData(selectedNode.id, { speaker: e.target.value });
                                    }}
                                />
                            </div>
                        )}
                        {selectedNode.data.type === 'choice' && (
                            <div className="space-y-2">
                                <label htmlFor="choicesList" className="text-sm font-medium text-gray-300">Choices</label>
                                <div id="choicesList" className="space-y-2">
                                    {(selectedNode.data as ChoiceStep).choices.map((choice: Choice, index: number) => (
                                        <div key={index} className="space-y-1">
                                            <input
                                                id={`choice-${index}`}
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
                                            />
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