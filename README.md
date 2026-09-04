# Chobi

A private photo delivery platform for event photographers and photo booth operators. Clients get a share link to a gallery of their event photos — optionally password protected, optionally time limited — where guests can browse, chat, and download the full-resolution originals.

Built on [Base44](https://base44.com) (React + Vite frontend, Deno backend functions, managed entities with row-level security).

---

## What it does

**For the operator**

- Create an album, get a unique share link
- Upload full-resolution originals; web-sized copies are generated automatically
- Set a password, mark the album public or link-only, set an expiry window
- Manage every album from one control room

**For guests**

- Open the link, enter the password if there is one
- Browse a masonry gallery, open any photo full screen
- Download a single photo, or the whole album as one ZIP
- Chat with other guests on the album — no account needed, just a display name

---

## Architecture

```text
src/
  pages/           Home, AlbumView, AdminPanel, auth pages
  components/      Gallery, lightbox, chat, password gate, admin cards
  lib/             imageResize.js, zipDownload.js, albums.js
base44/
  entities/        Album, Photo, ChatMessage, User (schema + RLS)
  functions/       Deno backend functions
  shared/          albumSecurity.ts — hashing and expiry helpers
```

### Backend functions

| Function | Purpose |
|---|---|
| `createAlbum` / `updateAlbum` | Admin-only album management, password hashing |
| `listAlbums` | Sanitized album list for the home page |
| `getAlbumMeta` | Sanitized single album lookup by slug |
| `verifyAlbumPassword` | Checks a guest's password against the stored hash |
| `getAlbumPhotos` | Password-gated photo access with signed URLs |
| `getAlbumMessages` | Password-gated chat history |
| `postChatMessage` | Validates and stores a guest message |
| `archiveExpiredAlbums` | Optional sweep that marks expired albums |

### Data model

`Album` (title, slug, password hash + salt, visibility, expiry) → `Photo` (original + derivative URIs, dimensions) and `ChatMessage` (text, author, visibility flag).

---

## Security model

This is the part of the project worth reading. Album access has to work for guests who have no account at all, which makes authorization interesting.

### Photos are never public

Originals are stored as private files. Guests never receive a durable URL — `getAlbumPhotos` verifies the password server-side and returns short-lived signed URLs valid for one hour. The frontend refreshes them at 50 minutes so a long browsing session doesn't break.

### Passwords never reach the browser

Album passwords are salted and hashed server-side. The hash and salt live on the `Album` record, which is readable only by admins. Every guest-facing endpoint returns a sanitized projection that omits them entirely.

This was a fix, not an original design. The `Album` entity initially had open read permission and the home page queried it directly from the browser — which meant any visitor could pull every album record, including password hashes and link-only albums, straight from the API. The UI hid them; the data layer didn't. Read access is now admin-only, and guest-facing data flows through `listAlbums` and `getAlbumMeta`, which return only safe fields.

### Chat visibility is denormalized on purpose

Row-level security can express "this row is public." It can't express "this guest typed the right password five minutes ago," because that state only exists in the browser.

So each `ChatMessage` carries an `is_listed` flag, set at write time from its album's actual state (public **and** no password). Read permission is `is_listed OR admin`. Messages from open albums stay readable — and keep working with realtime subscriptions. Messages from protected albums are unreadable through the entity API and are served only by `getAlbumMessages`, which checks the password first.

`updateAlbum` re-syncs the flag across existing messages whenever an album's visibility changes. Without that, adding a password to an album would leave its old messages exposed.

This also replaced a leak: a live feed on the public home page was querying all chat messages with no album filter, surfacing conversations from private, password-protected albums to anyone visiting the site.

### Expiry is enforced live

Every read path compares `expires_at` against the clock at request time rather than trusting a stored status field. The sweep workflow is bookkeeping and can be disabled without weakening access control.

---

## Image pipeline

A 200-photo album of 8MB originals is 1.6GB. Serving that as gallery thumbnails is unusable on a phone, and the platform's image optimizer only works on public URLs — which these deliberately are not.

So derivatives are generated in the browser at upload time (`src/lib/imageResize.js`):

| Copy | Size | Used for |
|---|---|---|
| Thumbnail | ~800px | Gallery grid |
| Web | ~1600px | Lightbox viewer |
| Original | Untouched | Downloads |

WebP where the browser supports it, JPEG otherwise. EXIF orientation is applied so portrait phone shots aren't rotated. Formats the browser can't decode (HEIC, for one) fall back to uploading the original alone, and every display path degrades to it gracefully.

Real pixel dimensions are stored so the masonry grid can reserve space and avoid reflow.

---

## Download as ZIP

"Download all" originally triggered one `<a download>` click per photo. Chrome blocks that after roughly ten, Safari after the first — on a real album the button silently did almost nothing.

`src/lib/zipDownload.js` is a dependency-free ZIP writer. Entries are STORED uncompressed, since JPEGs don't deflate usefully and it avoids pulling in a compression library. Where the File System Access API is available it streams straight to disk, so memory stays flat regardless of album size; elsewhere it buffers with a size guard. Unreachable photos are skipped rather than failing the archive, and filenames are sanitized against path traversal and deduplicated.

---

## Running locally

Requires Node and [Deno](https://docs.deno.com/runtime/getting_started/installation/).

```bash
npm install
npm install -g base44@latest

base44 login   # once per machine
base44 link    # once per clone
base44 dev     # backend + frontend together
```

Open the URL `base44 dev` prints. Don't run `npm run dev` on its own — it serves a UI with no backend behind it.

Entity data under `base44 dev` is in-memory and resets on restart. Use `base44 dev --remote` to work against live data, with the obvious caution that applies.

```bash
npm run build    # production build
npm run lint     # eslint
```

---

## Known limitations

- `getAlbumPhotos` caps at 200 photos with no pagination
- Password hashing is a single round of SHA-256 with a salt — adequate against casual guessing, weak against an attacker who obtains the database
- Deleting an album removes its record and chat but leaves the uploaded files in storage
- The album password is held in `sessionStorage` and sent with each gated request; a short-lived token would be cleaner
