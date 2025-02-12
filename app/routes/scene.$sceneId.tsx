import {useLoaderData, useNavigate, useRouteError} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useState, useEffect } from "react";
import type {
    Step,
    StoryData,
    DialogueStep,
    DescriptionStep,
    ChoiceStep,
    SceneTransitionStep,
    HistoryItem, VariableSetting
} from "~/types";
import { useGameState } from '~/components/GameState';

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
        console.debug('Context structure:', JSON.stringify({
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
                            <p>No story data is currently available. Locally you can:</p>
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
    const { evaluateCondition, setMultipleVariables } = useGameState();

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentStepId, setCurrentStepId] = useState(data.scene.startingStep);
    const [awaitingClick, setAwaitingClick] = useState(true);
    const [pendingChoice, setPendingChoice] = useState<{
        text: string;
        next: string;
        isDialogue?: boolean;
    } | null>(null);

    useEffect(() => {
        setHistory([]);
        setCurrentStepId(data.scene.startingStep);
        setAwaitingClick(true);
        setPendingChoice(null);
    }, [data.scene.startingStep]);

    const getNextStep = (currentStep: Step): string | undefined => {
        // Handle conditional branches for any step type that has them
        if ('conditionalBranches' in currentStep && currentStep.conditionalBranches?.length) {
            // Find the first matching condition
            const matchingBranch = currentStep.conditionalBranches.find(branch => {
                const result = evaluateCondition(branch.condition);
                console.debug('Evaluating condition:', branch.condition, 'Result:', result);
                return result;
            });
            if (matchingBranch) {
                console.debug('Found matching branch:', matchingBranch);
                return matchingBranch.next;
            }
        }
        // Fall back to default next if no conditions match or no conditions exist
        return 'next' in currentStep ? currentStep.next : undefined;
    };

    const currentStep = data.scene.steps[currentStepId];

    const handleProgress = () => {
        if (!currentStep || !awaitingClick) return;

        if (pendingChoice) {
            // Add the choice to history and move to next node
            setHistory(prev => [...prev, {
                type: 'choice',
                text: pendingChoice.text,
                isPlayerResponse: true,
                isDialogue: pendingChoice.isDialogue
            }]);
            setCurrentStepId(pendingChoice.next);
            setPendingChoice(null);
            setAwaitingClick(true);
            return;
        }

        if (isDialogueStep(currentStep)) {
            setHistory(prev => [...prev, {
                type: 'dialogue',
                speaker: currentStep.speaker,
                text: currentStep.text
            }]);
            const nextStepId = getNextStep(currentStep);
            if (nextStepId) {
                setCurrentStepId(nextStepId);
            }
        } else if (isDescriptionStep(currentStep)) {
            setHistory(prev => [...prev, {
                type: 'description',
                text: renderDescriptionText(currentStep)
            }]);
            const nextStepId = getNextStep(currentStep);
            if (nextStepId) {
                setCurrentStepId(nextStepId);
            }
        }
        setAwaitingClick(true);
    };

    const handleChoice = (choice: {
        text: string;
        next: string;
        historyText?: string;
        isDialogue?: boolean;
        setVariables?: VariableSetting[];
    }) => {
        if (choice.setVariables?.length) {
            setMultipleVariables(choice.setVariables);
        }
        const historyText = choice.historyText || choice.text;
        setPendingChoice({
            text: historyText,
            next: choice.next,
            isDialogue: choice.isDialogue
        });
        setAwaitingClick(true);
    };

    const renderDescriptionText = (step: DescriptionStep): string => {
        let finalText = step.text;

        if (step.insertionPoints) {
            for (const point of step.insertionPoints) {
                // Find the first matching variant (changed from branch)
                const matchingVariant = point.variants.find(variant =>
                    evaluateCondition(variant.condition)
                );

                if (matchingVariant) {
                    finalText = finalText.replace(
                        new RegExp(`{{${point.id}}}`, 'g'),
                        matchingVariant.text
                    );
                } else {
                    // Remove the placeholder if no conditions match
                    finalText = finalText.replace(
                        new RegExp(`{{${point.id}}}`, 'g'),
                        ''
                    );
                }
            }
        }

        return finalText;
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
                                {item.type === 'description' ? (
                                    <p className="description-text">{item.text}</p>
                                ) : item.isPlayerResponse ? (
                                    <p className="player-text">
                                        {item.isDialogue ? (
                                            <>You: &ldquo;{item.text}&rdquo;</>
                                        ) : (
                                            item.text
                                        )}
                                    </p>
                                ) : (
                                    <p className="dialogue-text">
                                        {item.speaker && <span className="font-semibold">{item.speaker}: </span>}
                                        &ldquo;{item.text}&rdquo;
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Current Step */}
                    <div className="mt-4">
                        {isDescriptionStep(currentStep) && awaitingClick && !pendingChoice && (
                            <button
                                onClick={handleProgress}
                                className="description-text w-full text-left"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleProgress();
                                    }
                                }}
                            >
                                {renderDescriptionText(currentStep)}
                            </button>
                        )}

                        {isDialogueStep(currentStep) && awaitingClick && !pendingChoice && (
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

                        {isChoiceStep(currentStep) && !pendingChoice && (
                            <div className="space-y-2">
                                {currentStep.choices.map((choice, index) => {
                                    const displayText = choice.isDialogue ?
                                        <>&ldquo;{choice.text}&rdquo;</> :
                                        choice.text;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleChoice({
                                                text: choice.text,
                                                next: choice.next,
                                                historyText: choice.historyText || choice.text,
                                                isDialogue: choice.historyIsDialogue ?? choice.isDialogue,
                                                setVariables: choice.setVariables
                                            })}
                                            className="choice-text w-full text-left"
                                        >
                                            {`${index + 1}. `}{displayText}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {pendingChoice && (
                            <button
                                onClick={handleProgress}
                                className="player-text w-full text-left cursor-pointer"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleProgress();
                                    }
                                }}
                            >
                                {pendingChoice.isDialogue ? (
                                    <>You: &ldquo;{pendingChoice.text}&rdquo;</>
                                ) : (
                                    pendingChoice.text
                                )}
                            </button>
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
