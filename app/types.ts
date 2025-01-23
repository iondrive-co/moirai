export interface Choice {
    text: string;
    next: string;
    historyText?: string;
    isDialogue?: boolean;
    historyIsDialogue?: boolean;
}

export interface HistoryItem {
    type: 'dialogue' | 'description' | 'choice';
    speaker?: string;
    text: string;
    isPlayerResponse?: boolean;
    isDialogue?: boolean;
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

export interface ChoiceStep {
    type: 'choice';
    choices: Choice[];
}

export type SceneTransitionStep = {
    type: 'sceneTransition';
    text: string;
    nextScene: string;
}

export type Step = DialogueStep | DescriptionStep | ChoiceStep | SceneTransitionStep;

export interface NodePosition {
    x: number;
    y: number;
}

export interface Scene {
    startingStep: string;
    steps: Record<string, Step>;
    nodePositions?: Record<string, NodePosition>;
}

export type StoryData = Record<string, Scene>;

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

export interface ChoiceNodeData {
    type: 'choice';
    stepId: string;
    choices: Choice[];
}

export interface SceneTransitionNodeData extends BaseNodeData {
    type: 'sceneTransition';
    nextScene: string;
}

export type StoryNodeData = DialogueNodeData | DescriptionNodeData | ChoiceNodeData | SceneTransitionNodeData;