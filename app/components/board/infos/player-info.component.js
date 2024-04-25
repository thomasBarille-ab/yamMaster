import React, {useEffect, useContext, useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import {SocketContext} from "../../../contexts/socket.context";

const PlayerInfos = () => {
    const socket = useContext(SocketContext);
    const [playerTokens, setPlayerTokens] = useState(0);

    useEffect(() => {

        socket.on("game.tokens.view-state", (data) => {
            setPlayerTokens(data['playerTokens'])
        });

        console.log("bbbbb", playerTokens);


    }, []);
    return (
        <View style={styles.opponentTimerContainer}>
            <Text>Tokens: {playerTokens}</Text>
        </View>
    );
};


const styles = StyleSheet.create({
    opponentTimerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default PlayerInfos;