import { ZodType, z } from "zod";

export function makeJsonEndpoint<TReq extends ZodType, TRes extends ZodType>(
  method: "post" | "get",
  pathname: string,
  requestQuerySchema: TReq,
  responseSchema: TRes
) {
  return async (params: z.infer<TReq>): Promise<z.infer<TRes>> => {
    params = requestQuerySchema.parse(params);
    const url = new URL(pathname, window.origin);
    const headers: Record<string, string> = { Accept: "application/json" };
    let body: string | undefined;
    if (method === "get") {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
      }
    } else {
      body = JSON.stringify(params);
      headers["Content-Type"] = "application/json";
    }
    console.time(pathname);
    const result = await fetch(url, {
      method,
      body,
      headers,
    })
      .then((d) => d.json())
      .then((d) => responseSchema.parse(d));
    console.timeEnd(pathname);
    return result;
  };
}
