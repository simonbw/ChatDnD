import { ErrorRequestHandler } from "express";
import { errorHtml } from "../pages/errorHtml";

export // Error Handling
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(400);
  }
  if (req.accepts(["html", "json"]) === "json") {
    res.send({ success: false, error });
  } else {
    res.send(errorHtml(error));
  }
};
