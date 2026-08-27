#!/usr/bin/env python3
from __future__ import annotations
import argparse
import re
from pathlib import Path

RULES: list[tuple[str, re.Pattern[str], str]] = [
    ("transition-all", re.compile(r"transition-all|transition:\s*all"), "Avoid broad transitions."),
    ("custom-radio", re.compile(r"role=[\"']radio[\"']"), "Verify complete radio keyboard behavior."),
    ("auto-scroll", re.compile(r"scrollIntoView|window\.scrollTo|scrollTo\("), "Verify movement is user-requested."),
    ("conditional-badge", re.compile(r"&&\s*\(\s*<[^>]*(Badge|badge|count)"), "Check whether insertion shifts siblings."),
    ("effect-state", re.compile(r"useEffect\([^)]*set[A-Z]", re.DOTALL), "Check for refetch overwriting user-owned state."),
]
EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".css", ".scss"}
IGNORED = {"node_modules", "dist", "build", ".next", "coverage", ".git"}

def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory likely React UI stability risks.")
    parser.add_argument("root", nargs="?", default=".")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    findings = 0
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix not in EXTENSIONS:
            continue
        if any(part in IGNORED for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for name, pattern, guidance in RULES:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                print(f"{path.relative_to(root)}:{line}: [{name}] {guidance}")
                findings += 1
    print(f"\n{findings} candidate finding(s). Review manually; this audit is intentionally conservative.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
