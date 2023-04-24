import { Response } from "express";

export const EVENT_STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
};

export function startEventStream(res: Response) {
  res.writeHead(200, EVENT_STREAM_HEADERS);
}

export function sendEvent(
  res: Response,
  data: object,
  {
    eventType,
    id,
    retry,
  }: { eventType?: string; id?: string; retry?: number } = {}
) {
  let message = "";
  if (eventType) {
    message += `event: ${eventType}\n`;
  }
  if (id) {
    message += `id: ${id}\n`;
  }
  if (retry) {
    message += `retry: ${retry}\n`;
  }
  message += `data: ${JSON.stringify(data)}\n\n`;

  res.write(message);
}

// export const asEventStream: <TParams, TRes>() => RequestHandler<
//   TParams,
//   TRes & { sendData: () => void }
// > = () => (req, res, next) => {
//   startEventStream(res);
//   res.next();
// };
