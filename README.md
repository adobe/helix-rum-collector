# helix-rum-collector

> Collect RUM data with Fastly Compute@Edge

This service is used to collect RUM (Real User Monitoring) Data, specifically Core Web Vitals snapshots, for Helix websites. It is deployed to Fastly's Compute@Edge edge computing service and will store the collected data using Fastly's real-time log forwarding in Coralogix and Google BigQuery for further analysis.

## Usage

```bash
$ curl -X POST https://rum.hlx3.page/.rum/1  -d '{"cwv":{ "CLS": 1.0, "LCP": 1.0, "FID": 4 }, "id": "blablub", "weight": 2}' X-Forwarded-Host:example.com
```

## API

The payload of a typical request looks like this:

```jsonc
{
  "id": "-1617507985-1629963441842-d6998c875b962",
  "weight": 100,
  "generation": "test-optimize-fonts",
  "referrer": "https://example.com/index.html",
  "cwv": {
    "CLS": 0.0097652112,
    "LCP": 800.7,
    "FID": 10.8999999762,
  }
}
```

- `id`: this is a generated request ID. Format does not matter, but it is important that this ID stays the same for a given page view.
- `weight`: the inverse of the sampling frequency used when tracking RUM data. In a typical site, only every `100`th request will be sampled, so the weight is `100`.
- `generation`: (optional) if you are trying different variants of the same website and want to evaluate the impact of code changes, add a `generation` field which could be the name of the feature branch or feature flag or just a description of the significant change
- `checkpoint`: (optional) if you want to track the drop-off of traffic as part of the load process, you can send events with an empty `cwv` object and the name of the checkpoint.
- `referrer`/`referer`: (optional) when using Helix RUM Collector as a third-party service, browsers will truncate the `Referer` HTTP header. This optional field allows to pass it explicitly. Both spellings are allowed.
- `cwv`: contains the Core Web Vitals data payload. Typically these measurements trickle in over the course of the page rendering, and are posted as soon as they are available, so a given request will have only one data point. Thanks to the stable `id` they can be merged for analysis.
- `cwv/CLS`: Cumulative Layout Shift
- `cwv/LCP`: Largest Contentful Paint in milliseconds
- `cwv/FID`: First Input Delay in milliseconds

### Supported Methods

- `POST`


### Supported Headers

- `User-Agent`
- `X-Forwarded-Host`
- `Referer`

