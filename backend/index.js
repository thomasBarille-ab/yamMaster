const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const updateDecks = (gameIndex) => setTimeout(() => {
    const gameState = games[gameIndex].gameState;
    games[gameIndex].player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', gameState));
    games[gameIndex].player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', gameState));
}, 200);

const setTimerTo5 = (gameIndex) => {
    games[gameIndex].gameState.timer = 5;
    updateTimer(gameIndex);
}

const updateTimer = (gameIndex) => {
    games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
    games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));
}

const updateGrid = (gameIndex) => {
    setTimeout(() => {
        games[gameIndex].player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', games[gameIndex].gameState));
        games[gameIndex].player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', games[gameIndex].gameState));
    }, 200)
}

const updateChoices = (gameIndex) => {
    games[gameIndex].player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', games[gameIndex].gameState));
    games[gameIndex].player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', games[gameIndex].gameState));
}

const updateTokens = (gameIndex) => {
    setTimeout(() => {
        games[gameIndex].player1Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:1', games[gameIndex].gameState));
        games[gameIndex].player2Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:2', games[gameIndex].gameState));
    }, 200);
}

const newPlayerInQueue = (socket) => {

    queue.push(socket);

    // Queue management
    if (queue.length >= 2) {
        const player1Socket = queue.shift();
        const player2Socket = queue.shift();
        createGame(player1Socket, player2Socket);
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    }
};

const createGame = (player1Socket, player2Socket) => {

    const newGame = GameService.init.gameState();
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['player2Socket'] = player2Socket;

    games.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);
    const gameInterval = setInterval(() => {

        games[gameIndex].gameState.timer--;

        // Si le timer tombe à zéro
        if (games[gameIndex].gameState.timer === 0) {

            // On change de tour en inversant le clé dans 'currentTurn'
            games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';

            // Méthode du service qui renvoie la constante 'TURN_DURATION'
            games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

            // Réinitialisation du deck
            games[gameIndex].gameState.deck = GameService.init.deck();
            games[gameIndex].gameState.choices = GameService.init.choices();
            games[gameIndex].gameState.grid = GameService.grid.resetCanBeCheckedCells(games[gameIndex].gameState.grid);
            updateDecks(gameIndex);
            updateChoices(gameIndex);
            updateGrid(gameIndex);
        }

        // On notifie finalement les clients que les données sont mises à jour.
        updateTimer(gameIndex);
    }, 1000);

    // On prévoit de couper l'horloge
    // pour le moment uniquement quand le socket se déconnecte
    player1Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });

    player2Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });

    games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
    games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

    updateGrid(gameIndex);
    updateDecks(gameIndex);
    updateTokens(gameIndex);
};

const rollDices = (socket) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const gameState = games[gameIndex].gameState;
    const rollNumber = gameState.deck.rollsCounter;
    const totalRolls = gameState.deck.rollsMaximum;

    if (totalRolls - rollNumber >= 1) {
        games[gameIndex].gameState.deck.dices = GameService.dices.roll(gameState.deck.dices);
        games[gameIndex].gameState.deck.rollsCounter++;
        updateDecks(gameIndex);
    } else {
        games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(GameService.dices.roll(gameState.deck.dices));
        games[gameIndex].gameState.deck.rollsCounter++;
        updateDecks(gameIndex);
        setTimerTo5(gameIndex)
    }

    const dices = [...games[gameIndex].gameState.deck.dices];
    const isDefi = false;
    const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;
    games[gameIndex].gameState.choices.availableChoices = GameService.choices.findCombinations(dices, isDefi, isSec);

    updateChoices(gameIndex);
}

const removePlayerFromQueue = (socket) => {
    const indexOfSocket = queue.indexOf(socket)
    queue.splice(indexOfSocket, 1);
    socket.emit("game.leave", GameService.send.forPlayer.viewQueueState());
}

const lockDice = (socket, diceId) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const diceIndex = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, diceId);
    games[gameIndex].gameState.deck.dices[diceIndex].locked = !games[gameIndex].gameState.deck.dices[diceIndex].locked;
    updateDecks(gameIndex);
}

const showChoices = (socket, data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;
    games[gameIndex].gameState.grid = GameService.grid.resetCanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    updateGrid(gameIndex);
}

const chooseChoice = (socket, data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    // La sélection d'une cellule signifie la fin du tour (ou plus tard le check des conditions de victoires)
    // On reset l'état des cases qui étaient précédemment clicables.
    games[gameIndex].gameState.grid = GameService.grid.resetCanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, games[gameIndex].gameState.currentTurn, games[gameIndex].gameState.grid);
    games[gameIndex].gameState = GameService.tokens.decrementToken(games[gameIndex].gameState, games[gameIndex].gameState.currentTurn)

    // TODO: Ici calculer le score
    // TODO: Puis check si la partie s'arrête (lines / diagolales / no-more-gametokens)

    // Sinon on finit le tour
    games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

    // On remet le deck et les choix à zéro (la grille, elle, ne change pas)
    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();

    // On reset le timer
    games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
    games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));

    // et on remet à jour la vue
    updateDecks(gameIndex);
    updateChoices(gameIndex);
    updateGrid(gameIndex);
    updateTokens(gameIndex);
}

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {
    console.log(`[${socket.id}] socket connected`);

    socket.on('queue.join', () => {
        console.log(`[${socket.id}] new player in queue `);
        newPlayerInQueue(socket);
    });

    socket.on('queue.leave', () => {
        removePlayerFromQueue(socket);
    })

    socket.on('disconnect', reason => {
        console.log(`[${socket.id}] socket disconnected - ${reason}`);
    });

    socket.on('game.dices.lock', (idDice) => {
        lockDice(socket, idDice);
    });

    socket.on('game.dices.roll', () => {
        rollDices(socket);
    })

    socket.on('game.choices.selected', (data) => {
        showChoices(socket, data);
    })

    socket.on('game.grid.selected', (data) => {
        chooseChoice(socket, data)
    })
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
    console.log('listening on *:3000');
});