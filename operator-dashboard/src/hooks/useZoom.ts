import { useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

export const useZoom = () => {
  const zoomInitialized = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const currentCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000');
    
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

    // Cleanup socket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinMeeting = async (callId: string) => {
    try {
      console.log('📞 Joining call:', callId);
      
      // Store the current call ID
      currentCallIdRef.current = callId;
      
      if (!window.ZoomMtg) {
        alert('Zoom SDK not loaded');
        return;
      }
      
      const response = await axios.get(`http://localhost:3000/api/emergency/join/${callId}`);
      const { meetingNumber, signature, sdkKey, userName, password } = response.data;
      
      console.log('✅ Got credentials:', { 
        meetingNumber, 
        userName,
        password: password || 'none'
      });

      window.ZoomMtg.init({
        leaveUrl: window.location.origin,
        patchJsMedia: true,
        leaveOnPageUnload: true,
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
              
              // ✅ Set up event listeners for when meeting ends
              setupMeetingEndListeners(callId, meetingNumber);
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

  // ✅ Function to set up meeting end event listeners
  const setupMeetingEndListeners = (callId: string, meetingNumber: string) => {
    console.log('🎧 Setting up meeting end listeners for call:', callId);

    // Listen for when user leaves meeting
    window.ZoomMtg.inMeetingServiceListener('onUserLeave', (data: any) => {
      console.log('🚪 User left meeting:', data);
      handleMeetingEnd(callId, 'user-left');
    });

    // Listen for when meeting ends for all
    window.ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data: any) => {
      console.log('📊 Meeting status changed:', data);
      
      if (data.meetingStatus === 3) {
        console.log('🔴 Meeting ended (status 3)');
        handleMeetingEnd(callId, 'meeting-ended');
      }
    });

    // Alternative: Listen for disconnect event
    window.ZoomMtg.inMeetingServiceListener('onDisconnect', (data: any) => {
      console.log('🔌 Disconnected from meeting:', data);
      handleMeetingEnd(callId, 'disconnected');
    });
  };

  // ✅ Handle meeting end
  const handleMeetingEnd = (callId: string, reason: string) => {
    console.log(`🔴 Meeting ended - Reason: ${reason}, Call ID: ${callId}`);
    
    // Only emit once per call
    if (currentCallIdRef.current === callId) {
      currentCallIdRef.current = null;
      
      // Emit to backend via socket
      if (socketRef.current) {
        console.log('📡 Emitting meeting:ended event to backend');
        socketRef.current.emit('meeting:ended', {
          callId,
          reason,
          timestamp: new Date().toISOString()
        });
      }
      
      // Hide Zoom UI
      const zoomContainer = document.getElementById('zmmtg-root');
      if (zoomContainer) {
        zoomContainer.style.display = 'none';
      }
    }
  };

  return { joinMeeting };
};