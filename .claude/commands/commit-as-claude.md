# Commit as Claude

**Usage:** `commit-as-claude [commit message]`

Commits staged changes with Claude Code as the author. **Note:** All commit messages must be in English.

## Implementation

```bash
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: commit-as-claude <commit-message>"
  exit 1
fi

git -c user.name="Claude Code" -c user.email="noreply@anthropic.com" commit -m "$1"
```

## Example

```bash
commit-as-claude "Fix authentication bug in login flow"
```