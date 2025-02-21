import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import Minesweeper from './src/components/Minesweeper';

/**
 * Componente principal de la aplicación
 */
const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Minesweeper rows={8} cols={8} mines={10} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App; 