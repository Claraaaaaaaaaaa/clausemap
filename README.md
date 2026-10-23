# ClauseMap

ClauseMap is a submission preflight inspector for **Build With AI: Basics**. Enter a public GitHub repository URL to check whether the repository can be read and whether `scope.md`, `prd.md`, and `spec.md` exist as regular files anywhere on its default branch. Each machine finding opens an Evidence Inspector with an observed fact, pinned commit or path, official-rule context, limitation, and next action.

It checks **file presence, not document contents or overall compliance**. Video, eligibility, and the Devpost form require your own review. Self-confirmations are local browser declarations and never become machine-verified findings.

## Run locally

Requires a current Node.js LTS release and npm. No GitHub login or API key is needed.

```sh
npm ci
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173/`). To run the trust-boundary tests and production build:

```sh
npm run test
npm run build
```

The public GitHub API must be reachable from the browser. Anonymous API rate limits, network errors, invisible repositories, and incomplete file trees produce `Unable to verify` where appropriate; they are not treated as missing files. A URL with `?repo=owner/repo` reopens that repository and performs a **new** live inspection. Machine results are never restored from storage.

## GitHub Pages

The included workflow builds with `VITE_BASE_PATH` set to `/<repository-name>/` and deploys `dist/` from `main` to project Pages. After creating a **public** GitHub repository and pushing this source, select **Settings → Pages → Build and deployment → GitHub Actions**. Publishing is a separate action; this local build does not create a remote repository or push code.

For a local project-path production preview:

```sh
VITE_BASE_PATH=/clausemap/ npm run build
VITE_BASE_PATH=/clausemap/ npm run preview
```

Then open `http://localhost:4173/clausemap/`. If the repository is an account-root Pages repository (`<owner>.github.io`) or uses a custom domain, set `VITE_BASE_PATH=/` instead and adjust the workflow before publishing. The app has no client-side path router; the query string carries only the repository identity.

## Evidence contract

- `Verified`: GitHub provided inspectable evidence for the narrow stated claim.
- `Missing`: a complete, commit-pinned recursive tree proves a required regular filename is absent.
- `Unable to verify`: the available response cannot support a reliable decision.
- `Needs confirmation`: human review has not been declared.
- `Self-confirmed`: the user declared review complete in this browser; no machine verification occurred.

Source rules: [Build With AI: Basics official rules](https://learn-ai-basics.devpost.com/rules). The rules are captured as a small, static, source-linked catalog in `src/rules.ts`. License and other recommendation-only material are not automatic failure checks.

`design/reference/fashion-noir-v1.1.html` is a preserved visual prototype with simulated interactions. It is not the production app; production findings come only from live GitHub requests.
