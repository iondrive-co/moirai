import React from 'react';
import type { TextVariant } from '~/types';

interface TextVariantEditorProps {
    variant: TextVariant;
    index: number;
    onUpdate: (updates: Partial<TextVariant>) => void;
    onRemove: () => void;
}

const ConditionalTextVariant: React.FC<TextVariantEditorProps> = ({
                                                                 variant,
                                                                 index,
                                                                 onUpdate,
                                                                 onRemove
                                                             }) => {
    return (
        <div className="mb-3 p-2 border border-gray-700 rounded">
            <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">
          Variant {index + 1}
        </span>
                <button
                    onClick={onRemove}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Remove
                </button>
            </div>

            <div className="space-y-2">
                <input
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                    placeholder="Variable name"
                    value={variant.condition.variableName}
                    onChange={(e) => {
                        onUpdate({
                            condition: {
                                ...variant.condition,
                                variableName: e.target.value
                            }
                        });
                    }}
                />

                <div className="flex gap-2">
                    <select
                        className="w-20 p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                        value={variant.condition.operator}
                        onChange={(e) => {
                            onUpdate({
                                condition: {
                                    ...variant.condition,
                                    operator: e.target.value as TextVariant['condition']['operator']
                                }
                            });
                        }}
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
                        value={String(variant.condition.value)}
                        onChange={(e) => {
                            onUpdate({
                                condition: {
                                    ...variant.condition,
                                    value: e.target.value
                                }
                            });
                        }}
                    />
                </div>

                <textarea
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                    placeholder="Text for this condition"
                    value={variant.text}
                    onChange={(e) => {
                        onUpdate({ text: e.target.value });
                    }}
                    rows={2}
                />
            </div>
        </div>
    );
};

export default ConditionalTextVariant;