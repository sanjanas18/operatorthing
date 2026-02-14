

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useZoom } from './hooks/useZoom';
// import './App.css';

// interface EmergencyCall {
//   id: string;
//   callId?: string;
//   type: 'medical' | 'fire' | 'police' | 'other';
//   location: {
//     lat: number;
//     lng: number;
//     address: string;
//   };
//   status: 'incoming' | 'active' | 'ended';
//   timestamp: string;
//   callerName?: string;
// }

// interface TranscriptItem {
//   text: string;
//   speaker: string;
//   timestamp: string;
// }

// function App() {
//   const [calls, setCalls] = useState<EmergencyCall[]>([]);
//   const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [zoomActive, setZoomActive] = useState(false);
//   const [liveTranscript, setLiveTranscript] = useState<TranscriptItem[]>([]);

//   // Get Zoom functions
//   const { joinMeeting, stopSpeechRecognition } = useZoom();

//   // Update time every second
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Fetch real calls from backend
//   useEffect(() => {
//     const fetchCalls = async () => {
//       try {
//         console.log('📡 Fetching calls from backend...');
//         const response = await axios.get('http://localhost:3000/api/emergency/active');
//         console.log('📡 Backend response:', response.data);
        
//         const backendCalls = response.data.calls.map((call: any) => {
//           console.log('📞 Processing call:', call);
//           return {
//             id: call.callId,
//             callId: call.callId,
//             type: call.emergencyType as 'medical' | 'fire' | 'police' | 'other',
//             location: {
//               lat: call.location.latitude,
//               lng: call.location.longitude,
//               address: call.location.address || 'Unknown location',
//             },
//             status: call.status === 'active' ? 'incoming' as const : 'ended' as const,
//             timestamp: call.createdAt,
//           };
//         });
        
//         console.log('✅ Final calls:', backendCalls);
//         setCalls(backendCalls);
//       } catch (error) {
//         console.error('❌ Failed to fetch calls:', error);
//       }
//     };

//     fetchCalls();
//     const interval = setInterval(fetchCalls, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const joinCall = async (call: EmergencyCall) => {
//     console.log('🔵 Join call clicked:', call);
//     setActiveCall(call);
//     setZoomActive(true);
//     setLiveTranscript([]); // Clear previous transcripts
    
//     setCalls(calls.map(c => 
//       c.id === call.id ? { ...c, status: 'active' as const } : c
//     ));
    
//     // Join Zoom meeting WITH transcript callback
//     if (call.callId) {
//       console.log('📞 Attempting to join Zoom meeting:', call.callId);
//       await joinMeeting(call.callId, (text: string, speaker: string) => {
//         console.log('📝 New transcript:', speaker, '-', text);
//         setLiveTranscript(prev => [...prev, {
//           text,
//           speaker,
//           timestamp: new Date().toISOString(),
//         }]);
//       });
//     }
//   };

//   // const endCall = () => {
//   //   if (activeCall) {
//   //     stopSpeechRecognition(); // Stop transcription
//   //     setCalls(calls.map(c => 
//   //       c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
//   //     ));
//   //     setActiveCall(null);
//   //     setZoomActive(false);
      
//   //     // Hide Zoom interface
//   //     const zoomContainer = document.getElementById('zmmtg-root');
//   //     if (zoomContainer) {
//   //       zoomContainer.style.display = 'none';
//   //     }
//   //   }
//   // };

//   const endCall = () => {
//   if (activeCall) {
//     stopSpeechRecognition(); // Stop transcription
    
//     // Save transcript to localStorage
//     if (liveTranscript.length > 0) {
//       const transcriptData = {
//         callId: activeCall.id,
//         emergencyType: activeCall.type,
//         location: activeCall.location,
//         transcript: liveTranscript,
//         startTime: activeCall.timestamp,
//         endTime: new Date().toISOString(),
//       };
      
//       // Save to localStorage
//       const existingTranscripts = JSON.parse(localStorage.getItem('call_transcripts') || '[]');
//       existingTranscripts.push(transcriptData);
//       localStorage.setItem('call_transcripts', JSON.stringify(existingTranscripts));
      
//       console.log('💾 Transcript saved:', transcriptData);
//     }
    
//     setCalls(calls.map(c => 
//       c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
//     ));
//     setActiveCall(null);
//     setZoomActive(false);
    
//     // Hide Zoom interface
//     const zoomContainer = document.getElementById('zmmtg-root');
//     if (zoomContainer) {
//       zoomContainer.style.display = 'none';
//     }
//   }
// };

//   const getEmergencyIcon = (type: string) => {
//     switch (type) {
//       case 'medical': return '🚑';
//       case 'fire': return '🚒';
//       case 'police': return '🚓';
//       default: return '⚠️';
//     }
//   };

//   const getEmergencyColor = (type: string) => {
//     switch (type) {
//       case 'medical': return '#ef4444';
//       case 'fire': return '#f97316';
//       case 'police': return '#3b82f6';
//       default: return '#6b7280';
//     }
//   };

//   const getTimeSince = (timestamp: string) => {
//     const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
//     if (seconds < 60) return `${seconds}s ago`;
//     const minutes = Math.floor(seconds / 60);
//     if (minutes < 60) return `${minutes}m ago`;
//     const hours = Math.floor(minutes / 60);
//     return `${hours}h ago`;
//   };

//   const incomingCalls = calls.filter(c => c.status === 'incoming');
//   const activeCalls = calls.filter(c => c.status === 'active');

//   return (
//     <div className="app">
//       {/* Zoom Container */}
//       <div 
//         id="zmmtg-root" 
//         style={{
//           display: zoomActive ? 'block' : 'none',
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           width: '500px',
//           height: '400px',
//           zIndex: 9999,
//           background: '#000',
//           borderRadius: '12px',
//           overflow: 'visible',
//           boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
//           border: '2px solid rgba(16, 185, 129, 0.5)'
//         }}
//       ></div>

//       {/* Top Navigation Bar */}
//       <nav className="navbar">
//         <div className="nav-content">
//           <div className="nav-left">
//             <div className="logo">
//               <span className="logo-icon">🚨</span>
//               <span className="logo-text">Emergency Dispatch</span>
//             </div>
//           </div>
          
//           <div className="nav-center">
//             <div className="status-indicator">
//               <span className="status-dot"></span>
//               <span className="status-text">System Online</span>
//             </div>
//           </div>
          
//           <div className="nav-right">
//             <div className="time-display">
//               {currentTime.toLocaleTimeString('en-US', { 
//                 hour: '2-digit', 
//                 minute: '2-digit',
//                 second: '2-digit',
//                 hour12: true 
//               })}
//             </div>
//             <div className="operator-badge">
//               <div className="operator-avatar">OP</div>
//               <span>Operator #247</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Dashboard */}
//       <div className="dashboard">
//         {/* Stats Bar */}
//         <div className="stats-bar">
//           <div className="stat-card">
//             <div className="stat-icon" style={{ background: '#ef4444' }}>📞</div>
//             <div className="stat-content">
//               <div className="stat-value">{incomingCalls.length}</div>
//               <div className="stat-label">Incoming</div>
//             </div>
//           </div>
          
//           <div className="stat-card">
//             <div className="stat-icon" style={{ background: '#10b981' }}>✓</div>
//             <div className="stat-content">
//               <div className="stat-value">{activeCalls.length}</div>
//               <div className="stat-label">Active</div>
//             </div>
//           </div>
          
//           <div className="stat-card">
//             <div className="stat-icon" style={{ background: '#3b82f6' }}>📊</div>
//             <div className="stat-content">
//               <div className="stat-value">{calls.length}</div>
//               <div className="stat-label">Total</div>
//             </div>
//           </div>
          
//           <div className="stat-card">
//             <div className="stat-icon" style={{ background: '#f59e0b' }}>⏱️</div>
//             <div className="stat-content">
//               <div className="stat-value">--</div>
//               <div className="stat-label">Avg Response</div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="content-grid">
//           {/* Calls Queue */}
//           <div className="queue-panel">
//             <div className="panel-header">
//               <h2>Emergency Queue</h2>
//               {incomingCalls.length > 0 && (
//                 <span className="priority-badge">
//                   {incomingCalls.length} Waiting
//                 </span>
//               )}
//             </div>

//             <div className="calls-list">
//               {calls.filter(c => c.status !== 'ended').map((call, index) => (
//                 <div 
//                   key={call.id} 
//                   className={`call-card ${call.type} ${call.status === 'active' ? 'active' : ''}`}
//                   style={{ 
//                     animationDelay: `${index * 0.1}s`,
//                     cursor: call.status === 'incoming' ? 'pointer' : 'default',
//                     border: call.status === 'incoming' ? '3px solid #10b981' : undefined,
//                     boxShadow: call.status === 'incoming' ? '0 0 20px rgba(16, 185, 129, 0.3)' : undefined
//                   }}
//                   onClick={() => {
//                     console.log('🔘 Card clicked:', call.id, 'Status:', call.status);
//                     if (call.status === 'incoming') {
//                       joinCall(call);
//                     }
//                   }}
//                 >
//                   <div className="call-priority">
//                     <span className="priority-number">#{index + 1}</span>
//                   </div>
                  
//                   <div className="call-content">
//                     <div className="call-header-row">
//                       <div className="emergency-badge" style={{ background: getEmergencyColor(call.type) }}>
//                         <span className="badge-icon">{getEmergencyIcon(call.type)}</span>
//                         <span className="badge-text">{call.type.toUpperCase()}</span>
//                       </div>
//                       <div className="call-time">{getTimeSince(call.timestamp)}</div>
//                     </div>

//                     {call.callerName && (
//                       <div className="caller-info">
//                         <span className="caller-icon">👤</span>
//                         <span className="caller-name">{call.callerName}</span>
//                       </div>
//                     )}

//                     <div className="location-row">
//                       <span className="location-icon">📍</span>
//                       <span className="location-text">{call.location.address}</span>
//                     </div>

//                     <div className="coordinates">
//                       {call.location.lat.toFixed(4)}, {call.location.lng.toFixed(4)}
//                     </div>

//                     {call.status === 'incoming' && (
//                       <div style={{ 
//                         marginTop: '12px', 
//                         padding: '12px', 
//                         background: 'rgba(16, 185, 129, 0.1)',
//                         borderRadius: '8px',
//                         textAlign: 'center',
//                         fontWeight: 'bold',
//                         color: '#10b981',
//                         fontSize: '16px'
//                       }}>
//                         👆 CLICK CARD TO ANSWER CALL
//                       </div>
//                     )}

//                     {call.status === 'active' && (
//                       <div style={{ 
//                         marginTop: '12px', 
//                         padding: '12px', 
//                         background: 'rgba(239, 68, 68, 0.1)',
//                         borderRadius: '8px',
//                         textAlign: 'center',
//                         fontWeight: 'bold',
//                         color: '#ef4444',
//                         fontSize: '16px'
//                       }}>
//                         🔴 CALL IN PROGRESS
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {calls.filter(c => c.status !== 'ended').length === 0 && (
//                 <div className="empty-queue">
//                   <div className="empty-icon">✅</div>
//                   <div className="empty-title">All Clear</div>
//                   <div className="empty-subtitle">No pending emergency calls</div>
//                   <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
//                     Create a test call in Postman to see it appear here
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Active Call Panel */}
//           <div className="active-panel">
//             <div className="panel-header">
//               <h2>Active Response</h2>
//               {activeCall && (
//                 <span className="live-indicator">
//                   <span className="pulse-dot"></span>
//                   LIVE
//                 </span>
//               )}
//             </div>

//             {activeCall ? (
//               <div className="active-content">
//                 <div className="emergency-header" style={{ background: getEmergencyColor(activeCall.type) }}>
//                   <div className="header-icon">{getEmergencyIcon(activeCall.type)}</div>
//                   <div className="header-text">
//                     <div className="header-title">{activeCall.type.toUpperCase()} EMERGENCY</div>
//                     <div className="header-subtitle">Response in Progress</div>
//                   </div>
//                 </div>

//                 <div className="info-section">
//                   <div className="section-title">📋 Call Information</div>
//                   <div className="info-grid">
//                     <div className="info-item">
//                       <span className="info-label">Caller</span>
//                       <span className="info-value">{activeCall.callerName || 'Unknown'}</span>
//                     </div>
//                     <div className="info-item">
//                       <span className="info-label">Time Elapsed</span>
//                       <span className="info-value">{getTimeSince(activeCall.timestamp)}</span>
//                     </div>
//                     <div className="info-item">
//                       <span className="info-label">Call ID</span>
//                       <span className="info-value">#{activeCall.id.slice(-6)}</span>
//                     </div>
//                     <div className="info-item">
//                       <span className="info-label">Priority</span>
//                       <span className="info-value priority-high">HIGH</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="info-section">
//                   <div className="section-title">📍 Location Details</div>
//                   <div className="location-card">
//                     <div className="location-address">{activeCall.location.address}</div>
//                     <div className="location-coords">
//                       Coordinates: {activeCall.location.lat.toFixed(6)}, {activeCall.location.lng.toFixed(6)}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Live Transcript Panel */}
//                 <div className="info-section">
//                   <div className="section-title">📝 Live Transcript</div>
//                   <div style={{
//                     background: 'rgba(30, 41, 59, 0.5)',
//                     border: '1px solid rgba(148, 163, 184, 0.1)',
//                     borderRadius: '12px',
//                     padding: '15px',
//                     maxHeight: '300px',
//                     overflowY: 'auto'
//                   }}>
//                     {liveTranscript.length === 0 ? (
//                       <div style={{ 
//                         color: '#64748b', 
//                         fontStyle: 'italic', 
//                         textAlign: 'center', 
//                         padding: '30px 20px' 
//                       }}>
//                         <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎤</div>
//                         <div>Live transcription will appear here...</div>
//                         <div style={{ fontSize: '12px', marginTop: '8px' }}>
//                           Speak into your microphone to see transcription
//                         </div>
//                       </div>
//                     ) : (
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                         {liveTranscript.map((item, idx) => (
//                           <div key={idx} style={{
//                             padding: '12px',
//                             background: 'rgba(15, 23, 42, 0.5)',
//                             borderRadius: '8px',
//                             borderLeft: '3px solid #3b82f6'
//                           }}>
//                             <div style={{ 
//                               fontSize: '11px', 
//                               color: '#94a3b8', 
//                               marginBottom: '6px',
//                               fontWeight: '600'
//                             }}>
//                               {new Date(item.timestamp).toLocaleTimeString()} - {item.speaker}
//                             </div>
//                             <div style={{ 
//                               fontSize: '14px', 
//                               color: '#cbd5e1', 
//                               lineHeight: '1.6' 
//                             }}>
//                               {item.text}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
                  
//                   {liveTranscript.length > 0 && (
//                     <div style={{
//                       marginTop: '10px',
//                       fontSize: '12px',
//                       color: '#94a3b8',
//                       textAlign: 'right'
//                     }}>
//                       {liveTranscript.length} transcript{liveTranscript.length !== 1 ? 's' : ''} captured
//                     </div>
//                   )}
//                 </div>

//                 <div className="action-section">
//                   <button 
//                     className="end-call-btn" 
//                     onClick={endCall}
//                     style={{
//                       padding: '16px 32px',
//                       fontSize: '18px',
//                       fontWeight: 'bold',
//                       minHeight: '60px',
//                     }}
//                   >
//                     <span className="btn-icon" style={{ fontSize: '24px' }}>📞</span>
//                     <span>END CALL</span>
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="no-active-call">
//                 <div className="no-call-icon">💼</div>
//                 <div className="no-call-title">No Active Call</div>
//                 <div className="no-call-subtitle">
//                   Click on a call card in the queue to begin response
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useZoom } from './hooks/useZoom';
import './App.css';

interface EmergencyCall {
  id: string;
  callId?: string;
  type: 'medical' | 'fire' | 'police' | 'other';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'incoming' | 'active' | 'ended';
  timestamp: string;
  callerName?: string;
}

interface TranscriptItem {
  text: string;
  speaker: string;
  timestamp: string;
}

function App() {
  const [calls, setCalls] = useState<EmergencyCall[]>([]);
  const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [zoomActive, setZoomActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptItem[]>([]);
  
  // NEW: Real-time AI report state
  const [aiReport, setAiReport] = useState<string>('');
  const [reportLoading, setReportLoading] = useState(false);
  const [lastReportTime, setLastReportTime] = useState<Date | null>(null);
  const reportIntervalRef = useRef<any>(null);

  const { joinMeeting, stopSpeechRecognition } = useZoom();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real calls from backend
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/emergency/active');
        const backendCalls = response.data.calls.map((call: any) => ({
          id: call.callId,
          callId: call.callId,
          type: call.emergencyType as 'medical' | 'fire' | 'police' | 'other',
          location: {
            lat: call.location.latitude,
            lng: call.location.longitude,
            address: call.location.address || 'Unknown location',
          },
          status: call.status === 'active' ? 'incoming' as const : 'ended' as const,
          timestamp: call.createdAt,
        }));
        setCalls(backendCalls);
      } catch (error) {
        console.error('❌ Failed to fetch calls:', error);
      }
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Auto-generate report every 10 seconds
  useEffect(() => {
    if (liveTranscript.length > 0 && activeCall && !reportLoading) {
      // Generate immediately on first transcript
      if (liveTranscript.length === 1) {
        generateLiveReport();
      }

      // Clear existing interval
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }

      // Generate every 10 seconds
      reportIntervalRef.current = setInterval(() => {
        generateLiveReport();
      }, 10000);
    }

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [liveTranscript.length, activeCall]);

  const generateLiveReport = async () => {
    if (!activeCall || liveTranscript.length === 0 || reportLoading) return;

    setReportLoading(true);
    console.log('🤖 Generating real-time AI report...');

    try {
      const response = await axios.post('http://localhost:3000/api/emergency/generate-report', {
        transcript: liveTranscript,
        emergencyType: activeCall.type,
        location: activeCall.location,
      });

      setAiReport(response.data.report);
      setLastReportTime(new Date());
      console.log('✅ AI Report updated');
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const joinCall = async (call: EmergencyCall) => {
    console.log('🔵 Join call clicked:', call);

      const zoomContainer = document.getElementById('zmmtg-root');
  if (zoomContainer) {
    zoomContainer.innerHTML = ''; // Clear any existing content
  }
    setActiveCall(call);
    setZoomActive(true);
    setLiveTranscript([]);
    setAiReport('');
    setLastReportTime(null);
    
    setCalls(calls.map(c => 
      c.id === call.id ? { ...c, status: 'active' as const } : c
    ));
    
    if (call.callId) {
      await joinMeeting(call.callId, (text: string, speaker: string) => {
        setLiveTranscript(prev => [...prev, {
          text,
          speaker,
          timestamp: new Date().toISOString(),
        }]);
      });
    }
  };

  const endCall = async () => {
    if (activeCall) {
      stopSpeechRecognition();
      
      // Clear report interval
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
      
      // Save final transcript to localStorage
      if (liveTranscript.length > 0) {
        const transcriptData = {
          callId: activeCall.id,
          emergencyType: activeCall.type,
          location: activeCall.location,
          transcript: liveTranscript,
          finalReport: aiReport,
          startTime: activeCall.timestamp,
          endTime: new Date().toISOString(),
        };
        
        const existingTranscripts = JSON.parse(localStorage.getItem('call_transcripts') || '[]');
        existingTranscripts.push(transcriptData);
        localStorage.setItem('call_transcripts', JSON.stringify(existingTranscripts));
        
        console.log('💾 Transcript and report saved');
      }
      
      setCalls(calls.map(c => 
        c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
      ));
      setActiveCall(null);
      setZoomActive(false);
      
      const zoomContainer = document.getElementById('zmmtg-root');
      if (zoomContainer) {
        zoomContainer.style.display = 'none';
      }

    setActiveCall(null);
    setZoomActive(false);
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'medical': return '🚑';
      case 'fire': return '🚒';
      case 'police': return '🚓';
      default: return '⚠️';
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case 'medical': return '#ef4444';
      case 'fire': return '#f97316';
      case 'police': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTimeSince = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const incomingCalls = calls.filter(c => c.status === 'incoming');
  const activeCalls = calls.filter(c => c.status === 'active');

  return (
    <div className="app">
      {/* Zoom Container */}
      <div 
        id="zmmtg-root" 
        style={{
          display: zoomActive ? 'block' : 'none',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '500px',
          height: '400px',
          zIndex: 9999,
          background: '#000',
          borderRadius: '12px',
          overflow: 'visible',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(16, 185, 129, 0.5)'
        }}
      ></div>

      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <div className="logo">
              <span className="logo-icon">🚨</span>
              <span className="logo-text">Emergency Dispatch</span>
            </div>
          </div>
          
          <div className="nav-center">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">System Online</span>
            </div>
          </div>
          
          <div className="nav-right">
            <div className="time-display">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="operator-badge">
              <div className="operator-avatar">OP</div>
              <span>Operator #247</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="dashboard">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>📞</div>
            <div className="stat-content">
              <div className="stat-value">{incomingCalls.length}</div>
              <div className="stat-label">Incoming</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>✓</div>
            <div className="stat-content">
              <div className="stat-value">{activeCalls.length}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>📊</div>
            <div className="stat-content">
              <div className="stat-value">{calls.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>⏱️</div>
            <div className="stat-content">
              <div className="stat-value">--</div>
              <div className="stat-label">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Calls Queue */}
          <div className="queue-panel">
            <div className="panel-header">
              <h2>Emergency Queue</h2>
              {incomingCalls.length > 0 && (
                <span className="priority-badge">
                  {incomingCalls.length} Waiting
                </span>
              )}
            </div>

            <div className="calls-list">
              {calls.filter(c => c.status !== 'ended').map((call, index) => (
                <div 
                  key={call.id} 
                  className={`call-card ${call.type} ${call.status === 'active' ? 'active' : ''}`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    cursor: call.status === 'incoming' ? 'pointer' : 'default',
                    border: call.status === 'incoming' ? '3px solid #10b981' : undefined,
                    boxShadow: call.status === 'incoming' ? '0 0 20px rgba(16, 185, 129, 0.3)' : undefined
                  }}
                  onClick={() => {
                    if (call.status === 'incoming') {
                      joinCall(call);
                    }
                  }}
                >
                  <div className="call-priority">
                    <span className="priority-number">#{index + 1}</span>
                  </div>
                  
                  <div className="call-content">
                    <div className="call-header-row">
                      <div className="emergency-badge" style={{ background: getEmergencyColor(call.type) }}>
                        <span className="badge-icon">{getEmergencyIcon(call.type)}</span>
                        <span className="badge-text">{call.type.toUpperCase()}</span>
                      </div>
                      <div className="call-time">{getTimeSince(call.timestamp)}</div>
                    </div>

                    {call.callerName && (
                      <div className="caller-info">
                        <span className="caller-icon">👤</span>
                        <span className="caller-name">{call.callerName}</span>
                      </div>
                    )}

                    <div className="location-row">
                      <span className="location-icon">📍</span>
                      <span className="location-text">{call.location.address}</span>
                    </div>

                    <div className="coordinates">
                      {call.location.lat.toFixed(4)}, {call.location.lng.toFixed(4)}
                    </div>

                    {call.status === 'incoming' && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#10b981',
                        fontSize: '16px'
                      }}>
                        👆 CLICK CARD TO ANSWER CALL
                      </div>
                    )}

                    {call.status === 'active' && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#ef4444',
                        fontSize: '16px'
                      }}>
                        🔴 CALL IN PROGRESS
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {calls.filter(c => c.status !== 'ended').length === 0 && (
                <div className="empty-queue">
                  <div className="empty-icon">✅</div>
                  <div className="empty-title">All Clear</div>
                  <div className="empty-subtitle">No pending emergency calls</div>
                  <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    Create a test call in Postman to see it appear here
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Call Panel */}
          <div className="active-panel">
            <div className="panel-header">
              <h2>Active Response</h2>
              {activeCall && (
                <span className="live-indicator">
                  <span className="pulse-dot"></span>
                  LIVE
                </span>
              )}
            </div>

            {activeCall ? (
              <div className="active-content">
                <div className="emergency-header" style={{ background: getEmergencyColor(activeCall.type) }}>
                  <div className="header-icon">{getEmergencyIcon(activeCall.type)}</div>
                  <div className="header-text">
                    <div className="header-title">{activeCall.type.toUpperCase()} EMERGENCY</div>
                    <div className="header-subtitle">Response in Progress</div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-title">📋 Call Information</div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Caller</span>
                      <span className="info-value">{activeCall.callerName || 'Unknown'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time Elapsed</span>
                      <span className="info-value">{getTimeSince(activeCall.timestamp)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Call ID</span>
                      <span className="info-value">#{activeCall.id.slice(-6)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Priority</span>
                      <span className="info-value priority-high">HIGH</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-title">📍 Location Details</div>
                  <div className="location-card">
                    <div className="location-address">{activeCall.location.address}</div>
                    <div className="location-coords">
                      Coordinates: {activeCall.location.lat.toFixed(6)}, {activeCall.location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* NEW: AI Report Panel */}
                <div className="info-section">
                  <div className="section-title">
                    🤖 AI Incident Report
                    {reportLoading && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#10b981' }}>● Updating...</span>}
                    {lastReportTime && !reportLoading && (
                      <span style={{ marginLeft: '10px', fontSize: '11px', color: '#94a3b8' }}>
                        Last updated: {lastReportTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    minHeight: '150px'
                  }}>
                    {aiReport ? (
                      <div style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {aiReport}
                      </div>
                    ) : (
                      <div style={{
                        color: '#64748b',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '40px 20px'
                      }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🤖</div>
                        <div>AI analysis will appear here...</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                          Report generates automatically every 10 seconds
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Transcript Panel */}
                <div className="info-section">
                  <div className="section-title">📝 Live Transcript</div>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '12px',
                    padding: '15px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {liveTranscript.length === 0 ? (
                      <div style={{ 
                        color: '#64748b', 
                        fontStyle: 'italic', 
                        textAlign: 'center', 
                        padding: '30px 20px' 
                      }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎤</div>
                        <div>Live transcription will appear here...</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                          Speak into your microphone to see transcription
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {liveTranscript.map((item, idx) => (
                          <div key={idx} style={{
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.5)',
                            borderRadius: '8px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#94a3b8', 
                              marginBottom: '6px',
                              fontWeight: '600'
                            }}>
                              {new Date(item.timestamp).toLocaleTimeString()} - {item.speaker}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#cbd5e1', 
                              lineHeight: '1.6' 
                            }}>
                              {item.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {liveTranscript.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#94a3b8',
                      textAlign: 'right'
                    }}>
                      {liveTranscript.length} transcript{liveTranscript.length !== 1 ? 's' : ''} captured
                    </div>
                  )}
                </div>

                <div className="action-section">
                  <button 
                    className="end-call-btn" 
                    onClick={endCall}
                    style={{
                      padding: '16px 32px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      minHeight: '60px',
                    }}
                  >
                    <span className="btn-icon" style={{ fontSize: '24px' }}>📞</span>
                    <span>END CALL</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-active-call">
                <div className="no-call-icon">💼</div>
                <div className="no-call-title">No Active Call</div>
                <div className="no-call-subtitle">
                  Click on a call card in the queue to begin response
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;