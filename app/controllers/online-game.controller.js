import React, { useEffect, useState, useContext, useCallback } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";


export default function OnlineGameController({navigation}) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);

    const handleCancel = useCallback(() => {
        if (socket) {
            socket.emit('queue.cancel');
            console.log('[emit][queue.cancel]');
        }
        setInQueue(false);
        // navigation.navigate('Home');
    }, [socket]);

    useEffect(() => {
        console.log('[emit][queue.join]:', socket.id);
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            console.log('[listen][queue.added]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            console.log('[listen][game.start]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
        });

        socket.on('queue.cancelled', (data) => {
            console.log('[listen][queue.cancelled]:', data);
            setInQueue(false);  // Confirmation du serveur que l'utilisateur a été retiré de la file
            alert('You have been removed from the queue.');
            navigation.navigate('HomeScreen');
        });

    }, []);

    return (
        <View style={styles.container}>
            {!inQueue && !inGame && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for server datas...
                    </Text>
                </>
            )}

            {inQueue && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for another player...
                    </Text>
                    <Button title="Cancel" onPress={handleCancel}/>
                </>
            )}

            {inGame && (
                <>
                    <Board/>
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
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
    }
});