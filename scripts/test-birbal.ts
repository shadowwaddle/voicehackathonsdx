// Logic checks for the story engine: npx tsx scripts/test-birbal.ts
import assert from "node:assert/strict";
import { STORY_CARDS, STORY_GENRES } from "../lib/birbal/stories";
import { makeSpark } from "../lib/birbal/spark";
import { buildBirbalSession } from "../lib/birbal/prompt";
import { sceneFromText, applyMatch } from "../lib/birbal/sceneFromText";
import { CUES, dueCues, shouldHardStop, wantsToStop } from "../lib/birbal/timeline";

assert.equal(STORY_CARDS.length, 10);
assert.equal(new Set(STORY_GENRES).size, 10);

for (const { genre } of STORY_CARDS) {
  const sparks = Array.from({ length: 200 }, () => makeSpark(genre));
  for (const key of ["setting", "sidekick", "quirk", "object", "deadline", "twist"] as const) {
    assert.ok(new Set(sparks.map((s) => s[key])).size >= 3, `${genre} ${key} varies`);
    assert.ok(sparks.every((s) => s[key]), `${genre} ${key} set`);
  }
  const taken = sparks.slice(0, 3).map((s) => s.title);
  assert.ok(Array.from({ length: 50 }, () => makeSpark(genre, taken)).every((s) => !taken.includes(s.title)), "avoids recent titles");
}

const spark = makeSpark("space");
const base = { card: STORY_CARDS[0], spark, childAge: 7, allowedWorlds: ["Space"], reviewWords: [], recentTitles: ["Old One"], returningCharacters: [] };
const off = buildBirbalSession({ ...base, learningLanguage: "off" });
const es = buildBirbalSession({ ...base, learningLanguage: "es", reviewWords: [{ word: "luz", translation: "light", emoji: "x", language: "es" }] });
assert.ok(off.firstMessage.includes(spark.title), "first message announces title");
assert.ok(!off.prompt.includes("LANGUAGE ADVENTURE"));
assert.ok(es.prompt.includes("LANGUAGE ADVENTURE: Spanish") && es.prompt.includes("luz (light)"));
for (const part of [spark.title, spark.setting, spark.deadline, spark.twist, "Old One", "teach_word" ]) assert.ok(es.prompt.includes(part), part);
for (const rule of ["set_scene", "play_sound", "make_storybook", "personal information", "once every three turns", "Beat 4"]) assert.ok(off.prompt.includes(rule), rule);
assert.ok(!/\{\{/.test(off.prompt), "fully interpolated");

assert.equal(sceneFromText("the tall trees")?.location, "forest");
assert.equal(sceneFromText("over the ocean")?.location, "water");
assert.equal(sceneFromText("the moon rose")?.location, "night sky");
assert.equal(sceneFromText("a stone castle")?.location, "castle");
assert.equal(sceneFromText("hot desert sun")?.location, "desert");
assert.equal(sceneFromText("into the cave")?.location, "cave");
assert.equal(sceneFromText("soft snow")?.location, "snow");
assert.equal(sceneFromText("hooray")?.mood, "happy");
assert.equal(sceneFromText("a whisper")?.mood, "mysterious");
assert.equal(sceneFromText("quick, run")?.mood, "exciting");
assert.equal(sceneFromText("from the forest to the cave")?.location, "cave", "latest wins");
assert.equal(sceneFromText("let's start"), null, "'start' is not 'star'");
assert.equal(sceneFromText("nothing here"), null);
const kept = applyMatch({ location: "x", mood: "calm", palette: ["#111111"], characters: [{ name: "A", color: "#222222" }], speaker: "A" }, { keyword: "hooray", mood: "happy" });
assert.deepEqual([kept.palette, kept.characters.length, kept.mood], [["#111111"], 1, "happy"]);

assert.deepEqual(dueCues(149, new Set()).map((c) => c.key), []);
assert.deepEqual(dueCues(150, new Set()).map((c) => c.key), ["puzzle"]);
assert.deepEqual(dueCues(270, new Set(["puzzle", "resolve"])).map((c) => c.key), ["ending"]);
assert.deepEqual(CUES.map((c) => c.at), [150, 225, 270]);
assert.equal(shouldHardStop(299, false), false);
assert.equal(shouldHardStop(300, true), false, "lets the goodbye finish");
assert.equal(shouldHardStop(300, false), true);
assert.equal(shouldHardStop(320, true), true, "20s grace at most");

for (const yes of ["I'm done", "stop", "Stop!", "I want to stop", "bye", "no more", "I'm tired.", "I’m done", "okay stop", "goodbye Birbal"]) assert.ok(wantsToStop(yes), yes);
for (const no of ["stop the robot!", "don't stop", "goodbye dragon, let's go", "I'm tired of this door, open it", "there are no more clues here", "by the river"]) assert.ok(!wantsToStop(no), no);

console.log("birbal logic: all checks passed");
