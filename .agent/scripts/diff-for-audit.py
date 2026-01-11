#!/usr/bin/env python3
import subprocess
import re


def run_git_command(args):
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout.strip()


def get_unstaged_modified_files():
    output = run_git_command(["diff", "--name-only", "--diff-filter=d"])
    return [f for f in output.split("\n") if f]


def get_untracked_files():
    output = run_git_command(["ls-files", "-o", "--exclude-standard"])
    return [f for f in output.split("\n") if f]


def parse_hunk_header(line):
    match = re.match(r"^@@.*?\+(\d+)(?:,(\d+))?\s@@", line)
    if not match:
        return None
    
    start = int(match.group(1))
    count = int(match.group(2)) if match.group(2) else 1
    
    if count == 0:
        return None
    
    if count == 1:
        return str(start)
    return f"[{start}-{start + count - 1}]"


def get_modified_lines(file_path):
    output = run_git_command(["diff", "--unified=0", "--", file_path])
    
    line_ranges = []
    for line in output.split("\n"):
        if line.startswith("@@"):
            range_str = parse_hunk_header(line)
            if range_str:
                line_ranges.append(range_str)
    
    return line_ranges


def format_output(modified_files, new_files):
    lines = []
    
    if modified_files:
        lines.append("# Modified files")
        for file_path in sorted(modified_files):
            lines.append("- " + file_path)
            line_ranges = get_modified_lines(file_path)
            if line_ranges:
                lines.append(f"  Lines: {', '.join(line_ranges)}")
    
    if new_files:
        if lines:
            lines.append("")
        lines.append("# New files")
        for file_path in sorted(new_files):
            lines.append("- " + file_path)
    
    return "\n".join(lines)


def main():
    modified_files = get_unstaged_modified_files()
    new_files = get_untracked_files()
    
    output = format_output(modified_files, new_files)
    if output:
        print(output)


if __name__ == "__main__":
    main()
