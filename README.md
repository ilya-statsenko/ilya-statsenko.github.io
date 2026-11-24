# Ilya Statsenko — personal research website

Static HTML/CSS, no dependencies or JavaScript. Preview: `python -m http.server 8000` from this directory.

Edit biography and publications in index.html; design tokens and responsive layout in style.css. Replace assets/images/profile.webp with an optimized image without metadata.

Publication information was checked against https://corl-team.github.io/namvis/.

Pending: owner-approved latest CV PDF. The supplied brief and older local TeX disagree on graduation date, so exact education dates are omitted. No unapproved CV or private research files are included.

Publish: create a public GitHub repository, push these files, then Settings > Pages > Deploy from a branch > main > / (root). Once the address is known, add canonical and og:url metadata. A CV link can be added after the approved PDF is supplied.


Redesign: locally hosted Space Grotesk, Inter and IBM Plex Mono (OFL licenses in assets/fonts). NAMVIS qualitative views are sourced from the public project page and attributed beside the figure. Motion is optional and respects prefers-reduced-motion. Update contact links in index.html.

V7 integration: field-v7.js is copied verbatim from the supplied reference script. preset.json records frozen values; motion.js mounts it and exposes a reduced-motion-aware toggle. Main column is 760px instead of the 560px laboratory reference; decoration is hidden at widths <=700px. No time-based loop. Visual checks: 1440x900, 1280x800, 390x844; no mobile overflow or console errors. Full five-progress screenshot comparison and system-level reduced-motion emulation were not performed. CV download remains pending a public-ready PDF.
