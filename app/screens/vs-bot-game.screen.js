// app/screens/vs-bot-game.screen.js 

import React, { useContext } from "react"; 
import { StyleSheet, View, Button, Text } from "react-native"; 
import { SocketContext } from '../contexts/socket.context'; 
import BotGameController from "../controllers/bot-game.controller";

export default function VsBotGameScreen({ navigation }) { 

    const socket = useContext(SocketContext); 
    const { inGameWithBot } = useContext(SocketContext); // Consume the GameContext

    return ( 
        <View style={styles.container}> 
            {!socket && ( 
                <> 
                    <Text style={styles.paragraph}> 
                        No connection with server... 
                    </Text> 
                    <Text style={styles.footnote}> 
                        Restart the app and wait for the server to be back again. 
                    </Text> 
                </> 
            )}

            {socket && inGameWithBot && (
                <BotGameController />
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
})