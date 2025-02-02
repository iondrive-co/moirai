import React from 'react';
import type {Condition, Step} from '~/types';

interface ConditionEditorProps {
    condition: Condition;
    onChange: (updates: Partial<Condition>) => void;
    className?: string;
}

export const ConditionEditor: React.FC<ConditionEditorProps> = ({
                                                                    condition,
                                                                    onChange,
                                                                    className = ''
                                                                }) => {
    return (
        <div className={`flex gap-2 ${className}`}>
            <input
                className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                placeholder="Variable name"
                value={condition.variableName}
                onChange={(e) => onChange({ variableName: e.target.value })}
            />
            <select
                className="w-20 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                value={condition.operator}
                onChange={(e) => onChange({
                    operator: e.target.value as Condition['operator']
                })}
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
                value={String(condition.value)}
                onChange={(e) => {
                    let val: string | number | boolean = e.target.value;
                    if (val === 'true') val = true;
                    else if (val === 'false') val = false;
                    else if (!isNaN(Number(val)) && val.trim() !== '') {
                        val = Number(val);
                    }
                    onChange({ value: val });
                }}
            />
        </div>
    );
};

interface NodeSelectProps {
    value: string;
    onChange: (value: string) => void;
    availableNodes: [string, Step][];
    className?: string;
    placeholder?: string;
}

export const NodeSelect: React.FC<NodeSelectProps> = ({
                                                          value,
                                                          onChange,
                                                          availableNodes,
                                                          className = '',
                                                          placeholder = 'Select node'
                                                      }) => {
    return (
        <select
            className={`w-full p-2 bg-gray-700 text-white border border-gray-600 rounded ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{placeholder}</option>
            {availableNodes.map(([id, step]) => (
                <option key={id} value={id}>
                    {id} ({step.type})
                </option>
            ))}
        </select>
    );
};