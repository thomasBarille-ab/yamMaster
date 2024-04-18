// websocket-server/services/game.service.js


const TURN_DURATION = 30;

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: TURN_DURATION,
        player1Score: 0,
        player2Score: 0,
        grid: [],
        choices: {},
        deck: {}
    }
}

const CHOICES_INIT = { 
    isDefi: false, 
    isSec: false, 
    idSelectedChoice: null, 
    availableChoices: [], 
};

const ALL_COMBINATIONS = [ 
    { value: 'Brelan1', id: 'brelan1' }, 
    { value: 'Brelan2', id: 'brelan2' }, 
    { value: 'Brelan3', id: 'brelan3' }, 
    { value: 'Brelan4', id: 'brelan4' }, 
    { value: 'Brelan5', id: 'brelan5' }, 
    { value: 'Brelan6', id: 'brelan6' }, 
    { value: 'Full', id: 'full' }, 
    { value: 'Carré', id: 'carre' }, 
    { value: 'Yam', id: 'yam' }, 
    { value: 'Suite', id: 'suite' }, 
    { value: '≤8', id: 'moinshuit' }, 
    { value: 'Sec', id: 'sec' }, 
    { value: 'Défi', id: 'defi' } 
];

const DECK_INIT = { 
    dices: [ 
        { id: 1, value: '', locked: true }, 
        { id: 2, value: '', locked: true }, 
        { id: 3, value: '', locked: true }, 
        { id: 4, value: '', locked: true }, 
        { id: 5, value: '', locked: true }, 
    ], 
    rollsCounter: 1, 
    rollsMaximum: 3 
};

const GameService = {

    init: {
        // Init first level of structure of 'gameState' object
        gameState: () => { 
            const game = { ...GAME_INIT }; 
            game['gameState']['timer'] = TURN_DURATION; 
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT };  
            return game; 
        },
        deck: () => {
            return {...DECK_INIT};
        },
        choices: () => {
            return { ...CHOICES_INIT };
        },
    },
    send: {
        forPlayer: {
            // Return conditionnaly gameState custom objet for player views
            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            gameTimer: (playerKey, gameState) => { 
                // Selon la clé du joueur on adapte la réponse (player / opponent) 
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0; 
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer; 
                return { playerTimer: playerTimer, opponentTimer: opponentTimer }; 
            },
            deckViewState: (playerKey, gameState) => { 
                const deckViewState = { 
                    displayPlayerDeck: gameState.currentTurn === playerKey, 
                    displayOpponentDeck: gameState.currentTurn !== playerKey, 
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum, 
                    rollsCounter: gameState.deck.rollsCounter, 
                    rollsMaximum: gameState.deck.rollsMaximum, 
                    dices: gameState.deck.dices 
                }; 
                return deckViewState; 
            }
        }
    },
    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        }
    },
    dices: { 
        roll: (dicesToRoll) => { 
            const rolledDices = dicesToRoll.map(dice => { 
                if (dice.value === "") { 
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false 
                    const newValue = String(Math.floor(Math.random() * 6) + 1); 
                    return { 
                        id: dice.id, 
                        value: newValue, 
                        locked: false 
                    }; 
                } else if (!dice.locked) { 
                    // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance 
                    const newValue = String(Math.floor(Math.random() * 6) + 1); 
                    return { 
                        ...dice, 
                        value: newValue 
                    }; 
                } else { 
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laiss
                    return dice; 
                } 
            }); 
            return rolledDices; 
        }, 
 
        lockEveryDice: (dicesToLock) => { 
            const lockedDices = dicesToLock.map(dice => ({ 
                ...dice, 
                locked: true 
            })); 
            return lockedDices; 
        } 
    },
    choices: { 
        findCombinations: (dices, isDefi, isSec) => { 
 
            const allCombinations = ALL_COMBINATIONS; 
 
            // Tableau des objets 'combinations' disponibles parmi 'ALL_COMBINATIONS' 
            const availableCombinations = []; 
 
            // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6) 
            const counts = Array(7).fill(0); 
 
            let hasPair = false; // check: paire 
            let threeOfAKindValue = null; // check: valeur brelan 
            let hasThreeOfAKind = false; // check: brelan 
            let hasFourOfAKind = false; // check: carré 
            let hasFiveOfAKind = false; // check: yam 
            let hasStraight = false; // check: suite 
            let sum = dices.reduce((a, b) => a + b, 0);
            let isLessThanEqual8 = sum <= 8; // check: ≤8
 
            // Check for pairs, three of a kind, four of a kind, yam
            counts.forEach((count, index) => {
                if (count >= 2) hasPair = true;
                if (count >= 3) {
                    hasThreeOfAKind = true;
                    threeOfAKindValue = index;
                }
                if (count >= 4) hasFourOfAKind = true;
                if (count == 5) hasFiveOfAKind = true;
            });

            // Check for straight (small or large)
            if (counts.slice(1, 6).every(c => c === 1) || counts.slice(2, 7).every(c => c === 1)) {
                hasStraight = true;
            }

            // return available combinations
            allCombinations.forEach(combination => { 
                    if ( 
                        (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1))) ||
                        (combination.id === 'full' && hasPair && hasThreeOfAKind) || 
                        (combination.id === 'carre' && hasFourOfAKind) || 
                        (combination.id === 'yam' && hasFiveOfAKind) || 
                        (combination.id === 'suite' && hasStraight) || 
                        (combination.id === 'moinshuit' && isLessThanEqual8) || 
                        (combination.id === 'defi' && isDefi) 
                    ) { 
                        availableCombinations.push(combination); 
                    } 
                }); 
 
            return availableCombinations; 
        } 
    },
    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },
        findGameIndexBySocketId: (games, socketId) => { 
            for (let i = 0; i < games.length; i++) { 
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) { 
                    return i; // Retourne l'index du jeu si le socket est trouvé 
                } 
            } 
            return -1; 
        }, 
 
        findDiceIndexByDiceId: (dices, idDice) => { 
            for (let i = 0; i < dices.length; i++) { 
                if (dices[i].id === idDice) { 
                    return i; // Retourne l'index du jeu si le socket est trouvé 
                } 
            } 
            return -1; 
        }
    },
}

module.exports = GameService;