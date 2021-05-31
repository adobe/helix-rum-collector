import { JSON, JSONEncoder } from "assemblyscript-json";
import  { Date, Console } from "as-wasi";
import  { Request, Fastly } from "@fastly/as-compute";

export class CoralogixLogger {
  private subsystemName: string;
  private start: i64;
  private req: Request;
  private logger: Fastly.LogEndpoint;

  constructor(req: Request) {

    Console.log("Building Coralogix Logger\n");
    this.subsystemName = "undefined";
    
    Console.log("Getting forwarded host\n");
    if (req.headers.get("x-forwarded-host") != null) {
      Console.log("Loading xfh header\n");
      this.subsystemName = (req.headers.get("x-forwarded-host") as string).split(",")[0].trim();
    } else if (req.headers.get("host") != null) {
      Console.log("Loading host header instead\n");
      this.subsystemName = req.headers.get("host") as string;
    }
    this.start = Math.floor(Date.now()) as i64;
    this.req = req;
    Console.log("Getting log endpoint\n");
    this.logger = Fastly.getLogEndpoint("Coralogix");
    Console.log("Ready\n");
  }

  public logRUM(json: JSON.Obj): void {
    Console.log("Encoding JSON log statement\n");
    let encoder = new JSONEncoder();
    let now: i64 = Math.floor(Date.now()) as i64;

    encoder.pushObject("");
    encoder.setInteger("timestamp", now);
    encoder.setString("applicationName", "helix-rum-collector");
    encoder.setString("subsystemName", this.subsystemName);
    let level = 3;

    encoder.setInteger("severity", level);
    encoder.pushObject("json");

    encoder.pushObject("edgecompute");
    encoder.setString("url", this.req.url);
    encoder.popObject();

    // json.cdn
    encoder.pushObject("cdn");
    if (this.req.headers.has("referer")) {
      encoder.setString("url", this.req.headers.get("referer") as string);
    } else {
      encoder.setString("url", this.req.url);
    }
    

    // json.cdn.time
    encoder.pushObject("time");
    encoder.setInteger("start_msec", this.start);
    encoder.setInteger("elapsed", now - this.start);
    encoder.popObject();

    // json.cdn.request
    encoder.pushObject("request");
    encoder.setString("method", this.req.method);
    if (this.req.headers.has("User-Agent")) {
      encoder.setString("user_agent", this.req.headers.get("User-Agent") as string);
    }
    encoder.popObject(); // .json.cdn.request


    encoder.popObject(); // .json.cdn

    encoder.pushObject("rum");
    
    const keys = json.keys;
    for (let i = 0; i< keys.length; i++) {
      const name = keys[i];
      const value = json.getNum(name);
      if (value != null) {
        encoder.setFloat(name, value.valueOf());
      }
    }

    encoder.popObject() // .json.rum

    encoder.popObject(); // .json
    encoder.popObject(); // .

    Console.log("Logging now\n");

    this.logger.log(encoder.toString());

    Console.log("Done.\n");
  }

}