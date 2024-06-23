/* eslint-disable no-unused-vars */
declare module "xss-clean" {
  import { IncomingMessage, ServerResponse } from "http";
  export default function xss(): (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: (error?: unknown) => void
  ) => void;
}
