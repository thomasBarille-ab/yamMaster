const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');

let games = [];
let queue = [];

const updateViewPlayerTimer = (game) => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
}

const updateViewPlayerDeck = (game) => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
};

const updateViewPlayerChoices = (game) => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
};

const newPlayerInQueue = (socket) => {
    queue.push(socket);
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
    newGame.idGame = uniqid();
    newGame.player1Socket = player1Socket;
    newGame.player2Socket = player2Socket;
    games.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);
    const gameState = games[gameIndex].gameState;
    updateViewPlayerDeck(games[gameIndex]);

    const gameInterval = setInterval(() => {
        const dices = { ...games[gameIndex].gameState.deck.dices}; 
        const isDefi = false; 
        const isSec = games[gameIndex].gameState.deck.rollsCounter === 2; 
        const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);

        games[gameIndex].gameState.choices.availableChoices = combinations;
        updateClientsViewChoices(games[gameIndex]);
        gameState.timer--;
        if (gameState.timer === 0) {
            gameState.currentTurn = gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            gameState.timer = GameService.timer.getTurnDuration();
            gameState.deck = GameService.init.deck();
            updateViewPlayerDeck(games[gameIndex]);
        }
        updateViewPlayerTimer(games[gameIndex]);
    }, 1000);

    player1Socket.on('disconnect', () => clearInterval(gameInterval));
    player2Socket.on('disconnect', () => clearInterval(gameInterval));
    updateViewPlayerDeck(games[gameIndex]);
};

io.on('connection', socket => {
    console.log(`[${socket.id}] socket connected`);
    socket.on('queue.join', () => newPlayerInQueue(socket));
    socket.on('queue.leave', () => {
    });

    socket.on('game.dices.roll', () => {
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gameIndex === -1) return;
        const gameState = games[gameIndex].gameState;
        const dicesToRoll = gameState.deck.dices.filter(dice => !dice.locked);
        gameState.deck.dices = GameService.dices.roll(dicesToRoll);
        gameState.deck.rollsCounter++;
        updateViewPlayerDeck(games[gameIndex]);

        if (gameState.deck.rollsCounter > gameState.deck.rollsMaximum) {
            gameState.deck.dices = GameService.dices.lockEveryDice(gameState.deck.dices);
            gameState.timer = 5;
            updateViewPlayerDeck(games[gameIndex]);
        }
    });

    socket.on('game.dices.lock', (idDice) => {
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gameIndex === -1) return;
        const diceIndex = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);
        if (diceIndex !== -1) {
            games[gameIndex].gameState.deck.dices[diceIndex].locked = !games[gameIndex].gameState.deck.dices[diceIndex].locked;
            updateViewPlayerDeck(games[gameIndex]);
        }
    });

    socket.on('game.choices.selected', (data) => { 
        // gestion des choix 
        const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id); 
        games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId; 
     
        updateClientsViewChoices(games[gameIndex]); 
    });
});

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function() {
    console.log('listening on *:3000');
});
