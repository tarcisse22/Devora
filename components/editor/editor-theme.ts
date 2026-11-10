import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/** Devora's dark editor theme, built from the same palette as the design tokens. */
const chrome = EditorView.theme(
  {
    "&": {
      color: "#e7e5f0",
      backgroundColor: "transparent",
      fontSize: "13.5px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      lineHeight: "1.7",
    },
    ".cm-content": { caretColor: "#cfc4ff", padding: "14px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#cfc4ff", borderLeftWidth: "2px" },
    "&.cm-focused": { outline: "none" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgb(157 134 247 / 0.28) !important",
    },
    ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 0.03)" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#5a5869",
      border: "none",
      paddingLeft: "6px",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#a8a6b8" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 8px", minWidth: "36px" },
    ".cm-foldGutter .cm-gutterElement": { color: "#5a5869" },
    ".cm-matchingBracket": { backgroundColor: "rgb(157 134 247 / 0.2)", outline: "1px solid rgb(157 134 247 / 0.4)" },
    ".cm-searchMatch": { backgroundColor: "rgb(252 211 77 / 0.2)" },
    ".cm-tooltip": {
      backgroundColor: "#1c1c27",
      border: "1px solid rgb(255 255 255 / 0.14)",
      borderRadius: "8px",
      color: "#e7e5f0",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "rgb(157 134 247 / 0.25)", color: "#f4f3f8" },
    ".cm-panels": { backgroundColor: "#16161f", color: "#e7e5f0", borderColor: "rgb(255 255 255 / 0.08)" },
    // Line highlighted by the code tracer.
    ".cm-trace-line": {
      backgroundColor: "rgb(157 134 247 / 0.16)",
      boxShadow: "inset 2px 0 0 #b7a6ff",
    },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: "#b7a6ff" },
  { tag: [t.definitionKeyword, t.modifier], color: "#b7a6ff" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#a7e3c4" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#f5c38a" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#8ec5ff" },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: "#f4f3f8" },
  { tag: [t.typeName, t.className, t.namespace], color: "#f0a6ca" },
  { tag: [t.propertyName], color: "#d6d3e6" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#6f6d80", fontStyle: "italic" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#a8a6b8" },
  { tag: [t.self, t.special(t.variableName)], color: "#f0a6ca" },
  { tag: t.invalid, color: "#ff8a8a" },
]);

export const devoraEditorTheme = [chrome, syntaxHighlighting(highlight)];
