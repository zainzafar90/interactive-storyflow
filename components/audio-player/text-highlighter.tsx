export function TextHighlighter({
  text,
  currentTime,
  duration,
}: {
  text: string;
  currentTime: number;
  duration: number;
}) {
  const words = text.split(" ");
  const totalWords = words.length;

  if (duration <= 0) return <p className="text-lg leading-relaxed">{text}</p>;

  const progress = currentTime / duration;
  const highlightedWordCount = Math.floor(totalWords * progress);

  const highlightedText = words.slice(0, highlightedWordCount).join(" ");
  const remainingText = words.slice(highlightedWordCount).join(" ");

  return (
    <p className="text-lg leading-relaxed">
      <span className="dark:text-indigo-300 text-indigo-500">
        {highlightedText}
      </span>
      {highlightedWordCount > 0 && remainingText && " "}
      <span>{remainingText}</span>
    </p>
  );
}
