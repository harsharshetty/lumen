import unittest
from datetime import datetime, timedelta, timezone

from thread_execution_controller import dependencies, parse_owner, priority_for, select_candidates


NOW = datetime(2026, 9, 15, 12, 0, tzinfo=timezone.utc)


def issue(number, owner, minutes_old=60, title="Task", body_extra="", labels=None):
    return {
        "number": number,
        "title": title,
        "body": f"## Owner\n{owner}\n{body_extra}",
        "updated_at": (NOW - timedelta(minutes=minutes_old)).isoformat().replace("+00:00", "Z"),
        "html_url": f"https://github.com/harsharshetty/lumen/issues/{number}",
        "labels": [{"name": label} for label in (labels or [])],
    }


class ControllerDecisionTests(unittest.TestCase):
    def test_parses_known_owner_only(self):
        self.assertEqual("implementation", parse_owner("## Owner\nImplementation & Delivery"))
        self.assertIsNone(parse_owner("## Owner\nUnknown Lane"))

    def test_priority_promotes_p0_and_blockers(self):
        self.assertEqual(0, priority_for("P0 production defect", ""))
        self.assertEqual(0, priority_for("Task", "This is a blocker"))
        self.assertEqual(2, priority_for("Task", "Normal work"))

    def test_dependency_parser(self):
        self.assertEqual({12, 44}, dependencies("Depends on #12 and blocked by #44"))

    def test_selects_one_highest_priority_stale_issue_per_lane(self):
        issues = [
            issue(1, "Implementation & Delivery", title="Normal"),
            issue(2, "Implementation & Delivery", title="P0 blocker"),
            issue(3, "Quality", title="Quality task"),
        ]
        selected = select_candidates(issues, NOW, 15)
        self.assertEqual({("implementation", 2), ("quality", 3)}, {(item.lane, item.number) for item in selected})

    def test_skips_fresh_blocked_and_open_dependency_work(self):
        issues = [
            issue(10, "Implementation & Delivery", minutes_old=5),
            issue(11, "Implementation & Delivery", labels=["blocked"]),
            issue(12, "Quality"),
            issue(13, "Implementation & Delivery", body_extra="Depends on #12"),
        ]
        selected = select_candidates(issues, NOW, 15)
        self.assertEqual([12], [item.number for item in selected])

    def test_ignores_pull_requests(self):
        pr = issue(20, "Implementation & Delivery")
        pr["pull_request"] = {"url": "https://api.github.com/pulls/20"}
        self.assertEqual([], select_candidates([pr], NOW, 15))


if __name__ == "__main__":
    unittest.main()
