# Progress

## In progress
<!-- What each person is working on right now. Update this when you start or stop a task. -->
- shadowwaddle (Lane A, UI): A1-A4 done; waiting on Daytona network to build and test
- sthavir007: Lane B: live test of storybook + SFX (needs keys in `.env`), ElevenLabs agent setup

## To do
- [ ] Daytona sandbox has no internet, so npm install fails. Fix the account network setting, then build and run
- [x] Idea picked: Birbal (kid-safe storytelling voice app)
- [ ] ElevenLabs agent setup in the dashboard (Lane B)

## Log
<!-- Newest first. Format: - [HH:MM] name: what was done -->
- sthavir007: B1-B3 code done, against the Lane A/B contract with no contract changes: `hooks/useVoiceAgent.ts`, `POST /api/storybook` + `lib/daytona.ts` + `lib/storybook-script.ts`, `/api/sfx`, `scripts/test-storybook.ts`. `next build` with the real hook, route validation and the Python generator pass in Daytona. Not yet tested live: real voice session, real sandbox publish, real SFX.
  - **Lane A:** `app/story/layout.tsx` adds the `ConversationProvider` the current SDK requires. To go live, change the import in `app/story/page.tsx` to `@/hooks/useVoiceAgent` and set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.
  - **Daytona builds:** the default sandbox gets OOM-killed by `next build` with all workers. Some new sandboxes come up with no DNS; test with `curl` and recreate if so.
- shadowwaddle: A4 done: `app/story/page.tsx` (watercolor background, speaker name, time ring, tap-to-start, listening/speaking indicator, captions toggle, end button, storybook modal with QR, saves the story) and `hooks/useVoiceAgent.mock.ts`. To go live, change the one import line in `app/story/page.tsx` to `@/hooks/useVoiceAgent`. **Not built yet:** the dev sandbox has no outbound internet (DNS fails, connections reset), so `npm install` hangs. This blocks Lane B too: storybook sandboxes can't install anything either.
- sthavir007: Changed CLAUDE.md rule 3: commit and push after every working piece, `git pull --rebase` before each edit and right before each push
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
