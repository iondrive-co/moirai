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

export interface HistoryItem {
    type: 'dialogue' | 'description' | 'choice';
    speaker?: string;
    text: string;
    isPlayerResponse?: boolean;
    isDialogue?: boolean;
}

export interface TextInsertionPoint {
    id: string;
    variants: TextVariant[];
}

export interface TextVariant {
    condition: Condition;
    text: string;
}

export interface TextBranch {
    condition: Condition;
    text: string;
}

export interface BaseStep {
    text: string;
}

export interface DialogueStep extends BaseStep {
    type: 'dialogue';
    speaker: string;
    next?: string;
    text: string;
}

export interface DescriptionStep extends BaseStep {
    type: 'description';
    text: string;
    next?: string;
    conditionalBranches?: ConditionalBranch[];
    insertionPoints?: TextInsertionPoint[];
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

export interface ImageStep {
    type: 'image';
    image: SceneImage;
    next?: string;
}

export type Step = DialogueStep | DescriptionStep | ChoiceStep | SceneTransitionStep | ImageStep;

export interface NodePosition {
    x: number;
    y: number;
}

export interface SceneImage {
    path: string;
    alt?: string;
    position: 'left' | 'right' | 'top' | 'bottom';
    fitMode?: 'natural' | 'stretch';
    alignment?: 'start' | 'center' | 'end';
}

export interface Scene {
    startingStep: string;
    steps: Record<string, Step>;
    nodePositions?: Record<string, NodePosition>;
}

export type StoryData = Record<string, Scene>;

export interface BaseNodeData {
    stepId: string;
    text?: string;
    type: string;
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
    insertionPoints?: TextInsertionPoint[];
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

export interface ImageNodeData extends BaseNodeData {
    image: SceneImage;
    type: 'image';
}

export type StoryNodeData = DialogueNodeData | DescriptionNodeData | ChoiceNodeData | SceneTransitionNodeData | ImageNodeData;