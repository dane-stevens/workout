import gql from 'graphql-tag'

export const LOG_TIME = gql`
    mutation LogTime($payload: LogPayload!) {
        logTime(payload: $payload)
    }
`