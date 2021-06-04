import { Response, Headers } from "@fastly/as-compute";
import  { Console } from "as-wasi";

export function error(status: u16, message: string): Response {
  const headers = new Headers();
  headers.set('x-error', message);
  Console.error(message);
  return new Response(String.UTF8.encode(message), {
    status: status,
    headers: headers,
    url: null,
  });
}