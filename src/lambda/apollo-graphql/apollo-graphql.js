require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server-lambda')
const { google } = require('googleapis')

const { CLIENT_EMAIL, PRIVATE_KEY } = process.env

console.log('CLIENT------------------------------------', CLIENT_EMAIL, PRIVATE_KEY)

const jwtClient = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDuvhCro2ZY+OAQ\nwKJY+9mBRCS/HgPTA3I5ZwZ7Z0/fm2xW3Ew/0nj+QCTzEONGaRmI+3VQ2ULmejiX\nLh651Sp+mdA18b3qlZ2YKPRIOAOc+CdFZnXxoqR+TBYiz6v7r9wG9YhkV2ox32NO\nhluAZE7Tkzvmf/v70ptyQp426HnB8noKyLh1VCfPx1LOJ1zyjBt2Ps/jpHRPm/iU\n0emsq/NHXV387ZHAkQPeQj6G9m3E+Nso4NCvHipLYuJ3SsUsbJv8gddjFJVFPy4w\nSoTKPLHIBfyySwzeuhHF1qtb8jpWU3BStkB9Vpwv00NnSrfzT+VqZJP7ZlY5lDiH\nb772AxpVAgMBAAECggEAALI7Yd8SNTf6XsXtCgM1RUOCn1gcJ+Bqycq5SxotK7Qe\nrxBs9AZuMlhaQLS8ajNmjTPHeQ29kLDyUR4FdWrUGs3OAASWkwzikTPHX1QRwKDK\nDa/MFRICatIHUxN61L6HKcYwqVThdHBvjl+UiYvu0AVTCtrrnQdSFUgMKcdvHoR4\nZDjTl8VPuuNqi1juDQjN/JsLVyF+Itp8+qB7/eETu//BeY/DEXZ347jEyBCgmogw\nUUYZUK6FSL7sRb/Jg+M2W4o/o60szYkZXzY4Kevysy1bOeaF7al4y8Rzp1fuAc/J\nfRJyd3TlbrMGgs3pZ5Mcbm3N8z96xiVb14exQLJBeQKBgQD+lnm4X9O3Y6khzOLX\ncuTyuFeLQc8WGJo12sGm5jgFxYNPg6g7aVj1xvGUvcgvwiiIYXRdboOP5JpFgG/M\nqedQg4wEDaKznv88rxMyhftGoO2+ip/eV6eQaZCifu0to8CwTeW6lrt2kM5xbUhn\nN1S+THd+0jhf51lkrpr9gXc6eQKBgQDwERawv3ZbUn1Qf/i2ZwNcgKsm28K3RHba\n4JHkEO5fpiwL+AvCbpxqHq6LzMHV4b7q916MZa1iTCO5+SejD1rubZdPbK0cW4dT\nB3uXGKki3Ub44WHGT54LTnDu7fgDeUTRBYR9o+vbxMrVw8sCzFDfJ3rlHa0vBzwY\nXMt1cpinvQKBgAygBbVA+0zS4mZMtMseZYAr6Bt9zfk4ix00lfni3NBcdSCSVNtt\nY/38Oaq4pp7HsB7jRlQD0P5nxcbAkcrCejgh7eWdj3382od13yvYPRfJj0CtuzPZ\ngPPGaGfGh5iF0F5t3oCcTPuaPsKdOsPzmH4/aIWfgzAuVt6JUiJUM0dxAoGAfbHU\n2ZJF3CbiqiV3CboCDoroEh56Yw6b1JpEiM88oCQXZ+Tl81WK3B1YcqYwz1W1ar0+\nafBKye7nvdXwpPXDPJdw5AsY0IIz5otCcKhe1nxZTrJjSTwimfTmOJOsidUS7QYg\nitArDBSLx0UOpFZp+Y1oUVIqfTcihfcAKGxp9VkCgYAItGLzSb0g+21+wab0MpUO\nFiICR2penT9GzjBZ9RPDLmENLHjuBo1pgUxjTNgKGEfzhTfhOtegVcE9gY1VhKGY\nkudCB4acm9RPWnN2yILsoCe91eihI6JP6duLDwI0LBJi5dF1SfeA6pGtTuZcnQhu\nvjjryQjiWVhL7IELv5AG3g==\n-----END PRIVATE KEY-----\n',
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
