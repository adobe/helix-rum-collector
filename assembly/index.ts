import { Request, Response, Fastly } from "@fastly/as-compute";
import  { Console } from "as-wasi";
import { JSON } from "assemblyscript-json";
import { CoralogixLogger } from "./coralogix-logger";
import { GoogleLogger } from "./google-logger";
import { error } from "./utils";

function main(req: Request): Response {
  Console.log("request received");

  const text = req.text();
  if (text.length<=0) {
    return error(400, "RUM collection expects a JSON POST or PUT body.");
  }

  let body = <JSON.Value>JSON.parse(text);
  if (body != null && body.isObj) {
    let obj = body as JSON.Obj;

    let cwv = obj.getObj("cwv") || new JSON.Obj();
    const weight = obj.getInteger("weight");
    const id = obj.getString("id");

    if (weight != null && id != null) {
      Console.log("\nBody: " + cwv.toString() + "\n");

      const c = new CoralogixLogger(req);
      c.logRUM(cwv, id.toString(), weight.valueOf());

      const g = new GoogleLogger(req);
      g.logRUM(cwv, id.toString(), weight.valueOf());
      
      return new Response(String.UTF8.encode("rum collected."), {
        status: 201,
        headers: null,
        url: null,
      });
    }

    return error(400, "Body is missing cwv, weight, or id");
  }
  return error(400, "Body is not a JSON object");
}

// Get the request from the client.
let req = Fastly.getClientRequest();

// Pass the request to the main request handler function.
let resp = main(req);

// Send the response back to the client.
Fastly.respondWith(resp);