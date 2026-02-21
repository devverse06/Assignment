# React Internship Assignment – Art Institute of Chicago Artworks

A React application with a data table displaying artwork data from the Art Institute of Chicago API, featuring server-side pagination and persistent row selection.

## Tech Stack

- **Vite** – Build tool
- **React 19** with **TypeScript**
- **PrimeReact** – DataTable and UI components

## Features

- Displays artwork data: title, place of origin, artist, inscriptions, start date, end date
- **Server-side pagination** – Fetches data per page from the API (no mass data storage)
- **Row selection** – Individual checkboxes, select/deselect all on current page
- **Custom selection overlay** – Select n rows via input (limited to current page to comply with no-prefetch rule)
- **Persistent selection** – Selections persist when navigating between pages (stored by ID only)

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## How to Deploy

Use **Netlify**, **Cloudflare Pages**, or another cloud provider. Do **not** use Vercel.

---

### Option A: Netlify (from Git)

1. Push this project to a **public** GitHub (or GitLab/Bitbucket) repository.
2. Go to [netlify.com](https://www.netlify.com) and sign in.
3. Click **Add new site** → **Import an existing project**.
4. Choose your Git provider and select this repository.
5. Netlify will read `netlify.toml` and set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   Leave these as-is and click **Deploy site**.
6. When the build finishes, your site URL will be shown (e.g. `https://random-name-123.netlify.app`). You can change it in **Site settings** → **Domain management**.

**Netlify (drag & drop, no Git):**

1. On your computer run: `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com) → **Sites** → **Add new site** → **Deploy manually**.
3. Drag and drop the **`dist`** folder (inside your project folder) into the drop zone.
4. Netlify will give you a live URL.

---

### Option B: Cloudflare Pages (from Git)

1. Push this project to a **public** GitHub repository.
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. Your site will be at `https://<project-name>.pages.dev`.

**Cloudflare Pages (direct upload):**

1. Run `npm run build` locally.
2. In Cloudflare: **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
3. Upload the contents of the **`dist`** folder (or the whole `dist` folder as a zip).
4. Cloudflare will give you a live URL.

---

### After deployment

- Use the **live URL** as your “Deployed Application URL” for the assignment.
- If you use a custom domain later, you can add it in the provider’s dashboard (Netlify or Cloudflare).
