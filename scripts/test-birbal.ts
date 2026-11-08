// Logic checks for the story engine: npx tsx scripts/test-birbal.ts
import assert from "node:assert/strict";
import { STORY_CARDS, STORY_GENRES } from "../lib/birbal/stories";
import { makeSpark } from "../lib/birbal/spark";
import { buildBirbalSession } from "../lib/birbal/prompt";
import { sceneFromText, applyMatch } from "../lib/birbal/sceneFromText";
import { CUES, dueCues, saidStopBirbal, shouldHardStop } from "../lib/birbal/timeline";
import { bookFromSession } from "../lib/birbal/fallbackBook";
import { buildReport, describeSession, localMetrics, localScore } from "../lib/scoring/localScore";

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
assert.ok(off.prompt.includes("Speak English only"), "no stray languages");
assert.ok(es.prompt.includes("Only ever say Spanish words you have taught"), "taught words only");
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

for (const yes of ["Stop Birbal", "stop birbal!", "Stop, Birbal.", "please STOP BIRBAL now", "stop burble"]) assert.ok(saidStopBirbal(yes), yes);
for (const no of ["stop", "I'm done", "bye", "no more", "I'm tired", "stop the robot!", "hey Birbal", "honey please stop that", ""]) assert.ok(!saidStopBirbal(no), no);

const empty = bookFromSession({ title: "T", genre: "space", lines: [], scenes: [], words: [] });
assert.ok(empty.title === "T" && empty.summary.length > 20, "storybook from an empty session");
const told = bookFromSession({ title: "T", genre: "space", scenes: [], words: [], lines: [
  { role: "birbal", text: "Hello!" }, { role: "child", text: "Let us go there" }, { role: "birbal", text: "[excited] You run to the door." }] });
assert.equal(told.summary, "You run to the door.");
assert.deepEqual(told.choices, ["Let us go there"]);

const req = { transcript: [] as { role: "child" | "birbal"; text: string }[], puzzlesSolved: 0, hintsUsed: 0, wordsLearned: 0, conversationId: null, storyTitle: "S", genre: "space" as const, durationSeconds: 1 };
const del = { audio: "skipped", transcript: "skipped", sandbox: "skipped", at: "" } as const;
const none = buildReport(req, localMetrics(req), 0, del);
assert.ok(none.short && none.summary?.includes("1 second"), "1-second silent chat gets a report");
const chat = { ...req, durationSeconds: 12, transcript: [{ role: "birbal" as const, text: "Which door?" }, { role: "child" as const, text: "why is the blue door humming because maybe magic?" }] };
const quick = buildReport(chat, localMetrics(chat), 50, del);
assert.equal(quick.thinkingScore, 0, "under 30s has no score");
assert.ok(quick.summary?.includes("1 reply") && quick.summary.includes("1 question") && quick.summary.includes("30 seconds"), String(quick.summary));
const long = { ...chat, durationSeconds: 200 };
const full = buildReport(long, localMetrics(long), localScore(localMetrics(long)), del);
assert.ok(!full.short && full.thinkingScore > 0 && full.summary?.includes("3 minutes 20 seconds"), String(full.summary));
assert.ok(!describeSession(long, localMetrics(long)).includes("door"), "never quotes the child");

console.log("birbal logic: all checks passed");
