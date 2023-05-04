import jsonpatch from "fast-json-patch";
import { useEffect, useState } from "react";
import { z } from "zod";
import { diffStreamSchema } from "../../common/models/diffStreamSchema";

export function useJsonDiffStream<T extends object>(
  url: string | undefined,
  parser: (o: unknown) => T
): T | undefined {
  const [state, setState] = useState<T | undefined>();

  useEffect(() => {
    if (!url) {
      return;
    }
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const maybeMessage = JSON.parse(event.data);
      const message = diffStreamSchema(z.any()).parse(maybeMessage);
      if (message.type == "replace") {
        setState(parser(message.state));
      } else {
        const diff = message.diff;
        setState((oldState) =>
          parser(jsonpatch.applyPatch(oldState, diff, true, false).newDocument)
        );
      }

      return () => eventSource.close();
    };
  }, [url]);

  return state;
}
