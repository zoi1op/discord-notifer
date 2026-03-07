# Discord Notifier

GitHub Action that sends push notifications to Discord using **Message Components v2**.

Each message includes a list of commits with authors and buttons linking to the diff and repository on GitHub.

## Usage

```yaml
- uses: zoi1op/discord-notifer@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    message-title: 'New commits'  # optional
```

For forum channels / threads:

```yaml
- uses: zoi1op/discord-notifer@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    thread-id: '1234567890123456789'
```

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `webhook` | ✅ | Full Discord webhook URL |
| `message-title` | ❌ | Title shown in the message (default: `Commits received`) |
| `thread-id` | ❌ | Discord thread or forum post ID to send into |

## Outputs

| Output | Description |
|--------|-------------|
| `result` | `Webhook sent` on success |

## Getting a Discord webhook

1. Open Discord → go to your channel → **Edit Channel**
2. Go to **Integrations** → **Webhooks** → **New Webhook**
3. Give it a name, choose the channel, click **Copy Webhook URL**
4. In your GitHub repo go to **Settings** → **Secrets and variables** → **Actions**
5. Add a new secret named `DISCORD_WEBHOOK` and paste the URL

> For **forum channels** — get the thread ID by right-clicking the post → **Copy Thread ID** (requires Developer Mode enabled in Discord settings) and pass it as `thread-id`.

## Example workflow

```yaml
name: Notify Discord

on: [push]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: zoi1op/discord-notifer@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          message-title: '🚀 New push to ${{ github.ref_name }}'
```

---

## Development

### Requirements

Install [Bun](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
```

### Setup

```bash
bun install
```

### Build

```bash
bun run build
```

Bundles `src/index.js` and all dependencies into `dist/index.js` — the file GitHub Actions runs directly.

### Project structure

```
├── src/
│   └── index.js      ← edit this
├── dist/             ← built by bun, commit to repo
├── action.yml
├── package.json
└── README.md
```

### After making changes

```bash
bun run build
git add dist/
git commit -m "build"
git push
```

> `dist/` must always be committed — GitHub Actions has no build step and runs `dist/index.js` directly.