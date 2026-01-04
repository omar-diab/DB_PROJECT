import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Integration tests (safe, read-only)', function () {
  this.timeout(10000);

  it('GET / should return HTML index', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.type).to.match(/html/);
  });

  it('GET /api/v1/books should return JSON array', async () => {
    const res = await request(app).get('/api/v1/books');
    expect(res.status).to.equal(200);
    expect(res.type).to.match(/json/);
    expect(res.body).to.be.an('array');
  });

  it('GET /api/v1/user should return JSON array', async () => {
    const res = await request(app).get('/api/v1/user');
    expect(res.status).to.equal(200);
    expect(res.type).to.match(/json/);


    expect(res.body).to.be.an('array');
  });
});
