import { shikiToMonaco } from "@shikijs/monaco";
import { Editor } from "@monaco-editor/react";
import { bundledLanguages, bundledThemes, createHighlighter, Highlighter } from "shiki";

let highlighter: Highlighter;

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    });
  }
  return highlighter;
}

export async function setupMonaco(monacoInstance: any) {
  const highlighter = await getHighlighter();

  // Register themes and apply highlighting
  shikiToMonaco(highlighter, monacoInstance);
} 

/*
Example usage:

import { setupMonaco } from '@/lib/highlighter';
import * as monaco from 'monaco-editor-core';

// ... inside the editor component
useEffect(() => {
  setupMonaco(monaco);
  
  const editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: '// Your code here\nfunction hello() {\n\tconsole.log("Hello, world!");\n}',
    language: 'javascript',
    theme: 'vitesse-dark',
    wordWrap: 'on', // This line enables word wrapping
  });

  // ... any other editor setup
}, []);
*/