
import { useEffect, useRef } from 'react';
import axios from 'axios';

declare global {
    interface Window {
        ZoomMtg: any;
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export const useZoom = () => {
    const zoomInitialized = useRef(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const initZoom = () => {
            if (!zoomInitialized.current && window.ZoomMtg) {
                console.log('Initializing Zoom SDK...');
                try {
                    window.ZoomMtg.setZoomJSLib('https://source.zoom.us/3.8.10/lib', '/av');
                    window.ZoomMtg.preLoadWasm();
                    window.ZoomMtg.prepareWebSDK();

                    zoomInitialized.current = true;
                    console.log('Zoom SDK initialized');
                } catch (error) {
                    console.error('Init error:', error);
                }
            }
        };

        if (window.ZoomMtg) {
            initZoom();
        } else {
            const checkInterval = setInterval(() => {
                if (window.ZoomMtg) {
                    initZoom();
                    clearInterval(checkInterval);
                }
            }, 100);

            return () => clearInterval(checkInterval);
        }
    }, []);

    const startSpeechRecognition = async (onTranscript?: (text: string, speaker: string) => void) => {
        if (!onTranscript) return;

        try {
            // Request microphone permission first
            console.log('Requesting microphone permission...');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
        } catch (error) {
            console.error('Microphone permission denied:', error);
            alert('Please allow microphone access for transcription to work');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            alert('Speech recognition is not supported. Please use Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let restartTimeout: any;

        recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
        };

        recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript;
                    console.log('📝 Transcript:', transcript);
                    onTranscript(transcript.trim(), 'Operator');
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                console.error('Microphone access denied');
                return;
            }

            if (event.error !== 'aborted') {
                clearTimeout(restartTimeout);
                restartTimeout = setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.log('Could not restart recognition');
                    }
                }, 1000);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended, restarting...');
            clearTimeout(restartTimeout);
            restartTimeout = setTimeout(() => {
                try {
                    recognition.start();
                } catch (e) {
                    console.log('Could not restart recognition');
                }
            }, 1000);
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            console.log('Speech recognition started successfully');
        } catch (error) {
            console.error(' Failed to start recognition:', error);
        }
    };

    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
                console.log('Speech recognition stopped');
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }
    };

    const joinMeeting = async (callId: string, onTranscript?: (text: string, speaker: string) => void) => {
        try {
            console.log('📞 Joining call:', callId);

            if (!window.ZoomMtg) {
                alert('Zoom SDK not loaded. Please refresh the page.');
                return;
            }

            // Clear Zoom container
            const zoomContainer = document.getElementById('zmmtg-root');
            if (zoomContainer) {
                zoomContainer.innerHTML = '';
                zoomContainer.style.display = 'block';
                console.log('🧹 Cleared Zoom container');
            }

            // Leave existing meeting
            try {
                await window.ZoomMtg.leaveMeeting({});
                console.log('Left previous meeting');
                // Wait for cleanup
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.log('No previous meeting to leave (this is fine)');
            }

            // meeting credentials
            const response = await axios.get(`https://operatorthing.onrender.com/api/emergency/join/${callId}`);
            const { meetingNumber, signature, sdkKey, userName, password } = response.data;

            console.log('✅ Got credentials:', {
                meetingNumber,
                userName,
                hasPassword: !!password,
                passwordLength: password?.length
            });

            // Initialize and join
            window.ZoomMtg.init({
                leaveUrl: window.location.origin,
                patchJsMedia: true,
                leaveOnPageUnload: true,
                success: () => {
                    console.log('Zoom init success, joining meeting...');

                    window.ZoomMtg.join({
                        meetingNumber: String(meetingNumber),
                        signature: signature,
                        sdkKey: sdkKey,
                        userName: userName,
                        userEmail: '',
                        passWord: password || '',
                        tk: '',
                        zak: '',
                        success: (res: any) => {
                            console.log('Successfully joined meeting!', res);

                            // Start transcription after joining
                            setTimeout(() => {
                                console.log('🎤 Starting transcription...');
                                startSpeechRecognition(onTranscript);
                            }, 2000);
                        },
                        error: (error: any) => {
                            console.error('Join meeting error:', error);
                            console.error('Error details:', {
                                errorCode: error.errorCode,
                                errorMessage: error.errorMessage,
                                method: error.method,
                                status: error.status,
                                result: error.result
                            });

                   
                            let errorMsg = 'Failed to join meeting.';
                            if (error.errorMessage) {
                                errorMsg += '\n\n' + error.errorMessage;
                            }
                            if (error.errorCode === 3000) {
                                errorMsg += '\n\nTry refreshing the page and joining again.';
                            }

                            alert(errorMsg);
                        },
                    });
                },
                error: (error: any) => {
                    console.error('Zoom init error:', error);
                    alert('Failed to initialize Zoom SDK. Please refresh the page and try again.');
                },
            });
        } catch (error: any) {
            console.error('API/Network error:', error);
            alert('Network error: ' + (error.response?.data?.error || error.message));
        }
    };

    return { joinMeeting, stopSpeechRecognition };
};