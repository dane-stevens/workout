import gql from 'graphql-tag'

export const GET_WORKOUT = gql`
    query GetWorkout($date: String!, $difficulty: Int!, $equipment: [String]!) {
        workout(date: $date, difficulty: $difficulty, equipment: $equipment) {
            hash
            sets {
                category
                exercise
                count
                time
            }
            exercises {
                slug
                name
                description
                alternating
                doubleCount
                category
                equipment
            }
        }
    }
`

export const COMPLETE_WORKOUT = gql`
    mutation CompleteWorkout($payload: CompleteWorkoutPayload!) {
        completeWorkout(payload: $payload)
    }
`