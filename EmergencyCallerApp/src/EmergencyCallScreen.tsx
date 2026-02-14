import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function EmergencyCallScreen() {
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [calling, setCalling] = useState(false);

  const startEmergencyCall = async () => {
    if (!emergencyType) {
      Alert.alert('Please select emergency type');
      return;
    }

    setCalling(true);

    try {
      console.log('📞 Creating emergency call...');
      
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco, CA',
      };

      // Create meeting
      const response = await axios.post(`${API_URL}/api/emergency/create`, {
        emergencyType,
        location,
      });

      const { meetingNumber, signature, sdkKey, userName, password } = response.data;

      console.log('✅ Meeting created:', meetingNumber);

      // Build Zoom web client URL
    //   const zoomUrl = `https://zoom.us/wc/${meetingNumber}/join?pwd=${password}`;
    const zoomUrl = `https://zoom.us/j/${meetingNumber}?pwd=${password}`;

      // Open in Safari
      const canOpen = await Linking.canOpenURL(zoomUrl);
      
      if (canOpen) {
        await Linking.openURL(zoomUrl);
        Alert.alert(
          'Call Started',
          'Zoom will open in Safari. Join the meeting to connect with emergency services.',
          [
            {
              text: 'OK',
              onPress: () => setEmergencyType(null),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Cannot open Zoom');
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error.message || 'Failed to create call');
    } finally {
      setCalling(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Emergency Call</Text>
      <Text style={styles.subtitle}>Select emergency type</Text>

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            emergencyType === 'medical' && styles.selected,
          ]}
          onPress={() => setEmergencyType('medical')}
        >
          <Text style={styles.emoji}>🚑</Text>
          <Text style={styles.typeText}>Medical</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeBtn,
            emergencyType === 'fire' && styles.selected,
          ]}
          onPress={() => setEmergencyType('fire')}
        >
          <Text style={styles.emoji}>🚒</Text>
          <Text style={styles.typeText}>Fire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeBtn,
            emergencyType === 'police' && styles.selected,
          ]}
          onPress={() => setEmergencyType('police')}
        >
          <Text style={styles.emoji}>🚓</Text>
          <Text style={styles.typeText}>Police</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeBtn,
            emergencyType === 'other' && styles.selected,
          ]}
          onPress={() => setEmergencyType('other')}
        >
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.typeText}>Other</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.callBtn,
          (calling || !emergencyType) && styles.callBtnDisabled,
        ]}
        onPress={startEmergencyCall}
        disabled={calling || !emergencyType}
      >
        {calling ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.callBtnText}>START EMERGENCY CALL</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        Call will open in your browser where you can share video and audio
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  typeBtn: {
    width: '48%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  selected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  callBtn: {
    backgroundColor: '#ef4444',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  callBtnDisabled: {
    backgroundColor: '#ccc',
  },
  callBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});