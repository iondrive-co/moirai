import { json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { story } from "~/data/story";
import type { LoaderFunction } from "@remix-run/cloudflare";
import type { Step, DialogueStep, DescriptionStep, ChoiceStep, SceneTransitionStep } from "~/data/story.types";

export async function loader({ params }: Parameters<LoaderFunction>[0]) {
    const scene = story[params.sceneId ?? ''];

    if (!scene) {
        throw new Response("Scene Not Found", { status: 404 });
    }

    return json({ scene });
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
    const data = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentStepId, setCurrentStepId] = useState<string>(data.scene.startingStep);
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
            setCurrentStepId(currentStep.next);
        } else if (isDescriptionStep(currentStep)) {
            setHistory(prev => [...prev, {
                type: 'description',
                text: currentStep.text
            }]);
            setCurrentStepId(currentStep.next);
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
                            <p
                                onClick={handleProgress}
                                className="description-text"
                            >
                                {currentStep.text}
                            </p>
                        )}

                        {isDialogueStep(currentStep) && awaitingClick && (
                            <p
                                onClick={handleProgress}
                                className="dialogue-text"
                            >
                                <span className="font-semibold">{currentStep.speaker}: </span>
                                {addQuotes(currentStep.text)}
                            </p>
                        )}

                        {isChoiceStep(currentStep) && (
                            <div>
                                {currentStep.choices.map((choice, index) => (
                                    <p
                                        key={index}
                                        onClick={() => handleChoice(choice)}
                                        className="choice-text"
                                    >
                                        {index + 1}. {choice.isAction ? choice.text : addQuotes(choice.text)}
                                    </p>
                                ))}
                            </div>
                        )}

                        {isSceneTransitionStep(currentStep) && (
                            <p
                                onClick={() => handleSceneTransition(currentStep)}
                                className="transition-text"
                            >
                                {currentStep.text}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}