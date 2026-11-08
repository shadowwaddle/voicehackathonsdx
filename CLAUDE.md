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

## Always assume the other person is active

Treat every task as if the other person pushed something a minute ago. Run `git pull --rebase` and read `PROGRESS.md` at the start of **every** task, including small ones, and pull again right before pushing.

## Where things run (save tokens)

- **Run everything in Daytona, not locally.** Installs, builds, servers, tests and scripts all go in a Daytona sandbox (Daytona MCP tools: `create_sandbox`, `git_clone`, `execute_command`, `preview_link`). Don't run them on the local machine.
- **Edit code locally, run it in Daytona.** Flow: edit locally → commit and push → in the sandbox run `git pull` → run the code there. Never edit files inside the sandbox: those changes aren't in git and disappear with the sandbox.
- **Keep sandbox output small.** Pipe long command output through `tail -n 30` or `grep`, and run servers in the background with logs written to a file.
- **Use the ElevenLabs and Daytona APIs and MCP tools instead of writing or debugging code by hand** wherever they can do the job: create and configure agents, voices, tools and knowledge bases through the ElevenLabs tools, and don't build what ElevenLabs already offers.
- Reuse the shared sandbox if one is listed below instead of creating a new one. Write the ID here when you create one.
- ElevenLabs agent changes go straight to the ElevenLabs account, not git. Write the agent ID and any important config changes in `PROGRESS.md`.

Shared resources:
- Daytona sandbox ID: TBD
- ElevenLabs agent ID: TBD

## Project

_Fill this in once you've picked the idea: what it does, the tech stack, and how to run it._

- Idea: TBD
- Stack: TBD (ElevenLabs for voice)
- Run: TBD
