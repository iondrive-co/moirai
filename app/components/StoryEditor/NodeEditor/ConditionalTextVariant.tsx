import React from 'react';
import type { TextVariant } from '~/types';
import { ConditionEditor } from './Common';
import { CollapsiblePanel } from './CollapsiblePanel';

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
        <CollapsiblePanel
            title={`Variant ${index + 1}`}
            defaultOpen={true}
            rightElement={
                <button
                    onClick={onRemove}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                    Remove
                </button>
            }
        >
            <div className="mb-3 p-2 border border-gray-700 rounded">
                <div className="space-y-2">
                    <ConditionEditor
                        condition={variant.condition}
                        onChange={(updates) => onUpdate({ condition: { ...variant.condition, ...updates } })}
                    />

                    <textarea
                        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                        placeholder="Text for this condition"
                        value={variant.text}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        rows={2}
                    />
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default ConditionalTextVariant;