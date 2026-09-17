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

The authoritative sign-in artwork is the self-contained
`frontend/src/assets/signin-left-reference.svg` with SHA-256
`8be52eb9804cd6ca45b92469adab906c9f9876b2a32fbfd46b51ff201aec4c4d`.
The production-container test locks that hash and compares pixels painted by
Chromium against an independent rasterization of the SVG at desktop and mobile
viewports. It also checks asset delivery, decoding, visibility, panel fill,
responsive geometry, and horizontal overflow. The SVG must not be replaced or
modified without an explicit design decision and corresponding gate update.

The production deployment workflow remains downstream of successful CI, so a failed frozen-screen gate prevents deployment.
