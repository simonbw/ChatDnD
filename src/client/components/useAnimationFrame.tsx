import { useRef, useEffect } from "react";

export function useAnimationFrame(callback: (() => void) | false) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current == callback;
  }, [callback]);

  useEffect(() => {
    let requestId: number;

    function loop() {
      requestId = requestAnimationFrame(loop);
      if (callbackRef.current) {
        callbackRef.current();
      }
    }
    requestId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);
}
