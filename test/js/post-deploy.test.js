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
/* eslint-env mocha */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const domain = !process.env.CI ? 'rum.hlx3.page' : `${process.env.CIRCLE_PROJECT_REPONAME}-${process.env.CIRCLE_BRANCH}.hlx3.one`;

console.log(`Using ${domain}`);

describe('Helix RUM Collector Post-Deploy Tests', () => {
  it('Missing body returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/');
    expect(response).to.have.status(400);
  });

  it('RUM collection returns 201', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send({
        cwv: {
          CLS: 1.0, 
          LCP: 1.0, 
          FID: 4 
        },
        id: 'blablub', 
        weight: 0
      });
    expect(response).to.have.status(201);
  });

  it('Missing id returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send({
        cwv: {
          CLS: 1.0, 
          LCP: 1.0, 
          FID: 4 
        },
        weight: 0
      });
    expect(response).to.have.status(400);
  });

  it('Missing weight returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send({
        cwv: {
          CLS: 1.0, 
          LCP: 1.0, 
          FID: 4 
        },
        id: 'blablub', 
      });
    expect(response).to.have.status(400);
  });

  it('Missing cwv returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send({
        id: 'blablub', 
        weight: 0
      });
    expect(response).to.have.status(400);
  });

  it('Non-object cwv returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send({
        cwv: "1",
        id: 'blablub', 
        weight: 0
      });
    expect(response).to.have.status(400);
  });

  it('Non-object root returns 400', async () => {
    const response = await chai.request(`https://${domain}`)
      .post('/')
      .send([]);
    expect(response).to.have.status(400);
  });
});
