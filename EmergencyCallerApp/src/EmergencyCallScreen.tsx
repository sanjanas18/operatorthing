import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
// const API_URL = 'https://shoes-van-tell-match.trycloudflare.com'; // 🔁 update tunnel URL as needed

export default function EmergencyCallScreen() {
  const [calling, setCalling] = useState(false);

  const startEmergencyCall = async () => {
    setCalling(true);
    try {
      const response = await axios.post(`${API_URL}/api/emergency/create`, {
        emergencyType: 'other',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'San Francisco, CA',
        },
      });

      const { meetingNumber, password } = response.data;
      const zoomUrl = `https://zoom.us/j/${meetingNumber}?pwd=${password}`;
      const canOpen = await Linking.canOpenURL(zoomUrl);

      if (canOpen) {
        await Linking.openURL(zoomUrl);
        Alert.alert(
          'Call Started',
          'Zoom will open. Join the meeting to connect with emergency services.',
          [{ text: 'OK' }]
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
    <SafeAreaView style={styles.container}>

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navIcon}>🚨</Text>
        <Text style={styles.navTitle}>Emergency Dispatch</Text>
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.body}>

        {/* Big icon ring */}
        <View style={styles.iconRing}>
          <Text style={styles.icon}>🆘</Text>
        </View>

        <Text style={styles.title}>Need Help?</Text>
        <Text style={styles.subtitle}>
          Press the button below to instantly connect with an emergency responder via video call.
        </Text>

        {/* THE button */}
        <TouchableOpacity
          style={[styles.callBtn, calling && styles.callBtnCalling]}
          onPress={startEmergencyCall}
          disabled={calling}
          activeOpacity={0.85}
        >
          {calling ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.callBtnText}>Connecting...</Text>
            </>
          ) : (
            <>
              <Text style={styles.callBtnIcon}>📞</Text>
              <Text style={styles.callBtnText}>EMERGENCY CALL</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          📍 Your location will be shared with emergency responders
        </Text>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.1)',
    gap: 10,
  },
  navIcon: { fontSize: 24 },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 0.3,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },

  // Body
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },

  iconRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 64 },

  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },

  // Call Button
  callBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginTop: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  callBtnCalling: {
    backgroundColor: '#64748b',
    shadowOpacity: 0,
  },
  callBtnIcon: { fontSize: 24 },
  callBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  disclaimer: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
  },
});