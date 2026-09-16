import json
import os
import re
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
INVITES_FILE = ROOT / "convites.json"


def validate(invites):
    if not isinstance(invites, list):
        raise ValueError("O conteúdo deve ser uma lista de convites.")
    hashes = set()
    for invite in invites:
        required = {"names", "note", "companions", "message", "hash", "confirmed", "sent", "confirmed_names"}
        if not isinstance(invite, dict) or not required.issubset(invite):
            raise ValueError("Cada convite deve conter todos os campos obrigatórios.")
        if not isinstance(invite["names"], list) or not invite["names"] or not all(isinstance(name, str) and name.strip() for name in invite["names"]):
            raise ValueError("Cada convite precisa ter ao menos um nome válido.")
        if not isinstance(invite["companions"], int) or invite["companions"] < 0:
            raise ValueError("A quantidade de acompanhantes é inválida.")
        if not isinstance(invite["message"], str) or not invite["message"].strip():
            raise ValueError("A mensagem é obrigatória.")
        if not isinstance(invite["hash"], str) or not re.fullmatch(r"[A-Za-z0-9_-]{12,}", invite["hash"]) or invite["hash"] in hashes:
            raise ValueError("Os códigos devem ser únicos, ter ao menos 12 caracteres e usar apenas letras, números, _ ou -.")
        if not isinstance(invite["note"], str) or not isinstance(invite["confirmed"], bool) or not isinstance(invite["sent"], bool) or not isinstance(invite["confirmed_names"], list) or not all(isinstance(name, str) for name in invite["confirmed_names"]):
            raise ValueError("Um ou mais campos do convite são inválidos.")
        hashes.add(invite["hash"])


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if urlparse(self.path).path == "/api/invites":
            try:
                with INVITES_FILE.open(encoding="utf-8") as file:
                    self.send_json(HTTPStatus.OK, json.load(file))
            except (OSError, json.JSONDecodeError):
                self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Não foi possível ler convites.json."})
            return
        super().do_GET()

    def do_PUT(self):
        if urlparse(self.path).path != "/api/invites":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            invites = json.loads(self.rfile.read(size))
            validate(invites)
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=ROOT, delete=False) as file:
                json.dump(invites, file, ensure_ascii=False, indent=2)
                file.write("\n")
                temporary = file.name
            os.replace(temporary, INVITES_FILE)
            self.send_json(HTTPStatus.OK, {"ok": True})
        except (OSError, ValueError, json.JSONDecodeError) as error:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": str(error)})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
    print("Dashboard: http://127.0.0.1:8765/asd/")
    print("Site principal: http://127.0.0.1:8765/")
    server.serve_forever()
