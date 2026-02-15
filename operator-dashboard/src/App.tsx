import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useZoom } from './hooks/useZoom';
import './App.css';
import videoCapture from './utils/videoCapture';


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
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Real-time AI report state
  const [aiReport, setAiReport] = useState<string>('');
  const [reportLoading, setReportLoading] = useState(false);
  const [lastReportTime, setLastReportTime] = useState<Date | null>(null);
  const reportIntervalRef = useRef<any>(null);

  const { joinMeeting, stopSpeechRecognition } = useZoom();

  const [videoAnalysis, setVideoAnalysis] = useState<any>(null);
  const [frameAnalyzing, setFrameAnalyzing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<Array<{ timestamp: string; analysis: any }>>([]);
  const videoAnalysisIntervalRef = useRef<any>(null);

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
      console.log('📞 Received call-ended event:', data);
      
      // Remove call from the list
      setCalls(prevCalls => {
        const filtered = prevCalls.filter(c => c.callId !== data.callId);
        console.log('🗑️ Calls after removal:', filtered.length);
        return filtered;
      });
      
      // Clear active call if it matches
      setActiveCall(prevActive => {
        if (prevActive?.callId === data.callId) {
          console.log('🔴 Clearing active call');
          setZoomActive(false);
          
          // Hide Zoom container
          const zoomContainer = document.getElementById('zmmtg-root');
          if (zoomContainer) {
            zoomContainer.className = 'zoom-hidden';
          }
          
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

  // Auto-generate report every 10 seconds
  useEffect(() => {
    if (liveTranscript.length > 0 && activeCall && !reportLoading) {
      if (liveTranscript.length === 1) {
        generateLiveReport();
      }

      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }

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

  // AUTO-ANALYZE VIDEO FRAMES WITH CLAUDE VISION
  useEffect(() => {
    if (activeCall && zoomActive) {
      let foundCanvas = false;
      
      const findAndAnalyzeVideo = () => {
        if (foundCanvas) return;
        
        const mainCanvas = document.getElementById('main-video') as HTMLCanvasElement;
        
        console.log('🔍 Looking for main-video canvas...', {
          found: !!mainCanvas,
          width: mainCanvas?.width,
          height: mainCanvas?.height,
        });
        
        if (mainCanvas && mainCanvas.width > 0) {
          console.log('📹 ✅ Found main-video canvas (mobile participant)!', {
            id: mainCanvas.id,
            width: mainCanvas.width,
            height: mainCanvas.height,
          });
          foundCanvas = true;
          
          const captureInterval = setInterval(async () => {
            try {
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d')!;
              
              const maxWidth = 700;
              const scale = Math.min(maxWidth / mainCanvas.width, 1);
              tempCanvas.width = mainCanvas.width * scale;
              tempCanvas.height = mainCanvas.height * scale;
              
              tempCtx.drawImage(mainCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
              
              const frameData = tempCanvas.toDataURL('image/jpeg', 0.4);
              
              console.log('📸 Resized frame!', {
                original: `${mainCanvas.width}x${mainCanvas.height}`,
                resized: `${tempCanvas.width}x${tempCanvas.height}`,
                size: frameData.length
              });
              
              setFrameAnalyzing(true);
              
              const recentTranscript = liveTranscript
                .slice(-3)
                .map(t => `[${t.speaker}]: ${t.text}`)
                .join('\n');
  
              console.log('🚀 Sending resized frame to Claude...');
  
              const response = await axios.post('http://localhost:3000/api/emergency/analyze-frame', {
                callId: activeCall.callId,
                frameData,
                emergencyType: activeCall.type,
                recentTranscript,
              });
  
              console.log('✅ Analysis:', response.data.analysis.urgencyLevel, '-', response.data.analysis.hazards.length, 'hazards');
  
              setVideoAnalysis(response.data.analysis);
              setCapturedFrames(prev => [...prev, {
                timestamp: new Date().toISOString(),
                analysis: response.data.analysis,
              }]);
            } catch (error) {
              console.error('❌ Frame analysis failed:', error);
            } finally {
              setFrameAnalyzing(false);
            }
          }, 5000);
          
          videoAnalysisIntervalRef.current = captureInterval;
          clearInterval(searchInterval);
          
          console.log('✅ Started capturing mobile participant video every 10 seconds');
        } else {
          console.log('⏳ main-video canvas not ready yet...');
        }
      };
      const searchInterval = setInterval(findAndAnalyzeVideo, 2000);
      
      setTimeout(() => {
        clearInterval(searchInterval);
        if (!foundCanvas) {
          console.log('❌ Could not find main-video canvas after 60 seconds');
        }
      }, 60000);
      
      findAndAnalyzeVideo();
    }
    return () => {
      if (videoAnalysisIntervalRef.current) {
        clearInterval(videoAnalysisIntervalRef.current);
      }
    };
  }, [activeCall, zoomActive, liveTranscript]);

  const generateLiveReport = async () => {
    if (!activeCall || liveTranscript.length === 0 || reportLoading) return;

    setReportLoading(true);
    console.log('🤖 Generating real-time AI report...');

    try {
      const response = await axios.post('http://localhost:3000/api/emergency/generate-report', {
        transcript: liveTranscript,
        emergencyType: activeCall.type,
        location: activeCall.location,
        videoAnalyses: capturedFrames,
      });

      setAiReport(response.data.report);
      setLastReportTime(new Date());
      console.log('✅ AI Report updated with video intelligence');
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const downloadCallReport = async () => {
    if (!activeCall) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/emergency/download/${activeCall.callId}`);
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency-report-${activeCall.callId}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('📥 Downloaded complete call report');
      alert('✅ Report downloaded! Includes:\n• Call details\n• Full transcript\n• Video analyses\n• Saved image paths');
    } catch (error) {
      console.error('❌ Failed to download report:', error);
      alert('Failed to download report. Check console for details.');
    }
  };

  const joinCall = async (call: EmergencyCall) => {
    console.log('🔵 Join call clicked:', call);

    const zoomContainer = document.getElementById('zmmtg-root');
    if (zoomContainer) {
      zoomContainer.innerHTML = '';
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
      console.log('🔴 END CALL CLICKED:', activeCall.callId);
      
      stopSpeechRecognition();
      
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
      
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
      
      // Remove the call from the list immediately
      setCalls(prevCalls => prevCalls.filter(c => c.callId !== activeCall.callId));
      
      // Clear all active call state
      setActiveCall(null);
      setZoomActive(false);
      setLiveTranscript([]);
      setAiReport('');
      setVideoAnalysis(null);
      setCapturedFrames([]);
      
      // Hide Zoom container
      const zoomContainer = document.getElementById('zmmtg-root');
      if (zoomContainer) {
        zoomContainer.className = 'zoom-hidden';
      }

      // Leave Zoom meeting
      if (window.ZoomMtg) {
        window.ZoomMtg.leaveMeeting({});
      }
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'medical': return 'MED';
      case 'fire': return 'FIRE';
      case 'police': return 'POL';
      default: return 'EMRG';
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
      {/* Zoom Container - Left 50% of screen */}
      <div 
        id="zmmtg-root" 
        className={zoomActive ? '' : 'zoom-hidden'}
      ></div>

      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <div className="logo">
              <span className="logo-text">FrontLine</span>
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
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="dashboard">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{incomingCalls.length}</div>
              <div className="stat-label">Incoming</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{activeCalls.length}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{calls.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          
          <div className="stat-card">
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
              <h2>Incoming Calls</h2>
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
                        <span className="badge-text">{getEmergencyIcon(call.type)}</span>
                      </div>
                      <div className="call-time">{getTimeSince(call.timestamp)}</div>
                    </div>

                    {call.callerName && (
                      <div className="caller-info">
                        <span className="caller-name">{call.callerName}</span>
                      </div>
                    )}

                    <div className="location-row">
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
                        fontSize: '13px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        Click to Answer Call
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
                        fontSize: '13px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        Call In Progress
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {calls.filter(c => c.status !== 'ended').length === 0 && (
                <div className="empty-queue">
                  <div className="empty-title">All Clear</div>
                  <div className="empty-subtitle">No pending emergency calls</div>
                </div>
              )}
            </div>
          </div>

          {/* Active Call Panel */}
          <div className="active-panel">
            <div className="panel-header">
              <h2>Report</h2>
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
                  <div className="header-text">
                    <div className="header-title">{getEmergencyIcon(activeCall.type)} EMERGENCY</div>
                    <div className="header-subtitle">Response in Progress</div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-title">Call Information</div>
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
                  <div className="section-title">Location Details</div>
                  <div className="location-card">
                    <div className="location-address">{activeCall.location.address}</div>
                    <div className="location-coords">
                      Coordinates: {activeCall.location.lat.toFixed(6)}, {activeCall.location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* AI Report Panel */}
                <div className="info-section">
                  <div className="section-title">
                    AI Incident Report
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
                  <div className="section-title">Live Transcript</div>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
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
                            background: 'rgba(30, 41, 59, 0.5)',
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

                {/* Computer Vision Analysis Panel */}
                {videoAnalysis && (
                  <div className="info-section">
                    <div className="section-title">
                      Live Video Analysis
                      {frameAnalyzing && (
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#3b82f6' }}>
                          ● Analyzing...
                        </span>
                      )}
                      <span style={{ marginLeft: '10px', fontSize: '11px', color: '#64748b' }}>
                        ({capturedFrames.length} frames analyzed)
                      </span>
                    </div>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: `2px solid ${
                        videoAnalysis.urgencyLevel === 'critical' ? '#ef4444' :
                        videoAnalysis.urgencyLevel === 'high' ? '#f97316' :
                        videoAnalysis.urgencyLevel === 'medium' ? '#f59e0b' : '#10b981'
                      }`,
                      borderRadius: '12px',
                      padding: '20px',
                    }}>
                      {/* Urgency Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px',
                      }}>
                        <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>
                          Scene Urgency:
                        </span>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          background: videoAnalysis.urgencyLevel === 'critical' ? '#ef4444' :
                                      videoAnalysis.urgencyLevel === 'high' ? '#f97316' :
                                      videoAnalysis.urgencyLevel === 'medium' ? '#f59e0b' : '#10b981',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}>
                          {videoAnalysis.urgencyLevel}
                        </span>
                      </div>

                      {/* Hazards */}
                      {videoAnalysis.hazards && videoAnalysis.hazards.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#ef4444', 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            HAZARDS DETECTED:
                          </div>
                          <div style={{ 
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderLeft: '3px solid #ef4444',
                            padding: '10px 12px',
                            borderRadius: '4px',
                          }}>
                            {videoAnalysis.hazards.map((hazard: string, idx: number) => (
                              <div key={idx} style={{ 
                                fontSize: '13px', 
                                color: '#f1f5f9', 
                                marginBottom: '6px',
                                lineHeight: '1.6',
                              }}>
                                • {hazard}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Injuries */}
                      {videoAnalysis.injuries && videoAnalysis.injuries.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#f97316', 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            INJURIES/MEDICAL OBSERVED:
                          </div>
                          <div style={{ 
                            background: 'rgba(249, 115, 22, 0.1)',
                            borderLeft: '3px solid #f97316',
                            padding: '10px 12px',
                            borderRadius: '4px',
                          }}>
                            {videoAnalysis.injuries.map((injury: string, idx: number) => (
                              <div key={idx} style={{ 
                                fontSize: '13px', 
                                color: '#f1f5f9', 
                                marginBottom: '6px',
                                lineHeight: '1.6',
                              }}>
                                • {injury}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Environment */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#3b82f6', 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          ENVIRONMENT ASSESSMENT:
                        </div>
                        <div style={{ 
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderLeft: '3px solid #3b82f6',
                          padding: '10px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                          lineHeight: '1.6',
                        }}>
                          {videoAnalysis.environmentAssessment}
                        </div>
                      </div>

                      {/* Recommendations */}
                      {videoAnalysis.recommendations && videoAnalysis.recommendations.length > 0 && (
                        <div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#10b981', 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            RECOMMENDATIONS:
                          </div>
                          <div style={{ 
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderLeft: '3px solid #10b981',
                            padding: '10px 12px',
                            borderRadius: '4px',
                          }}>
                            {videoAnalysis.recommendations.map((rec: string, idx: number) => (
                              <div key={idx} style={{ 
                                fontSize: '13px', 
                                color: '#cbd5e1', 
                                marginBottom: '6px',
                                lineHeight: '1.6',
                              }}>
                                {idx + 1}. {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="action-section">
                  {activeCall && (
                    <button 
                      className="secondary-btn" 
                      onClick={downloadCallReport}
                      style={{
                        padding: '14px 28px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        minHeight: '50px',
                      }}
                    >
                      <span>DOWNLOAD FULL REPORT</span>
                    </button>
                  )}
                  <button 
                    className="end-call-btn" 
                    onClick={endCall}
                    style={{
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      minHeight: '60px',
                    }}
                  >
                    <span>END CALL</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-active-call">
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