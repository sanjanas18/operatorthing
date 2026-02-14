

// import { useEffect, useRef } from 'react';
// import axios from 'axios';

// declare global {
//   interface Window {
//     ZoomMtg: any;
//   }
// }

// export const useZoom = () => {
//   const zoomInitialized = useRef(false);

//   useEffect(() => {
//     const initZoom = () => {
//       if (!zoomInitialized.current && window.ZoomMtg) {
//         console.log('✅ Initializing Zoom SDK...');
//         try {
//           window.ZoomMtg.setZoomJSLib('https://source.zoom.us/3.8.10/lib', '/av');
//           window.ZoomMtg.preLoadWasm();
//           window.ZoomMtg.prepareWebSDK();
//           zoomInitialized.current = true;
//           console.log('✅ Zoom SDK ready');
//         } catch (error) {
//           console.error('❌ Init error:', error);
//         }
//       }
//     };

//     if (window.ZoomMtg) {
//       initZoom();
//     } else {
//       const checkInterval = setInterval(() => {
//         if (window.ZoomMtg) {
//           initZoom();
//           clearInterval(checkInterval);
//         }
//       }, 100);
      
//       return () => clearInterval(checkInterval);
//     }
//   }, []);

// //   const joinMeeting = async (callId: string) => {
// //     try {
// //       console.log('📞 Joining call:', callId);
      
// //       if (!window.ZoomMtg) {
// //         alert('Zoom SDK not loaded');
// //         return;
// //       }
      
// //       const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
// //       const { meetingNumber, signature, sdkKey, userName, password } = response.data; // ← ADD password HERE
      
// //       console.log('✅ Got credentials:', { 
// //         meetingNumber, 
// //         userName,
// //         password: password || 'none' // ← Log it to verify
// //       });

// //       window.ZoomMtg.init({
// //         leaveUrl: window.location.origin,
// //         success: () => {
// //           console.log('✅ Init success, joining...');
          
// //           window.ZoomMtg.join({
// //             meetingNumber: String(meetingNumber),
// //             signature: signature,
// //             sdkKey: sdkKey,
// //             userName: userName,
// //             userEmail: '',
// //             passWord: password || '', // ← USE THE PASSWORD FROM RESPONSE
// //             tk: '',
// //             zak: '',
// //             success: (res: any) => {
// //               console.log('✅ Joined successfully!', res);
// //             },
// //             error: (error: any) => {
// //               console.error('❌ Join error:', error);
// //               alert('Failed to join: ' + (error.errorMessage || JSON.stringify(error)));
// //             },
// //           });
// //         },
// //         error: (error: any) => {
// //           console.error('❌ Init error:', error);
// //           alert('Failed to initialize: ' + (error.errorMessage || JSON.stringify(error)));
// //         },
// //       });
// //     } catch (error: any) {
// //       console.error('❌ API error:', error);
// //       alert('Error: ' + (error.response?.data?.error || error.message));
// //     }
// //   };

// const joinMeeting = async (callId: string) => {
//   try {
//     console.log('📞 Joining call:', callId);
    
//     if (!window.ZoomMtg) {
//       alert('Zoom SDK not loaded');
//       return;
//     }
    
//     const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
    
//     // LOG THE ENTIRE RESPONSE
//     console.log('🔍 FULL RESPONSE:', response.data);
    
//     const { meetingNumber, signature, sdkKey, userName, password } = response.data;
    
//     console.log('✅ Extracted credentials:', { 
//       meetingNumber, 
//       userName,
//       password: password,
//       passwordType: typeof password,
//       passwordLength: password?.length
//     });

//     window.ZoomMtg.init({
//       leaveUrl: window.location.origin,
//       patchJsMedia: true,
//       leaveOnPageUnload: true, 
//       success: () => {
//         console.log('✅ Init success, joining with password:', password);
        
//         window.ZoomMtg.join({
//           meetingNumber: String(meetingNumber),
//           signature: signature,
//           sdkKey: sdkKey,
//           userName: userName,
//           userEmail: '',
//           passWord: password || '',
//           tk: '',
//           zak: '',
//           success: (res: any) => {
//             console.log('✅ Joined successfully!', res);
//           },
//           error: (error: any) => {
//             console.error('❌ Join error:', error);
//             console.error('❌ Was trying to join with password:', password);
//             alert('Failed to join: ' + (error.errorMessage || JSON.stringify(error)));
//           },
//         });
//       },
//       error: (error: any) => {
//         console.error('❌ Init error:', error);
//         alert('Failed to initialize: ' + (error.errorMessage || JSON.stringify(error)));
//       },
//     });
//   } catch (error: any) {
//     console.error('❌ API error:', error);
//     alert('Error: ' + (error.response?.data?.error || error.message));
//   }
// };

//   return { joinMeeting };
// };

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
        console.log('✅ Initializing Zoom SDK...');
        try {
          window.ZoomMtg.setZoomJSLib('https://source.zoom.us/3.8.10/lib', '/av');
          window.ZoomMtg.preLoadWasm();
          window.ZoomMtg.prepareWebSDK();
          
          zoomInitialized.current = true;
          console.log('✅ Zoom SDK initialized');
        } catch (error) {
          console.error('❌ Init error:', error);
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
      console.log('🎤 Requesting microphone permission...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      alert('Please allow microphone access for transcription to work');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition not supported in this browser');
      alert('Speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // Only final results
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
      console.error('❌ Speech recognition error:', event.error);
      
      // Don't restart on certain errors
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        console.error('Microphone access denied');
        return;
      }
      
      // For other errors, try to restart
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
      console.log('🔄 Speech recognition ended, restarting...');
      // Auto-restart after brief pause
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
      console.log('🎤 Speech recognition started successfully');
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log('🛑 Speech recognition stopped');
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }
  };

  const joinMeeting = async (callId: string, onTranscript?: (text: string, speaker: string) => void) => {
    try {
      console.log('📞 Joining call:', callId);
      
      if (!window.ZoomMtg) {
        alert('Zoom SDK not loaded');
        return;
      }
      
      const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
      const { meetingNumber, signature, sdkKey, userName, password } = response.data;
      
      console.log('✅ Got credentials:', { meetingNumber, userName });

      window.ZoomMtg.init({
        leaveUrl: window.location.origin,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        success: () => {
          console.log('✅ Init success, joining...');
          
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
              console.log('✅ Joined successfully!', res);
              
              // START REAL-TIME TRANSCRIPTION after joining
              setTimeout(() => {
                startSpeechRecognition(onTranscript);
              }, 2000);
            },
            error: (error: any) => {
              console.error('❌ Join error:', error);
              alert('Failed to join: ' + (error.errorMessage || JSON.stringify(error)));
            },
          });
        },
        error: (error: any) => {
          console.error('❌ Init error:', error);
          alert('Failed to initialize: ' + (error.errorMessage || JSON.stringify(error)));
        },
      });
    } catch (error: any) {
      console.error('❌ API error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return { joinMeeting, stopSpeechRecognition };
};