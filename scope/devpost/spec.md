---
doc: spec
status: draft
---

# SCOPE — Technical Specification

Sources: [scope.md](./scope.md) and [prd.md](./prd.md).

## How It Works, in Plain Language

Studio and Client are two views in a single HTML page. Studio calculates a visible proposal based on a project's original assumptions and edits. Publishing writes the current offer to this browser's storage and provides a Client URL. Another tab in the **same browser** opens that URL and can read or update the same locally stored session. No cloud API or cross-device database is used by the public site.

## Current Stack and Files

- `scope/index.html`: self-contained HTML, CSS, and vanilla JavaScript for both roles, calculation, rendering, input controls, browser-local API simulation, and session links.
- `scope/README.md`: exact usage instructions and hosting limitations.
- `scope/devpost/`: project-specific planning and ship checklist.
- `.github/workflows/pages.yml`: repository Pages workflow also hosting the `scope/` directory within the published site.

The repository's root React/Vite app is **ClauseMap**, a separate tool, not SCOPE's runtime. Do not attribute ClauseMap's test suite to the SCOPE demo.

## Proposal computation

Implements `prd.md > Studio proposal composition`.

The preview derives an hourly reference rate from baseline fee / baseline hours, and a delivery-capacity reference from baseline hours / baseline days. Additional work hours provide a recommended extra fee and estimate for days. The user can choose different fee and delivery values within the interface constraints. Those values are estimates for discussion, not a guaranteed project plan.

## Browser-local API emulation

Implements `prd.md > Proposal state and feedback`.

- The GitHub Pages adaptation intercepts the original application's endpoint-like requests in the page.
- `localStorage` persists created sessions and response history on the browser origin.
- Client and Studio URLs contain different query parameter keys (`client` / `studio`) and local tokens.
- Only tabs with access to the **same storage origin** see a common session.
- There is no network database, authenticated user, verified consent, or actual sharing capability between devices.

## Client and Studio state

Implements `prd.md > Client evaluation`, `Proposal state and feedback`.

Publish saves an offer and version. Client can inspect it, issue accepted/declined/revision responses, and modify a draft of a counterproposal. Studio refresh can retrieve the local session and bring revised terms into the next published version. Invalid, absent, or unavailable browser-local session data must not be misrepresented as a successfully connected live backend.

## Presentation layer

Implements `prd.md > Look and feel`.

Single-page Studio/Client role views. Fonts loaded from Google Fonts with local fallbacks. Final approved style is pink/dark Studio and cream/light Client with the matched display-font family and accepted type sizing. Shipping-doc changes must not alter `scope/index.html`.

## Where It Runs and How To Try It

Open https://claraaaaaaaaaaa.github.io/clausemap/scope/ in a modern browser. Publish a Studio proposal and copy the Client link into another tab **of that same browser**. Submit an action in Client, return to Studio, and use Refresh. The preview can also be served as a static HTML file with a local HTTP server. No runtime Node server is required for SCOPE itself.

## Verification Plan

1. Compare the `scope/index.html` blob SHA to the final approved commit before and after documentation changes; it must remain unchanged.
2. Open the published page and check that both roles and font styles appear.
3. Edit Studio proposal values, publish, then open the Client link in a second tab of the same browser.
4. Submit a Client counterproposal and observe it after Studio refresh.
5. Test accept/decline and browser refresh states without asserting cross-device synchronization.
6. Capture real browser footage (under 3 minutes), with no fabricated server-sync claims.
7. Verify the published video and submitted Devpost entry separately.

## Risks and Limitations

- Browsers blocking or clearing storage can cause local proposals to disappear.
- Client URLs do not work as true invitations on different browsers/devices.
- Browser API emulation is a demonstration substitute; it is **not** the original FastAPI/SQLite service.
- The current technical stack has no production access controls or legally binding approval.
- There is no SCOPE-specific automated test suite confirmed in this repository.

## Document status

Reconstructed technical draft from the final accepted app and code inspection; does not claim historical pre-build approval or full completion of Devpost Learn Skill Pack.
