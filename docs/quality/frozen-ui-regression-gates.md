# Frozen UI regression gates

A Lumen screen is frozen only when its approved source artwork and its production-browser rendering are protected by CI. Visual references are immutable product artifacts. Updating one requires explicit design approval recorded in the pull request.

## Authoritative source artwork

These exact PNG files are the sole sources of truth:

| Artwork | Source | SHA-256 |
| --- | --- | --- |
| Sign-in hero | `frontend/src/assets/frozen/signin-hero-approved.png` | `e3ebb11145b172714e5549272213720020cd72baba5a25843b6b059bc19683c6` |
| Parent home | `frontend/src/assets/frozen/parent-home-approved.png` | `1678ae7f469d0530e87c500943b6b868190db6fb7dd58c2fceadcaf06a7bbe3d` |
| Learner avatars | `frontend/src/assets/frozen/learner-avatars-approved.png` | `44321821253693fa371da4f5eefab75a8444f7cfa35cd98775808c22e594583b` |

Files previously named `signin-left-reference.svg`, `parent-home-landscape-books.svg`, `learner-avatar-1.svg`, and the `frontend/public/assets/*-approved.webp` files are deprecated historical artifacts. They are not approved references and must not be used to implement or approve a frozen screen. Generated or reconstructed SVGs are not acceptable substitutes for the source PNGs.

The application imports the PNG sources through Vite. Vite may emit content-addressed production files, but it must not replace or modify the committed originals. Learner cards crop the three equal cells of the approved avatar sheet in the browser; no redrawn avatar derivative is permitted.

## CI contract

The frontend job verifies all three source SHA-256 values and confirms that each PNG is present in the production build. The production-container Playwright suite then verifies:

1. the production asset loads and decodes with the approved natural dimensions;
2. the artwork is visible and occupies the intended geometry;
3. the expected `object-fit` and `object-position` rules are active;
4. Chromium-painted pixels match an independent render of the authoritative PNG using the same crop rules;
5. missing, blank, wrong, or substituted artwork fails the pixel gate;
6. the sign-in and parent-home screens have no broken asset requests or horizontal overflow;
7. sign-in and parent-home evidence is retained at 1440×900 and 390×844.

The sign-in test includes a passing negative control which feeds a blank image through the same comparator and asserts that the gate rejects it. This proves the production failure class cannot pass merely because an image element exists or produces a non-empty screenshot.

## Approved updates

To update frozen artwork intentionally, obtain explicit design approval, replace the relevant PNG without recompression, calculate its SHA-256, and update the pinned values in CI, Playwright, and this document in the same reviewed change. The pull request must include before/after browser evidence and explain the design decision. A generated baseline from a failing implementation is not approval.

Production deployment remains downstream of successful CI, so any integrity or rendered-visual failure blocks deployment.
