
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

//   const joinMeeting = async (callId: string) => {
//     try {
//       console.log('📞 Joining call:', callId);
      
//       if (!window.ZoomMtg) {
//         alert('Zoom SDK not loaded');
//         return;
//       }
      
//       const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
//       const { meetingNumber, signature, sdkKey, userName } = response.data;
      
//       console.log('✅ Got credentials:', { meetingNumber, userName });

//       window.ZoomMtg.init({
//         leaveUrl: window.location.origin,
//         success: () => {
//           console.log('✅ Init success, joining...');
          
//           window.ZoomMtg.join({
//             meetingNumber: String(meetingNumber),
//             signature: signature,
//             sdkKey: sdkKey,
//             userName: userName,
//             userEmail: '',
//             passWord: '', // ← EMPTY, NO PASSWORD
//             tk: '',
//             zak: '',
//             success: (res: any) => {
//               console.log('✅ Joined successfully!', res);
//             },
//             error: (error: any) => {
//               console.error('❌ Join error:', error);
//               alert('Failed to join: ' + (error.errorMessage || JSON.stringify(error)));
//             },
//           });
//         },
//         error: (error: any) => {
//           console.error('❌ Init error:', error);
//           alert('Failed to initialize: ' + (error.errorMessage || JSON.stringify(error)));
//         },
//       });
//     } catch (error: any) {
//       console.error('❌ API error:', error);
//       alert('Error: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   return { joinMeeting };
// };


import { useEffect, useRef } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

export const useZoom = () => {
  const zoomInitialized = useRef(false);

  useEffect(() => {
    const initZoom = () => {
      if (!zoomInitialized.current && window.ZoomMtg) {
        console.log('✅ Initializing Zoom SDK...');
        try {
          window.ZoomMtg.setZoomJSLib('https://source.zoom.us/3.8.10/lib', '/av');
          window.ZoomMtg.preLoadWasm();
          window.ZoomMtg.prepareWebSDK();
          zoomInitialized.current = true;
          console.log('✅ Zoom SDK ready');
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

//   const joinMeeting = async (callId: string) => {
//     try {
//       console.log('📞 Joining call:', callId);
      
//       if (!window.ZoomMtg) {
//         alert('Zoom SDK not loaded');
//         return;
//       }
      
//       const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
//       const { meetingNumber, signature, sdkKey, userName, password } = response.data; // ← ADD password HERE
      
//       console.log('✅ Got credentials:', { 
//         meetingNumber, 
//         userName,
//         password: password || 'none' // ← Log it to verify
//       });

//       window.ZoomMtg.init({
//         leaveUrl: window.location.origin,
//         success: () => {
//           console.log('✅ Init success, joining...');
          
//           window.ZoomMtg.join({
//             meetingNumber: String(meetingNumber),
//             signature: signature,
//             sdkKey: sdkKey,
//             userName: userName,
//             userEmail: '',
//             passWord: password || '', // ← USE THE PASSWORD FROM RESPONSE
//             tk: '',
//             zak: '',
//             success: (res: any) => {
//               console.log('✅ Joined successfully!', res);
//             },
//             error: (error: any) => {
//               console.error('❌ Join error:', error);
//               alert('Failed to join: ' + (error.errorMessage || JSON.stringify(error)));
//             },
//           });
//         },
//         error: (error: any) => {
//           console.error('❌ Init error:', error);
//           alert('Failed to initialize: ' + (error.errorMessage || JSON.stringify(error)));
//         },
//       });
//     } catch (error: any) {
//       console.error('❌ API error:', error);
//       alert('Error: ' + (error.response?.data?.error || error.message));
//     }
//   };

const joinMeeting = async (callId: string) => {
  try {
    console.log('📞 Joining call:', callId);
    
    if (!window.ZoomMtg) {
      alert('Zoom SDK not loaded');
      return;
    }
    
    const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
    
    // LOG THE ENTIRE RESPONSE
    console.log('🔍 FULL RESPONSE:', response.data);
    
    const { meetingNumber, signature, sdkKey, userName, password } = response.data;
    
    console.log('✅ Extracted credentials:', { 
      meetingNumber, 
      userName,
      password: password,
      passwordType: typeof password,
      passwordLength: password?.length
    });

    window.ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: () => {
        console.log('✅ Init success, joining with password:', password);
        
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
          },
          error: (error: any) => {
            console.error('❌ Join error:', error);
            console.error('❌ Was trying to join with password:', password);
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

  return { joinMeeting };
};