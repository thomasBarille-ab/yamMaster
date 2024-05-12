// BotGameController.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Board from '../components/board/board.component';
import { SocketContext } from '../contexts/socket.context';


export default function BotGameController() {
    const socket = useContext(SocketContext);

    const { inGameWithBot } = useContext(SocketContext); // Consume the context

    useEffect(() => {
        if (inGameWithBot) {
            socket.emit('queue.join');
        }
    }, [inGameWithBot, socket]);


    return (
        <View style={styles.container}>
            {inGameWithBot && (
                <>
                    <Board />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    }
});