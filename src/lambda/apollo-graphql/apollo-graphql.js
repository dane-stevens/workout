require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server-lambda')
const { google } = require('googleapis')

const { CLIENT_EMAIL, PRIVATE_KEY } = process.env

console.log('CLIENT------------------------------------', CLIENT_EMAIL, PRIVATE_KEY)

const jwtClient = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  PRIVATE_KEY,
  [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar'
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

 function timer(count) {

  const [ minutes, decimalSeconds ] = (count / 60).toString().split('.')
  
  const seconds = Math.round(Number(`.${ decimalSeconds }`) * 60)

  function pad(num, leadingZeros = '00') {
      const string = leadingZeros + (num || 0)
      return string.substr(string.length - leadingZeros.length)
  }

  return `${ pad(minutes) || 0 }:${ pad(seconds) || 0 }`

}

 
// sheets.spreadsheets.values.get(
//   {
//     auth: jwtClient, 
//     spreadsheetId: '1-VUdDS3AmTfbuZIqLepi_aMbVzHWiL_PsqYEwJyf7so',
//     range: 'Sheet1'
//   },
//   (err, response) => {
//     if (err) {
//       console.log('The API returned an error: ' + err);
//     } 
//     console.log('RESPONSE-------------------------',response)
//     if (response.data.length < 1) {
//       console.log('EMPTY')
//     } else {
//         console.log('Movie list from Google Sheets:');
      
//         for (let row of response.data.values) {
//             console.log('Title [%s]\t\tRating [%s]', row[0], row[1]);
//         }
//     }
//   }
// )





const typeDefs = gql`
  type Query {
    hello: String
    allAuthors: [Author!]
    author(id: Int!): Author
    authorByName(name: String!): Author
  }
  type Author {
    id: ID!
    name: String!
    married: Boolean!
  }

  type Mutation {
    logTime(payload: LogPayload!): String
  }
  input LogPayload {
    name: String
    time: Int
  }

`

const authors = [
  { id: 1, name: 'Terry Pratchett', married: false },
  { id: 2, name: 'Stephen King', married: true },
  { id: 3, name: 'JK Rowling', married: false }
]

const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return 'Hello, world!'
    },
    allAuthors: (root, args, context) => {
      return authors
    },
    author: (root, args, context) => {
      return authors.find(author => author.id === args.id) || {}
    },
    authorByName: (root, args, context) => {
      console.log('hihhihi', args.name)
      return authors.find(x => x.name === args.name) || 'NOTFOUND'
    }
  },

  Mutation: {

    logTime:(root, { payload }) => {

      sheets.spreadsheets.values.append(
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
                  timer(payload.time)
                ]
              ],
            },
        },
      )

    }

  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

exports.handler = server.createHandler()
