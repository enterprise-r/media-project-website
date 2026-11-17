# www.enterprise-r.com

The Enterprise-R website. Public repo (needed for GitHub Pages on the Free tier). Built with [Astro](https://astro.build), plain HTML/CSS, no frameworks.

Part of [enterprise-r/project-foundation](https://github.com/enterprise-r/project-foundation). Brand files come from [enterprise-r/project-branding](https://github.com/enterprise-r/project-branding). The imported files are recorded in `vendor/MANIFEST`.

Pages: Home (`/`), About (`/about/`), Login (`/r/`), 404 (`/404.html`) and `/showcase/`. The showcase is the web UI, linked from the login page. It is `noindex` and not in the sitemap. `/login/` redirects to `/r/`. Nav links say Login. On `/r/` the breadcrumb says Login until Enter, then `demo@ra.hq`.

## Where things are

| To change… | Edit |
|---|---|
| Page text (title, heading, contact email) | the `page` block at the top of the page in `src/pages/` |
| Logo and favicons | `public/assets/`. The root breadcrumb shows `logo-wide-black.svg` from 48rem and `logo-compact-black.svg` below |
| Styles | `src/styles/`: `palette.css` (colours), `theme/` (Dark-R), `bar.css` (title bar), `footer.css`, `home.css`, `about.css`, `login.css`, `ui.css` (style guide) |
| Shared head, title bar and navigation | `src/layouts/Base.astro` |
| Social links | the `social` list in `src/components/Footer.astro` |
| Showcase sections and tutorial notes | `src/components/showcase/`, one component per section, put in order by `src/pages/showcase.astro` |
| Home and 404 terminal | `src/components/HomeWait.astro` and `src/styles/home.css` |
| Page not found | `src/pages/404.astro` |
| Search engines | `public/robots.txt`, and the indexed pages in `src/pages/sitemap.xml.ts` |
| Fonts | `src/styles/fonts/woff2/`. The theme loads them from `../fonts/woff2/` |
| Custom domain | repo Settings → Pages → Custom domain (Pages source is GitHub Actions, so there is no `CNAME` file) |

A new page is a file in `src/pages/` that uses the `Base` layout. About imports `src/styles/about.css`. Login imports `src/styles/login.css`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages in about a minute. Files can be edited on github.com. Settings → Pages → Source must be **GitHub Actions**.

## Local (optional, Node 24)

```sh
npm ci
npm run dev      # http://127.0.0.1:4321
npm run build    # output in dist/
```

## Pages

The bar is the theme's app bar (`theme/bar.css`): breadcrumbs on the left, links on the right. The root crumb is the black logo, as tall as the crumb: wide from 48rem, compact below, on the theme's root crumb fill and hover. On Home that crumb is the page heading (`h1`) and does not navigate. Breadcrumbs show the active page. A page that also has a nav button leaves the nav while you are on it and shows there as the self-link. On Home the right nav is About and Login. On About it is Login. On Login it is About.

hyper-j is the site wallpaper, set once in `bar.css`. The style guide and the login page keep the flat page colour. Home and the 404 share one terminal and a mote field (`HomeWait.astro`, `Motes.astro`, `home.css`). The 404 turns the terminal 45 degrees. About's plates are in `about.css`.

The footer is a slim stripe: LinkedIn, X and GitHub, inline paths from Simple Icons (CC0). On a short page it sits at the bottom of the window. On the wallpaper the stripe is open and the icons switch to Foreground, so they stay legible on the page behind the stripe.
