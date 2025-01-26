import React from 'react';
import type {
    StoryNode,
    StoryNodeData,
    ChoiceNodeData,
    Step,
    Choice,
    VariableSetting
} from '~/types';

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

    const parseAndSetValue = (
        choiceIndex: number,
        varIndex: number,
        rawValue: string
    ) => {
        let val: string | number | boolean = rawValue;
        if (rawValue === 'true') {
            val = true;
        } else if (rawValue === 'false') {
            val = false;
        } else if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
            val = Number(rawValue);
        }
        updateChoiceVariable(choiceIndex, varIndex, { value: val });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-300">Choices</h4>
                <button
                    onClick={addChoice}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                    Add Choice
                </button>
            </div>

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
                            <textarea
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={choice.text}
                                onChange={(e) => updateChoice(choiceIndex, { text: e.target.value })}
                                rows={2}
                                placeholder="Choice text"
                            />
                        </div>

                        {/* Dialogue or Descriptive */}
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

                        {/* Next Node */}
                        <div className="mt-2">
                            <select
                                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
                                value={choice.next}
                                onChange={(e) => updateChoice(choiceIndex, { next: e.target.value })}
                            >
                                <option value="">Select next node</option>
                                {availableNodes.map(([id, step]) => (
                                    <option key={id} value={id}>
                                        {id} ({step.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Variable Settings */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">Set Variables</label>
                                <button
                                    onClick={() => addVariableToChoice(choiceIndex)}
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                >
                                    Add Variable
                                </button>
                            </div>
                            {choice.setVariables?.map((varSetting, varIndex) => (
                                <div key={varIndex} className="flex flex-col gap-2 p-2 border border-gray-700 rounded">
                                    <div className="flex gap-2 items-center">
                                        <input
                                            className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                            placeholder="Variable name"
                                            value={varSetting.variableName}
                                            onChange={(e) =>
                                                updateChoiceVariable(choiceIndex, varIndex, {
                                                    variableName: e.target.value
                                                })
                                            }
                                        />
                                        <button
                                            onClick={() => removeChoiceVariable(choiceIndex, varIndex)}
                                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Operator and Value Fields */}
                                    <div className="flex gap-2 items-center">
                                        <select
                                            className="w-20 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                            value={varSetting.operator}
                                            onChange={(e) =>
                                                updateChoiceVariable(choiceIndex, varIndex, {
                                                    operator: e.target.value as VariableSetting['operator']
                                                })
                                            }
                                        >
                                            <option value="==">=</option>
                                            <option value="!=">≠</option>
                                            <option value=">">&gt;</option>
                                            <option value="<">&lt;</option>
                                            <option value=">=">&gt;=</option>
                                            <option value="<=">&lt;=</option>
                                        </select>
                                        <input
                                            className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                                            placeholder="Value"
                                            value={String(varSetting.value)}
                                            onChange={(e) => parseAndSetValue(choiceIndex, varIndex, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
