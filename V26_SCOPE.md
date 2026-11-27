# AMPLOP V26 Scope

## Business Objectives
Transition AMPLOP V25 from self-service SaaS to an admin-managed digital wedding invitation service. Visitors discover five approved designs and place orders exclusively through WhatsApp at `6285786755308`. The business owner prepares and deploys each invitation. Clients receive a finished invitation and tools to personalize guest links, without access to design editing. Guests view their personalized invitation.

The transition preserves historical V25 functionality and artifacts; it does not authorize deleting them. Preserve the five original designs, their approved assets, animations and music, and the original V14 rendering engine. No pricing, validity, refund, upload, or commercial policy is established by this scope.

## User Permissions
| User | Allowed | Not allowed |
|---|---|---|
| Public visitor | Browse the five-design portfolio, open interactive demos, select a design, order via WhatsApp | Register, log in, edit invitations |
| Admin / business owner | Create isolated client projects; edit design, wedding details, photos, music, colors, and typography; save/reopen drafts; preview, revise, export, and deploy completed invitations | Expose private drafts or Admin Studio as public application features |
| Paying client | View the completed invitation; enter guest names; generate personalized invitation URLs/messages; copy and share via WhatsApp | Edit design or wedding content |
| Invited guest | View the personalized invitation and supported guest-facing interactions | Edit invitation content |

## Architecture
1. **Public Portfolio Website:** Five design portfolios, interactive demos, and WhatsApp-only ordering.
2. **Local Private Admin Studio:** Owner-operated project authoring and export. Keep editor code and private drafts out of public deployment artifacts.
3. **Client Invitation Sharing Tool:** Client-facing guest-name entry and personalized link/message generation, without design/content editing.
4. **Published Invitation Website:** Completed invitation presentation with guest-facing interactions and personalized guest context.

Keep these as clear product/security boundaries. This scope does not prescribe a new framework or permit unnecessary dependencies. Admin Studio remains private and local; deployment is for completed invitation output only. Preserve stable personalized invitation URLs when an invitation is revised.

## Functional Requirements
- Support five distinct original designs: The Secret Letter, Cinematic Romance, The Wedding Editorial, The Enchanted Garden, and Our Story.
- Preserve V14 rendering, assets, animation behavior, and music interactions.
- Keep portfolio ordering exclusively on WhatsApp `6285786755308`.
- Admin-managed projects must be independent, with draft save/reopen, preview, revision, export, and completed-invitation deployment capability as later milestones deliver them.
- Client sharing must support guest-name entry, personalized URL and message generation, copying, and WhatsApp sharing, without design or wedding-content editing.
- Guests can view invitation details, photos, animations, and supported guest-facing interactions.
- Do not claim online RSVP works without an implemented and verified backend.
- Do not add customer authentication, Midtrans, a public invitation builder, a customer wedding planner, or Supabase for the initial release.

## Security Requirements
- Exclude editors and private drafts from public deployment artifacts. Hidden routes and `noindex` are not access control.
- Isolate all client projects and prevent cross-project reads or writes.
- Treat guest names and all external input as untrusted. Validate values and contextually encode output to prevent HTML/script injection.
- Construct personalized URLs using safe URL encoding; do not permit arbitrary unsafe URL, HTML, or CSS input.
- Keep invitation URLs stable across revisions while ensuring revisions update the intended invitation only.
- Never commit real client data or credentials to the existing public repository. Use fictional test data.
- No deployment, production data change, service provisioning, or live payment is implied by this scope. Preview deployment requires its authorized roadmap milestone and owner approval.
- Do not present previews, public link secrecy, or `noindex` as privacy/access-control guarantees.

## Milestone Acceptance Criteria
| Milestone | Acceptance criteria |
|---|---|
| **V26.1 Project Foundation** | Active branch `feature/v26-managed-invitation` and clean worktree verified before edits; update only `AGENTS.md`; create `V26_SCOPE.md` with objectives, permissions, architecture, functional and security requirements, milestone criteria, and roadmap; preserve compatible engineering/security and usage rules; no source, dependencies, migrations, reference assets, builds, installs, deployments, commits, or pushes changed/run. |
| **V26.2 Public Portfolio and WhatsApp Checkout** | COMPLETE: Public visitors can browse all five original designs, open interactive demos, select a design, and start an order using WhatsApp `6285786755308`; no registration, login, or editing is exposed; approved visual and interaction behavior remains intact. |
| **V26.3 Private Admin Studio** | Owner can create independent client projects, edit the required invitation fields/media/style, save and reopen drafts, preview, revise, and export; studio and draft data stay private/local and are excluded from public deployment artifacts. |
| **V26.4 Client Invitation Sharing Tool** | Client can enter guest names for a completed invitation, generate personalized URLs and invitation messages, copy them, and share through WhatsApp; client cannot edit design or wedding content; URL generation is safely encoded and invitation URLs remain stable through revisions. |
| **V26.5 Personalized Invitation Engine** | Published personalized invitations render the correct completed content and guest context using the V14 engine and approved designs/assets/interactions; untrusted names are safely handled; guests have no editing capability; do not claim online RSVP absent a verified backend. |
| **V26.6 Security and Automated Testing** | Automated tests cover project isolation, authorization boundaries, untrusted guest-name handling/XSS, URL construction and stability, public artifact exclusion, and critical invitation rendering; all scoped security checks pass with documented evidence and no real client data/credentials in the repository. |
| **V26.7 Vercel Preview Deployment** | With explicit owner approval, completed invitation output deploys to a protected Vercel preview; private studio/editor and drafts are absent; preview behavior, stable URLs, access boundaries, and deployment artifact contents are verified. No public production launch is implied. |
| **V26.8 Commercial Readiness** | Owner-approved commercial policies and operational/support/privacy terms are documented; rights and content handling, client delivery, deployment and rollback, security, and release gates are verified; no invented pricing, validity, refund, or upload policy is treated as approved. Any production launch remains separately authorized. |

## V26 Development Roadmap
1. V26.1 Project Foundation
2. V26.2 Public Portfolio and WhatsApp Checkout
3. V26.3 Private Admin Studio
4. V26.4 Client Invitation Sharing Tool
5. V26.5 Personalized Invitation Engine
6. V26.6 Security and Automated Testing
7. V26.7 Vercel Preview Deployment
8. V26.8 Commercial Readiness

V26.1 Project Foundation and V26.2 Public Portfolio and WhatsApp Checkout are complete. V26.3 Private Admin Studio is the only currently authorized milestone. Keep the studio local-only, serve only `admin-studio/` on 127.0.0.1, and exclude it from the independent `portfolio/` artifact. Do not deploy, commit, or push. Later milestones are planning criteria, not authorization to implement. Stop after V26.3.