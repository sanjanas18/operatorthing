import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Linking,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import axios from 'axios';

// const API_URL = 'http://localhost:3000';
const API_URL = 'https://operatorthing.onrender.com';

interface UserData {
    name: string;
    age: string;
    phone: string;
    medicalConditions: string;
}

export default function EmergencyCallScreen() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [calling, setCalling] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');

    const clearUserData = () => {
        setUserData(null);
        setName('');
        setAge('');
        setPhone('');
        setMedicalConditions('');
    };

    const handleContinue = () => {
        if (name.trim() === '' || age.trim() === '') {
            Alert.alert('Required Fields', 'Please enter your name and age');
            return;
        }

        const data: UserData = {
            name: name.trim(),
            age: age.trim(),
            phone: phone.trim(),
            medicalConditions: medicalConditions.trim(),
        };

        setUserData(data);
    };

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
                
                userInfo: {
                    name: userData?.name || 'Unknown',
                    age: userData?.age || 'Unknown',
                    phone: userData?.phone || 'Not provided',
                    medicalConditions: userData?.medicalConditions || 'None reported',
                },
            });

            const { meetingNumber, password } = response.data;

            console.log('Meeting created:', meetingNumber);

            const zoomUrl = `https://zoom.us/wc/${meetingNumber}/join?pwd=${password}`;

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
            console.error('Error:', error);
            Alert.alert('Error', error.message || 'Failed to create call');
        } finally {
            setCalling(false);
        }
    };

    // INTRO SCREEN
    if (!userData) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>FrontLine</Text>
                            <Text style={styles.headerSubtitle}>
                                Please provide your information for emergency response coordination.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Full Name <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="John Doe"
                                    placeholderTextColor="#64748b"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Age */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Age <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="25"
                                    placeholderTextColor="#64748b"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="number-pad"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+1 (555) 123-4567"
                                    placeholderTextColor="#64748b"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Medical Conditions */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Medical Conditions (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Allergies, chronic conditions, medications..."
                                    placeholderTextColor="#64748b"
                                    value={medicalConditions}
                                    onChangeText={setMedicalConditions}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[
                                styles.continueBtn,
                                (name.trim() === '' || age.trim() === '') && styles.continueBtnDisabled,
                            ]}
                            onPress={handleContinue}
                            disabled={name.trim() === '' || age.trim() === ''}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.continueBtnText}>Continue</Text>
                        </TouchableOpacity>

                        <Text style={styles.privacy}>
                            Your information is secured and will only be shared with emergency responders during active calls.
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // EMERGENCY SCREEN
    return (
        <SafeAreaView style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navLeft}>
                    <View style={styles.statusIndicator} />
                    <Text style={styles.navTitle}>FrontLine</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>ACTIVE</Text>
                </View>
            </View>

            {/* Main content */}
            <View style={styles.body}>
                {/* User info card */}
                <View style={styles.userCard}>
                    <Text style={styles.userLabel}>Registered User</Text>
                    <Text style={styles.userName}>{userData.name}</Text>
                    {userData.age && (
                        <Text style={styles.userDetail}>Age: {userData.age}</Text>
                    )}
                    {userData.phone && (
                        <Text style={styles.userDetail}>Contact: {userData.phone}</Text>
                    )}
                </View>

                <View style={styles.divider} />

                <Text style={styles.title}>Emergency Assistance</Text>
                <Text style={styles.subtitle}>
                    Connect with emergency response services via secure video call. Your location and medical information will be transmitted automatically.
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
                        <Text style={styles.callBtnText}>INITIATE EMERGENCY CALL</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    GPS coordinates and medical history will be shared with emergency services
                </Text>

                {/* Reset button */}
                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                        Alert.alert(
                            'Clear Registration',
                            'Remove your registered information from this device?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Clear', style: 'destructive', onPress: clearUserData },
                            ]
                        );
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={styles.resetBtnText}>Clear Registration</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1c',
    },

    // INTRO SCREEN STYLES
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 32,
        paddingTop: 60,
    },
    header: {
        marginBottom: 48,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#8b92a8',
        lineHeight: 22,
        fontWeight: '400',
    },
    form: {
        gap: 20,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#b4b9c8',
        letterSpacing: 0.2,
        textTransform: 'uppercase',
    },
    required: {
        color: '#dc2626',
    },
    input: {
        backgroundColor: '#151b2e',
        borderWidth: 1,
        borderColor: '#1f2937',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '400',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    continueBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueBtnDisabled: {
        backgroundColor: '#1f2937',
        opacity: 0.5,
    },
    continueBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    privacy: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 18,
        fontWeight: '400',
    },

    // EMERGENCY SCREEN STYLES
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#0f1419',
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
    },
    navLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.2,
    },
    statusBadge: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10b981',
        letterSpacing: 0.5,
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    userCard: {
        backgroundColor: '#151b2e',
        borderWidth: 1,
        borderColor: '#1f2937',
        borderRadius: 8,
        padding: 20,
        width: '100%',
        marginBottom: 24,
    },
    userLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    userDetail: {
        fontSize: 14,
        color: '#8b92a8',
        marginTop: 4,
        fontWeight: '400',
    },
    divider: {
        width: 60,
        height: 1,
        backgroundColor: '#1f2937',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#8b92a8',
        textAlign: 'center',
        lineHeight: 21,
        maxWidth: 320,
        marginBottom: 32,
        fontWeight: '400',
    },
    callBtn: {
        backgroundColor: '#dc2626',
        borderRadius: 8,
        paddingVertical: 18,
        paddingHorizontal: 48,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    callBtnCalling: {
        backgroundColor: '#4b5563',
    },
    callBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    disclaimer: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 18,
        fontWeight: '400',
    },
    resetBtn: {
        marginTop: 32,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    resetBtnText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});