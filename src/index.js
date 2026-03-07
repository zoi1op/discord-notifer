const axios = require('axios')
const core = require('@actions/core')
const github = require('@actions/github')

const webhook = core.getInput('webhook')

if (github.context.eventName !== 'push') {
  core.setFailed('This action only works on push events.')
  process.exit(1)
}

if (!/https:\/\/discord(app|)\.com\/api\/webhooks\/\d+?\/.+/i.test(webhook)) {
  core.setFailed('Invalid Discord webhook URL.')
  process.exit(1)
}

const { payload } = github.context
const shortSha = (s) => s.slice(0, 6)
const escapeMd = (s) => s.replace(/([\[\]\\`\(\)])/g, '\\$1')

const commits = payload.commits.map(
  (c) => `- [\`[${shortSha(c.id)}]\`](${c.url}) ${escapeMd(c.message)} - by ${c.author.name}`
)

if (!commits.length) process.exit(0)

const { before, after, repository } = payload
const compareUrl = `${repository.url}/compare/${before}...${after}`
const title = core.getInput('message-title') || 'Commits received'

function chunkArray(arr, limit = 4096) {
  const chunks = []
  let current = []
  for (const item of arr) {
    if (current.join('\n').length + item.length > limit) {
      chunks.push(current.join('\n'))
      current = []
    }
    current.push(item)
  }
  if (current.length) chunks.push(current.join('\n'))
  return chunks
}

const allLines = [
  `[\`\[${shortSha(before)}...${shortSha(after)}\]\`](${compareUrl})`
].concat(commits)

const components = chunkArray(allLines).map((chunk, index) => ({
  type: 9,
  ...(index === 0 && { accent_color: 0x5865F2 }),
  components: [
    ...(index === 0 ? [
      { type: 10, content: `## ${title}` },
      { type: 14 }
    ] : []),
    { type: 10, content: chunk }
  ]
}))

axios
  .post(webhook, { flags: 1 << 15, components })
  .then(() => core.setOutput('result', 'Webhook sent'))
  .catch((err) => core.setFailed(`Post to webhook failed: ${err}`))
  