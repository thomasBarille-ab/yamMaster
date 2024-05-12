import {StyleSheet, Text, View} from "react-native";
import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../../contexts/socket.context";

const OpponentScore = () => {
    const socket = useContext(SocketContext);
    const [score, setScore] = useState(0);

    useEffect(() => {

        socket.on("game.score.view-state", (data) => {
            setScore(data['opponentScore'])
        });

    }, []);
    return (
        <View style={styles.opponentScoreContainer}>
            <Text>Score : {score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    opponentScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OpponentScore;