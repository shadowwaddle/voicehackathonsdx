# Progress

## In progress
<!-- What each person is working on right now. Update this when you start or stop a task. -->
- shadowwaddle (Lane A, UI): A1 shell + Home, A2 /parents, A3 WatercolorCanvas, A4 Story screen + useVoiceAgent.mock.ts
- sthavir007: Lane B: hooks/useVoiceAgent.ts (moved out of app/story/page.tsx), set_scene + play_sound client tools, /api/sfx, watercolor storybook HTML, scripts/test-storybook.ts

## To do
- [ ] Install and run in Daytona (private repo: the sandbox needs a GitHub token)
- [x] Idea picked: Birbal (kid-safe storytelling voice app)
- [ ] ElevenLabs agent setup in the dashboard (Lane B)

## Log
<!-- Newest first. Format: - [HH:MM] name: what was done -->
- shadowwaddle: A3 done: `components/WatercolorCanvas.tsx` with props `scene`, `volume`. The speaker blob is matched by `scene.speaker` against `scene.characters[].name`, ignoring case, and up to 4 characters are shown. Lane B: send `palette` as hex strings.
- shadowwaddle: A2 done: `/parents` with PIN gate, age slider, genre chips, time limit (5/10/15/20/30), sound toggle, change PIN (enter twice) and clear saved stories.
- shadowwaddle: A1 done: app shell, Home, `hooks/useParentSettings.ts` (defaults: age 6, all genres, 15 min, sound on, PIN 1234), `hooks/useSavedStories.ts`, `lib/genres.ts`. Added `qrcode.react` to package.json. `app/story/page.tsx` is broken until A4 replaces it.
- shadowwaddle: **Switched to the Lane A/B plan.** Rewrote `types/contract.ts` with `Scene`, `StorybookRequest`, `StorybookResult`, `SavedStory`, `TranscriptLine`, `VoiceAgent`, `StartOptions`. All three agent tools are now client tools, not server tools. Removed my old server-tool route, store and `/storybook` page. `lib/daytona.ts` is still there for Lane B to rewrite or delete. Lane B: please build against these types, and log any change you make to them here.
- shadowwaddle: Built the Next.js scaffold (not installed or built yet), `types/contract.ts`, the 4 screens with mock data (Home, Story, Storybook, Parent), `/api/tools/make-storybook` (hosts the HTML in a shared public Daytona sandbox on port 8080) and `GET /api/storybook?session=` (polled by the client).
  - **For the agent setup (sthavir007):** dynamic variables are `allowed_genres` (comma list), `genre`, `child_age`, `max_minutes`, `sound_effects`, `session_id`. The `make_storybook` server tool should POST JSON `{session_id, title, genre, summary, characters[], choices[], puzzles_solved[]}` to `<app url>/api/tools/make-storybook` with header `x-tool-secret: <TOOL_SECRET>`. Set `session_id` from the `{{session_id}}` dynamic variable. Start character lines with `[Name]` so captions show who's talking.
  - Storybook look: `lib/storybook-html.ts` (yours to restyle).
- sthavir007: Added a Basic rules section to CLAUDE.md (claim work first, small files, fewer repeat reads, short replies, ask before changing shared resources)
- shadowwaddle: Added rules to CLAUDE.md: run everything in Daytona, use ElevenLabs/Daytona tools as much as possible, always pull and read PROGRESS.md first
- shadowwaddle: Set up the repo, CLAUDE.md and PROGRESS.md
