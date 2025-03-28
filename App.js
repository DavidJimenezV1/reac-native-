import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBcVjr3Enk3Va3Lzv-13XQTpg7jfNU6PN4",
  authDomain: "juego-e5b80.firebaseapp.com",
  projectId: "juego-e5b80",
  storageBucket: "juego-e5b80.firebasestorage.app",
  messagingSenderId: "869337596307",
  appId: "1:869337596307:web:6f3edfb5257c40aa136866"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generateBoard = (size) => {
  return Array(size)
    .fill()
    .map(() => Array(size).fill({ revealed: false, isMine: Math.random() < 0.2 }));
};

export default function App() {
  const [board, setBoard] = useState(generateBoard(8));
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scores, setScores] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver]);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    const scoresCollection = await getDocs(collection(db, "scores"));
    const scoresList = scoresCollection.docs.map(doc => doc.data());
    setScores(scoresList);
  };

  const handlePress = (row, col) => {
    if (gameOver) return;
    if (board[row][col].revealed) return;

    const newBoard = [...board];
    newBoard[row][col] = { ...newBoard[row][col], revealed: true };

    if (newBoard[row][col].isMine) {
      Alert.alert("¡Boom!", "Pisaste una mina.", [{ text: "Reiniciar", onPress: resetGame }]);
      setGameOver(true);
    }
    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(generateBoard(8));
    setElapsedTime(0);
    setGameOver(false);
  };

  const saveScore = async () => {
    try {
      await addDoc(collection(db, "scores"), { name: playerName, time: elapsedTime });
      fetchScores();
    } catch (error) {
      console.error("Error guardando puntuación: ", error);
    }
  };

  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Jugador</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre"
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsRegistered(true)}
        >
          <Text style={styles.buttonText}>Iniciar Juego</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscaminas</Text>
      <Text>Jugador: {playerName}</Text>
      <Text>Tiempo: {elapsedTime}s</Text>
      <TouchableOpacity style={styles.button} onPress={resetGame}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </TouchableOpacity>
      <FlatList
        data={board}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: row, index: rowIndex }) => (
          <View style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[styles.cell, cell.revealed && cell.isMine ? styles.mine : null]}
                onPress={() => handlePress(rowIndex, colIndex)}
              >
                {cell.revealed && cell.isMine ? <Text style={styles.cellText}>💣</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={saveScore}>
        <Text style={styles.buttonText}>Guardar Puntuación</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Puntajes</Text>
      <FlatList
        data={scores}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item.name}: {item.time}s</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4a6ea9",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  cellText: {
    fontSize: 20,
  },
  mine: {
    backgroundColor: "#f44336",
  },
});