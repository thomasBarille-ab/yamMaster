// websocket-server/services/game.service.js

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const GRID_INIT = [
    [
        {viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false},
        {viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false},
        {viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false},
        {viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false},
        {viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false},
        {viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false},
        {viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false},
        {viewContent: 'Full', id: 'full', owner: null, canBeChecked: false},
        {viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false},
        {viewContent: 'Full', id: 'full', owner: null, canBeChecked: false},
        {viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false},
        {viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false},
        {viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false},
        {viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false},
        {viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false},
        {viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false},
        {viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false},
    ],
    [
        {viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false},
        {viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false},
        {viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false},
        {viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false},
        {viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false},
    ]
];


const ALL_COMBINATIONS = [
    {value: 'Brelan1', id: 'brelan1'},
    {value: 'Brelan2', id: 'brelan2'},
    {value: 'Brelan3', id: 'brelan3'},
    {value: 'Brelan4', id: 'brelan4'},
    {value: 'Brelan5', id: 'brelan5'},
    {value: 'Brelan6', id: 'brelan6'},
    {value: 'Full', id: 'full'},
    {value: 'Carré', id: 'carre'},
    {value: 'Yam', id: 'yam'},
    {value: 'Suite', id: 'suite'},
    {value: '≤8', id: 'moinshuit'},
    {value: 'Sec', id: 'sec'},
    {value: 'Défi', id: 'defi'}
];

const TURN_DURATION = 30;

const DECK_INIT = {
    dices: [
        {id: 1, value: '', locked: true},
        {id: 2, value: '', locked: true},
        {id: 3, value: '', locked: true},
        {id: 4, value: '', locked: true},
        {id: 5, value: '', locked: true},
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        grid: [],
        choices: {},
        deck: {},
        player1Tokens: 12,
        player2Tokens: 12,
        winner: null,
    }
}

const GameService = {

    init: {
        gameState: () => {
            const game = {...GAME_INIT};
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = {...DECK_INIT};
            game['gameState']['choices'] = {...CHOICES_INIT};
            game['gameState']['grid'] = [...GRID_INIT];
            return game;
        },

        deck: () => {
            return {...DECK_INIT};
        },

        choices: () => {
            return {...CHOICES_INIT};
        },

        grid: () => {
            return {...GRID_INIT};
        }
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

            gridViewState: (playerKey, gameState) => {
                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };
            },

            endGame: (playerKey, gameState) => {
                return {
                    winner: gameState.winner === playerKey,
                    endGame: true,
                    playerScore: playerKey === 'player:1' ? gameState.player1Score : gameState.player2Score,
                    opponentScore: playerKey === 'player:1' ? gameState.player2Score : gameState.player1Score
                };
            },


            choicesViewState: (playerKey, gameState) => {
                return {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                };
            },

            deckViewState: (playerKey, gameState) => {
                return {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            scoreViewState: (playerKey, gameState) => {
                return {
                    playerScore: playerKey === 'player:1' ? gameState.player1Score : gameState.player2Score,
                    opponentScore: playerKey === 'player:1' ? gameState.player2Score : gameState.player1Score,
                };
            },

            gameTimer: (playerKey, gameState) => {
                // Selon la clé du joueur on adapte la réponse (player / opponent)
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return {playerTimer: playerTimer, opponentTimer: opponentTimer};
            },

            tokensViewState: (playerKey, gameState) => {
                return {
                    playerTokens: playerKey === 'player:1' ? gameState.player1Tokens : gameState.player2Tokens,
                    opponentTokens: playerKey === 'player:1' ? gameState.player2Tokens : gameState.player1Tokens,
                }
            }
        }
    },

    victoryConditions: {
        checkVictory: function(grid, tokens) {
            const gridSize = grid.length;
            let diagSum1 = new Set();
            let diagSum2 = new Set();
    
            for (let i = 0; i < gridSize; i++) {
                let rowSum = new Set();
                let colSum = new Set();
                for (let j = 0; j < gridSize; j++) {
                    rowSum.add(grid[i][j].owner);
                    colSum.add(grid[j][i].owner);
                }
                // Check if all elements in a row or column are the same and not null
                if (rowSum.size === 1 && !rowSum.has(null)) return true;
                if (colSum.size === 1 && !colSum.has(null)) return true;
    
                // Check diagonals
                diagSum1.add(grid[i][i].owner);
                diagSum2.add(grid[gridSize - 1 - i][i].owner);
            }
            if (diagSum1.size === 1 && !diagSum1.has(null)) return true;
            if (diagSum2.size === 1 && !diagSum2.has(null)) return true;
    
            // Check if any player has run out of tokens
            if (tokens.player1Tokens === 0 || tokens.player2Tokens === 0) return true;
    
            return false;
        }
    },    

    dices: {
        roll: (dicesToRoll) => {
            return dicesToRoll.map(dice => {
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
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }
            });
        },

        lockEveryDice: (dicesToLock) => {
            return dicesToLock.map(dice => ({
                ...dice,
                locked: true
            }));
        }
    },

    grid: {

        resetCanBeCheckedCells: (grid) => {
            // La grille retournée doit avoir le flag 'canBeChecked' de toutes les cases de la 'grid' à 'false'
            return grid.map((gridRow) => {
                return gridRow.map((item) => {
                    item.canBeChecked = false;
                    return item;
                })
            })
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {
            // La grille retournée doit avoir toutes les 'cells' qui ont le même 'id' que le 'idSelectedChoice' à 'canBeChecked: true'

            return grid.map((row) => {
                return row.map((item) => {
                    if (item.id === idSelectedChoice) {
                        item.canBeChecked = true;
                    }

                    return item;
                })
            });
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            // La grille retournée doit avoir la case selectionnée par le joueur du tour en cours à 'owner: currentTurn'
            // Nous avons besoin de rowIndex et cellIndex pour différencier les deux combinaisons similaires du plateau
            grid = grid.map((row, rowIndexGrid) => {
                return row.map((item, itemIndexGrid) => {
                    if (rowIndexGrid === rowIndex && itemIndexGrid === cellIndex && item.id === idCell) {
                        item.owner = currentTurn
                    }

                    return item;
                })
            })

            return grid;
        },

        countPoints: (grid) => {
            const directions = [
                {dr: 0, dc: 1},
                {dr: 1, dc: 0},
                {dr: 1, dc: 1},
                {dr: 1, dc: -1}
            ];

            let score = 0;

            const checkLine = (row, col, dr, dc, owner) => {
                let length = 0;
                while (grid[row] && grid[row][col] && grid[row][col].owner === owner) {
                    length++;
                    row += dr;
                    col += dc;
                }
                return length;
            };

            grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell.owner) {
                        directions.forEach(({dr, dc}) => {
                            if (!(grid[rowIndex - dr] && grid[rowIndex - dr][colIndex - dc] && grid[rowIndex - dr][colIndex - dc].owner === cell.owner)) {
                                const length = checkLine(rowIndex, colIndex, dr, dc, cell.owner);
                                if (length >= 3) {
                                    score += length - 2;
                                }
                            }
                        });
                    }
                });
            });

            return score;
        }

    },


    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = Array(7).fill(0); // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            let hasPair = false; // Pour vérifier si une paire est présente
            let threeOfAKindValue = null; // Stocker la valeur du brelan
            let hasThreeOfAKind = false; // Pour vérifier si un brelan est présent
            let hasFourOfAKind = false; // Pour vérifier si un carré est présent
            let hasFiveOfAKind = false; // Pour vérifier si un Yam est présent
            let hasStraight = false; // Pour vérifier si une suite est présente
            let sum = 0; // Somme des valeurs des dés

            // Compter le nombre de dés de chaque valeur et calculer la somme
            for (let i = 0; i < dices.length; i++) {
                const diceValue = parseInt(dices[i].value);
                counts[diceValue]++;
                sum += diceValue;
            }

            // Vérifier les combinaisons possibles
            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b); // Trie les valeurs de dé

            // Vérifie si les valeurs triées forment une suite
            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            // Vérifier si la somme ne dépasse pas 8
            const isLessThanEqual8 = sum <= 8;

            // Retourner les combinaisons possibles via leur ID
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
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


            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            return availableCombinations;
        }
    },

    tokens: {
        decrementToken: (gameState, playerKey) => {
            if (playerKey === "player:1") {
                gameState["player1Tokens"]--;
                console.log(`Player 1 tokens decremented: now ${gameState["player1Tokens"]}`);
            } else if (playerKey === "player:2") {
                gameState["player2Tokens"]--;
                console.log(`Player 2 tokens decremented: now ${gameState["player2Tokens"]}`);
            }
            return gameState;  // Retourne le gameState mis à jour
        },
    },

    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
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
        },

        endGame: {
            checkForFiveAligned: (grid) => {
                const size = 5; // La grille est de 5x5

                // Fonction helper pour vérifier si cinq cases consécutives sont du même propriétaire
                const checkFiveConsecutive = (cells) => {
                    const first = cells[0].owner;
                    return first && cells.every(cell => cell.owner === first);
                };

                // Vérifier les lignes et les colonnes
                for (let i = 0; i < size; i++) {
                    if (checkFiveConsecutive(grid[i]) || checkFiveConsecutive(grid.map(row => row[i]))) {
                        return grid[i][0].owner; // Retourne le propriétaire si trouvé
                    }
                }

                // Vérifier les diagonales
                const diag1 = [];
                const diag2 = [];
                for (let i = 0; i < size; i++) {
                    diag1.push(grid[i][i]);
                    diag2.push(grid[i][size - 1 - i]);
                }
                if (checkFiveConsecutive(diag1) || checkFiveConsecutive(diag2)) {
                    return diag1[0].owner; // Retourne le propriétaire si trouvé
                }

                return null; // Pas de gagnant trouvé
            },
        },
    }
}

module.exports = GameService;