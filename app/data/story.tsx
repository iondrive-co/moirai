// app/data/story.ts
export interface StoryVariables {
    hasKey?: boolean;
    gold?: number;
}

export interface Choice {
    text: string;
    nextScene: string;
    setVariables?: Partial<StoryVariables>;
    requires?: Partial<StoryVariables>;
}

export interface Scene {
    text: string;
    choices: Choice[];
}

export const story: Record<string, Scene> = {
    'scene1': {
        text: 'You stand at the entrance of a dark cave. A rusty key lies nearby.',
        choices: [
            {
                text: 'Take the key and enter the cave',
                nextScene: 'scene2',
                setVariables: { hasKey: true }
            },
            {
                text: 'Enter the cave without the key',
                nextScene: 'scene2',
                setVariables: { hasKey: false }
            }
        ]
    },
    'scene2': {
        text: 'Inside the cave, you find a locked chest.',
        choices: [
            {
                text: 'Open the chest with the key',
                nextScene: 'scene3',
                requires: { hasKey: true },
                setVariables: { gold: 100 }
            },
            {
                text: 'Leave the cave',
                nextScene: 'scene1',
                setVariables: { hasKey: false, gold: 0 }
            }
        ]
    },
    'scene3': {
        text: 'You found 100 gold pieces in the chest!',
        choices: [
            {
                text: 'Start over',
                nextScene: 'scene1',
                setVariables: { hasKey: false, gold: 0 }
            }
        ]
    }
};