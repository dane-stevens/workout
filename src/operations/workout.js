import gql from 'graphql-tag'

export const GET_WORKOUT = gql`
    query GetWorkout($filter: WorkoutFilter!) {
        workout(filter: $filter) {
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