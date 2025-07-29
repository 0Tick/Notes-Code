import { useRef, useEffect, useState } from "react";
import { Highlighter } from "shiki";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { NotesCode } from "@/handwriting";

interface CodeBlockProps {
  textBlock: NotesCode.ITextBlock;
  theme: string;
  onHeightChange: (height: number) => void;
}

export default function CodeBlock({ textBlock, theme, onHeightChange }: CodeBlockProps) {
  const { loadText, textCache, getHighlighter } = useFilesystemContext();
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const language = (textBlock.path && textBlock.path.split(".").pop()) || "txt";
  const [code, setCode] = useState("");
  const codeBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHighlighter().then((h) => {
      setHighlighter(h as Highlighter);
    });
  }, []);
  useEffect(() => {
    if (textBlock.path && textCache.has(textBlock.path)) {
      setCode(textCache.get(textBlock.path) as string);
    }
  }, [textCache, textBlock.path]);
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
  }, [highlighter, code, language, theme]);

  useEffect(() => {
    if (codeBlockRef.current) {
      const height = codeBlockRef.current.getBoundingClientRect().height;
      onHeightChange(height);
    }
  }, [html, onHeightChange]);

  if (!textBlock.path) return <div>Code Block has no filepath</div>;
  return (
    <div
      ref={codeBlockRef}
      className="absolute pointer-events-none select-none"
      style={{
        width: textBlock.w + "px",
        top: textBlock.y + "px",
        left: textBlock.x + "px",
      }}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
      draggable={false}
      onDrag={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    ></div>
  );
}
