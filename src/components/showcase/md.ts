// Inline note text: HTML is escaped, and `code` becomes a code span.
const esc: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const md = (s: string) =>
  s.replace(/[&<>"]/g, (c) => esc[c]).replace(/`([^`]+)`/g, "<code>$1</code>");
