import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
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
  const [socket, setSocket] = useState<Socket | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set up socket connection and listener for call ended
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('operator:call-ended', (data: { callId: string; reason: string }) => {
      console.log('Received call-ended event:', data);
      
      setCalls(prevCalls => {
        const filtered = prevCalls.filter(c => c.callId !== data.callId);
        console.log('Calls after removal:', filtered.length);
        return filtered;
      });
      
      setActiveCall(prevActive => {
        if (prevActive?.callId === data.callId) {
          console.log('Clearing active call');
          setZoomActive(false);
          return null;
        }
        return prevActive;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch real calls from backend
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        console.log('Fetching calls from backend...');
        const response = await axios.get('http://localhost:3000/api/emergency/active');
        console.log('Backend response:', response.data);
        
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
        
        console.log('Final calls:', backendCalls);
        setCalls(backendCalls);
      } catch (error) {
        console.error('Failed to fetch calls:', error);
      }
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinCall = async (call: EmergencyCall) => {
    console.log('Join call clicked:', call);
    setActiveCall(call);
    setZoomActive(true);
    setCalls(calls.map(c => 
      c.id === call.id ? { ...c, status: 'active' as const } : c
    ));
    
    if (call.callId) {
      console.log('Attempting to join Zoom meeting:', call.callId);
      await joinMeeting(call.callId);
    }
  };

  const endCall = () => {
    console.log('END CALL CLICKED');
    
    if (activeCall) {
      console.log('Ending call:', activeCall.callId);
      
      if (window.ZoomMtg) {
        window.ZoomMtg.leaveMeeting({});
      }
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
      {/* Zoom Container - Left half when active */}
      <div 
        id="zmmtg-root" 
        className={zoomActive ? 'zoom-container-active' : 'zoom-container-hidden'}
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

      {/* Main Dashboard - Adjusts based on zoom state */}
      <div className={`dashboard ${zoomActive ? 'split-view' : ''}`}>
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
                  className={`call-card ${call.status === 'active' ? 'active' : ''}`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    cursor: call.status === 'incoming' ? 'pointer' : 'default',
                    border: call.status === 'incoming' ? '3px solid #10b981' : '2px solid rgba(148, 163, 184, 0.1)',
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
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 700, 
                        color: '#cbd5e1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Emergency Call
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
                      <button 
                        className="action-button join"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinCall(call);
                        }}
                      >
                        <span className="button-icon"></span>
                        Answer Call
                      </button>
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
                        fontSize: '14px'
                      }}>
                        CALL IN PROGRESS
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {calls.filter(c => c.status !== 'ended').length === 0 && (
                <div className="empty-queue">
                  <div className="empty-icon">✓</div>
                  <div className="empty-title">All Clear</div>
                  <div className="empty-subtitle">No pending emergency calls</div>
                </div>
              )}
            </div>
          </div>

          {/* Active Call Panel - Right side when Zoom is active */}
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
                {/* Caller Information */}
                <div className="info-section">
                  <div className="section-title">📋 Caller Information</div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Caller Name</span>
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
                      <span className="info-label">Status</span>
                      <span className="info-value priority-high">LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="info-section">
                  <div className="section-title">📍 Location Details</div>
                  <div className="location-card">
                    <div className="location-address">{activeCall.location.address}</div>
                    <div className="location-coords">
                      Coordinates: {activeCall.location.lat.toFixed(6)}, {activeCall.location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* Live Transcription */}
                <div className="info-section">
                  <div className="section-title">🎤 Live Transcription</div>
                  <div className="transcription-box">
                    <div className="transcription-status">
                      <span className="pulse-dot"></span>
                      <span>Listening...</span>
                    </div>
                    <div className="transcription-content">
                      <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                        Transcription will appear here in real-time...
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Report Generation */}
                <div className="info-section">
                  <div className="section-title">🤖 AI Report Generation</div>
                  <div className="report-box">
                    <div className="report-status">
                      <span className="pulse-dot"></span>
                      <span>Generating incident report...</span>
                    </div>
                    <div className="report-content">
                      <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                        AI-powered summary and recommendations will be generated automatically...
                      </p>
                    </div>
                  </div>
                </div>

                {/* End Call Button */}
                <div className="action-section">
                  <button 
                    className="end-call-btn" 
                    onClick={endCall}
                  >
                    <span className="btn-icon">📞</span>
                    End Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-active-call">
                <div className="no-call-icon">📞</div>
                <div className="no-call-title">No Active Call</div>
                <div className="no-call-subtitle">
                  Select a call from the queue to begin response
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