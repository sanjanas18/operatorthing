// import express from 'express';
// import { activeCalls } from '../controllers/emergencyController.js';

// const router = express.Router();

// // SSE endpoint for Poke MCP
// router.get('/mcp/sse', (req, res) => {
//   console.log('SSE connection requested');
//   console.log('Headers:', req.headers);
  
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Send initial connection message
//   res.write('data: {"type":"connection","status":"connected"}\n\n');

//   // Keep connection alive
//   const keepAlive = setInterval(() => {
//     res.write('data: {"type":"ping"}\n\n');
//   }, 30000);

//   req.on('close', () => {
//     console.log('SSE connection closed');
//     clearInterval(keepAlive);
//     res.end();
//   });
// });

// // MCP JSON-RPC endpoint
// router.post('/mcp/sse', (req, res) => {

//   const { jsonrpc, id, method, params } = req.body;

//   if (method === 'initialize') {

//     return res.json({
//       jsonrpc: '2.0',
//       id,
//       result: {
//         protocolVersion: '2024-11-05',
//         capabilities: {
//           tools: {},
//         },
//         serverInfo: {
//           name: 'FrontLine Emergency Reports',
//           version: '1.0.0',
//         },
//       },
//     });
//   }

//   if (method === 'tools/list') {
//     console.log('Tools list request');
//     return res.json({
//       jsonrpc: '2.0',
//       id,
//       result: {
//         tools: [
//           {
//             name: 'list_recent_calls',
//             description: 'List recent emergency calls with caller information and phone numbers',
//             inputSchema: {
//               type: 'object',
//               properties: {},
//               additionalProperties: false,
//             },
//           },
//           {
//             name: 'get_call_report',
//             description: 'Get the full emergency report for a specific call to send via SMS',
//             inputSchema: {
//               type: 'object',
//               properties: {
//                 callId: {
//                   type: 'string',
//                   description: 'The emergency call ID (e.g., call_1234567890)',
//                 },
//               },
//               required: ['callId'],
//               additionalProperties: false,
//             },
//           },
//         ],
//       },
//     });
//   }

//   if (method === 'tools/call') {
//     console.log('Tool call request:', params?.name);
//     const { name, arguments: args } = params || {};

//     if (name === 'list_recent_calls') {
//       const calls = Array.from(activeCalls.values()).map(call => ({
//         callId: call.callId,
//         emergencyType: call.emergencyType,
//         callerName: call.userInfo?.name || 'Unknown',
//         phone: call.userInfo?.phone || 'No phone provided',
//         createdAt: new Date(call.createdAt).toLocaleString(),
//         location: call.location.address,
//       }));


//       return res.json({
//         jsonrpc: '2.0',
//         id,
//         result: {
//           content: [
//             {
//               type: 'text',
//               text: calls.length === 0 
//                 ? 'No recent emergency calls found.'
//                 : `Recent Emergency Calls:\n\n${calls.map(c => 
//                     ` Call ID: ${c.callId}\n` +
//                     ` Caller: ${c.callerName}\n` +
//                     ` Phone: ${c.phone}\n` +
//                     ` Type: ${c.emergencyType}\n` +
//                     ` Location: ${c.location}\n` +
//                     ` Time: ${c.createdAt}`
//                   ).join('\n\n---\n\n')}`,
//             },
//           ],
//         },
//       });
//     }

//     if (name === 'get_call_report') {
//       const { callId } = args || {};

//       if (!callId) {
//         return res.json({
//           jsonrpc: '2.0',
//           id,
//           error: {
//             code: -32602,
//             message: 'callId is required',
//           },
//         });
//       }

//       const call = activeCalls.get(callId);

//       if (!call) {
//         return res.json({
//           jsonrpc: '2.0',
//           id,
//           error: {
//             code: -32602,
//             message: `Call ${callId} not found`,
//           },
//         });
//       }

//       if (!call.userInfo?.phone) {
//         return res.json({
//           jsonrpc: '2.0',
//           id,
//           error: {
//             code: -32602,
//             message: `No phone number available for ${call.userInfo?.name || 'this caller'}`,
//           },
//         });
//       }

//       const smsReport = ` EMERGENCY REPORT
// Date: ${new Date(call.createdAt).toLocaleString()}

// Patient: ${call.userInfo?.name || 'Unknown'}
// Age: ${call.userInfo?.age || 'N/A'}
// Emergency: ${call.emergencyType.toUpperCase()}
// Location: ${call.location.address}

// Your emergency call has been documented. First responders have been dispatched with full details.

// Call ID: ${callId.slice(-8).toUpperCase()}`;

//       return res.json({
//         jsonrpc: '2.0',
//         id,
//         result: {
//           content: [
//             {
//               type: 'text',
//               text: `📱 Report for ${call.userInfo.name} (${call.userInfo.phone}):\n\n${smsReport}`,
//             },
//           ],
//         },
//       });
//     }

//     return res.json({
//       jsonrpc: '2.0',
//       id,
//       error: {
//         code: -32601,
//         message: `Unknown tool: ${name}`,
//       },
//     });
//   }

//   console.log(' Unknown method:', method);
//   res.json({
//     jsonrpc: '2.0',
//     id,
//     error: {
//       code: -32601,
//       message: `Unknown method: ${method}`,
//     },
//   });
// });

// export default router;

import express from 'express';
import { activeCalls, completedCalls } from '../controllers/emergencyController.js';

const router = express.Router();

// SSE endpoint for Poke MCP
router.get('/mcp/sse', (req, res) => {
  console.log('SSE connection requested');
  console.log('Headers:', req.headers);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write('data: {"type":"connection","status":"connected"}\n\n');

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"type":"ping"}\n\n');
  }, 30000);

  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(keepAlive);
    res.end();
  });
});

// MCP JSON-RPC endpoint
router.post('/mcp/sse', (req, res) => {
  const { jsonrpc, id, method, params } = req.body;

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'FrontLine Emergency Reports',
          version: '1.0.0',
        },
      },
    });
  }

  if (method === 'tools/list') {
    console.log('Tools list request');
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'list_recent_calls',
            description: 'List ALL emergency calls (active and completed) with caller information',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
          },
          {
            name: 'get_call_report',
            description: 'Get the FULL emergency report including transcripts and AI analysis',
            inputSchema: {
              type: 'object',
              properties: {
                callId: {
                  type: 'string',
                  description: 'The emergency call ID',
                },
              },
              required: ['callId'],
              additionalProperties: false,
            },
          },
        ],
      },
    });
  }

  if (method === 'tools/call') {
    console.log('Tool call request:', params?.name);
    const { name, arguments: args } = params || {};

    if (name === 'list_recent_calls') {
      // Active calls
      const active = Array.from(activeCalls.values()).map(call => ({
        callId: call.callId,
        status: 'ACTIVE',
        emergencyType: call.emergencyType,
        callerName: call.userInfo?.name || 'Unknown',
        phone: call.userInfo?.phone || 'No phone',
        createdAt: new Date(call.createdAt).toLocaleString(),
        location: call.location.address,
      }));

      // Completed calls
      const completed = Array.from(completedCalls.values()).map(call => ({
        callId: call.callId,
        status: 'COMPLETED',
        emergencyType: call.emergencyType,
        callerName: call.userInfo?.name || 'Unknown',
        phone: call.userInfo?.phone || 'No phone',
        createdAt: new Date(call.startTime).toLocaleString(),
        location: call.location.address,
        hasTranscript: !!(call.transcript && call.transcript.length > 0),
        hasAIReport: !!call.aiReport,
      }));

      const allCalls = [...active, ...completed];

      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: allCalls.length === 0 
                ? 'No emergency calls found.'
                : `Emergency Calls (${allCalls.length} total):\n\n${allCalls.map(c => 
                    `📞 ${c.status} - Call ID: ${c.callId}\n` +
                    `   Caller: ${c.callerName} (${c.phone})\n` +
                    `   Type: ${c.emergencyType.toUpperCase()}\n` +
                    `   Location: ${c.location}\n` +
                    `   Time: ${c.createdAt}` +
                    (c.status === 'COMPLETED' && (c as any).hasTranscript ? '\n   ✅ Has transcript' : '') +
                    (c.status === 'COMPLETED' && (c as any).hasAIReport ? '\n   ✅ Has AI analysis' : '')
                  ).join('\n\n---\n\n')}`,
            },
          ],
        },
      });
    }

    if (name === 'get_call_report') {
      const { callId } = args || {};

      if (!callId) {
        return res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32602,
            message: 'callId is required',
          },
        });
      }

      // Check BOTH active and completed calls
      let call = activeCalls.get(callId) || completedCalls.get(callId);

      if (!call) {
        return res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32602,
            message: `Call ${callId} not found`,
          },
        });
      }

      // Build detailed report
      let report = `🚨 EMERGENCY REPORT\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      report += `📋 Call ID: ${callId.slice(-8).toUpperCase()}\n`;
      report += `👤 Caller: ${call.userInfo?.name || 'Unknown'}\n`;
      report += `📱 Phone: ${call.userInfo?.phone || 'Not provided'}\n`;
      report += `🎂 Age: ${call.userInfo?.age || 'N/A'}\n`;
      report += `🚑 Emergency Type: ${call.emergencyType.toUpperCase()}\n`;
      report += `📍 Location: ${call.location.address}\n`;
      report += `🕐 Time: ${new Date(call.createdAt || call.startTime).toLocaleString()}\n\n`;

      // Add medical conditions if available
      if (call.userInfo?.medicalConditions) {
        report += `⚕️ MEDICAL CONDITIONS:\n${call.userInfo.medicalConditions}\n\n`;
      }

      // Add AI report if available
      if (call.aiReport) {
        report += `🤖 AI ANALYSIS:\n${call.aiReport}\n\n`;
      }

      // Add transcript if available
      if (call.transcript && call.transcript.length > 0) {
        report += `📝 CALL TRANSCRIPT (${call.transcript.length} messages):\n`;
        report += call.transcript.slice(0, 10).map((t: any) => 
          `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`
        ).join('\n');
        if (call.transcript.length > 10) {
          report += `\n... (${call.transcript.length - 10} more messages)`;
        }
        report += '\n\n';
      }

      // Add video analysis summary if available
      if (call.videoAnalyses && call.videoAnalyses.length > 0) {
        report += `📹 VIDEO ANALYSIS (${call.videoAnalyses.length} frames):\n`;
        const latestFrame = call.videoAnalyses[call.videoAnalyses.length - 1];
        if (latestFrame?.analysis) {
          report += `   Urgency: ${latestFrame.analysis.urgencyLevel?.toUpperCase()}\n`;
          if (latestFrame.analysis.hazards?.length > 0) {
            report += `   Hazards: ${latestFrame.analysis.hazards.join(', ')}\n`;
          }
        }
        report += '\n';
      }

      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `Status: ${completedCalls.has(callId) ? 'COMPLETED' : 'ACTIVE'}\n`;

      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: report,
            },
          ],
        },
      });
    }

    return res.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Unknown tool: ${name}`,
      },
    });
  }

  console.log('Unknown method:', method);
  res.json({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Unknown method: ${method}`,
    },
  });
});

export default router;