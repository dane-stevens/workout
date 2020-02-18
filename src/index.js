import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useInterval } from './hooks/interval'
import { AutoFontSize } from 'auto-fontsize'
import { ApolloProvider, useMutation, useQuery } from '@apollo/react-hooks'
import client from './Apollo'
import moment from 'moment'
import ReactGA from 'react-ga'

import './index.sass'

import { GET_WORKOUT, COMPLETE_WORKOUT } from './operations/workout'

ReactGA.initialize('UA-157156515-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const date = new Date().toISOString()

function App() {

    const [ loading, setLoading ] = useState(true)
    const [ preferences, setPreferences ] = useState(true)
    const [ name, setName ] = useState('')
    const [ theme, setTheme ] = useState('blue')
    const [ difficulty, setDifficulty ] = useState(1)
    const [ equipment, setEquipment ] = useState({
        'pullup-bar': false,
        'dumbells': false,
        'barbell': false,
        'kettlebells': false
    })

    useEffect(() => {

        const config = JSON.parse(localStorage.getItem('config') || null)

        if (config && config.theme) setTheme(config.theme)
        if (config && config.difficulty) setDifficulty(config.difficulty)
        if (config && config.equipment) setEquipment(config.equipment)
        if (config && config.name) {
            setName(config.name)
            setPreferences(false)
        }

        setLoading(false)

    },[])

    function submit() {

        if (!name) return

        const config = {
            name,
            theme,
            difficulty,
            equipment
        }

        localStorage.setItem('config', JSON.stringify(config))

        setPreferences(false)
    }

    if (loading) return null

    const hasEquipment = []
    Object.keys(equipment).map(key => equipment[key] && hasEquipment.push(key))

    return <div className={`container theme--${ theme }`}>
        {
            preferences ? (
                <form
                    style={{
                        maxWidth: '480px',
                        margin: '0 auto',
                    }}
                    onSubmit={(e) => {
                        e.preventDefault()
                        submit()
                    }}
                >
                    <h2>First and Last Name</h2>
                    <input type='text' name='name' id='f_name' value={ name } onChange={ (e) => setName(e.target.value) } />

                    <h2>Difficulty</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gridGap: '1rem'
                    }}>
                        <button type='button' className={`difficultyButton ${ difficulty === 1 ? 'difficultyButton--selected' : '' }`} onClick={ () => setDifficulty(1) }>Easy</button>
                        <button type='button' className={`difficultyButton ${ difficulty === 2 ? 'difficultyButton--selected' : '' }`} onClick={ () => setDifficulty(2) }>Medium</button>
                        <button type='button' className={`difficultyButton ${ difficulty === 3 ? 'difficultyButton--selected' : '' }`} onClick={ () => setDifficulty(3) }>Hard</button>
                        <button type='button' className={`difficultyButton ${ difficulty === 4 ? 'difficultyButton--selected' : '' }`} onClick={ () => setDifficulty(4) }>Heroic</button>
                        <button type='button' className={`difficultyButton ${ difficulty === 5 ? 'difficultyButton--selected' : '' }`} onClick={ () => setDifficulty(5) }>Legendary</button>
                    </div>                    

                    <h2>Equipment</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gridGap: '1rem'
                    }}>
                        <button type='button' className={`equipmentButton ${ equipment["pullup-bar"] ? 'equipmentButton--selected' : '' }`} onClick={ () => setEquipment({...equipment, 'pullup-bar': !equipment['pullup-bar']}) }>Pullup Bar<i className={`material-icons`}>{ equipment["pullup-bar"] ? 'check_box' : 'check_box_outline_blank' }</i></button>
                        <button type='button' className={`equipmentButton ${ equipment["dumbells"] ? 'equipmentButton--selected' : '' }`} onClick={ () => setEquipment({...equipment, dumbells: !equipment['dumbells']}) }>Dumbells<i className={`material-icons`}>{ equipment["dumbells"] ? 'check_box' : 'check_box_outline_blank' }</i></button>
                        <button type='button' className={`equipmentButton ${ equipment["barbell"] ? 'equipmentButton--selected' : '' }`} onClick={ () => setEquipment({...equipment, barbell: !equipment['barbell']}) }>Barbell<i className={`material-icons`}>{ equipment["barbell"] ? 'check_box' : 'check_box_outline_blank' }</i></button>
                        <button type='button' className={`equipmentButton ${ equipment["kettlebells"] ? 'equipmentButton--selected' : '' }`} onClick={ () => setEquipment({...equipment, kettlebells: !equipment['kettlebells']}) }>Kettlebells<i className={`material-icons`}>{ equipment["kettlebells"] ? 'check_box' : 'check_box_outline_blank' }</i></button>
                    </div>

                    <h2>Color Theme</h2>
                    <button type='button' className={`themeButton themeButton--blue ${ theme === 'blue' ? 'themeButton--selected' : '' }`} onClick={ () => setTheme('blue') }/>
                    <button type='button' className={`themeButton themeButton--purple ${ theme === 'purple' ? 'themeButton--selected' : '' }`} onClick={ () => setTheme('purple') }/>
                    <button type='button' className={`themeButton themeButton--green ${ theme === 'green' ? 'themeButton--selected' : '' }`} onClick={ () => setTheme('green') }/>
                    
                    <button type='submit'>Save Preferences</button>
                </form>
            ) : (
                <>
                    <button type='button' className='preferences' onClick={ () => setPreferences(true) }><i className='material-icons'>settings_applications</i></button>
                    <Workout config={{ name, difficulty, equipment: hasEquipment }} />
                </>
            )
        }
    </div>

}

function Workout({ config }) {

    const [ state, setState ] = useState('BEGIN')
    const [ current, setCurrent ] = useState(0)
    const [ timer, setTimer ] = useState(0)

    const { loading, error, data } = useQuery(GET_WORKOUT, {
        variables: {
            date: date.substr(0, 10),
            difficulty: config.difficulty,
            equipment: config.equipment
        }
    })

    const [ completeWorkout ] = useMutation(COMPLETE_WORKOUT)

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
            if (current < (sets.length - 1)) {
                setCurrent(current + 1)
            } else {
                setState('COMPLETE')
            }
        }
    }

    if (loading) return 'Loading...'
    if (error) return 'Error loading workout'

    const { workout } = data
    const { sets, exercises } = workout

    function completeTimer() {
        setState('COMPLETE')

        completeWorkout({
            variables: {
                payload: {
                    name: config.name,
                    duration: timer,
                    workoutHash: workout.hash
                }
            }
        })
    }

    const currentSet = sets[current]
    const currentExercise = exercises.find((exercise) => currentSet.exercise === exercise.slug)

    if (state === 'COMPLETE') return (
        <div className='workoutWrapper'>
            <h1>Complete!</h1>
            <ul style={{ marginBottom: '6rem' }}>
                {
                    exercises.map(exercise => <li key={ exercise.slug }>{ exercise.name }: { sets.filter(set => set.exercise === exercise.slug).reduce((count, set) => count + set.count, 0) }</li>)
                }
            </ul>
            <Timer count={ timer } />

            <button type='button' className='start' onClick={ () => window.location.reload() }>Reset</button>
        </div>
    )

    if (state === 'BEGIN') return (
        <div className='workoutWrapper'>
            <h1>Today's Workout</h1>
            <h2>{ moment().format('lll') }</h2>
    <h2>{ moment().unix() }</h2>
            <ul>
                {
                    exercises.map(exercise => <li key={ exercise.slug }>{ exercise.name }: { sets.filter(set => set.exercise === exercise.slug).reduce((count, set) => count + set.count, 0) }</li>)
                }
            </ul>

            <button type='button' className='start' onClick={ () => setState('WORKOUT') }>Start</button>
            <button type='button' className='start' onClick={ () => window.location.reload() }>Reset</button>
        </div>
    )

    return (
        <React.Fragment key={current}>
            <div className='workoutWrapper'>
                <div className='progress'>{ current + 1 }/{ sets.length }</div>
                <div className='exercise'>
                    <AutoFontSize
                        className='exerciseText'
                        text={ currentExercise.name }
                        minTextSize={40}
                        textSize={70}
                        textStepSize={1}
                        targetLines={2}
                    />
                </div>
                <div className='reps'>{ currentSet.count }</div>
                <div className='leftAndRight'>{ currentExercise.alternating && currentExercise.doubleCount ? 'L&R':'' }</div>

                <Timer count={ timer } />
            </div>
            <button className='nextButton' type='button' onClick={() => current < (sets.length - 1) ? setCurrent(current + 1) : completeTimer() }/>
        </React.Fragment>
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