export interface Choice {
    text: string;
    next: string;
    historyText?: string;
    isAction?: boolean;
}

export interface BaseStep {
    text: string;
}

export interface DialogueStep extends BaseStep {
    type: 'dialogue';
    speaker: string;
    next?: string;
}

export interface DescriptionStep extends BaseStep {
    type: 'description';
    next?: string;
}

export interface ChoiceStep extends BaseStep {
    type: 'choice';
    choices: Choice[];
}

export type Step = DialogueStep | DescriptionStep | ChoiceStep;

export interface Scene {
    startingStep: string;
    steps: Record<string, Step>;
}

export type StoryData = Record<string, Scene>;

// Node data types (for React Flow)
export interface BaseNodeData {
    type: string;
    text: string;
    stepId: string;
}

export interface DialogueNodeData extends BaseNodeData {
    type: 'dialogue';
    speaker: string;
    next?: string;
}

export interface DescriptionNodeData extends BaseNodeData {
    type: 'description';
    next?: string;
}

export interface ChoiceNodeData extends BaseNodeData {
    type: 'choice';
    choices: Choice[];
}

export type StoryNodeData = DialogueNodeData | DescriptionNodeData | ChoiceNodeData;