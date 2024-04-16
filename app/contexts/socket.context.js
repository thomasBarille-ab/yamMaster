// app/contexts/socket.context.js
import React from "react";
import { Platform } from 'react-native';
import io from "socket.io-client";

console.log('Emulation OS Platform: ', Platform.OS);

// Endpoint configuration based on platform
export const socketEndpoint = Platform.OS === 'web' ? "http://localhost:3000" : "http://172.20.10.2:3000";

// Socket initialization
export const socket = io(socketEndpoint, {
    transports: ["websocket"],
});

// Connection state management
export let hasConnection = false;

socket.on("connect", () => {
    console.log("connect: ", socket.id);
    hasConnection = true;
});

socket.on("disconnect", () => {
    hasConnection = false;
    console.log("disconnected from server");
    socket.removeAllListeners();
});

// Context for socket
export const SocketContext = React.createContext();