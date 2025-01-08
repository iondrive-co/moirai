export interface Env {
    STORY_DATA: KVNamespace;
}

declare module "@remix-run/cloudflare" {
    interface AppLoadContext {
        env: Env;
    }
}

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

export type SceneTransitionStep = {
    type: 'sceneTransition';
    text: string;
    nextScene: string;
}

export type Step = DialogueStep | DescriptionStep | ChoiceStep | SceneTransitionStep;

export interface Scene {
    startingStep: string;
    steps: Record<string, Step>;
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

export interface ChoiceNodeData extends BaseNodeData {
    type: 'choice';
    choices: Choice[];
}

export interface SceneTransitionNodeData extends BaseNodeData {
    type: 'sceneTransition';
    nextScene: string;
}

export type StoryNodeData = DialogueNodeData | DescriptionNodeData | ChoiceNodeData | SceneTransitionNodeData;