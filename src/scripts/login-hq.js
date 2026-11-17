// Login Enter: with script, the headquarters URL opens in an iframe that fills
// the page between the bar and the footer. Without script, Enter stays a link.

const HASH = "#hq";
const OPEN_CLASS = "is-hq";
const ACCOUNT = "demo";

// Registrable domain, last two labels. Enough for enterprise-r.com.
function registrableDomain(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost")) return "";
  if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return "";
  const parts = host.split(".");
  if (parts.length < 2) return "";
  return parts.slice(-2).join(".");
}

// ra.hq.enterprise-r.com under enterprise-r.com is ra.hq.
function hostUnderTld(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const domain = registrableDomain(host);
  if (!domain || host === domain) return host;
  return host.slice(0, -domain.length - 1);
}

export function enhanceEnter(link) {
  if (!link || link.dataset.hqReady === "1") return;
  link.dataset.hqReady = "1";

  const main = link.closest("main.login");
  const card = main && main.querySelector(".login-stack");
  const bar = document.querySelector(".r-bar");
  if (!main || !card) return;

  let shell = null;
  let frame = null;
  let tools = null;
  let lastFocus = null;
  let savedTitle = null;
  let savedIcons = null;
  let iconSig = "";
  let watch = null;
  let savedCrumb = null;

  const fitBar = () => {
    if (!bar) return;
    document.body.style.paddingTop = `${bar.getBoundingClientRect().height}px`;
  };

  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  const onPop = () => {
    if (location.hash === HASH) open({ fromHistory: true });
    else close({ fromHistory: true });
  };

  function open(opts = {}) {
    if (document.documentElement.classList.contains(OPEN_CLASS)) return;
    lastFocus = document.activeElement;

    if (!shell) {
      shell = document.createElement("div");
      shell.className = "login-hq";
      shell.setAttribute("role", "region");
      shell.setAttribute("aria-label", "Headquarters");
      frame = document.createElement("iframe");
      frame.title = "Headquarters";
      frame.src = link.href;
      frame.addEventListener("load", adoptChrome);
      shell.append(frame);

      tools = document.createElement("nav");
      tools.className = "r-group";
      tools.setAttribute("aria-label", "Headquarters");
      const tab = document.createElement("a");
      tab.className = "r-btn";
      tab.href = link.href;
      tab.target = "_blank";
      tab.rel = "nofollow noopener";
      tab.textContent = "Open in new tab";
      const stop = document.createElement("button");
      stop.type = "button";
      stop.className = "r-btn";
      stop.textContent = "Close";
      stop.addEventListener("click", () => close());
      tools.append(tab, stop);
    }

    card.hidden = true;
    main.append(shell);
    const end = bar && (bar.querySelector(".r-bar-end") || bar);
    if (tools && end && !tools.isConnected) end.append(tools);

    document.documentElement.classList.add(OPEN_CLASS);
    showAccount();
    fitBar();
    window.addEventListener("resize", fitBar);
    window.addEventListener("keydown", onKey);
    adoptChrome();
    frame.focus();

    if (!opts.fromHistory && location.hash !== HASH) {
      history.pushState({ hq: true }, "", HASH);
    }
  }

  function close(opts = {}) {
    if (!document.documentElement.classList.contains(OPEN_CLASS)) return;
    document.documentElement.classList.remove(OPEN_CLASS);
    restoreChrome();
    restoreAccount();
    window.removeEventListener("resize", fitBar);
    window.removeEventListener("keydown", onKey);
    document.body.style.paddingTop = "";
    if (shell) shell.remove();
    if (tools) tools.remove();
    card.hidden = false;
    const back = lastFocus && document.contains(lastFocus) ? lastFocus : link;
    back.focus();
    if (!opts.fromHistory && location.hash === HASH) {
      if (history.state && history.state.hq === true) history.back();
      else history.replaceState({ hq: false }, "", location.pathname + location.search);
    }
  }

  function crumbEl() {
    return document.querySelector('.r-crumbs [aria-current="page"]:not(.r-crumb-root)');
  }

  function showAccount() {
    const el = crumbEl();
    if (!el || savedCrumb) return;
    savedCrumb = el.textContent;
    el.textContent = `${ACCOUNT}@${hostUnderTld(new URL(link.href, location.href).hostname)}`;
    el.classList.add("r-crumb-literal");
  }

  function restoreAccount() {
    const el = crumbEl();
    if (!el || savedCrumb == null) return;
    el.textContent = savedCrumb;
    el.classList.remove("r-crumb-literal");
    savedCrumb = null;
  }

  // Readable when the frame was loaded on this origin. A foreign site stays opaque.
  function frameDocument() {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.URL || doc.URL === "about:blank") return null;
      return doc;
    } catch {
      return null;
    }
  }

  function isIcon(linkEl) {
    const rel = (linkEl.getAttribute("rel") || "").toLowerCase().split(/\s+/);
    return rel.some((token) => token === "icon" || token.endsWith("-icon"));
  }

  function readIcons(doc) {
    return [...doc.querySelectorAll("link[rel]")].flatMap((linkEl) => {
      if (!isIcon(linkEl) || !linkEl.href) return [];
      return [{
        rel: linkEl.getAttribute("rel"),
        type: linkEl.getAttribute("type") || "",
        sizes: linkEl.getAttribute("sizes") || "",
        media: linkEl.getAttribute("media") || "",
        href: linkEl.href,
      }];
    });
  }

  function applyIcons(icons) {
    const sig = icons.map((icon) => [icon.rel, icon.type, icon.sizes, icon.media, icon.href].join("|")).join("\n");
    if (sig === iconSig) return;
    if (!savedIcons) {
      savedIcons = [...document.head.querySelectorAll("link[rel]")].filter(isIcon).map((linkEl) => linkEl.cloneNode(true));
    }
    document.head.querySelectorAll("link[rel]").forEach((linkEl) => {
      if (isIcon(linkEl)) linkEl.remove();
    });
    for (const icon of icons) {
      const linkEl = document.createElement("link");
      linkEl.rel = icon.rel;
      if (icon.type) linkEl.type = icon.type;
      if (icon.sizes) linkEl.setAttribute("sizes", icon.sizes);
      if (icon.media) linkEl.media = icon.media;
      linkEl.href = icon.href;
      document.head.append(linkEl);
    }
    iconSig = sig;
  }

  function syncChrome() {
    const doc = frameDocument();
    if (!doc) return;
    const next = doc.title.trim();
    if (next) {
      if (savedTitle == null) savedTitle = document.title;
      if (document.title !== next) document.title = next;
    }
    const icons = readIcons(doc);
    if (icons.length) applyIcons(icons);
  }

  function adoptChrome() {
    const doc = frameDocument();
    if (!doc) return;
    syncChrome();
    if (watch) watch.disconnect();
    const head = doc.head;
    if (!head) return;
    watch = new MutationObserver(() => syncChrome());
    watch.observe(head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["href", "rel", "type", "sizes", "media"],
    });
  }

  function restoreChrome() {
    if (watch) {
      watch.disconnect();
      watch = null;
    }
    if (savedTitle != null) {
      document.title = savedTitle;
      savedTitle = null;
    }
    if (savedIcons) {
      document.head.querySelectorAll("link[rel]").forEach((linkEl) => {
        if (isIcon(linkEl)) linkEl.remove();
      });
      for (const node of savedIcons) document.head.append(node);
      savedIcons = null;
      iconSig = "";
    }
  }

  link.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open();
  });

  window.addEventListener("popstate", onPop);
  if (location.hash === HASH) open({ fromHistory: true });
}
