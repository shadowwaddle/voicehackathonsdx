import type { Genre } from "@/types/contract";

// A fresh random seed for every story. Items without `fits` work for any theme.
type Item<T> = T & { fits?: Genre[] };
type Rng = () => number;

export interface StorySpark {
  setting: string;
  sidekick: string;
  quirk: string;
  object: string;
  deadline: string;
  twist: string;
  title: string;
}

const SETTINGS: Item<{ text: string }>[] = [
  { text: "a sleepy research base on the dark side of a moon", fits: ["space"] },
  { text: "a floating garden between two small planets", fits: ["space"] },
  { text: "a rocket repair shop on a comet", fits: ["space"] },
  { text: "a lantern-lit reef under a calm bay", fits: ["ocean"] },
  { text: "a sunken library full of curious fish", fits: ["ocean"] },
  { text: "a tide-pool town at low tide", fits: ["ocean"] },
  { text: "a treetop village joined by rope bridges", fits: ["jungle"] },
  { text: "a misty valley of giant ferns", fits: ["jungle"] },
  { text: "a hidden pool behind hanging vines", fits: ["jungle"] },
  { text: "a warm valley of gentle long-necked giants", fits: ["dinosaurs"] },
  { text: "a nesting beach beside a smoking hill", fits: ["dinosaurs"] },
  { text: "a fossil dig that keeps changing overnight", fits: ["dinosaurs"] },
  { text: "a rainy little town with one very busy clock shop", fits: ["detective"] },
  { text: "a train station where the signs swap places", fits: ["detective"] },
  { text: "a village fair on the morning of the big pie contest", fits: ["detective"] },
  { text: "a castle kitchen run by polite mice", fits: ["fantasy"] },
  { text: "a mountain school for very small dragons", fits: ["fantasy"] },
  { text: "an enchanted orchard where the apples whisper", fits: ["fantasy"] },
  { text: "a patchwork ship in a harbor of tiny islands", fits: ["pirates"] },
  { text: "a sandbar that only appears at sunset", fits: ["pirates"] },
  { text: "a port town where the gulls deliver the mail", fits: ["pirates"] },
  { text: "a tidy factory that makes kites", fits: ["robots"] },
  { text: "a city where robots run the bakeries", fits: ["robots"] },
  { text: "a junkyard workshop full of friendly machines", fits: ["robots"] },
  { text: "a market street from a hundred years ago", fits: ["time_travel"] },
  { text: "a clock tower that opens onto tomorrow", fits: ["time_travel"] },
  { text: "a castle courtyard on the day it was finished", fits: ["time_travel"] },
  { text: "a village with roofs of frosting", fits: ["candy_land"] },
  { text: "a toffee canyon crossed by licorice ropes", fits: ["candy_land"] },
  { text: "a lollipop forest in the first warm week of spring", fits: ["candy_land"] },
];

const CREATURES: Item<{ text: string }>[] = [
  { text: "a tiny hedgehog" }, { text: "a chatty sparrow" }, { text: "a round little owl" },
  { text: "a shy firefly" }, { text: "a bouncy frog" }, { text: "a sleepy turtle" },
  { text: "a curious fox cub" }, { text: "a fluffy moth" }, { text: "a small snail" },
  { text: "a moon-rabbit", fits: ["space"] }, { text: "a friendly star-jelly", fits: ["space"] },
  { text: "a seahorse", fits: ["ocean"] }, { text: "a hermit crab", fits: ["ocean", "pirates"] },
  { text: "a baby sloth", fits: ["jungle"] }, { text: "a toucan chick", fits: ["jungle"] },
  { text: "a baby triceratops", fits: ["dinosaurs"] }, { text: "a tiny pterosaur", fits: ["dinosaurs"] },
  { text: "a mouse in a trench coat", fits: ["detective"] }, { text: "a pocket-sized dragon", fits: ["fantasy"] },
  { text: "a parrot", fits: ["pirates"] }, { text: "a wind-up mouse", fits: ["robots", "time_travel"] },
  { text: "a clockwork cat", fits: ["time_travel", "robots"] }, { text: "a marshmallow bear", fits: ["candy_land"] },
];

const QUIRKS = [
  "hiccups bubbles when nervous", "counts everything out loud", "rhymes when excited",
  "collects buttons", "sneezes glitter", "hums while thinking", "walks backward when happy",
  "mixes up left and right", "wears a scarf in all weather", "gives every rock a name",
  "naps at the worst moments", "whispers even when shouting",
];

const OBJECTS: Item<{ name: string }>[] = [
  { name: "Humming Compass" }, { name: "Backward Music Box" }, { name: "Flameless Lantern" },
  { name: "Invisible Map" }, { name: "Spinning Brass Top" }, { name: "Locked Little Book" },
  { name: "Glowing Seed" }, { name: "Yesterday Mirror" }, { name: "Silent Whistle" },
  { name: "Jar of Echoes" }, { name: "Paper Boat" }, { name: "Golden Acorn" },
  { name: "Star-Shaped Radio", fits: ["space"] }, { name: "Singing Pearl", fits: ["ocean", "pirates"] },
  { name: "Warm Fossil", fits: ["dinosaurs"] }, { name: "Beating Gear", fits: ["robots"] },
  { name: "Sugar-Glass Key", fits: ["candy_land"] }, { name: "Stopped Pocket Watch", fits: ["time_travel", "detective"] },
];

const DEADLINES = [
  "the moon sets", "the tide turns", "the festival begins", "the last lantern goes out",
  "the clock strikes twelve", "the rain arrives", "the market closes", "everyone wakes up",
  "the music stops", "the bridge folds away",
];

const TWISTS = [
  "the one who took it was only trying to help", "the clue was upside down the whole time",
  "the sidekick had the answer in a pocket all along", "the lost thing was never lost, only disguised",
  "two different clues turn out to be one", "a shy creature has been leaving the clues",
  "the map was drawn by a child long ago", "the strange sound was an echo from tomorrow",
  "the answer is in the first place they looked", "the grumpy one was only lonely",
  "the rule works backward", "what looks broken is really a doorway",
];

const pick = <T,>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length)];
const forGenre = <T,>(list: Item<T>[], genre: Genre) => list.filter((i) => !i.fits || i.fits.includes(genre));

function titleFor(genre: Genre, object: string, rng: Rng) {
  const forms = genre === "detective"
    ? ["The Case of the", "The Mystery of the", "The Clue of the"]
    : ["The Secret of the", "The Mystery of the", "The Quest for the", "The Riddle of the"];
  return `${pick(forms, rng)} ${object}`;
}

/** Rerolls so the announced title never matches one of the recent stories. */
export function makeSpark(genre: Genre, recentTitles: string[] = [], rng: Rng = Math.random): StorySpark {
  const recent = new Set(recentTitles.map((t) => t.toLowerCase()));
  const objects = forGenre(OBJECTS, genre);
  let object = pick(objects, rng).name;
  let title = titleFor(genre, object, rng);
  for (let i = 0; i < 12 && recent.has(title.toLowerCase()); i++) {
    object = pick(objects, rng).name;
    title = titleFor(genre, object, rng);
  }
  return {
    setting: pick(forGenre(SETTINGS, genre), rng).text,
    sidekick: pick(forGenre(CREATURES, genre), rng).text,
    quirk: pick(QUIRKS, rng),
    object: `the ${object}`,
    deadline: pick(DEADLINES, rng),
    twist: pick(TWISTS, rng),
    title,
  };
}
