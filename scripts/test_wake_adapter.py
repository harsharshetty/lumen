import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

from thread_execution_controller import invoke_webhook


class _CaptureHandler(BaseHTTPRequestHandler):
    payload = None
    authorization = None

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode()
        type(self).payload = json.loads(body)
        type(self).authorization = self.headers.get("Authorization")
        self.send_response(204)
        self.end_headers()

    def log_message(self, format, *args):
        pass


class WakeAdapterIntegrationTest(unittest.TestCase):
    def test_posts_authenticated_wake_payload_to_adapter(self):
        server = HTTPServer(("127.0.0.1", 0), _CaptureHandler)
        thread = threading.Thread(target=server.handle_request, daemon=True)
        thread.start()
        try:
            payload = {
                "source": "lumen-github-controller",
                "repository": "harsharshetty/lumen",
                "lane": "implementation",
                "issue": 121,
                "title": "Build external thread execution controller",
                "url": "https://github.com/harsharshetty/lumen/issues/121",
                "instruction": "Pick up this dependency-ready Lumen work now.",
            }
            invoke_webhook(
                f"http://127.0.0.1:{server.server_port}/wake",
                "test-secret",
                payload,
            )
            thread.join(timeout=2)

            self.assertEqual("Bearer test-secret", _CaptureHandler.authorization)
            self.assertEqual(payload, _CaptureHandler.payload)
        finally:
            server.server_close()


if __name__ == "__main__":
    unittest.main()
