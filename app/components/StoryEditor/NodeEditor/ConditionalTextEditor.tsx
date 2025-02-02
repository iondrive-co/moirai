import React from 'react';
import type { TextInsertionPoint, TextVariant } from '~/types';
import ConditionalTextVariant from './ConditionalTextVariant';

interface ConditionalTextEditorProps {
  point: TextInsertionPoint;
  onUpdate: (updates: Partial<TextInsertionPoint>) => void;
  onRemove: () => void;
}

export const ConditionalTextEditor: React.FC<ConditionalTextEditorProps> = ({
  point,
  onUpdate,
  onRemove
}) => {
  const updateVariant = (variantIndex: number, updates: Partial<TextVariant>) => {
    const newVariants = [...point.variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      ...updates
    };
    onUpdate({ variants: newVariants });
  };

  const removeVariant = (variantIndex: number) => {
    const newVariants = [...point.variants];
    newVariants.splice(variantIndex, 1);
    onUpdate({ variants: newVariants });
  };

  const addVariant = () => {
    const newVariant: TextVariant = {
      condition: {
        variableName: '',
        operator: '==',
        value: ''
      },
      text: ''
    };
    onUpdate({
      variants: [...point.variants, newVariant]
    });
  };

  return (
    <div className="mb-4 p-3 border border-gray-600 rounded">
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          className="flex-1 mr-2 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded text-sm"
          placeholder="Condition Name"
          value={point.id}
          onChange={(e) => onUpdate({ id: e.target.value })}
        />
        <button
          onClick={onRemove}
          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs whitespace-nowrap"
        >
          Remove
        </button>
      </div>

      {point.variants.map((variant, index) => (
        <ConditionalTextVariant
          key={index}
          variant={variant}
          index={index}
          onUpdate={(updates) => updateVariant(index, updates)}
          onRemove={() => removeVariant(index)}
        />
      ))}

      <button
        onClick={addVariant}
        className="w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
      >
        Add Text Variant
      </button>
    </div>
  );
};