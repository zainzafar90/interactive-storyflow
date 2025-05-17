import { tool } from "ai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const storyTellingTool = tool({
  id: "storyteller.generate" as const,
  description:
    "Generate a story with choices and story content. The story content will be used to generate audio.",
  parameters: z.object({
    story: z.string().describe("The story that speech model will use"),
    choices: z
      .array(z.string())
      .describe("The choices that the user will have"),
    completed: z.boolean().describe("Whether the story is completed"),
    storyId: z
      .string()
      .optional()
      .describe("ID for the story segment for storage"),
  }),
  execute: async ({ story, choices, completed, storyId = uuidv4() }) => {
    const audioUrl = await generateAudio(story, storyId);

    return {
      story,
      choices,
      completed,
      audioUrl,
      storyId,
    };
  },
});

async function generateAudio(
  text: string,
  storyId: string
): Promise<string | null> {
  try {
    const ttsResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/text-to-speech`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, storyId }),
        cache: "no-store",
      }
    );

    if (!ttsResponse.ok) {
      console.error("Failed to generate audio:", ttsResponse.status);
      return null;
    }

    const { audioUrl } = await ttsResponse.json();

    return audioUrl;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
}
