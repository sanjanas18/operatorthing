import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { removeCall } from './controllers/emergencyController.js'; // ✅ ADD THIS LINE

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Emergency Dispatch API Running' });
});

app.use('/api/emergency', emergencyRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('emergency:start', (data) => {
    console.log('Emergency started:', data);
    io.emit('operator:incoming-call', data);
  });
  
  // ✅ UPDATE THIS HANDLER
  socket.on('meeting:ended', (data) => {
    console.log('🔴 Meeting ended:', data);
    removeCall(data.callId);  // ✅ ADD THIS LINE
    io.emit('operator:call-ended', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});