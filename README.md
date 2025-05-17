

# Storio

Built an interactive story builder, basic idea is to navigate to different story based on user inputs and instead of plain chat like Gippity, I wanted to use better UI that's decided by the model itself when to render and when to send a simple text message.

## Tech stack

- Vercel AI SDK for inference
- XAI's Grok for the LLM
- Deepgram for text-to-speech
- Authentication & usage tracking
- Chat storage

## Cloning & running

1. **Clone the repo:**
   ```bash
   git clone https://github.com/zainzafar90/interactive-storyflow
   cd interactive-storyflow
   ```

2. **Create a `.env` file and add your environment variables (see `.env.example`):**
   ```
   GROK_API_KEY=(AI model)
   DEEPGRAM_API_KEY=(for text-to-speech)
   DATABASE_URL= (using neon db for now you can use any postgres one)
   NEXTAUTH_SECRET= (if using authentication)
   BLOB_READ_WRITE_TOKEN= (storing audios in production)
   ```

3. **Run npm install to install dependencies**
4. **Run npm db:generate to generate drizzle schema**
5. **Run npm dev to start the development server**

6. **Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.**

## Features

- [x] User can provide optional context for the story
- [x] Story segments are generated based on user choices
- [x] Story ends after the 3rd segment
- [x] Authentication
- [x] Usage-based tracking
- [x] Chat storage

## How it works

- User provides a context (optional)
- Story segments are generated based on the selected choice
- After the 2nd or 3rd segment, the story ends

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [XAI's Grok](https://x.ai/)
- [Deepgram](https://deepgram.com/)
