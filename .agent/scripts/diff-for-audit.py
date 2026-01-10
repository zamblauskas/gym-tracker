#!/usr/bin/env python3
import subprocess
import time
from pathlib import Path


def get_modified_files():
    result = subprocess.run(
        ["git", "diff", "--name-only"],
        capture_output=True,
        text=True,
        check=True
    )
    return [f for f in result.stdout.strip().split("\n") if f]


def get_new_files():
    result = subprocess.run(
        ["git", "ls-files", "-o", "--exclude-standard"],
        capture_output=True,
        text=True,
        check=True
    )
    return [f for f in result.stdout.strip().split("\n") if f]


def create_audit_file(modified_files, new_files):
    timestamp = int(time.time())
    filename = f"audit-{timestamp}.md"
    
    content_parts = []
    
    if modified_files:
        content_parts.append("# Modified files\n")
        for file_path in modified_files:
            content_parts.append(f"### File: {file_path}\n")
    
    if new_files:
        if content_parts:
            content_parts.append("\n")
        content_parts.append("# New files\n")
        for file_path in new_files:
            content_parts.append(f"### File: {file_path}\n")
    
    content = "\n".join(content_parts)
    
    Path(filename).write_text(content)
    return filename


def main():
    modified_files = get_modified_files()
    new_files = get_new_files()
    
    filename = create_audit_file(modified_files, new_files)
    print(filename)


if __name__ == "__main__":
    main()
