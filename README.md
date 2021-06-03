# helix-rum-collector

> Collect RUM data with Fastly Compute@Edge

This service is used to collect RUM (Real User Monitoring) Data, specifically Core Web Vitals snapshots, for Helix websites. It is deployed to Fastly's Compute@Edge edge computing service and will store the collected data using Fastly's real-time log forwarding in Coralogix and Google BigQuery for further analysis.

## Usage

```bash
$ curl -X POST https://rum.hlx3.page/.rum/1  -d '{"cwv":{ "CLS": 1.0, "LCP": 1.0, "FID": 4 }, "id": "blablub", "weight": 2}' X-Forwarded-Host:example.com
```

## API

### Supported Methods

- `POST`


### Supported Headers

- `User-Agent`
- `X-Forwarded-Host`
- `Referer`
