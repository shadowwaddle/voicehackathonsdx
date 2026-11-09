import { STATIC_SITE } from "@/lib/birbal/platform";

// "What happens to your child's voice". Every sentence here describes what the code
// actually does (hooks/useVoiceAgent.ts, app/api/report, lib/scoring). Keep it that way.
const STATIC_STEPS = [
  {
    title: "Heard live",
    body: "During the story, ElevenLabs (our voice service) hears your child and turns their words into text so Birbal can reply.",
  },
  {
    title: "Scored on this device",
    body: "When the story ends, your own browser works out the scores. This website has no server, so the text isn't sent to us.",
  },
  {
    title: "Recording removed automatically",
    body: "ElevenLabs is set to delete each conversation's audio and transcript within one day.",
  },
  {
    title: "Only scores kept on this device",
    body: "What stays, in this browser only: the numbers you see here, plus each story's title, characters, words learned and storybook link for the Saved adventures list. The app drops its copy of the conversation as soon as scoring finishes.",
  },
];

const SERVER_STEPS = [
  {
    title: "Heard live",
    body: "During the story, ElevenLabs (our voice service) hears your child and turns their words into text so Birbal can reply.",
  },
  {
    title: "Scored in a sealed sandbox",
    body: "When the story ends, our server passes the text, without saving or logging it, to a brand-new Daytona sandbox with internet access switched off. It only runs our scoring script.",
  },
  {
    title: "Sandbox destroyed & recording deleted",
    body: "The sandbox is deleted right after scoring, and we ask ElevenLabs to delete the conversation's audio and transcript. Each story's receipt shows whether that worked.",
  },
  {
    title: "Only scores kept on this device",
    body: "What stays, in this browser only: the numbers you see here, plus each story's title, characters, words learned and storybook link for the Saved adventures list. The app drops its copy of the conversation as soon as scoring finishes.",
  },
];

const STEPS = STATIC_SITE ? STATIC_STEPS : SERVER_STEPS;

export function PrivacyTimeline() {
  return (
    <ol className="relative space-y-5">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-4">
          {i < STEPS.length - 1 && <span className="absolute left-[17px] top-10 h-[calc(100%-12px)] w-0.5 bg-stone-200" aria-hidden />}
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef6f4] font-display font-semibold text-[#1f5f57]">{i + 1}</span>
          <div className="pt-1">
            <div className="font-display text-lg font-semibold">{s.title}</div>
            <p className="mt-0.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
