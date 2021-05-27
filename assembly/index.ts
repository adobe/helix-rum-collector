import { Request, Response, Headers, URL, Fastly } from "@fastly/as-compute";
import  { Date, Console } from "as-wasi";
import { JSON } from "assemblyscript-json";
import { CoralogixLogger } from "./coralogix-logger";
import { GoogleLogger } from "./google-logger";

function main(req: Request): Response {
  Console.log("request received");

  const text = req.text();
  if (text.length<=0) {
    return new Response(String.UTF8.encode("RUM collection expects a JSON POST or PUT body."), {
      status: 400,
      headers: null,
      url: null,
    });
  }

  let body = <JSON.Value>JSON.parse(text);
  if (body != null && body.isObj) {
    let obj = body as JSON.Obj;

    let cwv = obj.getObj("cwv");
    if (cwv != null) {
      Console.log("\nBody: " + cwv.toString() + "\n");

      const c = new CoralogixLogger(req);
      c.logRUM(cwv);

      const g = new GoogleLogger(req);
      g.logRUM(cwv);
    }
  }

  return new Response(String.UTF8.encode("rum collected."), {
    status: 201,
    headers: null,
    url: null,
  });
}

// Get the request from the client.
let req = Fastly.getClientRequest();

// Pass the request to the main request handler function.
let resp = main(req);

// Send the response back to the client.
Fastly.respondWith(resp);