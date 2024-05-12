import { StyleSheet, View, ImageBackground } from "react-native";
import { Button } from 'react-native-paper';

// Création d'un bouton personnalisé avec un effet néon
const NeonButton = ({ title, onPress }) => {
    return (
        <View style={styles.neonButtonContainer}>
            <Button 
                mode="contained" 
                onPress={onPress}
                style={styles.neonButton}
                labelStyle={styles.neonText}
            >
                {title}
            </Button>
        </View>
    );
}

export default function HomeScreen({ navigation }) {
    return (
        <ImageBackground 
            source={require('../pictures/home.jpg')}
            style={styles.container}
            resizeMode="stretch" // Cette propriété ajuste le mode de remplissage de l'image de fond
        >
            <NeonButton
                title="Jouer contre un autre joueur"
                onPress={() => navigation.navigate('OnlineGameScreen')}
            />
            <View style={{ height: 20 }} /> {/* Espacement entre les boutons */}
            <NeonButton
                title="Jouer contre le bot"
                onPress={() => navigation.navigate('VsBotGameScreen')}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%', 
        position: 'absolute', 
        justifyContent: "center",
        alignItems: "center",
    },
    neonButtonContainer: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 8,
    },
    neonButton: {
        backgroundColor: '#FF1493', // Couleur de fond rose
        paddingHorizontal: 30,
        paddingVertical: 8,
    },
    neonText: {
        color: '#FFFFFF', // Texte blanc
        fontWeight: 'bold',
    }
});