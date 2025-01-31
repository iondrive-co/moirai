import { useState } from 'react';
import type { VariableSetting, Condition } from '~/types';

export function useGameState() {
    const [variables, setVariables] = useState<Record<string, string | number | boolean>>({});

    const evaluateCondition = (condition: Condition): boolean => {
        const { variableName, operator, value } = condition;
        const currentValue = variables[variableName];

        // If variable doesn't exist yet, return false
        if (currentValue === undefined) return false;

        const normalizeValue = (val: string | number | boolean): string | number => {
            if (typeof val === 'boolean') return val ? 1 : 0;
            if (typeof val === 'string') {
                if (val.toLowerCase() === 'true') return 1;
                if (val.toLowerCase() === 'false') return 0;
                const num = Number(val);
                return isNaN(num) ? val : num;
            }
            return val;
        };

        const normalizedCurrent = normalizeValue(currentValue);
        const normalizedValue = normalizeValue(value);

        switch (operator) {
            case '==':
                return normalizedCurrent === normalizedValue;
            case '!=':
                return normalizedCurrent !== normalizedValue;
            case '>':
                return typeof normalizedCurrent === 'number' &&
                    typeof normalizedValue === 'number' &&
                    normalizedCurrent > normalizedValue;
            case '<':
                return typeof normalizedCurrent === 'number' &&
                    typeof normalizedValue === 'number' &&
                    normalizedCurrent < normalizedValue;
            case '>=':
                return typeof normalizedCurrent === 'number' &&
                    typeof normalizedValue === 'number' &&
                    normalizedCurrent >= normalizedValue;
            case '<=':
                return typeof normalizedCurrent === 'number' &&
                    typeof normalizedValue === 'number' &&
                    normalizedCurrent <= normalizedValue;
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