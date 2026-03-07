# Discord Notifier

GitHub Action that sends push notifications to Discord using webhook and new discord **Message Components v2**.

## Usage

```yaml
- uses: your-username/discord-notifier@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    message-title: 'New commits'
```

## Setup

Add your Discord webhook URL as a repository secret named `DISCORD_WEBHOOK`.

## Development

```bash
npm install

# Build bundle (required before committing)
npm run build
```

> The `dist/` folder must be committed to the repo — GitHub Actions runs from it directly.

## Project structure

```
├── src/
│   └── index.js      # source code (edit this)
├── dist/             # built bundle (commit this)
├── action.yml
├── package.json
└── .gitignore
```
