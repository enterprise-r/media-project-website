# Dark-R theme

Dark-R is the Enterprise-R web theme: the brand palette, type and components as plain CSS.

The name is Dark-R wherever it is read. In HTML the R is the character ® in Enterprsr (`.r-name-r`), which draws the lone R. Enterprsr has no D, a or k, so the rest of the word stays in the text face. The ® is the picture and is never read: `aria-hidden` on it, and the name in `.r-vh` (components.css) or in a control's `aria-label`.

```html
<span class="r-vh">Dark-R</span><span aria-hidden="true">Dark-<span class="r-name-r">®</span></span>
```

Dark-R is futuristic with a hint of retro, on a fresh palette you don't often see in everyday interfaces. It is made for night mode and for night-light filters that warm the screen in the evening. Its purples and magentas carry a lot of blue, so Dark-R changes more than most themes when the night light comes on.

The theme targets WCAG 2.2 AA.

It needs no framework and no build step. Any page or app can use it with `<link>` tags, in this order. Keep `theme/` and `fonts/` side by side, as in the assets:

```html
<link rel="stylesheet" href="theme/palette.css">
<link rel="stylesheet" href="theme/base.css">
<link rel="stylesheet" href="theme/components.css">
<link rel="stylesheet" href="theme/column.css">
<link rel="stylesheet" href="theme/bar.css">
<link rel="stylesheet" href="theme/foot.css">
<link rel="stylesheet" href="theme/kv.css">
<link rel="stylesheet" href="theme/doc.css">
<script src="theme/rows.js"></script>
<script src="theme/guard.js"></script>
```

The app shell, `column.css` to `kv.css`, is optional: include `column.css` and the parts a page uses. `bar.css` reads the tokens of `column.css`. `doc.css` is optional: include it only on pages that hold documents. `rows.js` is optional too: include it only on pages that use `.r-rows`. It runs on `DOMContentLoaded` (or immediately if the document is already ready) and enhances every `.r-rows` it finds. To enhance a list added later, call `rRows.enhance(element)` or `rRows.enhanceAll(container)`. `guard.js` is optional: include it once on pages that should guard button clicks. It listens on the document and applies to every `button` and `input` of type button, submit or reset, not to links. Add `.r-unguarded` on a control or an ancestor (for example a nav) to opt out.

## Files

| File | What it is | State |
|---|---|---|
| `palette.css` | The `--ui-*` colour variables, the striped gradient and the separator. Generated from `palette/palette.json`; `build.sh` copies it here in `dist/theme/`. | Shipped |
| `base.css` | Fonts and plain HTML elements: body, headings h1-h6 (a ladder of colours; Saira for text, including h2-h3 and the body, Audiowide for impact via `.r-impact` and for h1 by default, Rajdhani uppercase for h4-h6, buttons, pills, crumbs and labels; `--r-font-text`, `--r-font-ui` and `--r-font-heading`), text, lists, quotes, marks, details, figures, tables (rounded outline, header row, row dividers; corner cell radii account for a caption so a filled header stays inside the curve), links, the separator rule, code and keys (Monaspace Neon, `--r-font-mono`), form fields and field groups, radios and checkboxes (Dark-R field look, `--r-choice-*`), progress and meter, dialog, media that scale down, focus ring, text selection. Element selectors sit inside `:where()`, so they weigh nothing and an app's own rules win. Role variables start with `--r-` (text, heading, link, focus, field highlight, choice tokens, font stacks). `.r-name-r` is the picture of the R in the name Dark-R. It loads its fonts from `../fonts/woff2/`, the existing fonts export next to `theme/`. Compact (`.r-compact`) narrows Saira; body text uses it below `40rem`, the bar below `52rem`. | Shipped |
| `doc.css` | The document measure, for long text, scoped to `.r-doc`: the same typography as the rest of the theme, at most `--r-doc-measure` (68ch) wide, with a slightly larger body size. An h1 inside `.r-doc` does not use impact. | Shipped |
| `components.css` | Buttons (`.r-btn`) with the current page (`aria-current="page"`) and the form roles `.r-primary`, `.r-clear` (also any reset button) and `.r-cancel`; no role class is generic. Width and padding are `--r-btn-min`, `--r-btn-pad-x`, `--r-btn-pad-b`, `--r-btn-pad-flat`, `--r-btn-pad-curve` and `--r-btn-tracking`; below `40rem` the min-width and padding scale down, the label stays end-aligned, and curved group ends keep enough inset to clear `--r-pill-r`. Pill groups (`.r-group`, including a single button with both ends curved; the ends are the first and last buttons that show, so a button hidden with `hidden` or an inline `display: none` does not count), groups at the end of their line (`.r-group.r-end`, a form's actions), dropdown menus (`.r-menu`, `.r-menu-list`, `.r-to-right`, `.r-side` for a second level that opens to the left; a checked `menuitemradio` is Green, an open role button keeps its hover), slanted breadcrumbs (`.r-crumbs`, with `.r-crumb-root` for the ® root; crumbs size to their label, `min-width: 0`) and separators (`.r-sep`, `.r-striped`) number columns in tables (`.r-num`), panels and cards (`.r-panel`, `.r-card` with `.r-active` and `.r-selected`), status pills (`.r-pill`), notification boxes (`.r-notice` with `.r-ok`, `.r-warn`, `.r-error`), the terminal panel for text over a picture (`.r-term`), the prompt (`.r-prompt`), the update glow (`.r-glow`, `.r-glow-run` with two laps of a band, and `.r-glow-shape` with `--r-glow-mask` for a box with an open side or a notch), a brief iridescent border that marks a box that just changed, and the dynamic list (`.r-rows`, with `.r-vh` for its live region; it stacks below `30rem` of its own width). The markup for each is in a comment above its rules. | Shipped |
| `column.css` | The measure and the insets the shell shares: `--r-measure` (880px), `--r-text-min`, `--r-text-pad`, `--r-box-gap`, `--r-box-pad`, `--r-text-inline` and `--r-bar-inline`, one inset below `40rem`. The page (`.r-page`: bar, content, footer, at least the window tall), the column (`.r-column`: the content under the bar, clearing `--r-bar-h`), and the step back (`.r-step-back`: a box whose words line up with the text outside it). | Shipped |
| `bar.css` | The app bar (`.r-bar`), fixed across the top on the Border fill: the root on the left (a trail of `.r-crumbs`, or any element), `.r-bar-end` on the right with an actions pill (`.r-group`) and the mark menu (`.r-mark`, a framed picture as tall as a button, sized by `--r-mark-view`, `--r-mark-plate` and `--r-mark-round`). Below `52rem` a trail meets the window edge, square, 8px deep. `--r-bar-pad`, `--r-bar-gap`. | Shipped |
| `foot.css` | The footer stripe (`.r-foot`): the Border fill, the company word in Enterprsr, linked. | Shipped |
| `kv.css` | The key/value table (`.r-kv`): right-aligned keys against a rule, nested tables flush in their cells, `--r-kv-line`. | Shipped |
| `rows.js` | Plain script that enhances any `.r-rows` fieldset: add and remove, keyboard, live-region announcements, `data-name` templates, template rows and size caps. No dependencies, no build step. | Shipped |
| `guard.js` | Plain script that guards button clicks. Moving the pointer (or stopping) accepts presses immediately, including during movement, for `--r-guard-gap2` (10s); the window restarts on each movement. After 10s with no movement, presses stay off until the pointer moves again. An accepted press turns clicks off for `--r-guard-cool` (400ms), then off until movement again. Touch and keyboard use the cooldown only. Only trusted events are judged; clicks a script dispatches, such as `el.click()`, pass through. Acceptance is decided on button press, not release; a discarded press also suppresses the click. A discarded press flashes the waiting cursor for 300ms. Opt out with `.r-unguarded` on the button or an ancestor. No dependencies, no build step. | Shipped |
| `icons/` | Waiting icons: `icons/wait.svg` (animated) and `icons/wait-static.svg` (the full W, unanimated, 128). `icons/wait-cursor.svg` is the same W at 32 CSS px for the `.r-wait` cursor (hotspot 16 16, `progress` fallback). Disabled controls use that cursor too, never the system not-allowed pointer. `--r-icon-wait`, `--r-icon-wait-static` and `--r-icon-wait-cursor` in `base.css`. | Shipped |

## Typography

One typography, with two optional levels. Monaspace Neon (`--r-font-mono`) is for code.

Saira (`--r-font-text`, weight 400) sets the text, including headings. It has a width axis and a real italic, and covers latin, latin-ext and Vietnamese. Rajdhani SemiBold (`--r-font-ui`, weight 600) sets uppercase interface labels, buttons, pills, crumbs and h4-h6, and covers latin, latin-ext and Devanagari. Faces are split by `unicode-range`, so a page only downloads the scripts it uses.

- **Impact** (`.r-impact`): Audiowide (`--r-font-heading`), mainly on h1-h3, and usable on any element. A page h1 uses impact by default; an h1 inside `.r-doc` does not.
- **Compact** (`.r-compact`): narrows Saira to width 85. Body text switches to compact by itself below `40rem`. The bar does so earlier, below `52rem`. Both use the same width. In compact, uppercase buttons, pills and crumbs tighten their letter-spacing (`--r-btn-tracking` from 0.1em to 0.04em, `--r-pill-tracking` from 0.12em to 0.05em), and h4-h6 caps tighten `--r-label-tracking` from 0.16em to 0.08em.

`.r-doc` (`doc.css`) is only the document measure and spacing (`--r-doc-measure`, 68ch), not a second typography.

The all-caps h4 labels use `--r-heading-4` (Yellow), the same gold as visited links.

## Links

Unvisited links use `--r-link` (Bright magenta). Visited links use `--r-link-visited` (Yellow). Hover, visited or not, uses `--r-link-hover` (Bright yellow).

## Buttons, pills and choices

On a wide screen `.r-btn` uses `--r-btn-min` (7rem) and even `--r-btn-pad-x` (0.75rem), with the label tucked to the end (`justify-content: flex-end`), so spare width sits on the start side. Below `40rem` those become `--r-btn-min: 4.75rem`, `--r-btn-pad-x: 0.5rem`, `--r-btn-pad-flat: 0.4rem` and `--r-btn-pad-curve: max(var(--r-btn-pad-x), calc(var(--r-pill-r) * 0.7))`, with tracking `--r-btn-tracking: 0.04em` and `--r-pill-tracking: 0.05em` (from 0.12em). The bar applies that tighter tracking earlier, below `52rem`. Height stays `--r-btn-h` (2rem). Breadcrumbs (`.r-crumbs`) do not use the min-width; they size to their label.

Radios and checkboxes share `--r-choice-size` (1.5rem), `--r-choice-bg`, `--r-choice-border`, `--r-choice-checked`, `--r-choice-mark`, `--r-choice-radius` and `--r-choice-dot`. They use the same field look as text inputs (`appearance: none`, Lighter fill, Dark border, the field focus ring). A checked radio draws a sage inner dot; a checked checkbox a sage fill and a dark check; an indeterminate checkbox a sage dash. Forced colours revert to the native control.

## Dynamic list

`.r-rows` is a fieldset of rows with a quiet add/remove control in a left column the size of a radio (`--r-choice-size`). The × and + are Rajdhani, in Clear (`--r-clear`); hover turns × red (and that row's field borders, with no ring around the row) and + sage (and shows a reserved ghost row whose fields use `--r-clear`). Include `theme/rows.js` on the page.

```html
<fieldset class="r-rows">
  <legend>Team members</legend>
  <div class="r-rows-head" aria-hidden="true"><span></span><span>Name</span><span>Role</span></div>
  <div class="r-rows-list">
    <div class="r-row">
      <span class="r-row-bubble"><button type="button" class="r-row-remove"><span class="r-row-glyph" aria-hidden="true">×</span></button></span>
      <input data-name="team[{i}][name]" data-label="Name, row {n}" placeholder="Name" autocomplete="off">
      <input data-name="team[{i}][role]" data-label="Role, row {n}" placeholder="Role" autocomplete="off">
    </div>
  </div>
  <div class="r-rows-foot">
    <span class="r-row-bubble"><button type="button" class="r-row-add" aria-label="Add row"><span class="r-row-glyph" aria-hidden="true">+</span></button></span>
    <div class="r-row-ghost" aria-hidden="true">
      <input placeholder="Name" disabled tabindex="-1" aria-hidden="true" autocomplete="off">
      <input placeholder="Role" disabled tabindex="-1" aria-hidden="true" autocomplete="off">
    </div>
  </div>
  <p class="r-rows-live r-vh" aria-live="polite"></p>
</fieldset>
```

- `data-name` and optional `data-id` / `data-label` on each field are templates. `{i}` is the 0-based index, `{n}` the 1-based row number. The script writes `name`, `id` and `aria-label` from them whenever rows change.
- Optional attributes on the fieldset: `data-remove` (default `Remove row {n}`, used for the × button's `aria-label`), `data-added` and `data-removed` (live-region announcements, default `Row added` and `Row removed`).
- Keyboard: Enter in the last row adds a row and focuses its first field. Backspace at the start of an empty row (every field blank, above the minimum) removes it and focuses the previous row's last field.
- A new row is cloned from a `<template>` holding an `.r-row` inside the fieldset, or from the last row when there is none. Its fields are reset: text empty, boxes off, selects on their first option.
- `data-min` and `data-max` on the fieldset cap the list. At the minimum the rows cannot be removed and their remove controls are hidden; at the maximum the add button is disabled. The minimum defaults to none with a template and to one row without. The ghost row is not in the tab order (`disabled`, `tabindex="-1"`, `aria-hidden`). `.r-vh` hides the live region visually. Reduced motion drops the row-in animation; forced colours keep the control edges visible.
- Below `30rem` of its own width the list stacks: each row is one column of fields beside its ×, the header row goes and the placeholders name the fields. The ghost row stacks the same way; its fields (inputs, selects, textareas) fill their columns and keep the default pointer.

## App shell

The shell is the frame of a page: the bar, the column, the footer. A site and an app share it; only the root of the bar differs.

```html
<body class="r-page">
  <header class="r-bar">
    <nav class="r-crumbs" aria-label="Breadcrumb"><ol>
      <li><a class="r-btn r-crumb-root" href="/">Home</a></li>
      <li><a class="r-btn" href="/jobs" aria-current="page">jobs</a></li>
    </ol></nav>
    <div class="r-bar-end">
      <div class="r-group"><button type="button" class="r-btn r-cancel">Cancel</button><button type="button" class="r-btn">Run again</button></div>
      <details class="r-menu r-mark">
        <summary aria-label="Menu" aria-haspopup="menu"><img src="mark.svg" alt="" width="32" height="32"></summary>
        <div class="r-menu-list" role="menu" aria-label="Menu">
          <details class="r-menu r-side">
            <summary class="r-btn r-clear" role="menuitem" aria-haspopup="menu">Theme</summary>
            <div class="r-menu-list" role="menu" aria-label="Theme">
              <button type="button" class="r-btn" role="menuitemradio" aria-checked="false">Light</button>
              <button type="button" class="r-btn" role="menuitemradio" aria-checked="true" aria-label="Dark-R"><span aria-hidden="true">Dark-<span class="r-name-r">®</span></span></button>
            </div>
          </details>
        </div>
      </details>
    </div>
  </header>
  <main class="r-column">…</main>
  <footer class="r-foot"><a href="https://www.enterprise-r.com">Enterprise-R</a></footer>
</body>
```

- **Column.** The text is `--r-measure` (880px) wide, centered, at least `--r-text-min` (26px) from the window: `--r-text-inline`. A box pads its sides by `--r-box-pad` and steps back by the same length (`.r-step-back`), so its words line up with the text outside it; `--r-box-gap` (4px) stays outside its border for the glow. The bar's inset, `--r-bar-inline`, lines it up with the boxes. Below `40rem` the text and the bar share `--r-text-pad` (1rem). `.r-column` starts a button's height below the bar; a page whose bar wraps sets `--r-bar-h` to the bar's measured height.
- **Bar.** The root comes first and stays on the left; `.r-bar-end` stays on the right, also when the bar wraps. In the bar a trail's labels sit against the slant. The actions pill ends square against the mark. A disabled button takes the page ground, as the theme's disabled fill is the bar's. Below `52rem` a trail meets the left edge of the window: the first crumb is square, 8px deep, and a lone first crumb is square on the left with its right end still round, never a whole pill. Any other root keeps the inset.
- **Mark.** A menu whose button is a square picture as tall as a button, framed like an active card. The picture is a square view box with a rounded plate centered in it: `--r-mark-view`, `--r-mark-plate` and `--r-mark-round` (128, 120 and 26 by default) fit the plate to the square and the frame to its curve. Focus draws the frame in the focus color. A second level (`.r-menu.r-side`) fills the list's width and opens to its left.
- **Footer.** The Border fill, the company word in Enterprsr in the darkest ink; pointing at it fills the word with the striped gradient. Inside `.r-page` it stays on the bottom of the window.
- Print drops the bar and the footer, and the column keeps the page edge.

## Key/value table

Keys right-aligned against a rule, values beside them; a value may be a table of its own, flush in its cell, parted from the row before by a double rule. The box scrolls when the text runs past it. The lines are `--r-kv-line`.

```html
<div class="r-kv"><table><tbody>
  <tr><th>name</th><td>Weekly report</td></tr>
  <tr><th>owner</th><td><table><tbody>
    <tr><th>team</th><td>Ops</td></tr>
    <tr><th>email</th><td>ops@example.com</td></tr>
  </tbody></table></td></tr>
</tbody></table></div>
```

## Form actions

`.r-group.r-end` is a group at the end of its line: a form's Clear and Send as one pill at the right edge, or a lone Send.

```html
<div class="r-group r-end"><button type="reset" class="r-btn">Clear</button><button type="submit" class="r-btn r-primary">Send</button></div>
```

## Rules

- Standard CSS only: no preprocessor, no nesting, no framework scoping. Newer features need a fallback for browsers without them.
- Colours come only from `--ui-*` variables. To change a colour, change `palette/palette.json`.
- Every class starts with `r-`, so the theme cannot clash with an app's own classes. Custom properties the theme adds for roles start with `--r-`.
- A site's own content (its pages, and what it puts in the bar and the footer) stays in that site.
