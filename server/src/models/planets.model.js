const {parse} = require('csv-parse');
const fs = require('fs');
const path = require('path')

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
  return new Promise((resolve,reject) => {
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject();
      })
      .on('end', async () => {
        const count = (await getAllPlanets()).length;
        console.log(`${count} habitable planets found!`);
        resolve();
      }
    );
  });
}

async function savePlanet(data) {
  try {
    await planets.updateOne({
      keplerName: data.kepler_name
    }, {
      keplerName: data.kepler_name
    }, {
      upsert: true
    }); 
  } catch (error) {
    console.log(`Couldn't save planet : ${error}`)
  }
}

async function getAllPlanets() {
  return await planets.find({}, {
    '_id':0,
    '__v':0
  });
}

  module.exports = {
    loadPlanetsData,
    getAllPlanets
  }