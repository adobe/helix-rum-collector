import { JSON, JSONEncoder } from "assemblyscript-json";
import  { Date, Console } from "as-wasi";
import  { Request, Fastly } from "@fastly/as-compute";

export class GoogleLogger {
  private subsystemName: string;
  private start: i64;
  private req: Request;
  private logger: Fastly.LogEndpoint;

  constructor(req: Request) {

    this.subsystemName = "undefined";
    if (req.headers.get("host") != null) {
      this.subsystemName = req.headers.get("host") as string;
    }
    if (req.headers.get("x-forwarded-host") != null) {
      this.subsystemName = (req.headers.get("x-forwarded-host") as string).split(",").pop().trim();
    }
    this.start = Math.floor(Date.now()) as i64;
    this.req = req;
    this.logger = Fastly.getLogEndpoint("BigQuery");
  }

  public logRUM(json: JSON.Obj): void {
    let encoder = new JSONEncoder();
    let now: i64 = Math.floor(Date.now()) as i64;

    encoder.pushObject("");
    encoder.setInteger("time", now);
    encoder.setString("host", this.subsystemName);

    // json.cdn
    if (this.req.headers.has("referer")) {
      encoder.setString("url", this.req.headers.get("referer") as string);
    } else {
      encoder.setString("url", this.req.url);
    }
    

    if (this.req.headers.has("User-Agent")) {
      encoder.setString("user_agent", this.req.headers.get("User-Agent") as string);
    }
    
    const keys = json.keys;
    for (let i = 0; i< keys.length; i++) {
      const name = keys[i];
      const value = json.getNum(name);
      if (value != null) {
        encoder.setFloat(name, value.valueOf());
      }
    }

    encoder.popObject(); // .


    Console.log(encoder.toString());
    this.logger.log(encoder.toString());
  }

}