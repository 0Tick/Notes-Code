import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor-core";
import { createHighlighter, Highlighter } from "shiki";

let highlighter: Highlighter;

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["vitesse-dark", "vitesse-light"],
      langs: ["javascript", "typescript", "vue", "html", "css", "markdown"],
    });
  }
  return highlighter;
}

export async function setupMonaco(monacoInstance: typeof monaco) {
  const highlighter = await getHighlighter();
  // Register languages
  monacoInstance.languages.register({ id: "vue" });
  monacoInstance.languages.register({ id: "typescript" });
  monacoInstance.languages.register({ id: "javascript" });
  monacoInstance.languages.register({ id: "html" });
  monacoInstance.languages.register({ id: "css" });
  monacoInstance.languages.register({ id: "markdown" });

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