import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {
    const socket = useContext(SocketContext);
    const [displayGrid, setDisplayGrid] = useState(false);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        socket.on("game.grid.view-state", (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells']);
            setGrid(data['grid']);
        });
    }, []);

    return (
        <View style={styles.gridContainer}>
            {displayGrid &&
                grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={cell.id}
                                style={[
                                    styles.cell,
                                    cell.owner === "player:1" && styles.playerOwnedCell,
                                    cell.owner === "player:2" && styles.opponentOwnedCell,
                                    (cell.canBeChecked && !(cell.owner === "player:1") && !(cell.owner === "player:2")) && styles.canBeCheckedCell,
                                    rowIndex !== 0 && styles.topBorder,
                                    cellIndex !== 0 && styles.leftBorder,
                                    styles.neonEffect // Appliquer l'effet néon ici
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={[
                                    styles.cellText, 
                                    cell.owner === "player:1" && styles.playerOwnedText,
                                    cell.owner === "player:2" && styles.opponentOwnedText,
                                    cell.canBeChecked && styles.canBeCheckedText
                                ]}>
                                    {cell.viewContent}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "black",
    },
    cellText: {
        fontSize: 20,
        color: 'white', // Couleur de texte par défaut en noir
    },
    playerOwnedCell: {
        backgroundColor: "cyan", // Couleur cyan pour Player 1
        opacity: 0.9,
    },
    playerOwnedText: { // Texte pour Player 1
        color: '#000',
    },
    opponentOwnedCell: {
        backgroundColor: "pink", // Couleur rose type néon pour Player 2
        opacity: 0.9,
    },
    opponentOwnedText: { // Texte pour Player 2
        color: '#000',
    },
    canBeCheckedCell: {
        backgroundColor: "lightyellow",
    },
    canBeCheckedText: { // Texte pour les cases sélectionnables
        color: '#000', // Texte en noir pour contraste avec jaune
    },
    neonEffect: {
        shadowColor: 'cyan',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.8,
    },
    topBorder: {
        borderTopWidth: 1,
    },
    leftBorder: {
        borderLeftWidth: 1,
    },
});

export default Grid;