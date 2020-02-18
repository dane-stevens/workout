// require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server-lambda')
const { google } = require('googleapis')
const md5 = require('md5')
const db = require('./db.js')

const { CLIENT_EMAIL, PRIVATE_KEY } = process.env
const privateKey = PRIVATE_KEY.replace(/\\n/g, '\n')

function timer(count) {

  const [ minutes, decimalSeconds ] = (count / 60).toString().split('.')
  
  const seconds = Math.round(Number(`.${ decimalSeconds }`) * 60)

  function pad(num, leadingZeros = '00') {
      const string = leadingZeros + (num || 0)
      return string.substr(string.length - leadingZeros.length)
  }

  return `${ pad(minutes) || 0 }:${ pad(seconds) || 0 }`

}

const typeDefs = gql`

  type Query {

    workout(
      date: String!
      difficulty: Int!
      equipment: [String]
    ): Workout

  }

  input WorkoutFilter {

    date: String!
    difficulty: Int!
    equipment: [String]

  }

  type Workout @cacheControl(maxAge: 216000) {
    hash: ID!
    sets: [Set]
    exercises: [Exercise]

  }

  type Set @cacheControl(maxAge: 216000) {
    category: ID!
    exercise: ID!
    count: Int
    time: Int
  }

  type Exercise @cacheControl(maxAge: 216000) {
    slug: ID!
    name: String!
    description: String
    alternating: Boolean
    doubleCount: Boolean
    category: String
    equipment: String
  }

  type Mutation {
    logTime(payload: LogPayload!): String
    completeWorkout(payload: CompleteWorkoutPayload!): String
  }
  input LogPayload {
    name: String
    time: Int
    workoutId: Int
  }
  input CompleteWorkoutPayload {
    name: String
    duration: Int
    workoutHash: ID!
  }

`

const resolvers = {

  Query: {

    workout: async (root, filter, { db }, info) => {

      info.cacheControl.setCacheHint({ maxAge: 216000, scope: 'PUBLIC' })

      const workoutHash = md5(filter.date + ',' + filter.difficulty.toString() + ',' + filter.equipment.reduce((str, equipment) => str + ',' + equipment, ''))

      // Find if workout exists
      const [ rows ] = await db.execute(`SELECT * FROM workout WHERE hash = ?`, [ workoutHash ])

      if (rows.length > 0) {

        // return the workout
        return {
            hash: rows[0].hash,
            ...(JSON.parse(rows[0].config))
        }

      }
      
      // Generate the workout
      // const equipmentString = filter.equipment.reduce((str, equipment) => (str + (str.length ? ",'" : "'") + equipment + "'"), "'none'")
      const equipmentString = filter.equipment.reduce((str, equipment) => (str + (str.length ? `,'${ equipment }'` : `'${ equipment }'`)), "'none'")

      const [ [arms], [conditioning], [legs], [abs], [strength] ] = await Promise.all([
        db.execute(`SELECT * FROM exercises WHERE category = 'arms' AND minDifficulty <= ? AND maxDifficulty >= ? AND (equipment IN (${ equipmentString }) OR equipment IS NULL) ORDER BY RAND() LIMIT 1`, [ filter.difficulty, filter.difficulty ]),
        db.execute(`SELECT * FROM exercises WHERE category = 'conditioning' AND minDifficulty <= ? AND maxDifficulty >= ? AND (equipment IN (${ equipmentString }) OR equipment IS NULL) ORDER BY RAND() LIMIT 1`, [ filter.difficulty, filter.difficulty ]),
        db.execute(`SELECT * FROM exercises WHERE category = 'legs' AND minDifficulty <= ? AND maxDifficulty >= ? AND (equipment IN (${ equipmentString }) OR equipment IS NULL) ORDER BY RAND() LIMIT 1`, [ filter.difficulty, filter.difficulty ]),
        db.execute(`SELECT * FROM exercises WHERE category = 'abs' AND minDifficulty <= ? AND maxDifficulty >= ? AND (equipment IN (${ equipmentString }) OR equipment IS NULL) ORDER BY RAND() LIMIT 1`, [ filter.difficulty, filter.difficulty ]),
        db.execute(`SELECT * FROM exercises WHERE category = 'strength' AND minDifficulty <= ? AND maxDifficulty >= ? AND (equipment IN (${ equipmentString }) OR equipment IS NULL) ORDER BY RAND() LIMIT 1`, [ filter.difficulty, filter.difficulty ]),
      ])

      const exercises = {
        arms,
        conditioning,
        legs,
        abs,
        strength
      }

      // Set reps by difficulty
      const reps = {
        1: [ 
          [2, 3, 4, 5, 6, 7, 8, 9, 10],
          [10, 10, 10, 10, 10],
          [15, 15, 20]
          [20, 20, 10]
        ],
        2: [ 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10],
          [10, 10, 10, 10, 10, 10, 10],
          [15, 15, 15, 15, 15]
          [20, 20, 20]
        ],
        3: [ 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
          [15, 15, 15, 15, 15, 15, 15],
          [20, 20, 20, 20, 20]
        ],
        4: [ 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30]
        ],
        5: [ 
          [10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 30, 30]
        ],
      }

      // Set categories by difficulty
      const categories = ['arms', 'conditioning', 'legs', 'abs']

      // Set builder
      const rawSets = []
      const repConfig = reps[filter.difficulty][Math.floor(Math.random() * reps[filter.difficulty].length)]
      categories.map((category) => repConfig.map(rep => rawSets.push({ category, exercise: exercises[category][0].slug, count: rep })))

      // Push strength sets if greater than easy
      if (filter.difficulty > 1) {

        const strengthReps = {
          2: 10,
          3: 20,
          4: 30,
          5: 40
        }

        rawSets.push({ category: 'strength', exercise: strength[0].slug, count: strengthReps[filter.difficulty] })
        rawSets.push({ category: 'strength', exercise: strength[0].slug, count: strengthReps[filter.difficulty] })

      }

      // Randomize the sets
      const randomSets = rawSets.sort(() => .5 - Math.random());
      
      const config = {
        sets: randomSets,
        exercises: [
          arms[0],
          conditioning[0],
          legs[0],
          abs[0],
          ... filter.difficulty > 2 ? [strength[0]] : []
        ]
      }

      const today = new Date().toISOString().substr(0, 10)

      await db.execute(`INSERT INTO workout (hash, date, difficulty, config) VALUES (?, ?, ?, ?)`, [ workoutHash, today, filter.difficulty, JSON.stringify(config) ])

      return {
        hash: workoutHash,
        ...config
      }

    }

  },

  Mutation: {

    completeWorkout: async (root, { payload }, { db }) => {

      await db.execute(`INSERT INTO results (workoutHash, name, duration) VALUES (?, ?, ?)`, [ payload.workoutHash, payload.name, payload.duration ])

      return 'SUCCESS'

    },

    logTime: async (root, { payload }) => {

      const jwtClient = new google.auth.JWT(
        CLIENT_EMAIL,
        null,
        privateKey,
        [
          'https://www.googleapis.com/auth/spreadsheets',
          // 'https://www.googleapis.com/auth/drive',
          // 'https://www.googleapis.com/auth/calendar'
        ]
      )

      jwtClient.authorize(function (err, tokens) {
        if (err) {
          console.log(err);
          return;
        } else {
          console.log("Successfully connected!");
        }
      });

      const sheets = google.sheets('v4')

      await sheets.spreadsheets.values.append(
        {
          auth: jwtClient,
          spreadsheetId: '1-VUdDS3AmTfbuZIqLepi_aMbVzHWiL_PsqYEwJyf7so',
          range: 'RESULTS',
          valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
              values: [
                [
                  payload.name,
                  new Date().toISOString(),
                  timer(payload.time),
                  payload.arms,
                  payload.conditioning,
                  payload.legs,
                  payload.abs,
                  payload.strength
                ]
              ],
            },
        },
      )

      console.log('DONE')

      return 'SUCCESS'

    }

  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {

    return {
      db
    }

  }
})

exports.handler = server.createHandler()
