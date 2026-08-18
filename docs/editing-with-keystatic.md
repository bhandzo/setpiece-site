# Editing Setpiece with Keystatic

This is the everyday content workflow for Setpiece editors. Keystatic runs on your computer, but it reads from and writes to GitHub. You do not need to edit files, make commits, or push anything yourself.

## Start an editing session

Open your local agent in the `setpiece-site` repository and ask:

> Start the GitHub-backed Setpiece Keystatic editor for me. Use `pnpm dev`, not `pnpm dev:local`. Preserve any unrelated local work, do not edit content directly, and tell me when `http://localhost:4321/keystatic` is ready. If GitHub login needs setup, guide me through it without printing or committing secrets.

The agent should start the development server and keep it running. Open the URL it gives you and log into GitHub. Your GitHub account needs write access to `bhandzo/setpiece-site`, and the Setpiece Keystatic GitHub App must have access to the repository.

The first login may ask you to create or authorize the GitHub App. Follow the Keystatic prompts. Its credentials belong in the ignored `.env` file on your computer and must never be committed.

## Choose where the save goes

Keystatic shows the selected GitHub branch in the editor. Check it before saving:

- `main` means **publish this change now**. Keystatic commits the save directly to GitHub, and Cloudflare automatically starts a production deployment.
- Any other branch means **keep this change out of production for review**. Keystatic still commits directly to GitHub, but the branch must be merged before it can deploy to production.

For the normal Ben-and-Kim workflow, use `main` unless you deliberately want review first.

## Edit and save

Choose the homepage, a collection item, or a blog post in Keystatic. Make the change and select **Save**.

Saving in this workflow:

- creates a GitHub commit on the branch selected in Keystatic;
- does not write the change into your local checkout;
- does not require `git commit` or `git push`; and
- triggers production deployment when the selected branch is `main`.

For blog posts, the `Draft` field adds one more publishing control:

| Selected branch | Draft | Result |
| :-------------- | :---- | :----- |
| `main`          | Off   | The saved post deploys to production. |
| `main`          | On    | The content is saved in GitHub but hidden from production. |
| Other branch    | Either | The content stays off production until that branch is merged. |

Homepage and other site-content changes do not have a draft switch. Saving them to `main` starts publication immediately.

## Confirm publication

After saving to `main`, ask your local agent:

> Confirm that my latest Keystatic save reached `main`, that the resulting deployment completed successfully, and that the changed content is live on `https://setpiece.co`. Do not create another commit or push local files.

A Keystatic save and a successful production deployment are separate events. Do not call the change published until the deployment passes and the live page contains the new content.

## Stop editing

When you are finished, close the browser tab and ask the agent:

> Stop the Setpiece development server you started for this editing session. Do not discard or alter any local work.

## If something goes wrong

- **There is no `/keystatic` page:** confirm the local server is running and use `http://localhost:4321/keystatic`, not `https://setpiece.co/keystatic`.
- **Edits appear as local files:** the server was probably started with `pnpm dev:local`. Stop it and restart with `pnpm dev` for the GitHub-backed workflow.
- **GitHub login fails:** ask the agent to verify that the ignored `.env` file contains the Keystatic credentials and that the GitHub App has repository access. Never paste credentials into chat or commit them.
- **The save succeeded but the site did not change:** check the selected branch, the post's `Draft` field, and the Cloudflare deployment result.
- **The live site still shows the old content:** ask the agent to identify the GitHub commit created by Keystatic and trace that exact commit through the production deployment before making another edit.

## Developer-only local-file mode

`pnpm dev:local` runs Keystatic in local storage mode. In that mode, saves modify files in the checkout and a developer must review, commit, and push them. Editors should not use this mode for the normal content workflow.
