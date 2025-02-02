import React from 'react';
import type {
    StoryNode,
    StoryNodeData,
    ChoiceNodeData,
    Step,
    Choice,
    VariableSetting
} from '~/types';
import { ConditionEditor, NodeSelect } from './Common';
import { CollapsiblePanel } from './CollapsiblePanel';

interface EditorSectionProps {
    title: string;
    children: React.ReactNode;
    rightElement?: React.ReactNode;
    className?: string;
}

const EditorSection: React.FC<EditorSectionProps> = ({
                                                         title,
                                                         children,
                                                         rightElement,
                                                         className = ''
                                                     }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-300">{title}</h4>
                {rightElement}
            </div>
            {children}
        </div>
    );
};

interface ChoiceNodeEditorProps {
    node: StoryNode & { data: ChoiceNodeData };
    onUpdateNodeData: (nodeId: string, newData: Partial<StoryNodeData>) => void;
    availableNodes: [string, Step][];
}

export const ChoiceNodeEditor: React.FC<ChoiceNodeEditorProps> = ({
                                                                      node,
                                                                      onUpdateNodeData,
                                                                      availableNodes
                                                                  }) => {
    const addChoice = () => {
        const newChoice: Choice = {
            text: 'New Choice',
            next: '',
            isDialogue: false,
            historyText: '',
            historyIsDialogue: false,
            setVariables: []
        };
        onUpdateNodeData(node.id, { choices: [...node.data.choices, newChoice] });
    };

    const updateChoice = (index: number, updates: Partial<Choice>) => {
        const newChoices = [...node.data.choices];
        newChoices[index] = { ...newChoices[index], ...updates };
        onUpdateNodeData(node.id, { choices: newChoices });
    };

    const removeChoice = (index: number) => {
        const newChoices = [...node.data.choices];
        newChoices.splice(index, 1);
        onUpdateNodeData(node.id, { choices: newChoices });
    };

    const addVariableToChoice = (choiceIndex: number) => {
        const newChoices = [...node.data.choices];
        const newVariable: VariableSetting = {
            variableName: '',
            operator: '==',
            value: ''
        };
        const currentVariables = newChoices[choiceIndex].setVariables || [];
        newChoices[choiceIndex] = {
            ...newChoices[choiceIndex],
            setVariables: [...currentVariables, newVariable]
        };
        onUpdateNodeData(node.id, { choices: newChoices });
    };

    const updateChoiceVariable = (
        choiceIndex: number,
        varIndex: number,
        updates: Partial<VariableSetting>
    ) => {
        const newChoices = [...node.data.choices];
        const vars = [...(newChoices[choiceIndex].setVariables || [])];
        vars[varIndex] = { ...vars[varIndex], ...updates };
        newChoices[choiceIndex] = { ...newChoices[choiceIndex], setVariables: vars };
        onUpdateNodeData(node.id, { choices: newChoices });
    };

    const removeChoiceVariable = (choiceIndex: number, varIndex: number) => {
        const newChoices = [...node.data.choices];
        const vars = [...(newChoices[choiceIndex].setVariables || [])];
        vars.splice(varIndex, 1);
        newChoices[choiceIndex] = { ...newChoices[choiceIndex], setVariables: vars };
        onUpdateNodeData(node.id, { choices: newChoices });
    };

    return (
        <EditorSection
            title="Choices"
            rightElement={
                <button
                    onClick={addChoice}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                    Add Choice
                </button>
            }
        >
            <div className="space-y-4">
                {node.data.choices.map((choice: Choice, choiceIndex: number) => (
                    <div
                        key={choiceIndex}
                        className="space-y-2 p-3 border border-gray-600 rounded"
                    >
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-sm font-medium text-gray-300">
                                Choice {choiceIndex + 1}
                            </span>
                            <button
                                onClick={() => removeChoice(choiceIndex)}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Choice Text */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Choice Text</label>
                            <textarea
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={choice.text}
                                onChange={(e) => updateChoice(choiceIndex, { text: e.target.value })}
                                rows={2}
                                placeholder="Choice text"
                            />
                        </div>

                        {/* Choice Text Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Choice Type</label>
                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 px-2 py-1 rounded text-sm ${
                                        choice.isDialogue
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    onClick={() => updateChoice(choiceIndex, { isDialogue: true })}
                                >
                                    Dialogue
                                </button>
                                <button
                                    className={`flex-1 px-2 py-1 rounded text-sm ${
                                        !choice.isDialogue
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    onClick={() => updateChoice(choiceIndex, { isDialogue: false })}
                                >
                                    Descriptive
                                </button>
                            </div>
                        </div>

                        {/* History Text */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">History Text</label>
                            <textarea
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={choice.historyText || ''}
                                onChange={(e) => updateChoice(choiceIndex, { historyText: e.target.value })}
                                rows={2}
                                placeholder="Text to show in history (optional)"
                            />

                            {/* History Text Type */}
                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 px-2 py-1 rounded text-sm ${
                                        choice.historyIsDialogue
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    onClick={() => updateChoice(choiceIndex, { historyIsDialogue: true })}
                                >
                                    Dialogue History
                                </button>
                                <button
                                    className={`flex-1 px-2 py-1 rounded text-sm ${
                                        !choice.historyIsDialogue
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    onClick={() => updateChoice(choiceIndex, { historyIsDialogue: false })}
                                >
                                    Descriptive History
                                </button>
                            </div>
                        </div>

                        {/* Next Node */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Next Node</label>
                            <NodeSelect
                                value={choice.next}
                                onChange={(value) => updateChoice(choiceIndex, { next: value })}
                                availableNodes={availableNodes}
                                placeholder="Select next node"
                            />
                        </div>

                        {/* Variable Settings */}
                        <CollapsiblePanel
                            title="Set Variables"
                            defaultOpen={false}
                            rightElement={
                                <button
                                    onClick={() => addVariableToChoice(choiceIndex)}
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                >
                                    Add Variable
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {choice.setVariables?.map((varSetting, varIndex) => (
                                    <div key={varIndex} className="flex flex-col gap-2 p-2 border border-gray-700 rounded">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-300">Variable {varIndex + 1}</label>
                                            <button
                                                onClick={() => removeChoiceVariable(choiceIndex, varIndex)}
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <ConditionEditor
                                            condition={varSetting}
                                            onChange={(updates) => updateChoiceVariable(choiceIndex, varIndex, updates)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CollapsiblePanel>
                    </div>
                ))}
            </div>
        </EditorSection>
    );
};