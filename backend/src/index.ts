// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, { cors: { origin: '*' } });

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.json({ message: 'Emergency Dispatch API Running' });
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
  
//   socket.on('emergency:start', (data) => {
//     console.log('Emergency started:', data);
//     io.emit('operator:incoming-call', data);
//   });
// });

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });



import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import emergencyRoutes from './routes/emergencyRoutes.js';

import pokeRoutes from './routes/pokeRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Emergency Dispatch API Running' });
});

app.use('/api/emergency', emergencyRoutes);  // ← Make sure this line exists!
app.use('/api/poke', pokeRoutes);


// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});