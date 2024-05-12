// app/components/board/board.component.js

import React from "react";
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import PlayerTimer from '../timers/player-timer.component';
import OpponentTimer from '../timers/opponent-timer.component';
import OpponentDeck from "./decks/opponent-deck.component";
import PlayerDeck from "./decks/player-deck.component";
import Grid from "./grid/grid.component";
import Choices from "./choices/choices.component";
import PlayerInfos from "./infos/player-info.component";
import OpponentInfos from "./infos/opponent-info.component";
import OpponentScore from "./score/opponent-score.component";
import PlayerScore from "./score/player-score.component";


const Board = ({gameViewState}) => {
    return (
        <ImageBackground 
            source={require('../../pictures/board.gif')} // Assure-toi que le chemin vers l'image est correct
            style={styles.container}
            resizeMode="cover" // Ajuste selon le besoin pour remplir l'espace
        >
            <View style={[styles.row, {height: '5%'}]}>
                <OpponentInfos/>
                <View style={styles.opponentTimerScoreContainer}>
                    <OpponentTimer/>
                    <OpponentScore/>
                </View>
            </View>
            <View style={[styles.row, {height: '25%'}]}>
                <OpponentDeck/>
            </View>
            <View style={[styles.row, {height: '40%'}]}>
                <Grid/>
                <Choices/>
            </View>
            <View style={[styles.row, {height: '25%'}]}>
                <PlayerDeck/>
            </View>
            <View style={[styles.row, {height: '5%'}]}>
                <PlayerInfos/>
                <View style={styles.playerTimerScoreContainer}>
                    <PlayerTimer/>
                    <PlayerScore/>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        width: '100%',
        height: '95%',
        backgroundColor: 'black'
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderColor: 'cyan',
    },
    opponentInfosContainer: {
        flex: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'cyan',
    },
    opponentTimerScoreContainer: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'cyan',
    },

    opponentScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deckOpponentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "cyan"
    },
    gridContainer: {
        flex: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'cyan',
    },
    choicesContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deckPlayerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    playerInfosContainer: {
        flex: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
        backgroundColor: "lightgrey"
    },
    playerTimerScoreContainer: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "lightgrey"
    },
    playerScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "lightgrey"
    },
});

export default Board;