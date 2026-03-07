import * as core from '@actions/core'
import * as github from '@actions/github'

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
const firstLine = (s) => s.split('\n')[0].trim()
const truncate = (s, max) => s.length > max ? s.slice(0, max - 1) + '…' : s

const rawCommits = payload.commits ?? []
const commits = rawCommits.map(
  (c) => `- [\`[${shortSha(c.id)}]\`](${c.url}) ${escapeMd(firstLine(c.message))} - by ${c.author.name}`
)

if (!commits.length) process.exit(0)

const { before, after, repository } = payload
const repoUrl = repository.html_url
const compareUrl = `${repoUrl}/compare/${before}...${after}`
const title = core.getInput('message-title') || 'Commits received'
const threadId = core.getInput('thread-id')

function chunkArray(arr, limit = 4096) {
  const chunks = []
  let current = []
  let length = 0
  for (const item of arr) {
    const add = (current.length ? 1 : 0) + item.length
    if (length + add > limit) {
      chunks.push(current.join('\n'))
      current = [item]
      length = item.length
    } else {
      current.push(item)
      length += add
    }
  }
  if (current.length) chunks.push(current.join('\n'))
  return chunks
}

const allLines = [
  `[\`\[${shortSha(before)}...${shortSha(after)}\]\`](${compareUrl})`
].concat(commits)

const chunks = chunkArray(allLines)

const components = [
  {
    type: 17, // container
    accent_color: 0x5865F2,
    components: [
      { type: 10, content: `## ${title}` }, // text_display
      { type: 14 },                          // separator
      ...chunks.map((chunk) => ({ type: 10, content: chunk })),
      { type: 14 },                          // separator
      {
        type: 1, // action_row
        components: [
          {
            type: 2,  // button
            style: 5, // link
            label: truncate(`${repository.name}: view changes`, 80),
            url: compareUrl,
            emoji: { name: '🔀' }
          },
          {
            type: 2,  // button
            style: 5, // link
            label: 'Repository',
            url: repoUrl,
            emoji: { name: '📁' }
          }
        ]
      }
    ]
  }
]

const url = new URL(webhook)
url.searchParams.set('with_components', 'true')
if (threadId) url.searchParams.set('thread_id', threadId)

fetch(url.toString(), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ flags: 1 << 15, components })
})
  .then(async (res) => {
    if (!res.ok) {
      const text = await res.text()
      core.setFailed(`Webhook request failed (${res.status}): ${text}`)
    } else {
      core.setOutput('result', 'Webhook sent')
    }
  })
  .catch((err) => core.setFailed(`Post to webhook failed: ${err}`))