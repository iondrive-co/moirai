import { useState } from 'react';
import type { VariableSetting, Condition } from '~/types';

export function useGameState() {
    const [variables, setVariables] = useState<Record<string, string | number | boolean>>({});

    const evaluateCondition = (condition: Condition): boolean => {
        const { variableName, operator, value } = condition;
        const currentValue = variables[variableName];

        // If variable doesn't exist yet, return false
        if (currentValue === undefined) return false;

        switch (operator) {
            case '==':
                return currentValue === value;
            case '!=':
                return currentValue !== value;
            case '>':
                return typeof currentValue === 'number' && typeof value === 'number' && currentValue > value;
            case '<':
                return typeof currentValue === 'number' && typeof value === 'number' && currentValue < value;
            case '>=':
                return typeof currentValue === 'number' && typeof value === 'number' && currentValue >= value;
            case '<=':
                return typeof currentValue === 'number' && typeof value === 'number' && currentValue <= value;
            default:
                return false;
        }
    };

    const setMultipleVariables = (settings: VariableSetting[]) => {
        const newVariables = { ...variables };
        settings.forEach(({ variableName, value }) => {
            newVariables[variableName] = value;
        });
        setVariables(newVariables);
    };

    return {
        variables,
        setVariables,
        evaluateCondition,
        setMultipleVariables
    };
}