import {StyleSheet, Text, View} from "react-native";
import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../../contexts/socket.context";

const PlayerScore = () => {

    const socket = useContext(SocketContext);
    const [score, setScore] = useState(0);

    useEffect(() => {

        socket.on("game.score.view-state", (data) => {
            setScore(data['playerScore'])
        });

    }, []);

    return (
        <View style={styles.playerScoreContainer}>
            <Text>Score : {score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    playerScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "lightgrey"
    },
});


export default PlayerScore;