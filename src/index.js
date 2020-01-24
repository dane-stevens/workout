import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useInterval } from './hooks/interval'
import { AutoFontSize } from 'auto-fontsize'

import './index.sass'

import { cards, exerciseList, reps } from './exerciseConfig'
// import { cards, exerciseList, reps } from './katieExerciseConfig'
// import { cards, exerciseList, reps } from './pushupConfig'

const random = cards.sort(() => .5 - Math.random())

// Count total reps per exercise
const counts = {}
cards.map(([k, card]) => {
    return counts[k] = counts[k] ? counts[k] + reps[card] : reps[card]
})

const exercises = {
    'D': exerciseList['D'][Math.floor(Math.random() * exerciseList['D'].length)],
    'H': exerciseList['H'][Math.floor(Math.random() * exerciseList['H'].length)],
    'C': exerciseList['C'][Math.floor(Math.random() * exerciseList['C'].length)],
    'S': exerciseList['S'][Math.floor(Math.random() * exerciseList['S'].length)],
    'Joker': exerciseList['Joker'][Math.floor(Math.random() * exerciseList['Joker'].length)],
}

function App() {

    const [ state, setState ] = useState('BEGIN')
    const [ current, setCurrent ] = useState(0)
    const [ timer, setTimer ] = useState(0)

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
            if (current < (random.length - 1)) {
                setCurrent(current + 1)
            } else {
                setState('COMPLETE')
            }
        }
    }

    const currentElement = random[current]


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
                <div className='progress'>{ current + 1 }/{ random.length }</div>
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
            <button className='nextButton' type='button' onClick={() => current < (random.length - 1) ? setCurrent(current + 1) : setState('COMPLETE')}/>
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

ReactDOM.render(<App />, document.getElementById('root'))