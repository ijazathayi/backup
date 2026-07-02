/*!
 * Friday Core – Rust HTTP server
 * Enhanced: serde_json parsing, /api/status endpoint, graceful error replies,
 * better path resolution, structured logging.
 */

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;
use std::fs;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

const HOST: &str = "127.0.0.1:7878";
const VERSION: &str = env!("CARGO_PKG_VERSION");

// ─── Request / Response types ──────────────────────────────────────────────────

#[derive(Deserialize)]
struct AskBody {
    command: String,
}

#[derive(Serialize)]
struct StatusBody<'a> {
    status: &'a str,
    version: &'a str,
    uptime_secs: u64,
}

// ─── Entry point ───────────────────────────────────────────────────────────────

fn main() {
    let start = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let listener = TcpListener::bind(HOST).expect("Friday core: could not bind port");
    println!("┌──────────────────────────────────────────────┐");
    println!("│  Friday Core v{VERSION} online at http://{HOST}  │");
    println!("└──────────────────────────────────────────────┘");
    println!("Open http://{HOST} in Chrome or Edge to use the voice interface.\n");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => handle_client(stream, start),
            Err(err) => eprintln!("[Friday] Connection error: {err}"),
        }
    }
}

// ─── Request handler ───────────────────────────────────────────────────────────

fn handle_client(mut stream: TcpStream, server_start: u64) {
    let mut buffer = [0u8; 16384];
    let Ok(size) = stream.read(&mut buffer) else {
        return;
    };

    let raw = String::from_utf8_lossy(&buffer[..size]);
    let mut header_lines = raw.lines();
    let first = header_lines.next().unwrap_or_default();
    let mut parts = first.split_whitespace();
    let method = parts.next().unwrap_or_default();
    let path   = parts.next().unwrap_or("/");

    // CORS pre-flight
    if method == "OPTIONS" {
        send_text(&mut stream, 204, "text/plain", "");
        return;
    }

    // ── Status endpoint ────────────────────────────────────────────────────────
    if method == "GET" && path == "/api/status" {
        let uptime = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
            .saturating_sub(server_start);

        let body = serde_json::to_string(&StatusBody {
            status: "online",
            version: VERSION,
            uptime_secs: uptime,
        })
        .unwrap_or_else(|_| r#"{"status":"online"}"#.to_string());

        send_text(&mut stream, 200, "application/json", &body);
        return;
    }

    // ── Ask endpoint ────────────────────────────────────────────────────────────
    if method == "POST" && path == "/api/ask" {
        let body_str = raw.split("\r\n\r\n").nth(1).unwrap_or_default();

        let command = match serde_json::from_str::<Value>(body_str) {
            Ok(Value::Object(map)) => map
                .get("command")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            _ => {
                // Fallback: try legacy key extraction
                extract_json_value(body_str, "command").unwrap_or_default()
            }
        };

        if command.trim().is_empty() {
            let err = json_reply("error", "No command received.", None);
            send_text(&mut stream, 400, "application/json", &err);
            return;
        }

        eprintln!("[Friday] Command: {command}");
        let reply = ask_python_brain(&command);
        eprintln!("[Friday] Reply:   {reply}");
        send_text(&mut stream, 200, "application/json", &reply);
        return;
    }

    // ── Static file serving ────────────────────────────────────────────────────
    let file_path = web_path(path);
    match fs::read(&file_path) {
        Ok(content) => send_bytes(&mut stream, 200, content_type(&file_path), &content),
        Err(_) => send_text(&mut stream, 404, "text/plain", "Not found"),
    }
}

// ─── Python brain caller ──────────────────────────────────────────────────────

fn ask_python_brain(command_text: &str) -> String {
    let root = locate_project_root();
    let brain = root.join("python-brain").join("brain.py");

    if !brain.exists() {
        return json_reply(
            "error",
            &format!("brain.py not found at {}", brain.display()),
            None,
        );
    }

    let python = find_python();
    if python.is_none() {
        return json_reply(
            "error",
            "Python 3 was not found. Please install Python 3 from python.org and tick Add to PATH.",
            None,
        );
    }
    let python = python.unwrap();

    let mut child = match Command::new(&python)
        .arg(&brain)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(c) => c,
        Err(err) => {
            return json_reply(
                "error",
                &format!("Could not start Python brain: {err}"),
                None,
            );
        }
    };

    if let Some(stdin) = child.stdin.as_mut() {
        let _ = stdin.write_all(command_text.as_bytes());
    }

    match child.wait_with_output() {
        Ok(out) if out.status.success() => {
            let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if stdout.is_empty() {
                json_reply("error", "Python brain returned empty output.", None)
            } else {
                stdout
            }
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
            json_reply("error", &format!("Python brain error: {stderr}"), None)
        }
        Err(err) => json_reply("error", &format!("Python brain failed: {err}"), None),
    }
}

// ─── Python finder ────────────────────────────────────────────────────────────

/// Try several candidate python executables and return the first real Python 3.
/// On Windows the bare "python" command may be a Microsoft Store stub.
/// Priority:
///   1. python-brain/python_path.txt  (explicit override written by startup script)
///   2. FRIDAY_PYTHON env var
///   3. py launcher (installed by official Python installer on Windows)
///   4. Known install paths under LOCALAPPDATA / PROGRAMFILES
///   5. python3 / python on PATH (last resort)
fn find_python() -> Option<String> {
    let root = locate_project_root();

    // 1. python_path.txt written by the startup script
    let path_file = root.join("python-brain").join("python_path.txt");
    if path_file.exists() {
        if let Ok(contents) = fs::read_to_string(&path_file) {
            let candidate = contents.trim().to_string();
            if !candidate.is_empty() && is_real_python(&candidate) {
                eprintln!("[Friday] Python (from python_path.txt): {candidate}");
                return Some(candidate);
            }
        }
    }

    // 2. FRIDAY_PYTHON env var
    if let Ok(custom) = env::var("FRIDAY_PYTHON") {
        let c = custom.trim().to_string();
        if !c.is_empty() && is_real_python(&c) {
            eprintln!("[Friday] Python (from FRIDAY_PYTHON): {c}");
            return Some(c);
        }
    }

    // 3-5. Candidate list
    let mut candidates: Vec<String> = vec![];

    #[cfg(windows)]
    {
        // py.exe launcher
        candidates.push(r"C:\Windows\py.exe".to_string());
        if let Ok(local) = env::var("LOCALAPPDATA") {
            candidates.push(format!(r"{local}\Programs\Python\Launcher\py.exe"));
            for ver in &["313", "312", "311", "310", "39"] {
                candidates.push(format!(r"{local}\Programs\Python\Python{ver}\python.exe"));
            }
        }
        if let Ok(prog) = env::var("PROGRAMFILES") {
            for ver in &["313", "312", "311", "310", "39"] {
                candidates.push(format!(r"{prog}\Python\Python{ver}\python.exe"));
            }
        }
        candidates.push("py".to_string());
    }

    candidates.push("python3".to_string());
    candidates.push("python".to_string());

    for candidate in candidates {
        if is_real_python(&candidate) {
            eprintln!("[Friday] Python (auto-detected): {candidate}");
            return Some(candidate);
        }
    }

    None
}

/// Run `<cmd> --version` and return true only if the output contains "Python 3".
/// This rejects the Windows Store stub which outputs the Store prompt instead.
fn is_real_python(cmd: &str) -> bool {
    match Command::new(cmd).arg("--version").output() {
        Ok(out) => {
            let combined = format!(
                "{}{}",
                String::from_utf8_lossy(&out.stdout),
                String::from_utf8_lossy(&out.stderr)
            );
            combined.contains("Python 3")
        }
        Err(_) => false,
    }
}

// ─── Path helpers ─────────────────────────────────────────────────────────────

/// Walk up from the binary location until we find a folder that contains
/// both `python-brain` and `web`, or fall back to the executable directory.
fn locate_project_root() -> PathBuf {
    // When run via `cargo run` inside rust-core/ the current dir is rust-core/
    let candidates = [
        env::current_dir().ok(),
        env::current_exe().ok().and_then(|p| p.parent().map(Path::to_path_buf)),
    ];
    for base in candidates.into_iter().flatten() {
        for ancestor in base.ancestors() {
            if ancestor.join("python-brain").exists() && ancestor.join("web").exists() {
                return ancestor.to_path_buf();
            }
        }
    }
    // Ultimate fallback: one level up from current dir
    env::current_dir()
        .ok()
        .and_then(|d| d.parent().map(Path::to_path_buf))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn web_path(request_path: &str) -> PathBuf {
    let web_root = locate_project_root().join("web");
    let cleaned  = request_path.trim_start_matches('/');
    if cleaned.is_empty() || cleaned == "index.html" {
        web_root.join("index.html")
    } else {
        web_root.join(cleaned)
    }
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("") {
        "html"        => "text/html; charset=utf-8",
        "css"         => "text/css; charset=utf-8",
        "js" | "mjs"  => "text/javascript; charset=utf-8",
        "json"        => "application/json",
        "svg"         => "image/svg+xml",
        "png"         => "image/png",
        "ico"         => "image/x-icon",
        "woff2"       => "font/woff2",
        "woff"        => "font/woff",
        _             => "application/octet-stream",
    }
}

// ─── HTTP response writers ────────────────────────────────────────────────────

fn send_text(stream: &mut TcpStream, status: u16, ct: &str, body: &str) {
    send_bytes(stream, status, ct, body.as_bytes());
}

fn send_bytes(stream: &mut TcpStream, status: u16, ct: &str, body: &[u8]) {
    let reason = match status {
        200 => "OK",
        204 => "No Content",
        400 => "Bad Request",
        404 => "Not Found",
        _   => "OK",
    };
    let headers = format!(
        "HTTP/1.1 {status} {reason}\r\n\
         Content-Type: {ct}\r\n\
         Content-Length: {}\r\n\
         Access-Control-Allow-Origin: *\r\n\
         Access-Control-Allow-Headers: Content-Type\r\n\
         Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n\
         Cache-Control: no-store\r\n\
         Connection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(headers.as_bytes());
    let _ = stream.write_all(body);
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────

fn json_reply(status: &str, speech: &str, action: Option<&str>) -> String {
    let action_part = action
        .map(|a| format!(",\"action\":\"{}\"", escape_json(a)))
        .unwrap_or_default();
    format!(
        "{{\"status\":\"{}\",\"speech\":\"{}\"{}}}",
        escape_json(status),
        escape_json(speech.trim()),
        action_part
    )
}

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\")
     .replace('"',  "\\\"")
     .replace('\n', "\\n")
     .replace('\r', "\\r")
     .replace('\t', "\\t")
}

/// Legacy manual JSON string extractor (fallback only).
fn extract_json_value(body: &str, key: &str) -> Option<String> {
    let needle = format!("\"{}\"", key);
    let start  = body.find(&needle)?;
    let after  = &body[start + needle.len()..];
    let colon  = after.find(':')?;
    let rest   = after[colon + 1..].trim_start();
    if !rest.starts_with('"') {
        return None;
    }
    let mut value   = String::new();
    let mut escaped = false;
    for ch in rest[1..].chars() {
        if escaped {
            value.push(match ch {
                'n' => '\n', 'r' => '\r', 't' => '\t',
                '"' => '"',  '\\' => '\\', other => other,
            });
            escaped = false;
        } else if ch == '\\' {
            escaped = true;
        } else if ch == '"' {
            break;
        } else {
            value.push(ch);
        }
    }
    Some(value)
}
