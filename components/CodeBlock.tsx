import { useRef, useEffect, useState } from "react";
import { Highlighter } from "shiki";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { NotesCode } from "@/handwriting";

interface CodeBlockProps {
  textBlock: NotesCode.ITextBlock;
  theme: string;
}

export default function CodeBlock({textBlock, theme}: CodeBlockProps) {
  const { loadText, textCache, getHighlighter } = useFilesystemContext();
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const language = (textBlock.path && textBlock.path.split(".").pop()) || "txt";
  const [code, setCode] = useState("");

  useEffect(() => {
    getHighlighter().then((h) => {
      setHighlighter(h as Highlighter);
    });
  }, []);
  useEffect(() => {
    if (textBlock.path && textCache.has(textBlock.path)) {
      setCode(textCache.get(textBlock.path) as string);
    }
  }, [textCache]);
  const [html, setHtml] = useState("<div>Loading highlighter...<");
  useEffect(() => {
    if (!highlighter) return;
    (async () => {
      const html = await highlighter.codeToHtml(code, {
        lang: language,
        theme: theme,
      });
      setHtml(html);
    })();
  }, [highlighter, code]);
  if (!textBlock.path) return <div>Code Block has no filepath</div>;
  return (
    <div className="absolute top-0 left-0 h-full w-full pointer-events-none select-none"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  );
}
