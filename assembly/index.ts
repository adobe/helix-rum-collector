import { Request, Response, Headers, URL, Fastly } from "@fastly/as-compute";
import  { Date, Console } from "as-wasi";

function main(req: Request): Response {
  Console.log("request received");
  Console.log(req.text());

  return new Response(String.UTF8.encode("rum collected."), {
    status: 201,
    headers: null,
    url: null,
  })
}

// Get the request from the client.
let req = Fastly.getClientRequest();

// Pass the request to the main request handler function.
let resp = main(req);

// Send the response back to the client.
Fastly.respondWith(resp);