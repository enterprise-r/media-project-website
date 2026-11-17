// Login Enter: with script, the headquarters URL opens in an iframe that fills
// the page between the bar and the footer. Without script, Enter stays a link.

const HASH = "#hq";
const OPEN_CLASS = "is-hq";

export function enhanceEnter(link) {
  if (!link || link.dataset.hqReady === "1") return;
  link.dataset.hqReady = "1";

  const main = link.closest("main.login");
  const card = main && main.querySelector(".login-stack");
  const bar = document.querySelector(".r-bar");
  if (!main || !card) return;

  const url = link.href;
  let shell = null;
  let frame = null;
  let tools = null;
  let lastFocus = null;

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
      frame.src = url;
      shell.append(frame);

      tools = document.createElement("nav");
      tools.className = "r-group";
      tools.setAttribute("aria-label", "Headquarters");
      const tab = document.createElement("a");
      tab.className = "r-btn";
      tab.href = url;
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
    fitBar();
    window.addEventListener("resize", fitBar);
    window.addEventListener("keydown", onKey);
    frame.focus();

    if (!opts.fromHistory && location.hash !== HASH) {
      history.pushState({ hq: true }, "", HASH);
    }
  }

  function close(opts = {}) {
    if (!document.documentElement.classList.contains(OPEN_CLASS)) return;
    document.documentElement.classList.remove(OPEN_CLASS);
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

  link.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open();
  });

  window.addEventListener("popstate", onPop);
  if (location.hash === HASH) open({ fromHistory: true });
}
