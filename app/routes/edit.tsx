import type { MetaFunction } from "@remix-run/cloudflare";
import StoryEditor from "~/components/StoryEditor/StoryEditor";

export const meta: MetaFunction = () => {
    return [
        { title: "Story Editor" },
        { name: "description", content: "Edit your story" },
    ];
};

export default function Edit() {
    return (
        <div className="h-screen">
            <StoryEditor />
        </div>
    );
}