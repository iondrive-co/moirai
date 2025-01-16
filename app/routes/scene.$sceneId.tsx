import {useLoaderData, useNavigate, useRouteError} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useState, useEffect } from "react";
import type { Step, StoryData, DialogueStep, DescriptionStep, ChoiceStep, SceneTransitionStep } from "~/types";

interface LoaderData {
    scene: {
        startingStep: string;
        steps: Record<string, Step>;
    };
}

export const loader: LoaderFunction = async ({ params, context }) => {
    try {
        const sceneId = params['*'];
        const kvNamespace = context.env?.STORY_DATA || context.cloudflare?.env?.STORY_DATA;

        if (!kvNamespace) {
            throw new Response('Story system is not properly configured', {
                status: 500,
                statusText: 'Configuration Error'
            });
        }

        if (!sceneId) {
            throw new Response('No scene ID provided', {
                status: 400,
                statusText: 'Invalid Request'
            });
        }

        const storyData = await kvNamespace.get('current-story');

        if (!storyData) {
            throw new Response('No story data is currently loaded', {
                status: 503,
                statusText: 'Story Not Available'
            });
        }

        try {
            const parsedStory = JSON.parse(storyData) as StoryData;
            const scene = parsedStory[sceneId];

            if (!scene) {
                throw new Response(`Scene "${sceneId}" is not available`, {
                    status: 404,
                    statusText: 'Scene Not Found'
                });
            }

            return { scene };
        } catch (parseError) {
            throw new Response('Story data is corrupted or in an invalid format', {
                status: 500,
                statusText: 'Data Error'
            });
        }
    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }
        throw new Response(
            error instanceof Error ? error.message : 'An unexpected error occurred',
            { status: 500 }
        );
    }
};

export function ErrorBoundary() {
    const error = useRouteError();

    let errorMessage = 'An unexpected error occurred';
    let errorDetails = null;
    let statusCode = 500;

    if (error instanceof Response) {
        statusCode = error.status;
        try {
            // Try to get the response body synchronously
            const text = error.bodyUsed ? '' : error.statusText;
            errorMessage = text || `${error.status} ${error.statusText}`;

            if (error.status === 503) {
                errorDetails = (
                    <div className="mt-4 p-4 bg-gray-800 rounded">
                        <p>No story data is currently available. If you're an administrator, you can:</p>
                        <ol className="list-decimal ml-6 mt-2">
                            <li>Load the example story using npm run story:load-example:prod</li>
                            <li>Create a new story using the editor locally</li>
                            <li>Upload your story using npm run story:put:prod</li>
                        </ol>
                    </div>
                );
            }
        } catch (e) {
            console.error('Error reading response:', e);
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
        if (error.stack) {
            errorDetails = (
                <pre className="mt-4 p-4 bg-gray-800 rounded overflow-auto text-sm">
                    {error.stack}
                </pre>
            );
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return (
        <div className="min-h-screen p-6 bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-red-500">
                    {statusCode === 404 ? 'Not Found' : 'Error'}
                </h1>
                <div className="space-y-4">
                    <p>{errorMessage}</p>
                    {errorDetails}
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
