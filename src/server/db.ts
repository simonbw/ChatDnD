import { RequestHandler } from "express";
import rethink, { Connection } from "rethinkdb";
import { getRethinkConfig } from "./utils/envUtils";

const DB_NAME = "chatdnd";

let connection: Connection | undefined;

export async function getDb() {
  if (!connection) {
    connection = await rethink.connect(getRethinkConfig());

    try {
      await rethink.dbCreate(DB_NAME).run(connection);
      console.log(`created db ${DB_NAME}`);
    } catch {}

    connection.use(DB_NAME);

    for (const table of ["rooms"]) {
      try {
        await rethink.db(DB_NAME).tableCreate(table).run(connection);
      } catch {}
    }
  }
  return connection;
}

export const withDb: <
  TParams,
  TResBody,
  ReqBody,
  ReqQuery,
  Locals extends Record<string, any> = Record<string, any>
>() => RequestHandler<
  TParams & { db: Connection },
  TResBody,
  ReqBody,
  ReqQuery,
  Locals
> = () => async (req, res, next) => {
  req.params.db = await getDb();
  next();
};
