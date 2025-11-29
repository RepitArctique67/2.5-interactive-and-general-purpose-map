const request = require('supertest');
const express = require('express');

const app = express();
app.get('/test', (req, res) => res.status(200).json({ message: 'Hello World' }));

describe('Server Setup', () => {
    it('should pass a basic test', async () => {
        const res = await request(app).get('/test');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Hello World');
    });
});
