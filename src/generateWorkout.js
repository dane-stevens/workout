const fs = require('fs');

const cards = [
    ['H','2'],
    ['H','3'],
    ['H','4'],
    ['H','5'],
    ['H','6'],
    ['H','7'],
    ['H','8'],
    ['H','9'],
    ['H','10'],
    ['H','J'],
    ['H','Q'],
    ['H','K'],
    ['H','A'],

    ['D','2'],
    ['D','3'],
    ['D','4'],
    ['D','5'],
    ['D','6'],
    ['D','7'],
    ['D','8'],
    ['D','9'],
    ['D','10'],
    ['D','J'],
    ['D','Q'],
    ['D','K'],
    ['D','A'],

    ['S','2'],
    ['S','3'],
    ['S','4'],
    ['S','5'],
    ['S','6'],
    ['S','7'],
    ['S','8'],
    ['S','9'],
    ['S','10'],
    ['S','J'],
    ['S','Q'],
    ['S','K'],
    ['S','A'],

    ['C','3'],
    ['C','2'],
    ['C','4'],
    ['C','5'],
    ['C','6'],
    ['C','7'],
    ['C','8'],
    ['C','9'],
    ['C','10'],
    ['C','J'],
    ['C','Q'],
    ['C','K'],
    ['C','A'],

    ['Joker', 'Joker'],
    ['Joker', 'Joker']

];

const randomCards = cards.sort(() => .5 - Math.random());

const exerciseList = {
    'D': [
        'Dive Bomber Pushups',
        'Regular Pushups',
        'Thumbs Up Pushups',
        'Reverse Pushups',
    ],
    'H': [
        'Burpees',
        'Squat Jumps',
        'Jumping Knee Tuck',
        'Squat Thrusts',
        '180 Degree Burpees',
        'Broad Jump Burpees',
    ],
    'C': [
        'Hindu Squats',
        'Sumo Squats',
        'Pistol Squats',
    ],
    'S': [
        'Hanging Knee Tucks',
        'Mountain Climbers',
        'V-Ups',
        'Windshield Wipers',
    ],
    'Joker': [
        'Pullups',
        'Handstand Pushups',
        'Commando Pullups',
        'Headbanger Pullups',
    ]
};

const exercises = {
    'D': exerciseList['D'][Math.floor(Math.random() * exerciseList['D'].length)],
    'H': exerciseList['H'][Math.floor(Math.random() * exerciseList['H'].length)],
    'C': exerciseList['C'][Math.floor(Math.random() * exerciseList['C'].length)],
    'S': exerciseList['S'][Math.floor(Math.random() * exerciseList['S'].length)],
    'Joker': exerciseList['Joker'][Math.floor(Math.random() * exerciseList['Joker'].length)],
};

fs.writeFile('src/config.json', JSON.stringify({
    cards: randomCards,
    exercises: exercises
}), function(err) { 
    if (err) throw err;
    console.log('Workout generated successfully.');
});