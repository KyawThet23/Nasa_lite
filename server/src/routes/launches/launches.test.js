const request = require('supertest');
const app = require('../../app');
const {
  mongoConnect,
  mongoDisconnect
} = require('../../services/mongo');

describe('Launches API', () => {

  beforeAll(async () => {
    await mongoConnect()
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => { 
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-type',/json/)
        .expect(200);
     });
  }); 
  
  describe('Test POST /launch', () => {
  
    const completeLaunchData = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      target: 'Kepler-442 b',
      launchDate: 'December 27,2030'
    };
  
    const launchDataWithoutDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      target: 'Kepler-442 b'
    };
  
    const launchDataWithInvalidDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      target: 'Kepler-442 b',
      launchDate: 'December'
    }
  
    test('It should respond with 201 success', async () => { 
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-type',/json/)
        .expect(201);
  
        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate);
  
        expect(response.body).toMatchObject(launchDataWithoutDate);
    });
  
    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(  launchDataWithoutDate)
        .expect('Content-type',/json/)
        .expect(400);
  
        expect(response.body).toStrictEqual({
          error: 'Missing required launch property'
        })
    });
  
    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-type',/json/)
        .expect(400);
  
        expect(response.body).toStrictEqual({
          error: 'Invalid launch date',
        })
    });

  })

})