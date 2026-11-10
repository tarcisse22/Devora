"use client";

import { useEffect, useRef } from "react";
import { Compartment, EditorState, Prec, StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, keymap, type DecorationSet } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";
import { cn } from "@/lib/utils";
import { devoraEditorTheme } from "./editor-theme";

export type EditorLanguage = "javascript" | "typescript" | "python" | "java" | "sql";

const languageExtension = (lang: EditorLanguage): Extension => {
  switch (lang) {
    case "typescript":
      return javascript({ typescript: true });
    case "python":
      return python();
    case "java":
      return java();
    case "sql":
      return sql();
    default:
      return javascript();
  }
};

// Highlighted line (used by the code tracer).
const setHighlight = StateEffect.define<number | null>();
const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (!e.is(setHighlight)) continue;
      if (e.value === null || e.value < 1 || e.value > tr.state.doc.lines) return Decoration.none;
      const line = tr.state.doc.line(e.value);
      return Decoration.set([Decoration.line({ class: "cm-trace-line" }).range(line.from)]);
    }
    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

type Props = {
  value: string;
  onChange?: (value: string) => void;
  language: EditorLanguage;
  readOnly?: boolean;
  /** Called on Ctrl/⌘ + Enter. */
  onRun?: () => void;
  /** 1-based line to highlight, or null. */
  highlightLine?: number | null;
  ariaLabel: string;
  className?: string;
};

/** CodeMirror 6 editor with Devora's theme. Controlled via `value`. */
export function CodeEditor({ value, onChange, language, readOnly = false, onRun, highlightLine = null, ariaLabel, className }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  // Keep latest callbacks without recreating the editor.
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  // Create once.
  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          // Highest precedence so Mod-Enter runs code instead of inserting a line.
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                preventDefault: true,
                run: () => {
                  onRunRef.current?.();
                  return true;
                },
              },
            ]),
          ),
          keymap.of([indentWithTab]),
          EditorState.tabSize.of(2),
          devoraEditorTheme,
          highlightField,
          langCompartment.current.of(languageExtension(language)),
          readOnlyCompartment.current.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the editor is created once; props sync below
  }, []);

  // Sync external value changes (e.g. switching example or reset).
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: langCompartment.current.reconfigure(languageExtension(language)) });
  }, [language]);

  useEffect(() => {
    view.current?.dispatch({
      effects: readOnlyCompartment.current.reconfigure([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
    });
  }, [readOnly]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const effects: StateEffect<unknown>[] = [setHighlight.of(highlightLine)];
    if (highlightLine && highlightLine <= v.state.doc.lines) {
      effects.push(EditorView.scrollIntoView(v.state.doc.line(highlightLine).from, { y: "nearest" }));
    }
    v.dispatch({ effects });
  }, [highlightLine]);

  return <div ref={host} className={cn("h-full min-h-0 overflow-hidden", className)} />;
}
