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

export const story: Record<string, { steps: Record<string, Step>; startingStep: string; }> = {
    'intro': {
        startingStep: 'opening_description',
        steps: {
            'opening_description': {
                type: 'description',
                text: "You find yourself in a dimly lit tavern. At a corner table sits a hooded figure who seems to be watching you.",
                next: 'stranger_initial'
            },
            'stranger_initial': {
                type: 'dialogue',
                speaker: "Stranger",
                text: "I've been waiting for someone like you.",
                next: 'first_choice'
            },
            'first_choice': {
                type: 'choice',
                choices: [
                    {
                        text: "Who are you?",
                        next: 'mysterious_response',
                        setVariables: { trustLevel: 1 }
                    },
                    {
                        text: "I noticed you watching me.",
                        next: 'perceptive_response',
                        setVariables: { trustLevel: 2 }
                    }
                ]
            },
            'mysterious_response': {
                type: 'dialogue',
                speaker: "Stranger",
                text: "Someone who knows more than they should. And someone who needs your help.",
                next: 'lean_forward'
            },
            'perceptive_response': {
                type: 'dialogue',
                speaker: "Stranger",
                text: "Perceptive. Yes, I've been watching. Waiting for the right moment.",
                next: 'lean_forward'
            },
            'lean_forward': {
                type: 'description',
                text: "The stranger leans forward, their hood casting deep shadows across their face.",
                next: 'help_choice'
            },
            'help_choice': {
                type: 'choice',
                choices: [
                    {
                        text: "What kind of help?",
                        next: 'help_explanation'
                    },
                    {
                        text: "I'm not interested.",
                        next: 'leave_option'
                    }
                ]
            },
            'help_explanation': {
                type: 'dialogue',
                speaker: "Stranger",
                text: "There's an artifact of great power that needs to be protected. I believe you have the skills necessary to help me guard it.",
                next: 'leave_option'
            },
            'leave_option': {
                type: 'sceneTransition',
                text: "Leave the tavern",
                nextScene: 'outside_tavern'
            }
        }
    },
    'outside_tavern': {
        startingStep: 'initial_description',
        steps: {
            'initial_description': {
                type: 'description',
                text: "The cold night air hits you as you step outside. The streets are empty save for a few guards on patrol.",
                next: 'footsteps'
            },
            'footsteps': {
                type: 'description',
                text: "You hear footsteps behind you.",
                next: 'turn_choice'
            },
            'turn_choice': {
                type: 'choice',
                choices: [
                    {
                        text: "Turn around slowly",
                        historyText: "You turn around slowly, cautiously facing the direction of the footsteps.",
                        isAction: true,
                        next: 'face_follower',
                        requires: { trustLevel: 2 }
                    },
                    {
                        text: "Start running",
                        historyText: "Without hesitation, you break into a sprint.",
                        isAction: true,
                        next: 'run_away'
                    }
                ]
            },
            'face_follower': {
                type: 'dialogue',
                speaker: "Stranger",
                text: "Wait! There's something you need to know!",
                next: 'end_choice'
            },
            'run_away': {
                type: 'description',
                text: "You break into a sprint, your footsteps echoing off the cobblestones.",
                next: 'end_chase'
            },
            'end_choice': {
                type: 'choice',
                choices: [
                    {
                        text: "I'm listening",
                        next: 'reveal_secret'
                    },
                    {
                        text: "Keep walking",
                        next: 'walk_away'
                    }
                ]
            },
            'end_chase': {
                type: 'sceneTransition',
                text: "Continue running",
                nextScene: 'chase_scene'
            },
            'walk_away': {
                type: 'sceneTransition',
                text: "Walk away",
                nextScene: 'end_conversation'
            },
            'reveal_secret': {
                type: 'sceneTransition',
                text: "Listen to the secret",
                nextScene: 'secret_scene'
            }
        }
    }
};