# Frozen UI regression gates

A Lumen screen is not considered frozen until its approved visual artifact is represented by an automated CI gate.

## Required protections

Frozen screens must be validated against the production-built application before merge. The gate must combine:

1. structural assertions for required landmarks and geometry;
2. asset delivery assertions for approved visual assets;
3. deterministic comparison against the committed approved visual reference;
4. desktop and mobile viewport coverage where the frozen design defines both;
5. retained screenshots and diagnostics from CI failures.

Approved visual references are immutable product artifacts. Updating or replacing a reference is a UX decision and must be explicit in the pull request; implementation code must not silently redefine the baseline.

## Sign-in

The sign-in production-container test checks that the approved artwork is present, decoded, visible, fills the frozen artwork panel, is served from the production bundle, and remains visually within tolerance of `frontend/src/assets/signin-left-reference.jpg` at desktop and mobile viewports.

The production deployment workflow remains downstream of successful CI, so a failed frozen-screen gate prevents deployment.
