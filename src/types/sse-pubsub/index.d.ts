declare module "sse-pubsub" {
  import { IncomingMessage, ServerResponse } from "http";

  type ClientRef = { _client_id: string };

  type MessageId = number;

  export default class SSEChannel {
    /**
     * Creates a new SSEChannel.
     */
    constructor(options?: {
      /** Interval at which to send pings (no-op events). Milliseconds, default is 3000, set to a falsy value to disable pings entirely. */
      pingInterval?: number;
      /** Maximum amoiunt of time to allow a client to remain connected before closing the connection. SSE streams are expected to disconnect regularly to avoid zombie clients and problems with misbehaving middleboxes and proxies. Milliseconds, default is 30000. */
      maxStreamDuration?: number;
      /** Amount of time clients should wait before reconencting, if they become disconnected from the stream. Milliseconds, default is 1000. */
      clientRetryInterval?: number;
      /** ID to use for the first message on the channel. Default is 1. */
      startId?: number;
      /** Number of messages to keep in memory, allowing for clients to use the Last-Event-ID header to request events that occured before they joined the stream. Default is 100. */
      historySize?: number;
      /** Number of messages to backtrack by default when serving a new subscriber that does not include a Last-Event-ID in their request. If request includes Last-Event-ID, the rewind option is ignored. */
      rewind?: number;
    });

    subscribe(
      req: IncomingMessage,
      res: ServerResponse,
      events?: string[]
    ): ClientRef;

    publish(data: any, eventName?: string): MessageId;

    unsubscribe(clientRef: ClientRef): void;

    close(): void;

    listClients(): Record<string, number>;

    getSubscriberCount(): number;
  }
}
