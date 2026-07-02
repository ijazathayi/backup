import ctypes
import sys
import subprocess

# ─── Admin Check ───────────────────────────────────────────────────────────────
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

# ─── Configuration ─────────────────────────────────────────────────────────────
HOSTS_FILE = r"C:\Windows\System32\drivers\etc\hosts"
REDIRECT   = "127.0.0.1"

# ─── Helpers ───────────────────────────────────────────────────────────────────
def flush_dns():
    """Flush Windows DNS cache so blocks take effect immediately."""
    print("\n  [*] Flushing DNS cache...", end=" ")
    result = subprocess.run(["ipconfig", "/flushdns"], capture_output=True, text=True)
    if result.returncode == 0:
        print("Done!")
    else:
        print("Failed (try running as Administrator).")

def get_blocked_sites():
    """Return a list of hostnames currently in the hosts file."""
    blocked = []
    try:
        with open(HOSTS_FILE, "r") as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith(REDIRECT):
                    parts = stripped.split()
                    if len(parts) >= 2:
                        blocked.append(parts[1])
    except FileNotFoundError:
        print(f"\n[ERROR] Hosts file not found: {HOSTS_FILE}")
    return blocked

def normalize(site):
    """Strip http/https/www prefixes and trailing slashes, return bare domain."""
    site = site.strip().lower()
    for prefix in ("https://", "http://"):
        if site.startswith(prefix):
            site = site[len(prefix):]
    # Remove path (keep only domain)
    site = site.split("/")[0]
    # Strip www. to get bare domain
    if site.startswith("www."):
        site = site[4:]
    return site

def get_variants(site):
    """Return both bare domain and www variant."""
    bare = normalize(site)
    www  = "www." + bare
    return [bare, www]

def open_hosts(mode):
    try:
        return open(HOSTS_FILE, mode)
    except PermissionError:
        print("\n[ERROR] Permission denied — please run this script as Administrator.")
        sys.exit(1)

def print_browser_reminder():
    print("\n  " + "─" * 44)
    print("  [!] IMPORTANT — For the block to work:")
    print("      1. Close and reopen your browser")
    print("      2. If the site still loads, disable")
    print("         DNS-over-HTTPS in your browser:")
    print("         Chrome  → Settings → Privacy →")
    print("                   Security → Use secure DNS → OFF")
    print("         Edge    → Settings → Privacy →")
    print("                   Security → Use secure DNS → OFF")
    print("         Firefox → Settings → General →")
    print("                   Network → DNS over HTTPS → OFF")
    print("  " + "─" * 44)

# ─── Actions ───────────────────────────────────────────────────────────────────
def block():
    print("\nEnter websites to block (one per line).")
    print("You can paste full URLs like https://www.twitter.com")
    print("Type 'done' when finished.\n")

    already_blocked = set(get_blocked_sites())
    to_add = []

    while True:
        entry = input("  Site to block: ").strip()
        if entry.lower() == "done":
            break
        if not entry:
            continue

        variants = get_variants(entry)
        added_any = False
        for v in variants:
            if v in already_blocked or v in to_add:
                print(f"  [INFO] '{v}' is already blocked — skipped.")
            else:
                to_add.append(v)
                added_any = True

        if added_any:
            print(f"  Queued  : {variants[0]}  +  {variants[1]}")

    if not to_add:
        print("\n[INFO] No new sites to block.")
        return

    with open_hosts("a") as f:
        for site in to_add:
            f.write(f"\n{REDIRECT} {site}")

    print("\n[SUCCESS] The following have been blocked:")
    for site in to_add:
        print(f"  Blocked : {site}")

    flush_dns()
    print_browser_reminder()

def unblock():
    blocked = get_blocked_sites()

    if not blocked:
        print("\n[INFO] No sites are currently blocked.")
        return

    print("\nCurrently blocked sites:")
    for i, site in enumerate(blocked, 1):
        print(f"  {i}. {site}")

    print("\nEnter sites to unblock — type the name or number.")
    print("Type 'done' when finished.\n")

    to_remove = set()

    while True:
        entry = input("  Site to unblock: ").strip()
        if entry.lower() == "done":
            break
        if not entry:
            continue

        if entry.isdigit():
            idx = int(entry) - 1
            if 0 <= idx < len(blocked):
                to_remove.add(blocked[idx])
                print(f"  Marked : {blocked[idx]}")
            else:
                print(f"  [ERROR] Number {entry} out of range.")
        else:
            # Also try to match www/bare variants
            variants = get_variants(entry)
            matched = False
            for v in variants:
                if v in blocked:
                    to_remove.add(v)
                    print(f"  Marked : {v}")
                    matched = True
            if not matched:
                print(f"  [INFO] '{entry}' not found in blocked list — skipped.")

    if not to_remove:
        print("\n[INFO] Nothing to unblock.")
        return

    kept_lines = []
    with open_hosts("r") as f:
        for line in f:
            stripped = line.strip()
            if stripped.startswith(REDIRECT):
                parts = stripped.split()
                if len(parts) >= 2 and parts[1] in to_remove:
                    continue
            kept_lines.append(line)

    with open_hosts("w") as f:
        f.writelines(kept_lines)

    print("\n[SUCCESS] Unblocked:")
    for site in to_remove:
        print(f"  Unblocked : {site}")

    flush_dns()

def show_blocked():
    blocked = get_blocked_sites()
    if blocked:
        print(f"\n[INFO] {len(blocked)} site(s) currently blocked:")
        for i, site in enumerate(blocked, 1):
            print(f"  {i}. {site}")
    else:
        print("\n[INFO] No sites are currently blocked.")

# ─── Main Menu ─────────────────────────────────────────────────────────────────
def main():
    if not is_admin():
        print("[WARNING] Not running as Administrator.")
        print("          Re-launching with elevated privileges...\n")
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, " ".join(sys.argv), None, 1
        )
        sys.exit(0)

    print("=" * 50)
    print("       Website Blocker (hosts-file method)")
    print("=" * 50)

    while True:
        print("\nWhat do you want to do?")
        print("  1. Block a website")
        print("  2. Unblock a website")
        print("  3. Show all blocked websites")
        print("  4. Quit")

        choice = input("\nEnter choice (1/2/3/4): ").strip()

        if   choice == "1": block()
        elif choice == "2": unblock()
        elif choice == "3": show_blocked()
        elif choice == "4":
            print("\nGoodbye!")
            break
        else:
            print("[ERROR] Invalid choice. Please enter 1, 2, 3, or 4.")

        input("\nPress Enter to continue...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[INFO] Interrupted by user.")
    finally:
        input("\nPress Enter to exit...")