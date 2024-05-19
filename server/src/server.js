const http = require('http');

const app = require('./app.js')
const { loadPlanetsData } = require('./models/planets.model.js')
const { mongoConnect } = require('./services/mongo.js');
const { loadLaunchesData } = require('./models/launches.model.js')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer(){
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
  });
}

startServer();