/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global fastly */
/* eslint-disable max-len */
export class SplunkLogger {
  constructor(req) {
    this.subsystemName = 'undefined';
    this.req = req;

    this.start = Math.floor(Date.now());
    this.req = req;
    this.logger = fastly.getLogger('Splunk');
  }

  logRUM(_json, id, _weight, referer, _generation, checkpoint) {
    if (checkpoint !== 'noscript' && checkpoint !== 'top' && checkpoint !== 'unsupported') {
      return;
    }
    console.log(`logging to Splunk: ${typeof this.logger}`);

    const host = new URL(referer || this.req.url).hostname;

    const data = {
      time: this.start,
      host,
      index: 'dx_aem_engineering',
      sourcetype: 'cdn',
      event: {
        aem_service: `helix-rum-${host}`,
        aem_tier: 'publish',
        aem_cluster: 'helix-prod',
        service_id: 'helix-rum',
        // 'x-rid': str(vcl`if(req.http.X-CDN-Request-ID, req.http.X-CDN-Request-ID, randomstr(8, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(1, "89ab") + randomstr(3, "0123456789abcdef") + "-" + randomstr(12, "0123456789abcdef"))`),
        'x-rid': id,
        // time_start: str(time`begin:%Y-%m-%dT%H:%M:%S%Z`), // str(vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.start)`),
        time_start: new Date().toISOString(),
        // time_end: str(time`end:%Y-%m-%dT%H:%M:%S%Z`), // str(vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.end)`),
        time_end: new Date().toISOString(),
        // time_elapsed: vcl`time.elapsed.usec`,
        time_elapsed: 0,
        // client_ip: str(vcl`req.http.Fastly-Client-IP`),
        client_ip: this.req.headers.get('Fastly-Client-IP'),
        // client_as_name: str(vcl`client.as.name`),
        // client_as_number: str(vcl`client.as.number`),
        // client_connection_speed: str(vcl`client.geo.conn_speed`),
        // request: str(vcl`req.request`),
        request: this.req.method,
        // protocol: str(vcl`req.proto`),
        // origin_host: str(vcl`req.http.host`),
        origin_host: host,
        // url: str(vcl`cstr_escape(req.url)`),
        url: new URL(referer || this.req.url).path,
        // is_ipv6: str(vcl`if(req.is_ipv6, "true", "false")`),
        // is_tls: str(vcl`if(req.is_ssl, "true", "false")`),
        is_tls: true,
        // tls_client_protocol: str(vcl`cstr_escape(tls.client.protocol)`),
        // tls_client_servername: str(vcl`cstr_escape(tls.client.servername)`),
        // tls_client_cipher: str(vcl`cstr_escape(tls.client.cipher)`),
        // tls_client_cipher_sha: str(vcl`cstr_escape(tls.client.ciphers_sha )`),
        // tls_client_tlsexts_sha: str(vcl`cstr_escape(tls.client.tlsexts_sha)`),
        // is_h2: str(vcl`if(fastly_info.is_h2, "true", "false")`),
        // is_h2_push: str(vcl`if(fastly_info.h2.is_push, "true", "false")`),
        // h2_stream_id: str(vcl`fastly_info.h2.stream_id`),
        // request_referer: str(vcl`cstr_escape(req.http.referer)`),
        // request_user_agent: str(vcl`cstr_escape(req.http.user-agent)`),
        request_user_agent: this.req.headers.get('user-agent'),
        // request_accept_content: str(vcl`cstr_escape(req.http.accept)`),
        request_accept_content: this.req.headers.get('accept'),
        // request_accept_language: str(vcl`cstr_escape(req.http.accept-language)`),
        request_accept_language: this.req.headers.get('accept-language'),
        // request_accept_encoding: str(vcl`cstr_escape(req.http.accept-encoding)`),
        request_accept_encoding: this.req.headers.get('accept-encoding'),
        // request_accept_charset: str(vcl`cstr_escape(req.http.accept-charset)`),
        request_accept_charset: this.req.headers.get('accept-charset'),
        // request_connection: str(vcl`cstr_escape(req.http.connection)`),
        request_connection: this.req.headers.get('connection'),
        // request_dnt: str(vcl`cstr_escape(req.http.dnt)`),
        request_dnt: this.req.headers.get('dnt'),
        // request_forwarded: str(vcl`cstr_escape(req.http.forwarded)`),
        request_forwarded: this.req.headers.get('forwarded'),
        // request_via: str(vcl`cstr_escape(req.http.via)`),
        request_via: this.req.headers.get('via'),
        // request_cache_control: str(vcl`cstr_escape(req.http.cache-control)`),
        request_cache_control: this.req.headers.get('cache-control'),
        // request_x_requested_with: str(vcl`cstr_escape(req.http.x-requested-with)`),
        request_x_requested_with: this.req.headers.get('x-requested-with'),
        // request_x_att_device_id: str(vcl`cstr_escape(req.http.x-att-device-id)`),
        request_x_att_device_id: this.req.headers.get('x-att-device-id'),
        // request_x_forwarded_for: str(vcl`cstr_escape(req.http.x-forwarded-for)`),
        request_x_forwarded_for: this.req.headers.get('x-forwarded-for'),
        // status: str(vcl`resp.status`),
        status: '200',
        // content_type: str(vcl`cstr_escape(resp.http.content-type)`),
        // cache_status: str(vcl`regsub(fastly_info.state, "^(HIT-(SYNTH)|(HITPASS|HIT|MISS|PASS|ERROR|PIPE)).*", "\\2\\3")`),
        cache_status: 'PASS',
        // is_cacheable: str(vcl`if(fastly_info.state ~"^(HIT|MISS)$", "true", "false")`),
        is_cacheable: 'false',
        // response_age: str(vcl`cstr_escape(resp.http.age)`),
        response_age: '0',
        // response_cache_control: str(vcl`cstr_escape(resp.http.cache-control)`),
        // response_expires: str(vcl`cstr_escape(resp.http.expires)`),
        // response_last_modified: str(vcl`cstr_escape(resp.http.last-modified)`),
        // response_tsv: str(vcl`cstr_escape(resp.http.tsv)`),
        // server_datacenter: str(vcl`server.datacenter`),
        // server_ip: str(vcl`server.ip`),
        // geo_city: str(vcl`client.geo.city.utf8`),
        // geo_country_code: str(vcl`client.geo.country_code`),
        // geo_continent_code: str(vcl`client.geo.continent_code`),
        // geo_region: str(vcl`client.geo.region`),
        // req_header_size: str(vcl`req.header_bytes_read`),
        // req_body_size: str(vcl`req.body_bytes_read`),
        // resp_header_size: str(vcl`resp.header_bytes_written`),
        // resp_body_size: str(vcl`resp.body_bytes_written`),
        // socket_cwnd: str(vcl`client.socket.cwnd`),
        // socket_nexthop: str(vcl`client.socket.nexthop`),
        // socket_tcpi_rcv_mss: str(vcl`client.socket.tcpi_rcv_mss`),
        // socket_tcpi_snd_mss: str(vcl`client.socket.tcpi_snd_mss`),
        // socket_tcpi_rtt: str(vcl`client.socket.tcpi_rtt`),
        // socket_tcpi_rttvar: str(vcl`client.socket.tcpi_rttvar`),
        // socket_tcpi_rcv_rtt: str(vcl`client.socket.tcpi_rcv_rtt`),
        // socket_tcpi_rcv_space: str(vcl`client.socket.tcpi_rcv_space`),
        // socket_tcpi_last_data_sent: str(vcl`client.socket.tcpi_last_data_sent`),
        // socket_tcpi_total_retrans: str(vcl`client.socket.tcpi_total_retrans`),
        // socket_tcpi_delta_retrans: str(vcl`client.socket.tcpi_delta_retrans`),
        // socket_ploss: str(vcl`client.socket.ploss`),
      },
    };
    this.logger.log(JSON.stringify(data));
  }
}
