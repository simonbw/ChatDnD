import { Operation } from "fast-json-patch";
import { z } from "zod";

export function diffStreamSchema<T extends z.ZodType>(state: T) {
  return z.discriminatedUnion("type", [
    z.object({ type: z.literal("replace"), state }),
    z.object({ type: z.literal("diff"), diff: z.array(operationSchema) }),
  ]);
}

export type DiffStream<T> = z.infer<
  ReturnType<typeof diffStreamSchema<z.ZodType<T>>>
>;

export const operationSchema = z.custom<Operation>((value) =>
  z.any().parse(value)
);
