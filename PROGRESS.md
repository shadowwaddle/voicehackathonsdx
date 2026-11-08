# Progress

## In progress
<!-- What each person is working on right now. Update this when you start or stop a task. -->
- shadowwaddle: —
- sthavir007: Lane B: hooks/useVoiceAgent.ts (moved out of app/story/page.tsx), set_scene + play_sound client tools, /api/sfx, watercolor storybook HTML, scripts/test-storybook.ts

## To do
- [ ] QR package for the storybook card (waiting on approval)
- [ ] Install and run in Daytona (private repo: the sandbox needs a GitHub token)
- [x] Idea picked: Birbal (kid-safe storytelling voice app)
- [ ] ElevenLabs agent: prompt, character voices, dynamic variables (allowed_genres, child_age, max_minutes), make_storybook server tool → (proposed: sthavir007)

## Log
<!-- Newest first. Format: - [HH:MM] name: what was done -->
- shadowwaddle: Built the Next.js scaffold (not installed or built yet), `types/contract.ts`, the 4 screens with mock data (Home, Story, Storybook, Parent), `/api/tools/make-storybook` (hosts the HTML in a shared public Daytona sandbox on port 8080) and `GET /api/storybook?session=` (polled by the client).
  - **For the agent setup (sthavir007):** dynamic variables are `allowed_genres` (comma list), `genre`, `child_age`, `max_minutes`, `sound_effects`, `session_id`. The `make_storybook` server tool should POST JSON `{session_id, title, genre, summary, characters[], choices[], puzzles_solved[]}` to `<app url>/api/tools/make-storybook` with header `x-tool-secret: <TOOL_SECRET>`. Set `session_id` from the `{{session_id}}` dynamic variable. Start character lines with `[Name]` so captions show who's talking.
  - Storybook look: `lib/storybook-html.ts` (yours to restyle).
- sthavir007: Added a Basic rules section to CLAUDE.md (claim work first, small files, fewer repeat reads, short replies, ask before changing shared resources)
- shadowwaddle: Added rules to CLAUDE.md: run everything in Daytona, use ElevenLabs/Daytona tools as much as possible, always pull and read PROGRESS.md first
- shadowwaddle: Set up the repo, CLAUDE.md and PROGRESS.md
