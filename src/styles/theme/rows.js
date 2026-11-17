/* Dark-R dynamic list. Enhances any .r-rows that has a .r-rows-list and a
   .r-row-add: add and remove rows, keyboard, live-region announcements, and
   data-name="…{i}…" templates (also data-id and data-label; {i} is the
   0-based index, {n} the 1-based row number). A new row is cloned from a
   <template> in the .r-rows, or from the last .r-row if there is no
   template. The clone's fields are reset: text empty, boxes off, each
   select on its first option. data-min and data-max on the .r-rows cap the
   list: remove is disabled at min, add at max. With a template, min
   defaults to 0; otherwise it defaults to 1. No dependencies.
   <script src="theme/rows.js"></script> */
(function (global) {
  "use strict";

  var TOKEN = /\{i\}|\{n\}/g;
  var ready = new WeakSet();

  function fill(template, i, n) {
    return String(template).replace(TOKEN, function (tok) {
      return tok === "{i}" ? String(i) : String(n);
    });
  }

  function bound(root, name, fallback) {
    var raw = root.getAttribute(name);
    if (raw === null || raw === "") return fallback;
    var n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function enhance(root) {
    if (!root || ready.has(root)) return;
    var list = root.querySelector(".r-rows-list");
    var addBtn = root.querySelector(".r-row-add");
    var live = root.querySelector(".r-rows-live");
    if (!list || !addBtn) return;
    ready.add(root);

    var tpl = root.querySelector("template");
    var addedMsg = root.getAttribute("data-added") || "Row added";
    var removedMsg = root.getAttribute("data-removed") || "Row removed";
    var removeTpl = root.getAttribute("data-remove") || "Remove row {n}";
    var min = bound(root, "data-min", tpl ? 0 : 1);
    var max = bound(root, "data-max", Infinity);

    function rows() {
      return Array.prototype.slice.call(list.querySelectorAll(":scope > .r-row"));
    }

    function announce(msg) {
      if (!live) return;
      live.textContent = "";
      requestAnimationFrame(function () { live.textContent = msg; });
    }

    function reindex() {
      var all = rows();
      all.forEach(function (row, i) {
        var n = i + 1;
        Array.prototype.forEach.call(row.querySelectorAll("input, select, textarea"), function (inp) {
          var nameTpl = inp.getAttribute("data-name");
          if (nameTpl) inp.name = fill(nameTpl, i, n);
          var idTpl = inp.getAttribute("data-id");
          if (idTpl) inp.id = fill(idTpl, i, n);
          var labelTpl = inp.getAttribute("data-label");
          if (labelTpl) inp.setAttribute("aria-label", fill(labelTpl, i, n));
        });
        var rm = row.querySelector(".r-row-remove");
        if (rm) {
          var label = fill(removeTpl, i, n);
          rm.setAttribute("aria-label", label);
          rm.disabled = all.length <= min;
        }
      });
      addBtn.disabled = all.length >= max;
    }

    function source() {
      if (tpl) {
        var fromTpl = tpl.content.querySelector(".r-row");
        if (fromTpl) return fromTpl;
      }
      var all = rows();
      return all[all.length - 1] || null;
    }

    function reset(row) {
      Array.prototype.forEach.call(row.querySelectorAll("input, select, textarea"), function (inp) {
        if (inp.type === "checkbox" || inp.type === "radio") inp.checked = false;
        else if (inp.tagName === "SELECT") inp.selectedIndex = 0;
        else inp.value = "";
      });
    }

    function makeRow() {
      var src = source();
      if (!src) return null;
      var row = src.cloneNode(true);
      row.classList.remove("is-new");
      row.classList.add("is-new");
      reset(row);
      return row;
    }

    function add() {
      if (rows().length >= max) return;
      var row = makeRow();
      if (!row) return;
      list.appendChild(row);
      reindex();
      announce(addedMsg);
      var first = row.querySelector("input, select, textarea");
      if (first) first.focus();
    }

    function removeRow(row) {
      var all = rows();
      if (all.length <= min) return;
      var i = all.indexOf(row);
      var target = all[i + 1] || all[i - 1];
      row.parentNode.removeChild(row);
      reindex();
      announce(removedMsg);
      if (target) {
        var el = target.querySelector("input, select, textarea");
        if (el) el.focus();
      } else {
        addBtn.focus();
      }
    }

    addBtn.addEventListener("click", add);
    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".r-row-remove");
      if (btn && !btn.disabled) {
        var row = btn.closest(".r-row");
        if (row && list.contains(row)) removeRow(row);
      }
    });
    list.addEventListener("keydown", function (e) {
      var input = e.target.closest("input");
      if (!input || !list.contains(input)) return;
      var row = input.closest(".r-row");
      if (!row) return;
      var all = rows();
      if (e.key === "Enter" && row === all[all.length - 1]) {
        e.preventDefault();
        add();
      }
      if (e.key === "Backspace" && input.selectionStart === 0 && input.selectionEnd === 0
          && all.length > min) {
        var fields = Array.prototype.slice.call(row.querySelectorAll("input"));
        var empty = fields.every(function (el) { return el.value === ""; });
        if (!empty) return;
        e.preventDefault();
        var i = all.indexOf(row);
        var prev = all[i - 1];
        row.parentNode.removeChild(row);
        reindex();
        announce(removedMsg);
        if (prev) {
          var prevFields = Array.prototype.slice.call(prev.querySelectorAll("input"));
          var last = prevFields[prevFields.length - 1];
          if (last) {
            last.focus();
            if (last.setSelectionRange) {
              var end = last.value.length;
              last.setSelectionRange(end, end);
            }
          }
        } else {
          var first = rows()[0] && rows()[0].querySelector("input");
          if (first) first.focus();
        }
      }
    });
    reindex();
  }

  function enhanceAll(scope) {
    var root = scope && scope.querySelectorAll ? scope : document;
    Array.prototype.forEach.call(root.querySelectorAll(".r-rows"), enhance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { enhanceAll(); });
  } else {
    enhanceAll();
  }

  global.rRows = { enhance: enhance, enhanceAll: enhanceAll };
})(typeof window !== "undefined" ? window : this);
