import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';
import { COLORS, MAX_NICKNAME_LENGTH } from '../constants/game';
import { Difficulty } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const { playerData, setNickname } = usePlayer();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleNicknameSubmit = async () => {
    if (newNickname.trim()) {
      await setNickname(newNickname.trim());
    }
    setIsEditingNickname(false);
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
    setNewNickname(playerData?.nickname || '');
  };

  const handleSaveProfile = async () => {
    if (newNickname.trim()) {
      await setNickname(newNickname.trim());
      playSound('levelup');
    }
    setShowProfileModal(false);
  };

  const formatTime = (time: number | null) => {
    if (!time) return '---';
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    router.push({
      pathname: '/game',
      params: { difficulty: selectedDifficulty }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleEditProfile}
        >
          <View style={styles.profileInfo}>
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
            <Text style={styles.welcomeText}>
              ¡Hola, {playerData?.nickname}!
            </Text>
          </View>
          <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.difficultyContainer}>
        <Text style={styles.sectionTitle}>Dificultad</Text>
        <View style={styles.difficultyButtons}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.difficultyButton,
                selectedDifficulty === difficulty && styles.selectedDifficulty,
              ]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  selectedDifficulty === difficulty && styles.selectedDifficultyText,
                ]}
              >
                {difficulty === 'easy' ? 'Fácil' :
                 difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        {playerData && Object.entries(playerData.stats).map(([difficulty, stats]) => (
          <View key={difficulty} style={styles.statCard}>
            <Text style={styles.statTitle}>
              {difficulty === 'easy' ? 'Fácil' :
               difficulty === 'medium' ? 'Medio' : 'Difícil'}
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Partidas Jugadas:</Text>
              <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Partidas Ganadas:</Text>
              <Text style={styles.statValue}>{stats.gamesWon}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Mejor Tiempo:</Text>
              <Text style={styles.statValue}>{formatTime(stats.bestTime)}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.playButton} onPress={startGame}>
        <Text style={styles.playButtonText}>JUGAR</Text>
      </TouchableOpacity>

      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.nicknameInput}
                value={newNickname}
                onChangeText={setNewNickname}
                maxLength={MAX_NICKNAME_LENGTH}
                placeholder="Ingresa tu nickname"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  nicknameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 5,
    minWidth: 150,
  },
  difficultyContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: COLORS.revealed,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: COLORS.primary,
  },
  difficultyText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedDifficultyText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: COLORS.revealed,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    color: COLORS.text,
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  playButtonText: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.revealed,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});

export default HomeScreen; 