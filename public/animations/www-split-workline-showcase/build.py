#!/usr/bin/env python3
"""Render one diagram frame per www-split status change.

Times are Europe/Madrid (CET, UTC+1) on 2026-11-24.
Issue status comes from GitHub project transitions and close events.
The 10:49 frame is the www-ng#1 merge: the promote landed then, and no
issue changed status for it.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = (ROOT / "source.svg").read_text()
OUT = ROOT

HEAD1 = "Workline armed. r-arch#61 is open, status Todo, assigned to neg3ntropy."
HEAD2 = "Six sub-issues filed, none closed. DNS and hosting are unchanged."
PARENT_BLURB = (
    "Six sub-issues, none closed. neg3ntropy leads. "
    "The Founder still merges the promote pull request."
)
FOOT = (
    "Diagram of the filed workline. r-arch#61 is open. "
    "Nothing here has changed DNS or hosting."
)
SIX = ("web", "docs26", "rmedia", "sys", "r38", "docs27")

# label as it appears in source.svg -> card key
LABELS = {
    "parent": "r-arch#61 · parent · Todo",
    "web": "media-project-website#59 · Todo",
    "docs26": "docs#26 · Todo",
    "rmedia": "r-media#3 · Todo",
    "sys": "sys-github#28 · Todo · after website#59 has landed",
    "r38": "r#38 · Todo",
    "docs27": "docs#27 · Todo",
    "founder": "FOUNDER · NOT AN ISSUE",
}

WORDS = {"todo": "Todo", "active": "In progress", "done": "Done"}
STROKE = {"active": "#F0A202", "done": "#77AF8A"}
FILL = {"active": "#24180e", "done": "#14241c"}


def relabel(label: str, state: str) -> str:
    word = WORDS[state]
    if " · Todo · " in label:
        return label.replace(" · Todo · ", f" · {word} · ", 1)
    if label.endswith(" · Todo"):
        return label[: -len("Todo")] + word
    if label == "FOUNDER · NOT AN ISSUE":
        return "FOUNDER · STORED" if state == "done" else label
    raise SystemExit(f"cannot relabel {label}")


def paint_rect_before(svg: str, label: str, state: str) -> str:
    """Recolor the card rect that sits just before this label."""
    if state == "todo":
        return svg
    i = svg.find(label)
    if i < 0:
        raise SystemExit(f"missing label {label}")
    k = svg.rfind("<rect", 0, i)
    end = svg.find(">", k)
    tag = svg[k:end]
    # Self-closing tags end with "/". Attributes belong before that slash.
    slash = ""
    if tag.rstrip().endswith("/"):
        tag = tag.rstrip()[:-1].rstrip()
        slash = " /"
    tag = re.sub(r'stroke="#[0-9A-Fa-f]+"', f'stroke="{STROKE[state]}"', tag, count=1)
    tag = re.sub(r'fill="#[0-9A-Fa-f]+"', f'fill="{FILL[state]}"', tag, count=1)
    if "stroke-width" in tag:
        tag = re.sub(r'stroke-width="[^"]+"', 'stroke-width="2"', tag, count=1)
    else:
        tag += ' stroke-width="2"'
    return svg[:k] + tag + slash + svg[end:]


def tint_promote(svg: str) -> str:
    """Turn the two promote pills green once www-ng#1 has landed."""

    def repl(m: re.Match) -> str:
        tag = m.group(0)
        tag = tag.replace('stroke="#3F2C53"', 'stroke="#77AF8A"')
        tag = tag.replace('fill="#0C040F"', 'fill="#14241c"')
        if tag.endswith("/>"):
            tag = tag[:-2].rstrip() + ' stroke-width="2.5"/>'
        return tag

    return re.sub(r'<rect x="(?:407|917)" y="322"[^>]*/>', repl, svg)


def status_lines(frame: dict) -> tuple[str, str]:
    done = sum(frame["cards"][k] == "done" for k in SIX)
    if done == 0:
        blurb = PARENT_BLURB
    elif done < 6:
        blurb = (
            f"{done} of 6 sub-issues closed. neg3ntropy leads. "
            "The Founder merges the promote pull request."
        )
    elif frame["cards"]["parent"] != "done":
        blurb = "Six sub-issues closed. neg3ntropy leads. The parent is still open."
    else:
        blurb = (
            "Six sub-issues closed. neg3ntropy leads. "
            "The Founder merges the promote pull request."
        )
    if done == 0 and not frame["promote"]:
        foot = "DNS and hosting are unchanged."
    elif frame["promote"] and done < 4:
        # docs#27 closes on frame 13, the fourth close after website#59.
        foot = "First promote has landed on www. The ng DNS record is not on main yet."
    elif frame["promote"] and frame["cards"]["parent"] != "done":
        foot = "The ng DNS record is on main. The ng certificate is still pending."
    elif frame["cards"]["parent"] == "done":
        foot = "Parent closed. www answers over HTTPS. ng answers over HTTP. mysys will poll."
    else:
        foot = "website#59 is on production main. DNS is unchanged."
    return blurb, foot


def clock(hhmmss: str, date: str) -> str:
    return f'''
  <g id="frame-clock">
    <rect x="1036" y="16" width="376" height="44" rx="4" fill="#050308" stroke="#77AF8A"/>
    <text class="mono" x="1052" y="46" fill="#9ADD6D" font-size="22">{hhmmss}</text>
    <text class="mono" x="1196" y="45" fill="#77AF8A" font-size="13">CET</text>
    <text class="mono" x="1252" y="45" fill="#B6C1CC" font-size="13">{date}</text>
  </g>
'''


def render_svg(frame: dict) -> str:
    svg = SRC
    for old in (
        'url("media/projects/website/src/styles/fonts/woff2/',
        'url("../media/projects/website/src/styles/fonts/woff2/',
    ):
        svg = svg.replace(old, 'url("fonts/woff2/')
    for old, new in (
        ('"ER Audiowide"', '"Audiowide"'),
        ('"ER Rajdhani"', '"Rajdhani"'),
        ('"ER Saira"', '"Saira"'),
        ('"ER Mono"', '"Monaspace Neon"'),
    ):
        svg = svg.replace(old, new)
    svg = svg.replace(HEAD1, frame["head1"], 1)
    svg = svg.replace(HEAD2, frame["head2"], 1)
    for key, state in frame["cards"].items():
        old = LABELS[key]
        new = relabel(old, state)
        if new != old:
            if svg.find(old) < 0:
                raise SystemExit(f"missing {old}")
            svg = paint_rect_before(svg, old, state)
            svg = svg.replace(old, new, 1)
        elif state != "todo":
            svg = paint_rect_before(svg, old, state)
    if frame["promote"]:
        svg = tint_promote(svg)
    blurb, foot = status_lines(frame)
    svg = svg.replace(PARENT_BLURB, blurb, 1)
    svg = svg.replace(FOOT, foot, 1)
    svg = svg.replace("</svg>", clock(frame["clock"], frame["date"]) + "</svg>", 1)
    return svg


# cards: parent, web, docs26, rmedia, sys, r38, docs27, founder
# todo | active | done
BASE = {k: "todo" for k in LABELS}

def cards(**kw) -> dict:
    d = dict(BASE)
    d.update(kw)
    return d


FRAMES = [
    dict(
        n="01", clock="02:26:44", date="2026-11-24",
        cards=cards(), promote=False,
        head1="r-arch#61 open, Todo.",
        head2="0 of 6 sub-issues done.",
        prompt="At 02:26 the workline is armed. r-arch#61 and the six sub-issues are filed, assigned, and on the board as Todo.",
    ),
    dict(
        n="02", clock="09:57:17", date="2026-11-24",
        cards=cards(web="active"), promote=False,
        head1="r-arch#61 open, Todo.",
        head2="website#59 is In progress. 0 of 6 done.",
        prompt="At 09:57 website#59 goes In progress. Pull request www-prod#60 is open.",
    ),
    dict(
        n="03", clock="10:00:16", date="2026-11-24",
        cards=cards(web="done"), promote=False,
        head1="r-arch#61 open, Todo.",
        head2="1 of 6 sub-issues done.",
        prompt="At 10:00 www-prod#60 merges to main and website#59 closes. The env-driven site is on production.",
    ),
    dict(
        n="04", clock="10:03:10", date="2026-11-24",
        cards=cards(web="done", parent="active"), promote=False,
        head1="r-arch#61 open, In progress.",
        head2="1 of 6 sub-issues done.",
        prompt="At 10:03 the parent issue goes In progress.",
    ),
    dict(
        n="05", clock="10:05:49", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active"), promote=False,
        head1="r-arch#61 open, In progress.",
        head2="1 of 6 sub-issues done.",
        prompt="At 10:05 docs#26 goes In progress. Pull request docs#28 is open.",
    ),
    dict(
        n="06", clock="10:05:50", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active"), promote=False,
        head1="r-arch#61 open, In progress.",
        head2="1 of 6 sub-issues done.",
        prompt="One second later r-media#3 goes In progress. Pull request r-media#4 is open.",
    ),
    dict(
        n="07", clock="10:06:50", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active", r38="active"),
        promote=False,
        head1="r-arch#61 open, In progress.",
        head2="1 of 6 sub-issues done.",
        prompt="At 10:06 r#38 goes In progress. Pull request r#39 is open.",
    ),
    dict(
        n="08", clock="10:37:49", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active", r38="active", sys="active"),
        promote=False,
        head1="r-arch#61 open, In progress.",
        head2="1 of 6 sub-issues done.",
        prompt="At 10:37 sys-github#28 goes In progress. The rename and the www-ng record are on sys-github#29.",
    ),
    dict(
        n="09", clock="10:49:34", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active", r38="active", sys="active"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="First promote has landed. 1 of 6 done.",
        prompt="At 10:49 www-ng#1 merges into ng. The first promote fast-forwards production, and www deploys. No issue closes for this.",
    ),
    dict(
        n="10", clock="11:12:44", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active", r38="active", sys="active", docs27="active", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="docs#27 is In progress. 1 of 6 done.",
        prompt="At 11:12 docs#27 goes In progress. The ng DNS row is on the branch. PROMOTE_TOKEN is already stored on www-ng.",
    ),
    dict(
        n="11", clock="11:36:19", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="active", rmedia="active", r38="done", sys="active", docs27="active", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="2 of 6 sub-issues done.",
        prompt="At 11:36:19 r#39 merges to main and r#38 is Done. The mounts are on main.",
    ),
    dict(
        n="12", clock="11:36:20", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="done", rmedia="active", r38="done", sys="active", docs27="active", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="3 of 6 sub-issues done.",
        prompt="At 11:36:20 docs#28 merges and docs#26 is Done.",
    ),
    dict(
        n="13", clock="11:36:22", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="done", rmedia="active", r38="done", sys="active", docs27="done", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="4 of 6 sub-issues done.",
        prompt="At 11:36:22 docs#27 closes on that same merge. The ng DNS record is on main.",
    ),
    dict(
        n="14", clock="11:36:30", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="done", rmedia="active", r38="done", sys="done", docs27="done", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="5 of 6 sub-issues done.",
        prompt="At 11:36:30 sys-github#29 merges and sys-github#28 closes.",
    ),
    dict(
        n="15", clock="11:36:38", date="2026-11-24",
        cards=cards(web="done", parent="active", docs26="done", rmedia="done", r38="done", sys="done", docs27="done", founder="done"),
        promote=True,
        head1="r-arch#61 open, In progress.",
        head2="6 of 6 sub-issues done.",
        prompt="At 11:36:38 r-media#4 merges and r-media#3 closes. bots#16 has landed too. Every sub-issue is Done. The parent is still open.",
    ),
    dict(
        n="16", clock="11:49:45", date="2026-11-24",
        cards=cards(parent="done", web="done", docs26="done", rmedia="done", r38="done", sys="done", docs27="done", founder="done"),
        promote=True,
        head1="r-arch#61 closed, Done.",
        head2="6 of 6 done. ng HTTPS still pending.",
        prompt="At 11:49 the parent closes. www answers over HTTPS and the apex redirects to it. ng answers over HTTP. The ng certificate is still pending, and mysys will poll.",
    ),
]


def main() -> None:
    manifest = []
    for frame in FRAMES:
        svg = render_svg(frame)
        stem = f"{frame['n']}"
        svg_path = OUT / f"{stem}.svg"
        png_path = OUT / f"{stem}.png"
        txt_path = OUT / f"{stem}.txt"
        svg_path.write_text(svg)
        txt_path.write_text(
            f"{frame['date']} {frame['clock']} CET\n\n{frame['prompt']}\n"
        )
        manifest.append({
            "file": png_path.name,
            "svg": svg_path.name,
            "time": f"{frame['date']}T{frame['clock']}+01:00",
            "prompt": frame["prompt"],
        })
        print("wrote", stem, flush=True)
    (OUT / "frames.json").write_text(json.dumps(manifest, indent=2) + "\n")
    for frame in FRAMES:
        stem = frame["n"]
        png = OUT / f"{stem}.png"
        svg = (OUT / f"{stem}.svg").as_uri()
        print("render", stem, flush=True)
        subprocess.run(
            [
                "chromium", "--headless=new", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=1", "--window-size=1440,2244",
                f"--screenshot={png}", svg,
            ],
            check=True,
        )


if __name__ == "__main__":
    main()
