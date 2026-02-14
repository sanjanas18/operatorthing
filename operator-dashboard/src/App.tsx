// import React, { useState, useEffect } from 'react';
// import './App.css';

// interface EmergencyCall {
//   id: string;
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

// function App() {
//   const [calls, setCalls] = useState<EmergencyCall[]>([]);
//   const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Update time every second
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Mock data
//   useEffect(() => {
//     const mockCalls: EmergencyCall[] = [
//       {
//         id: '1',
//         type: 'medical',
//         location: { 
//           lat: 37.7749, 
//           lng: -122.4194,
//           address: '123 Market St, San Francisco, CA'
//         },
//         status: 'incoming',
//         timestamp: new Date(Date.now() - 120000).toISOString(),
//         callerName: 'Sarah Johnson'
//       },
//       {
//         id: '2',
//         type: 'fire',
//         location: { 
//           lat: 37.7849, 
//           lng: -122.4094,
//           address: '456 Mission St, San Francisco, CA'
//         },
//         status: 'incoming',
//         timestamp: new Date(Date.now() - 60000).toISOString(),
//         callerName: 'Mike Chen'
//       },
//       {
//         id: '3',
//         type: 'police',
//         location: { 
//           lat: 37.7949, 
//           lng: -122.3994,
//           address: '789 Valencia St, San Francisco, CA'
//         },
//         status: 'incoming',
//         timestamp: new Date(Date.now() - 30000).toISOString(),
//       },
//     ];
//     setCalls(mockCalls);
//   }, []);

//   const joinCall = (call: EmergencyCall) => {
//     setActiveCall(call);
//     setCalls(calls.map(c => 
//       c.id === call.id ? { ...c, status: 'active' as const } : c
//     ));
//   };

//   const endCall = () => {
//     if (activeCall) {
//       setCalls(calls.map(c => 
//         c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
//       ));
//       setActiveCall(null);
//     }
//   };

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
//               <div className="stat-value">47</div>
//               <div className="stat-label">Today</div>
//             </div>
//           </div>
          
//           <div className="stat-card">
//             <div className="stat-icon" style={{ background: '#f59e0b' }}>⏱️</div>
//             <div className="stat-content">
//               <div className="stat-value">2m 14s</div>
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
//                   style={{ animationDelay: `${index * 0.1}s` }}
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

//                     <button 
//                       className={`action-button ${call.status === 'active' ? 'in-call' : 'join'}`}
//                       onClick={() => call.status === 'incoming' && joinCall(call)}
//                       disabled={call.status === 'active'}
//                     >
//                       {call.status === 'active' ? (
//                         <>
//                           <span className="button-icon">🔴</span>
//                           <span>In Progress</span>
//                         </>
//                       ) : (
//                         <>
//                           <span className="button-icon">📞</span>
//                           <span>Answer Call</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               {calls.filter(c => c.status !== 'ended').length === 0 && (
//                 <div className="empty-queue">
//                   <div className="empty-icon">✅</div>
//                   <div className="empty-title">All Clear</div>
//                   <div className="empty-subtitle">No pending emergency calls</div>
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
//                       <span className="info-value">#{activeCall.id.padStart(6, '0')}</span>
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
//                   <div className="map-container">
//                     <div className="map-placeholder">
//                       <div className="map-icon">🗺️</div>
//                       <div className="map-text">Interactive map integration</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="info-section">
//                   <div className="section-title">📹 Live Video Feed</div>
//                   <div className="video-container">
//                     <div className="video-placeholder">
//                       <div className="video-icon">📹</div>
//                       <div className="video-text">Zoom Video SDK</div>
//                       <div className="video-subtext">Camera feed will appear here</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="action-section">
//                   <button className="end-call-btn" onClick={endCall}>
//                     <span className="btn-icon">📞</span>
//                     <span>End Call</span>
//                   </button>
//                   <button className="secondary-btn">
//                     <span className="btn-icon">🚑</span>
//                     <span>Dispatch Units</span>
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="no-active-call">
//                 <div className="no-call-icon">💼</div>
//                 <div className="no-call-title">No Active Call</div>
//                 <div className="no-call-subtitle">
//                   Select an emergency from the queue to begin response
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

// function App() {
//   const { joinMeeting } = useZoom();
//   const [calls, setCalls] = useState<EmergencyCall[]>([]);
//   const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

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
//     setCalls(calls.map(c => 
//       c.id === call.id ? { ...c, status: 'active' as const } : c
//     ));
    
//     // Join Zoom meeting
//     if (call.callId) {
//       console.log('📞 Attempting to join Zoom meeting:', call.callId);
//       await joinMeeting(call.callId);
//     }
//   };

//   const endCall = () => {
//     if (activeCall) {
//       setCalls(calls.map(c => 
//         c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
//       ));
//       setActiveCall(null);
//     }
//   };

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
//                   style={{ animationDelay: `${index * 0.1}s` }}
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

//                     <button 
//                       className={`action-button ${call.status === 'active' ? 'in-call' : 'join'}`}
//                       onClick={() => {
//                         console.log('🔘 Button clicked for call:', call.id, 'Status:', call.status);
//                         if (call.status === 'incoming') {
//                           joinCall(call);
//                         }
//                       }}
//                       disabled={call.status === 'active'}
//                       style={{
//                         padding: '16px 24px',
//                         fontSize: '18px',
//                         fontWeight: 'bold',
//                         minHeight: '60px',
//                       }}
//                     >
//                       {call.status === 'active' ? (
//                         <>
//                           <span className="button-icon" style={{ fontSize: '24px' }}>🔴</span>
//                           <span>In Progress</span>
//                         </>
//                       ) : (
//                         <>
//                           <span className="button-icon" style={{ fontSize: '24px' }}>📞</span>
//                           <span>ANSWER CALL</span>
//                         </>
//                       )}
//                     </button>
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

//                 <div className="info-section">
//                   <div className="section-title">📹 Live Video Feed</div>
//                   <div className="video-container">
//                     <div className="video-placeholder">
//                       <div className="video-icon">📹</div>
//                       <div className="video-text">Zoom Video Active</div>
//                       <div className="video-subtext">Video call in separate window</div>
//                     </div>
//                   </div>
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
//                   Select an emergency from the queue to begin response
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

// function App() {
//   const { joinMeeting } = useZoom();
//   const [calls, setCalls] = useState<EmergencyCall[]>([]);
//   const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

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
//     setCalls(calls.map(c => 
//       c.id === call.id ? { ...c, status: 'active' as const } : c
//     ));
    
//     // Join Zoom meeting
//     if (call.callId) {
//       console.log('📞 Attempting to join Zoom meeting:', call.callId);
//       await joinMeeting(call.callId);
//     }
//   };

//   const endCall = () => {
//     if (activeCall) {
//       setCalls(calls.map(c => 
//         c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
//       ));
//       setActiveCall(null);
//     }
//   };

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

//                 <div className="info-section">
//                   <div className="section-title">📹 Live Video Feed</div>
//                   <div className="video-container">
//                     <div className="video-placeholder">
//                       <div className="video-icon">📹</div>
//                       <div className="video-text">Zoom Video Active</div>
//                       <div className="video-subtext">Video call in separate window</div>
//                     </div>
//                   </div>
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


import React, { useState, useEffect } from 'react';
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

function App() {
  const { joinMeeting } = useZoom();
  const [calls, setCalls] = useState<EmergencyCall[]>([]);
  const [activeCall, setActiveCall] = useState<EmergencyCall | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [zoomActive, setZoomActive] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real calls from backend
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        console.log('📡 Fetching calls from backend...');
        const response = await axios.get('http://localhost:3000/api/emergency/active');
        console.log('📡 Backend response:', response.data);
        
        const backendCalls = response.data.calls.map((call: any) => {
          console.log('📞 Processing call:', call);
          return {
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
          };
        });
        
        console.log('✅ Final calls:', backendCalls);
        setCalls(backendCalls);
      } catch (error) {
        console.error('❌ Failed to fetch calls:', error);
      }
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinCall = async (call: EmergencyCall) => {
    console.log('🔵 Join call clicked:', call);
    setActiveCall(call);
    setZoomActive(true);
    setCalls(calls.map(c => 
      c.id === call.id ? { ...c, status: 'active' as const } : c
    ));
    
    // Join Zoom meeting
    if (call.callId) {
      console.log('📞 Attempting to join Zoom meeting:', call.callId);
      await joinMeeting(call.callId);
    }
  };

  const endCall = () => {
    if (activeCall) {
      setCalls(calls.map(c => 
        c.id === activeCall.id ? { ...c, status: 'ended' as const } : c
      ));
      setActiveCall(null);
      setZoomActive(false);
      
      // Hide Zoom interface
      const zoomContainer = document.getElementById('zmmtg-root');
      if (zoomContainer) {
        zoomContainer.style.display = 'none';
      }
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
      {/* Zoom Container - Full Screen Overlay */}
      <div 
        id="zmmtg-root" 
        style={{
          display: zoomActive ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: '#000'
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
                    console.log('🔘 Card clicked:', call.id, 'Status:', call.status);
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

                <div className="info-section">
                  <div className="section-title">📹 Live Video Feed</div>
                  <div style={{
                    padding: '20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎥</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                      Zoom Video Call Active
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Video call is running in full screen overlay
                    </div>
                  </div>
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