# n8n-nodes-ackpost

AckPost community nodes for n8n. Use AckPost in n8n workflows to inspect brands, queues, approvals, proofs, and create draft-first social content without bypassing human review.

AckPost is a proof-backed social publishing platform for agencies and multi-brand teams. Teams use it to plan content, route approvals, migrate queues, publish to connected destinations, and keep proof logs when posts succeed or fail.

- Website: https://ackpost.com
- n8n integration page: https://ackpost.com/integrations/n8n
- MCP/API docs: https://ackpost.com/docs/mcp
- Free migration help: https://ackpost.com/migration

## Status

Private beta source package. Publish to npm only after founder review, GitHub provenance setup, package audit, and final security review.

Important n8n Cloud note: unverified community nodes are not available on n8n Cloud. Until this node is verified, n8n Cloud users should use the free HTTP Request workflow templates at https://ackpost.com/integrations/n8n.

## Supported Operations

| Operation | Scope | Description |
| --- | --- | --- |
| List Brands | Read | Return brands available to the API key. |
| List Queue Items | Read | Inspect scheduled, active, completed, and failed queue work. |
| List Proofs | Read | Read publishing proof records available to the API key. |
| Create Draft | Write | Create a draft in AckPost for human review. Does not publish. |

`Create Draft` is the only write operation in this first package. It creates content inside AckPost for review. It does not publish, schedule, delete, invite users, send replies, approve content, reject content, or change billing.

## Credentials

Create an API key in AckPost:

1. Open AckPost.
2. Go to **Settings > Developer**.
3. Create a scoped API key.
4. Paste it into the n8n **AckPost API** credential.

Use a read-only key for list operations. Use a scoped write key only when a workflow needs to create drafts.

## Installation

This package is prepared for npm/community-node review. After it is published and verified, install it from the n8n node panel or community node settings.

For local development:

```bash
npm install
npm run build
npm pack --dry-run
```

## Example Workflows

AckPost also provides cloud-compatible workflow JSON templates that work through n8n's built-in HTTP Request node:

- AI content agent to AckPost approval queue
- Multi-brand article distribution to AckPost drafts
- Failed publish alert
- Client approval pipeline
- CSV migration assistant
- RSS feed to draft ideas
- Google Sheets content calendar to drafts
- MCP agent publishing stack

Download them from https://ackpost.com/integrations/n8n.

## Safety Boundary

Keep these operations out of public n8n nodes until the corresponding safety review is complete:

- Direct publish
- Schedule
- Delete
- Approval approve/reject
- Send AI replies
- Invite users
- Billing or entitlement changes

AckPost's stronger angle is draft-first automation with approval and proof trails, not silent auto-publishing.

## Development Notes

- Package name must remain `n8n-nodes-ackpost`.
- Keep the `n8n-community-node-package` keyword in `package.json`.
- Do not commit API keys, provider tokens, screenshots with secrets, `.env` files, or customer exports.
- Use temporary AckPost API keys for test runs and revoke them immediately after evidence is captured.

## License

MIT
