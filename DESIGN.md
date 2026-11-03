# AJV Mariner's Inn · Interface design system

## Product context

**Mode:** Persuade (public accommodation website) with a small Operate-mode reservation inquiry dialog and owner-only *demo* inbox. This is a **proposal concept**, not an official reservation service. All room names, layouts, occupancy, imagery, and policies are explicitly illustrative. Publicly listed address must be confirmed by the owner. Prioritize guest trust over conversion claims.

## Visual direction

A refined small-town hospitality identity with coastal influences but **no claim that the property is beachfront**. Easy navigation and generous photographic zones, ready to receive authentic property photos. Retain the established navy–teal–sand visual identity, serif display headings, and clean sans-serif body text.

### Durable tokens

| Token | Value | Use |
|---|---|---|
| `--navy` | `#153b45` | Primary CTAs and heading identity |
| `--navy-deep` | `#0f2c35` | Dark panels, footer |
| `--teal` | `#417b78` | Secondary emphasis |
| `--gold` | `#bc9366` | Restrained accent |
| `--ivory` | `#f7f5ef` | Warm neutral surface |
| `--ink` | `#233439` | Primary text |
| `--text-secondary` | `#4b625c` | Legible descriptions |
| `--focus-ring` | `#b77d36` | Visible keyboard focus |
| `--control-height` | `48px` | Form inputs |

**Typography:** Playfair Display for headlines; DM Sans for reading text and controls; Georgia and system sans as offline fallbacks. Body 16px. Supporting body text >=14px. UI metadata >=12px except tiny illustration labels. Input text >=16px on touch devices.

**Components:** Rectilinear CTAs with soft hover lift; editorial room cards; bordered input fields with explicit focus; native `<dialog>` overlays with 44px minimum close controls. Keep unverified details labeled near the relevant component, not hidden in the footer.

## Key guest flows

1. Browse concept rooms and illustrations. All availability and capacities are demonstrations, not real inventory.
2. Enter dates and guests and continue to an inquiry, not a booking confirmation.
3. Review / complete inquiry; browser-only demo storage or separately configured Netlify Forms mode.
4. View clear success with a **pending staff confirmation** state. No payment capture, live room calendar, or automatic confirmations.

## Responsive and accessibility rules

- Mobile navigation works at 950px and below; 44px touch targets for key controls.
- Mobile bar preserves request CTA outside dialogs.
- Prevent text clipping at 320px width and at browser zoom; allow wrapping.
- Keyboard visible focus, labeled fields, screen-reader status messages, native `<dialog>` focus trap, reduced-motion behavior.
- Browser-only demo inbox is not a shared staff dashboard and must remain clearly identified.
- No public indexing until the owner approves exact property facts and production operations.

## Launch exclusions

Never imply actual pricing, room inventory, beachfront access, amenities, customer reviews, payment support, or real-time availability without owner verification. Owner presentation and sample guest flow are **pitch-only**. Data and privacy compliance and form notifications require approval and production testing.
