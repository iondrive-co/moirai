export interface StoryVariables {
    trustLevel?: number;
    hasMetBefore?: boolean;
    knowsSecret?: boolean;
}

export type DialogueStep = {
    type: 'dialogue';
    speaker: string;
    text: string;
    next: string;
}

export type DescriptionStep = {
    type: 'description';
    text: string;
    next: string;
}

export type ChoiceStep = {
    type: 'choice';
    choices: {
        text: string;           // Text shown in the choice list
        next: string;
        historyText?: string;   // Text shown in history (if different from choice text)
        isAction?: boolean;     // Whether this is an action (no quotes, no "You:")
        setVariables?: Partial<StoryVariables>;
        requires?: Partial<StoryVariables>;
    }[];
}

export type SceneTransitionStep = {
    type: 'sceneTransition';
    text: string;
    nextScene: string;
    setVariables?: Partial<StoryVariables>;
    requires?: Partial<StoryVariables>;
}

export type Step = DialogueStep | DescriptionStep | ChoiceStep | SceneTransitionStep;

export type StoryData = Record<string, {
    steps: Record<string, Step>;
    startingStep: string;
}>