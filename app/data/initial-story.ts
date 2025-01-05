import type { StoryData } from './story.types';

export const initialStoryData: StoryData = {
    intro: {
        startingStep: 'start',
        steps: {
            start: {
                type: 'description',
                text: 'Your story begins here...',
                next: 'first_dialogue'
            },
            first_dialogue: {
                type: 'dialogue',
                speaker: 'Guide',
                text: 'Welcome to your adventure!',
                next: 'first_choice'
            },
            first_choice: {
                type: 'choice',
                text: 'What would you like to do?',
                choices: [
                    {
                        text: 'Begin the journey',
                        next: 'start'
                    },
                    {
                        text: 'Ask for more information',
                        next: 'first_dialogue'
                    }
                ]
            }
        }
    }
};