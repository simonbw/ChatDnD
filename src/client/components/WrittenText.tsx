import React, { useEffect, useRef, useState } from "react";

export function WrittenText({
  children = "",
  interval = 20,
  initialText = "",
}: {
  children?: string;
  initialText?: string;
  interval?: number;
}) {
  const [text, setText] = useState(initialText);

  const childrenRef = useRef(children);
  childrenRef.current = children;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const updateText = () => {
      setText((oldText) => stepTowardsString(oldText, childrenRef.current));
      timeout = setTimeout(updateText, interval);
    };

    timeout = setTimeout(updateText, interval);

    return () => clearTimeout(timeout);
  }, [interval]);

  return <>{text}</>;
}

function stepTowardsString(from: string, to: string): string {
  const minLength = Math.min(from.length, to.length);

  for (let i = 0; i < minLength; i++) {
    if (from.charAt(i) !== to.charAt(i)) {
      return from.slice(0, i) + to.charAt(i) + from.slice(i + 1);
    }
  }

  if (from.length > to.length) {
    return from.slice(0, -1);
  } else if (from.length < to.length) {
    return from + to.charAt(minLength);
  } else {
    return to;
  }
}
