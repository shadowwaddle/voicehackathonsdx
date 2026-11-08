# Voice Hackathon (SDx)

Two people are building this project at the same time, each with their own Claude Code session:
- **shadowwaddle**
- **sthavir007**

The GitHub repo is the only thing shared between the two sessions. Keep it current.

## Sync rules (follow these every time)

1. **Before starting any task:** run `git pull --rebase` and read `PROGRESS.md` to see what the other person has done.
2. **After finishing any meaningful chunk of work** (a feature works, a bug is fixed, a file is added):
   - Add an entry at the top of the log in `PROGRESS.md`.
   - Commit with a clear message, then run `git pull --rebase && git push`.
3. Commit small and often. Don't sit on unpushed work for more than about 20-30 minutes.
4. If a pull hits a merge conflict, resolve it while keeping both people's changes, then explain what you did to the user.
5. Before editing a file the other person is actively working on (check "In progress" in `PROGRESS.md`), tell the user and ask first.
6. Never commit secrets. API keys go in `.env`, which is gitignored. Keep the variable names (not the values) listed in `.env.example`.

## Project

_Fill this in once you've picked the idea: what it does, the tech stack, and how to run it._

- Idea: TBD
- Stack: TBD (ElevenLabs for voice)
- Run: TBD
