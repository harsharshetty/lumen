import unittest

from lane_execution_worker import GithubTools, LANE_ROLES, MAX_CHANGED_FILES, output_text, function_calls


class LaneExecutionWorkerTests(unittest.TestCase):
    def test_all_supported_lanes_have_roles(self):
        self.assertEqual(
            {"implementation", "quality", "platform-architect", "ux", "pm"},
            set(LANE_ROLES),
        )

    def test_extracts_output_text_and_function_calls(self):
        response = {
            "output": [
                {"type": "message", "content": [{"type": "output_text", "text": "done"}]},
                {"type": "function_call", "name": "get_issue", "call_id": "abc", "arguments": "{}"},
            ]
        }
        self.assertEqual("done", output_text(response))
        self.assertEqual(["get_issue"], [call["name"] for call in function_calls(response)])

    def test_file_cap_is_eight(self):
        self.assertEqual(8, MAX_CHANGED_FILES)

    def test_worker_has_no_merge_tool(self):
        tools = GithubTools(repo="o/r", token="t", issue=1, lane="implementation", branch="b")
        with self.assertRaisesRegex(RuntimeError, "unknown tool"):
            tools.execute("merge_pull_request", {})


if __name__ == "__main__":
    unittest.main()
