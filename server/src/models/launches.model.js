const axios = require('axios');
const launchDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const { path } = require('../app');

const DEFAULT_FLIGHT_NUMBER = 100;

let latestFlightNumber = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function loadLaunchesData(){

  const firstLaunch =  await findLunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if(firstLaunch){
    console.log('Launch data already loaded');
    return;
  }else{
    await populateData();
  }
}

async function populateData(){
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
        pagination: false,
        populate: [
            {
                 path: 'rocket',
                 select: {
                    name: 1
                }
            },
            {
              path: 'payloads',
              select: {
                 'customers':1
              }
            }
        ]
      }
  });

  const launchDocs = response.data.docs;
  for(const launchDoc of launchDocs){
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers
    };

    await saveLaunch(launch);
  }
}

async function findLunch(filter){
  return await launchDatabase.findOne(filter);
}

async function saveLaunch(launch){

  await launchDatabase.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true
  })
}

async function getAllLaunches(skip,limit) {
  return await launchDatabase
    .find({} , {'_id':0, '__v':0})
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function existsLaunchWithId(launchId){
  return await launchDatabase.findOne({
    flightNumber: launchId
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchDatabase
  .findOne()
  .sort('-flightNumber');

  if(!latestLaunch){
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {

  const planet = await planets.findOne({
    keplerName: launch.target
  });

  if(!planet){
    throw new Error('No matching planet found')
  }
  
  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId){

  const aborted = await launchDatabase.updateOne({
    flightNumber: launchId
  },{
    upcoming: false,
    success: false
  });

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById
}