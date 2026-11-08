"""Run: python3 -m unittest test_score.py (from lib/scoring)."""
import unittest

from score import compute_metrics, score

ENGAGED = {
    "transcript": [
        {"role": "birbal", "text": "All the honey buns are gone! What do you think happened?"},
        {"role": "child", "text": "Maybe a hungry raccoon sneaked in because the window was open"},
        {"role": "birbal", "text": "A raccoon! Look, sticky footprints. Should we follow them?"},
        {"role": "child", "text": "Why are they sticky?"},
        {"role": "birbal", "text": "Great question. They lead to the old oak tree."},
        {"role": "child", "text": "I think the squirrel family wanted a birthday picnic"},
        {"role": "birbal", "text": "The door is locked. How can we open it?"},
        {"role": "child", "text": "If we knock three times then the door opens"},
    ],
    "puzzlesSolved": 2, "hintsUsed": 1, "wordsLearned": 3,
}

QUIET = {
    "transcript": [
        {"role": "birbal", "text": "All the honey buns are gone! What do you think happened?"},
        {"role": "child", "text": "I don't know"},
        {"role": "birbal", "text": "Look, sticky footprints! Should we follow them?"},
        {"role": "child", "text": "yes"},
        {"role": "birbal", "text": "They lead to the old oak tree. Who could live there?"},
        {"role": "child", "text": "tree"},
    ],
    "puzzlesSolved": 1, "hintsUsed": 3, "wordsLearned": 0,
}


class ScoreTest(unittest.TestCase):
    def test_engaged_metrics(self):
        m = compute_metrics(ENGAGED)
        self.assertEqual(m["childTurns"], 4)
        self.assertEqual(m["reasoningAnswers"], 3)  # maybe/because, i think, if..then
        self.assertEqual(m["questionsAsked"], 1)     # "Why are they sticky?"
        self.assertEqual(m["originalIdeas"], 3)      # raccoon/window, squirrel/picnic, knock/three
        self.assertAlmostEqual(m["avgAnswerWords"], 8.25, delta=0.1)  # 33 words / 4 turns
        self.assertTrue(0.3 < m["talkShare"] < 0.6)

    def test_quiet_metrics(self):
        m = compute_metrics(QUIET)
        self.assertEqual(m["childTurns"], 3)
        self.assertEqual(m["originalIdeas"], 0)  # "tree" was said by Birbal first
        self.assertEqual(m["reasoningAnswers"], 0)
        self.assertEqual(m["questionsAsked"], 0)

    def test_scores_rank_and_range(self):
        engaged, quiet = score(ENGAGED)["thinkingScore"], score(QUIET)["thinkingScore"]
        self.assertTrue(0 <= quiet < engaged <= 100, (quiet, engaged))

    def test_fewer_hints_scores_higher(self):
        few = score({**ENGAGED, "hintsUsed": 0})["thinkingScore"]
        many = score({**ENGAGED, "hintsUsed": 6})["thinkingScore"]
        self.assertGreater(few, many)

    def test_empty(self):
        self.assertEqual(score({"transcript": []})["thinkingScore"], 0)


if __name__ == "__main__":
    unittest.main()
