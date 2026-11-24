"""사무소 PC에서 홈페이지 관리자 비밀번호를 설정한다. Python 표준 라이브러리만 사용."""
import hashlib
import http.client
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import threading
import time
import tkinter as tk
from tkinter import ttk
import queue
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "jungmyungoffice.com"
PROJECT = "jm-office-homepage"


def password_hash(password):
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def vercel_cli():
    installed = shutil.which("vercel.cmd")
    if installed:
        return Path(installed)
    cached = (Path(os.environ["LOCALAPPDATA"]) / "npm-cache/_npx").glob("*/node_modules/.bin/vercel.cmd")
    return max(cached, key=lambda path: path.stat().st_mtime, default=None)


def configure(password, events):
    stage = "배포 계정 확인"
    try:
        linked = json.loads((ROOT / ".vercel/project.json").read_text(encoding="utf-8"))
        cli = vercel_cli()
        if not cli or linked.get("projectName") != PROJECT:
            raise ValueError("프로젝트 연결 확인 필요")

        def run(*args, data=None):
            return subprocess.run([str(cli), *args], input=data, text=True, encoding="utf-8",
                                  errors="replace", cwd=ROOT, capture_output=True, timeout=240,
                                  creationflags=subprocess.CREATE_NO_WINDOW, check=True).stdout

        args = ["--scope", linked["orgId"]]
        # 항상 현재 운영 도메인에 연결된 배포를 사용한다.
        deploy = json.loads(run("api", f"/v13/deployments/{DOMAIN}", *args))
        if deploy.get("projectId") != linked["projectId"] or deploy.get("target") != "production":
            raise ValueError("운영 대상 불일치")
        stage = "비밀번호 등록"
        run("env", "add", "ADMIN_PASSWORD_HASH", "production", "--force", "--sensitive", "--yes",
            *args, data=password_hash(password))
        stage = "운영 반영"
        events.put(("progress", "비밀번호를 등록했습니다. 홈페이지에 반영하고 있습니다."))
        run("redeploy", deploy["url"], "--environment", "production", *args)
        stage = "실제 홈페이지 로그인 확인"
        body = json.dumps({"password": password}).encode("utf-8")
        for attempt in range(3):
            conn = http.client.HTTPSConnection(DOMAIN, timeout=15)
            try:
                conn.request("POST", "/api/admin", body=body, headers={"Content-Type": "application/json"})
                response = conn.getresponse()
                if response.status == 200 and json.load(response).get("sessionToken"):
                    break
                if response.status not in (401, 503):
                    raise ValueError("로그인 확인 실패")
            finally:
                conn.close()
            if attempt < 2:
                time.sleep(3)
        else:
            raise ValueError("로그인 확인 실패")
        events.put(("done", "설정했습니다. 홈페이지의 관리자 버튼에서 로그인하세요."))
    except Exception:
        events.put(("error", f"{stage} 단계에서 완료하지 못했습니다. 다시 시도해 주세요."))


def main():
    root = tk.Tk()
    root.title("정명 홈페이지 · 관리자 비밀번호 설정")
    root.attributes("-topmost", True)
    box = ttk.Frame(root, padding=20)
    box.pack(fill="both", expand=True)
    ttk.Label(box, text="PC와 휴대폰에서 사용할 비밀번호를 정하세요.").pack(anchor="w")
    fields = []
    for label in ("새 비밀번호 (12자 이상)", "비밀번호 다시 입력"):
        ttk.Label(box, text=label).pack(anchor="w", pady=(10, 2))
        field = ttk.Entry(box, show="●", width=44)
        field.pack(fill="x")
        fields.append(field)
    status = tk.StringVar()
    ttk.Label(box, textvariable=status, wraplength=360).pack(pady=8)
    events = queue.Queue()

    def poll():
        try:
            kind, message = events.get_nowait()
        except queue.Empty:
            root.after(300, poll)
            return
        status.set(message)
        if kind == "progress":
            root.after(300, poll)
        elif kind == "done":
            button.configure(text="관리자 페이지 열기", command=lambda: webbrowser.open(f"https://{DOMAIN}/admin"), state="normal")
            root.protocol("WM_DELETE_WINDOW", root.destroy)
        else:
            for field in fields:
                field.configure(state="normal")
            button.configure(state="normal")
            root.protocol("WM_DELETE_WINDOW", root.destroy)

    def submit():
        if str(button["state"]) == "disabled" or str(fields[0]["state"]) == "disabled":
            return
        value = fields[0].get()
        if not 12 <= len(value) or len(value.encode("utf-8")) > 256 or not value.strip():
            status.set("12자 이상, UTF-8 기준 256바이트 이내로 입력해 주세요.")
            return
        if value != fields[1].get():
            status.set("두 비밀번호가 다릅니다. 다시 확인해 주세요.")
            return
        for field in fields:
            field.delete(0, "end")
            field.configure(state="disabled")
        button.configure(state="disabled")
        status.set("비밀번호를 설정하고 있습니다.")
        root.protocol("WM_DELETE_WINDOW", lambda: status.set("설정 작업을 마친 뒤 닫아 주세요."))
        threading.Thread(target=configure, args=(value, events), daemon=True).start()
        root.after(300, poll)

    button = ttk.Button(box, text="비밀번호 설정", command=submit)
    button.pack()
    fields[0].focus_force()
    root.bind("<Return>", lambda event: submit())
    root.mainloop()


if __name__ == "__main__":
    main()
