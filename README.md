# AJV Mariner's Inn · Website Concept MVP

A mobile-first, pitch-ready lodging website prototype prepared for **AJV Mariner's Inn, Tukuran, Zamboanga del Sur**. Built with plain HTML, CSS, and JavaScript; no build process or paid dependencies.

## Included

- Polished responsive landing page with rooms, gallery, directions, FAQ and inquiry CTA
- Three **explicitly fictional room concepts** with local SVG concept artwork (not real rooms, inventory, or photos)
- Booking bar with dates and guest input
- Validation and a reservation inquiry form that **never claims confirmed room availability**
- Browser-only demo inquiry storage, owner preview, CSV export, and clearing demo records
- Optional production integration with **Netlify Forms** (requires owner approval and configuration)
- Source code ready for GitHub and Netlify drag-and-drop deployment

## Quick start

Open `index.html` in a modern browser. For a local HTTP preview:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Owner demo walkthrough

1. Open the home page and show mobile navigation, room concepts, gallery, and the published location.
2. Choose dates for a future stay and submit the booking bar.
3. Complete the reservation inquiry with **sample** guest details.
4. Show the resulting **DEMO reference** and pending confirmation status.
5. Select **For the owner / Owner preview → View demo inquiry inbox** and show the inquiry.
6. Export the demo inquiries as CSV, then explain that the owner can receive real inquiries once Netlify Forms is explicitly enabled.

## Demonstration vs production (important)

The site ships in `demo` mode by default in `js/config.js`.

| Mode | What happens |
|---|---|
| `demo` | Requests are saved only in this browser's `localStorage`. No email is sent and no room is booked. |
| `netlify` | The inquiry form POSTs to Netlify Forms. Netlify must successfully detect the static form on deploy and the owner must configure notifications. Still **not** a confirmed booking. |

The **Owner Preview** inbox works only for demo browser data. In production, use the Netlify Forms submissions dashboard and owner-configured notifications; the demo inbox is not a shared staff dashboard.

### Netlify deployment

1. Push all files to a new GitHub repository (suggested: `ajv-mariners-inn-mvp`).
2. In Netlify choose **Add new project → Import an existing project**, select the repository.
3. No build command is needed; publish directory is `.` (the repository root).
4. Leave `mode: 'demo'` for the owner pitch and deploy it as a clearly labeled demo only.
5. For live form submissions **after owner sign-off**, change `mode` to `'netlify'` in `js/config.js`, redeploy, enable Forms in Netlify, and configure owner-approved notification email(s).
6. Submit a TEST inquiry, verify it appears in Netlify Forms and that notification emails arrive. Never treat an untested Netlify deployment as a live booking system.
7. Have the owner approve a proper privacy notice, storage/retention policies, and your consent text; configure anti-spam and access controls.
8. Once facts are verified and all features tested, remove the `noindex,nofollow` meta tag, update SEO metadata and custom domain, and submit the site to Google Search Console.

**Note:** Netlify Forms has plan-dependent limits. Confirm the current Netlify plan's Forms allowance, spam protection, and notification behavior before production.

## Owner approval checklist (must complete before public launch)

- [ ] Legal brand name, approved logo and identity
- [ ] Exact street address, map pin, entrance, and directions
- [ ] Verified official phone number, email, Facebook/Messenger URL
- [ ] Real room inventory, names, maximum occupancy, bed setup, inclusion details
- [ ] Nightly rates, seasonal rates, additional guest charges, taxes, surcharges
- [ ] Actual photographs for property exterior, room interiors and common areas
- [ ] Check-in/check-out, cancellation, deposits, payment methods, refund policies
- [ ] Privacy notice, consent, personal-data retention and deletion workflows
- [ ] Email delivery, staff responsibilities, response-time expectations and form testing
- [ ] Owner approval of public claims and final SEO information

## Data integrity

The publicly indexed business listing provided the address **V. Enriquez St, Tukuran, 7019 Zamboanga del Sur, Philippines**. This is labeled as a publicly listed location and **still requires owner confirmation**. Do not confuse this business with **AJ Beach Resort**, a separate establishment in Tukuran.

Do not present sample room illustrations as actual room photographs, or the illustrated map as geographical navigation. The only directions CTA goes to a Google Maps place search.

## Folder structure

```
index.html
css/styles.css
js/config.js
js/app.js
js/inquiry-utils.js
tests/inquiry-utils.test.js
DESIGN.md
assets/hero-scene.svg
assets/room-classic.svg
assets/room-twin.svg
assets/room-family.svg
assets/favicon.svg
```

## Production enhancements (outside this MVP)

- Authenticated staff dashboard with a real database, role-based access, audit log
- Availability calendar that is synchronized with walk-in/phone/OTA bookings
- Automated confirmations only when inventory is actually reserved
- Secure online payments, approved receipts and refunds
- Staff-managed room photography/rates/content CMS
- Google Business Profile, Search Console and analytics with consent

## Ownership and delivery

P2 Digital Works can deliver a one-time website project and separately offer maintenance and support. Owner-controlled hosting, domain, Forms inbox and analytics accounts are recommended.

## Quality checks (refined MVP)

Run `node --test tests/inquiry-utils.test.js` and `node --check js/app.js` after changes. The former covers date validation, calendar boundaries, room filtering, and CSV formula injection protection. The latter covers JavaScript syntax. The revised `DESIGN.md` captures the site’s visual and behavioral constraints.

**Owner-pitch shortcut:** Open **Owner preview → Try guest booking flow**. The inquiry form preloads fictional guest details and future dates. You can also select **Use sample guest details** within the guest form. This prevents the pitch from requiring real personal data.

**Browser verification:** `python tests/browser_smoke.py` runs Chromium against an offline inlined copy of the production HTML, CSS, JS and SVG assets. It tests 320/390/768/1440px layouts, interactive form submissions, owner demo inbox, and mobile navigation. Normal browser navigation in the review sandbox is restricted, so this is not a deployed-site or Netlify endpoint test. Before production, check actual hosting, form notifications, privacy, accessibility and real devices.
