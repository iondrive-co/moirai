import {useLoaderData, useNavigate, useRouteError} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useState, useEffect } from "react";
import type { Step, StoryData, DialogueStep, DescriptionStep, ChoiceStep, SceneTransitionStep } from "~/types";

interface LoaderData {
    scene: {
        startingStep: string;
        steps: Record<string, Step>;
    };
    isDevelopment: boolean;
}

export const loader: LoaderFunction = async ({ params, context }) => {
    try {
        const sceneId = params['*'];
        const isDevelopment = context.env.ENV === 'development';
        console.log('Context structure:', JSON.stringify({
            hasEnv: !!context.env,
            hasCloudflareEnv: !!context.cloudflare?.env,
            envValue: context.env.ENV,
            sceneId
        }));
        const kvNamespace = context.env?.STORY_DATA || context.cloudflare?.env?.STORY_DATA;
        if (!kvNamespace) {
            throw new Error('KV Namespace not found');
        }
        const storyData = await kvNamespace.get('current-story');
        if (!sceneId) {
            throw new Response(JSON.stringify({
                error: 'Invalid Request',
                details: 'No scene ID provided'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (!storyData) {
            return {
                scene: {
                    startingStep: 'empty',
                    steps: {
                        empty: {
                            type: 'description',
                            text: 'No story has been created yet. Please use the editor to create a story.',
                            next: undefined
                        }
                    }
                },
                isDevelopment
            };
        }
        try {
            const parsedStory = JSON.parse(storyData) as StoryData;
            const scene = parsedStory[sceneId];
            if (!scene) {
                return {
                    scene: {
                        startingStep: 'not_found',
                        steps: {
                            not_found: {
                                type: 'description',
                                text: `Scene "${sceneId}" was not found. Please check the story structure in the editor.`,
                                next: undefined
                            }
                        }
                    },
                    isDevelopment
                };
            }
            return { scene, isDevelopment };
        } catch (parseError) {
            throw new Error('Story data is corrupted or in an invalid format');
        }
    } catch (error) {
        console.error('Loader error:', error);
        throw error;
    }
};

interface ErrorResponse {
    error: string;
    details: string;
}

export function ErrorBoundary() {
    const error = useRouteError();

    const getErrorContent = async (error: unknown) => {
        if (error instanceof Response) {
            try {
                const data = await error.json() as ErrorResponse;
                return {
                    title: data.error || 'Error',
                    message: data.details || 'An unexpected error occurred',
                    status: error.status
                };
            } catch {
                return {
                    title: 'Error',
                    message: error.statusText || 'An unexpected error occurred',
                    status: error.status
                };
            }
        }

        return {
            title: 'Error',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            status: 500
        };
    };

    const [errorContent, setErrorContent] = useState<{
        title: string;
        message: string;
        status: number;
    }>({
        title: 'Loading Error',
        message: 'Processing error details...',
        status: 500
    });

    useEffect(() => {
        getErrorContent(error).then(setErrorContent);
    }, [error]);

    return (
        <div className="min-h-screen p-6 bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-red-500">{errorContent.title}</h1>
                <div className="space-y-4">
                    <p>{errorContent.message}</p>
                    {errorContent.status === 503 && (
                        <div className="mt-4 p-4 bg-gray-800 rounded">
                            <p>No story data is currently available. If you're an administrator, you can:</p>
                            <ol className="list-decimal ml-6 mt-2">
                                <li>Load the example story using npm run story:load-example:prod</li>
                                <li>Create a new story using the editor locally</li>
                                <li>Upload your story using npm run story:put:prod</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface HistoryItem {
    type: 'dialogue' | 'description' | 'choice' | 'action';
    speaker?: string;
    text: string;
    isPlayerResponse?: boolean;
}

function isDialogueStep(step: Step): step is DialogueStep {
    return step.type === 'dialogue';
}

function isDescriptionStep(step: Step): step is DescriptionStep {
    return step.type === 'description';
}

function isChoiceStep(step: Step): step is ChoiceStep {
    return step.type === 'choice';
}

function isSceneTransitionStep(step: Step): step is SceneTransitionStep {
    return step.type === 'sceneTransition';
}

function addQuotes(text: string): string {
    if (!text.startsWith('"')) text = '"' + text;
    if (!text.endsWith('"')) text = text + '"';
    return text;
}

export default function Scene() {
    const data = useLoaderData<typeof loader>() as LoaderData;
    const { isDevelopment } = data;
    const navigate = useNavigate();
    if (!data?.scene?.startingStep || !data?.scene?.steps) {
        throw new Error(`Invalid scene data: ${JSON.stringify(data)}`);
    }
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentStepId, setCurrentStepId] = useState(data.scene.startingStep);
    const [awaitingClick, setAwaitingClick] = useState(true);

    useEffect(() => {
        setHistory([]);
        setCurrentStepId(data.scene.startingStep);
        setAwaitingClick(true);
    }, [data.scene.startingStep]);

    const currentStep = data.scene.steps[currentStepId];

    const handleProgress = () => {
        if (!currentStep || isChoiceStep(currentStep) || isSceneTransitionStep(currentStep) || !awaitingClick) return;

        if (isDialogueStep(currentStep)) {
            setHistory(prev => [...prev, {
                type: 'dialogue',
                speaker: currentStep.speaker,
                text: currentStep.text
            }]);
            if (currentStep.next) {
                setCurrentStepId(currentStep.next);
            }
        } else if (isDescriptionStep(currentStep)) {
            setHistory(prev => [...prev, {
                type: 'description',
                text: currentStep.text
            }]);
            if (currentStep.next) {
                setCurrentStepId(currentStep.next);
            }
        }

        setAwaitingClick(true);
    };

    const handleChoice = (choice: { text: string; next: string; historyText?: string; isAction?: boolean }) => {
        const historyItem: HistoryItem = choice.isAction ? {
            type: 'action',
            text: choice.historyText || choice.text
        } : {
            type: 'choice',
            text: choice.historyText || choice.text,
            isPlayerResponse: true
        };

        setHistory(prev => [...prev, historyItem]);
        setCurrentStepId(choice.next);
        setAwaitingClick(true);
    };

    const handleSceneTransition = (step: SceneTransitionStep) => {
        navigate(`/scene/${step.nextScene}`);
    };

    if (!currentStep) return null;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {isDevelopment && (
                    <div className="fixed top-4 right-4">
                        <button
                            onClick={() => navigate('/edit')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Open Editor
                        </button>
                    </div>
                )}
                <div className="p-6">
                    {/* History */}
                    <div className="space-y-4">
                        {history.map((item, index) => (
                            <div key={index}>
                                {item.type === 'description' || item.type === 'action' ? (
                                    <p className="description-text">{item.text}</p>
                                ) : item.isPlayerResponse ? (
                                    <p className="player-text">You: {addQuotes(item.text)}</p>
                                ) : (
                                    <p className="dialogue-text">
                                        {item.speaker && <span className="font-semibold">{item.speaker}: </span>}
                                        {addQuotes(item.text)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Current Step */}
                    <div className="mt-4">
                        {isDescriptionStep(currentStep) && awaitingClick && (
                            <button
                                onClick={handleProgress}
                                className="description-text w-full text-left"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleProgress();
                                    }
                                }}
                            >
                                {currentStep.text}
                            </button>
                        )}

                        {isDialogueStep(currentStep) && awaitingClick && (
                            <button
                                onClick={handleProgress}
                                className="dialogue-text w-full text-left"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleProgress();
                                    }
                                }}
                            >
                                <span className="font-semibold">{currentStep.speaker}: </span>
                                {addQuotes(currentStep.text)}
                            </button>
                        )}

                        {isChoiceStep(currentStep) && (
                            <div>
                                {currentStep.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleChoice(choice)}
                                        className="choice-text w-full text-left"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleChoice(choice);
                                            }
                                        }}
                                    >
                                        {index + 1}. {choice.isAction ? choice.text : addQuotes(choice.text)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isSceneTransitionStep(currentStep) && (
                            <button
                                onClick={() => handleSceneTransition(currentStep)}
                                className="transition-text w-full text-left"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleSceneTransition(currentStep);
                                    }
                                }}
                            >
                                {currentStep.text}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
