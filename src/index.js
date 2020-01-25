import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useInterval } from './hooks/interval'
import { AutoFontSize } from 'auto-fontsize'
import { ApolloProvider, useMutation } from '@apollo/react-hooks'
import client from './Apollo'

import './index.sass'

import { reps } from './exerciseConfig'
import { LOG_TIME } from './operations/time'
// import { cards, exerciseList, reps } from './katieExerciseConfig'
// import { cards, exerciseList, reps } from './pushupConfig'

import config from './config.json'

const { cards, exercises } = config

// Count total reps per exercise
const counts = {}
cards.map(([k, card]) => {
    return counts[k] = counts[k] ? counts[k] + reps[card] : reps[card]
})

function App() {

    const [ loading, setLoading ] = useState(true)
    const [ input, setInput ] = useState('')
    const [ name, setName ] = useState('')

    useEffect(() => {

        const name = localStorage.getItem('name') || null
        setName(name)
        setLoading(false)

    },[])

    function submit() {
        setName(input)
        localStorage.setItem('name', input)
    }

    if (loading) return null

    if (!name) return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                submit()
            }}
        >
            <label htmlFor='f_name'>Your Name</label>
            <input type='text' name='name' id='f_name' value={ input } onChange={ (e) => setInput(e.target.value) } />
            <button type='submit'>Continue</button>
        </form>
    )

    return <Workout name={ name } />

}

function Workout({ name }) {

    const [ state, setState ] = useState('BEGIN')
    const [ current, setCurrent ] = useState(0)
    const [ timer, setTimer ] = useState(0)

    const [ logTime ] = useMutation(LOG_TIME)

    useInterval(() => {
        if (state === 'WORKOUT') {
            setTimer(timer + 1)
        }
    }, 1000)

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress)
        return () => window.removeEventListener('keypress', handleKeyPress)
    })

    function handleKeyPress(e) {
        if (e.code === 'Space') {
            if (current < (cards.length - 1)) {
                setCurrent(current + 1)
            } else {
                setState('COMPLETE')
            }
        }
    }

    function completeTimer() {
        setState('COMPLETE')
        logTime({
            variables: {
                payload: {
                    name: name,
                    time: timer,
                    arms: exercises['D'],
                    conditioning: exercises['H'],
                    legs: exercises['C'],
                    abs: exercises['S'],
                    strength: exercises['Joker']
                }
            }
        })
    }

    const currentElement = cards[current]


    if (state === 'COMPLETE') return (
        <div className='container'>
            <div className='workoutWrapper'>
                <h1>Complete!</h1>
                <ul style={{ marginBottom: '6rem' }}>
                    {
                        Object.keys(exercises).map(key => <li key={ key }>{ exercises[key] }: { counts[key] }</li>)
                    }
                </ul>
                <Timer count={ timer } />

                <button type='button' className='start' onClick={ () => window.location.reload() }>Reset</button>
            </div>
        </div>
    )

    if (state === 'BEGIN') return (
        <div className='container'>
            <div className='workoutWrapper'>
                <h1>Today's Workout</h1>
                <ul>
                    {
                        Object.keys(exercises).map(key => <li key={ key }>{ exercises[key] }: { counts[key] }</li>)
                    }
                </ul>

                <button type='button' className='start' onClick={ () => setState('WORKOUT') }>Start</button>
                <button type='button' className='start' onClick={ () => window.location.reload() }>Reset</button>
            </div>
        </div>
    )

    return (
        <div className='container' key={current}>
            <div className='workoutWrapper'>
                <div className='progress'>{ current + 1 }/{ cards.length }</div>
                <div className='exercise'>
                    <AutoFontSize
                        className='exerciseText'
                        text={ exercises[currentElement[0]] }
                        minTextSize={40}
                        textSize={70}
                        textStepSize={1}
                        targetLines={2}
                    />
                </div>
                <div className='reps'>{ reps[currentElement[1]] }</div>

                <Timer count={ timer } />
            </div>
            <button className='nextButton' type='button' onClick={() => current < (cards.length - 1) ? setCurrent(current + 1) : completeTimer() }/>
        </div>
    )
}

function Timer({ count }) {

    const [ minutes, decimalSeconds ] = (count / 60).toString().split('.')
    
    const seconds = Math.round(Number(`.${ decimalSeconds }`) * 60)

    // console.log(minutes,seconds)

    function pad(num, leadingZeros = '00') {
        const string = leadingZeros + (num || 0)
        return string.substr(string.length - leadingZeros.length)
    }

    return <div className='timer'>{`${ pad(minutes) || 0 }:${ pad(seconds) || 0 }`}</div>

}

ReactDOM.render(<ApolloProvider client={ client }><App /></ApolloProvider>, document.getElementById('root'))