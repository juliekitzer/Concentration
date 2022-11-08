// Array for puzzle backgrounds
let puzzle = [
    {puzzleAnswer: 'throw in the towl',
    img: './assets/owl.png'},
    
    {puzzleAnswer: 'To be or not to be',
    img: './assets/bee.png'},
    
    // {puzzleAnswer: 'lion',
    // img: './assets/lion_card.jpeg'},  
    ]

// This variable sets a random integer as the puzzle background within the range of the puzzle.length
const randomPuzzle = Math.floor(Math.random() * (puzzle.length));
console.log(randomPuzzle);

// Solution is the variable that the img and answer come from
let solution = puzzle[randomPuzzle]
console.log(solution);
//  Adding an attribute to the board-container tag from HTML 
const divForBackground = document.querySelector('.board-container')
divForBackground.setAttribute('style', `background-image: url(${solution.img}); background-size: contain`)

// This is grabbing the tag by the ID and setting it to inputBox variable
const inputBox = document.querySelector('#userInput')

// This object allows you to select different classes 
const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    start: document.querySelector('button'),
    timer: document.querySelector('.timer'), 
}

// This keeps track of variables that are constantly changing
const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

// This area shuffles the cards. Array is being cloned to create a double of each array item
const shuffle = (array) => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

// This area randomizes card grid
const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)

        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    if (dimensions % 2 !== 0) {
        return('Error, needs even number.')
        
    }

    // This array holds the card images, its inside the generate game function so it starts when the game starts
    const cardImg = 
    ['./assets/cheese_card.jpeg',
     './assets/crocodile_card.jpg', 
     './assets/dino_card.jpeg', 
     './assets/epicBattle_card.jpeg', 
     './assets/tiger_card.jpg', 
     './assets/lion_card.jpeg', 
     './assets/monster_card.jpg', 
     './assets/pandaDonut_card.jpeg', 
     './assets/polarPump_card.jpeg', 
     './assets/sloth_card.jpeg',]
    const picks = pickRandom(cardImg, (dimensions * dimensions) / 2) 
    const items = shuffle([...picks, ...picks])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    
                    <img src=${item} class="card-back">
                </div>
            `).join('')}
       </div>
    `

    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}

// Function to toggle modal for users guess
// Needs to be called second time to go away
const toggleModal = () => {
    const overlay = document.querySelector('#overlay');
    overlay.classList.toggle('visible');
}

// Only toggles when correct answer is guessed, it's called in validateAnswer
const toggleWinModal = () => {
    const overlay = document.querySelector('#winOverlay');
    overlay.classList.toggle('visible');
}

// This function creates tags that contain values that are dynamic.
//  It then appends them to the modal so they get attached to the div.
const winModalContent = () => {
    let modal = document.querySelector('#winModal');
    let winPuzzle = document.createElement('img');
    winPuzzle.setAttribute('src', `${solution.img}`)
    winPuzzle.setAttribute('style', 'width:500px')
    modal.append(winPuzzle)
    gameResponse.setAttribute('id', 'thegameResponse');
    let totalTime = document.createElement('p');
    totalTime.innerText = `Total time: ${state.totalTime}`;
    let totalFlips = document.createElement('p');
    totalFlips.innerText = `Total Flips: ${state.totalFlips}`;
    modal.append(totalTime)
    modal.append(totalFlips)
    let refresh = document.createElement('button');
    refresh.setAttribute('onClick', 'location.reload();');
    refresh.innerHTML = ('Play again!');
    modal.append(refresh)
}

// This function checks if input from user matches solution
const validateAnswer = () => {
    let gameResponse = document.querySelector('#gameResponse')
    let inputValue = document.querySelector('#userInput')
    if (inputValue.value.toLowerCase() == solution.puzzleAnswer.toLowerCase()) {
        gameResponse.innerText = 'Correct, you win'
        toggleModal()
        winModalContent()
        toggleWinModal()
    } else {
        gameResponse.innerText = 'Incorrect, keep playing'
        // toggleModal()
        setTimeout(() => {toggleModal()}, 3000)
    }
}

// Makes sure that the previous inputs are not there the next time the modal populates
function clearModalText(){
    let clearInput = document.querySelector('#userInput')
    clearInput.value = ""
    let clearGameResponse = document.querySelector('#gameResponse')
    clearGameResponse.innerText = ""

}
// This gets called right away because its in the globalscope
// This is where it adds to total time + moves
const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++
        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `time: ${state.totalTime} sec`
    }, 1000)
}

// This makes sure all cards get flipped back over when they are not matched
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}


// Each time this is called it will update the state by increment of 1
const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }
// 
    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerHTML === flippedCards[1].innerHTML) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
            clearModalText()
            setTimeout(() => {
                toggleModal()
            }, 2000)
        }
// This function waits 1000 ms or 1 second to call flipBackCard method
        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}
generateGame()
attachEventListeners()