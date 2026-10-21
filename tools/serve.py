#!/usr/bin/env python3
"""Tiny dev server for Tamil Tutor.

    python3 tools/serve.py [port] [folder]     (default 8080, project folder)
    python3 tools/serve.py 8090 dist/portable  (share the offline build on your Wi-Fi)

Serves with caching switched off so a reload always shows your latest edits,
and prints the address to open on your phone.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("directory", os.environ.get("TT_SERVE_DIR", ROOT))
        super().__init__(*args, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    folder = os.path.abspath(os.path.join(ROOT, sys.argv[2])) if len(sys.argv) > 2 else ROOT
    if not os.path.isdir(folder):
        sys.exit(f"no such folder: {folder}")
    os.environ["TT_SERVE_DIR"] = folder
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", port), Handler) as httpd:
        print(f"\n  தமிழ் Tutor is running   (serving {os.path.relpath(folder, ROOT) or '.'})\n")
        print(f"    on this machine : http://localhost:{port}/")
        try:
            import socket

            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            print(f"    on your phone   : http://{ip}:{port}/   (same Wi-Fi)")
        except OSError:
            pass
        print("\n  Tip: open it in the browser, then Add to Home Screen.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  bye\n")


if __name__ == "__main__":
    main()
