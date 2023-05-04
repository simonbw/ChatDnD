import { Dispatch, SetStateAction, useState } from "react";
import { ZodType } from "zod";

export function useCachedState<
  S extends object | string | number | undefined | null
>(
  cacheKey: string,
  validator: ZodType<S>,
  initial: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    try {
      return validator.parse(JSON.parse(localStorage.getItem(cacheKey) ?? ""));
    } catch {
      if (typeof initial === "function") {
        return initial();
      } else {
        return initial;
      }
    }
  });

  const wrappedSetState = (value: SetStateAction<S>) => {
    setState((old: S) => {
      const newValue =
        typeof value === "function" ? (value as (old: S) => S)(old) : value;

      localStorage.setItem(cacheKey, JSON.stringify(newValue));
      return newValue;
    });
  };

  return [state, wrappedSetState];
}
