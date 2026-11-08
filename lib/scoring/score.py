"""Birbal thinking score. Pure stdlib, runs inside a throwaway Daytona sandbox.

Usage: python3 score.py input.json  -> prints {"metrics": {...}, "thinkingScore": n}

input.json: {"transcript": [{"role": "child"|"birbal", "text": str}, ...],
             "puzzlesSolved": int, "hintsUsed": int, "wordsLearned": int}
"""
import json
import re
import sys

STOPWORDS = set("""
about above after again against also been before being below between both could does doing down during each
from further have having here hers herself himself into itself just more most myself once only other ours
ourselves over own same should some such than that their theirs them themselves then there these they this
those through under until very were what when where which while whom will with would your yours yourself
yourselves yeah okay yes nope know like want really thing things going gonna said says tell told
don't dont can't cant won't didn't isn't aren't wasn't it's that's there's i'm i'll i've you're we're they're let's
sure maybe think
""".split())

REASONING = re.compile(r"\b(because|so that|maybe|what if|i think|might)\b|\bif\b.*\bthen\b")
QUESTION_STARTS = {"what", "why", "how", "where", "who", "can"}

# Per-story targets for a full score in each part (ages 4-10).
WEIGHTS = {"talk": 20, "elaboration": 15, "ideas": 20, "reasoning": 20, "curiosity": 10, "problem": 15}
TALK_TARGET = 0.5      # child says half the words
ELABORATION_CAP = 12   # words per answer
IDEAS_TARGET = 5
REASONING_TARGET = 4
QUESTIONS_TARGET = 3
PUZZLES_TARGET = 2


def words(text):
    return re.findall(r"[a-z']+", text.lower())


def content_words(text):
    return {w for w in words(text) if len(w) >= 4 and w not in STOPWORDS}


def compute_metrics(data):
    lines = [l for l in data.get("transcript", []) if l.get("text")]
    child_turns, child_words, all_words = 0, 0, 0
    original, reasoning, questions = 0, 0, 0
    birbal_vocab = set()

    for line in lines:
        text = str(line["text"])
        n = len(words(text))
        all_words += n
        if line.get("role") == "child":
            child_turns += 1
            child_words += n
            lower = text.lower().strip()
            if content_words(text) - birbal_vocab:
                original += 1
            if REASONING.search(lower):
                reasoning += 1
            first = (words(lower) or [""])[0]
            if lower.endswith("?") or first in QUESTION_STARTS:
                questions += 1
        else:
            birbal_vocab |= set(words(text))

    return {
        "talkShare": round(child_words / all_words, 3) if all_words else 0.0,
        "avgAnswerWords": round(child_words / child_turns, 1) if child_turns else 0.0,
        "originalIdeas": original,
        "reasoningAnswers": reasoning,
        "questionsAsked": questions,
        "puzzlesSolved": int(data.get("puzzlesSolved", 0)),
        "hintsUsed": int(data.get("hintsUsed", 0)),
        "wordsLearned": int(data.get("wordsLearned", 0)),
        "childTurns": child_turns,
    }


def thinking_score(m):
    if m["childTurns"] == 0:
        return 0
    part = lambda value, target: min(1.0, value / target)
    puzzles = m["puzzlesSolved"]
    # Solving with fewer hints per puzzle scores higher (never below 40% of the part).
    hint_factor = max(0.4, 1 - 0.15 * m["hintsUsed"] / puzzles) if puzzles else 0
    total = (
        WEIGHTS["talk"] * part(m["talkShare"], TALK_TARGET)
        + WEIGHTS["elaboration"] * part(m["avgAnswerWords"], ELABORATION_CAP)
        + WEIGHTS["ideas"] * part(m["originalIdeas"], IDEAS_TARGET)
        + WEIGHTS["reasoning"] * part(m["reasoningAnswers"], REASONING_TARGET)
        + WEIGHTS["curiosity"] * part(m["questionsAsked"], QUESTIONS_TARGET)
        + WEIGHTS["problem"] * part(puzzles, PUZZLES_TARGET) * hint_factor
    )
    return int(round(total))


def score(data):
    m = compute_metrics(data)
    return {"metrics": m, "thinkingScore": thinking_score(m)}


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        print(json.dumps(score(json.load(f))))
