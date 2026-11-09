import { BASE_PATH } from "./platform";

// Pre-generated sound library for the static site, matched by what the agent asks for.
export const SOUNDS: { file: string; match: RegExp; prompt: string }[] = [
  { file: "door", match: /door|creak|hinge|gate/i, prompt: "soft wooden door creaking open" },
  { file: "wind", match: /wind|breeze|whoosh|gust/i, prompt: "gentle whoosh of wind" },
  { file: "chime", match: /bell|chime|ding|gong/i, prompt: "small bright bell chime" },
  { file: "splash", match: /splash|water|wave|drip|bubble|river|ocean/i, prompt: "playful small water splash" },
  { file: "steps", match: /step|tiptoe|walk|patter/i, prompt: "light quick footsteps" },
  { file: "magic", match: /magic|sparkle|shimmer|twinkle|glow|star/i, prompt: "gentle magical sparkle shimmer" },
  { file: "thunder", match: /thunder|rumble|storm/i, prompt: "soft far away rumble of thunder" },
  { file: "rain", match: /rain|drizzle/i, prompt: "gentle light rain" },
  { file: "bird", match: /bird|chirp|tweet|parrot|owl|wing/i, prompt: "cheerful small bird chirping" },
  { file: "tick", match: /clock|tick/i, prompt: "soft clock ticking" },
  { file: "beep", match: /beep|robot|radio|machine|computer|signal/i, prompt: "friendly little robot beeps" },
  { file: "rocket", match: /rocket|engine|zoom|blast/i, prompt: "soft cartoon rocket zoom" },
  { file: "boing", match: /boing|bounce|spring|hop|jump/i, prompt: "cartoon spring boing" },
  { file: "pop", match: /pop|click|snap|cork/i, prompt: "small cheerful pop" },
  { file: "stomp", match: /dinosaur|roar|stomp|thump/i, prompt: "gentle friendly cartoon dinosaur footsteps" },
];

export function localSoundUrl(description: unknown): string | null {
  const hit = SOUNDS.find((s) => s.match.test(String(description ?? "")));
  return hit ? `${BASE_PATH}/sfx/${hit.file}.mp3` : null;
}
