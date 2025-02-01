import { Node, Edge } from 'reactflow';

export type StoryNode = Node<StoryNodeData>;
export type StoryEdge = Edge;

export interface VariableSetting {
    variableName: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: string | number | boolean;
}

export interface Choice {
    text: string;
    next: string;
    historyText?: string;
    isDialogue?: boolean;
    historyIsDialogue?: boolean;
    setVariables?: VariableSetting[];
}

export interface Condition {
    variableName: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: string | number | boolean;
}

export interface ConditionalBranch {
    condition: Condition;
    next: string;
}

export interface ConditionalText {
    id: string;
    name: string;
    condition: Condition;
    text: string;
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
    text: string;
    next?: string;
    conditionalBranches?: ConditionalBranch[];
    conditionalTexts?: ConditionalText[];
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
    conditionalBranches?: ConditionalBranch[];
    conditionalTexts?: ConditionalText[];
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