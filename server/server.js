const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const userRoutes = require('./routes/userRoute');
const uploadRoutes = require('./routes/uploadRoute');
const itEquipments = require('./routes/itEquipments');
const telecomRoutes = require('./routes/telecomRoute');
const telephoneLineRoutes = require('./routes/telephoneLineRoute');
const schemaRoute = require('./routes/schemaRoute');
const sequelize = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/it-equipments', itEquipments);
app.use('/api/telecom-packs', telecomRoutes);
app.use('/api/telephone-lines', telephoneLineRoutes);
app.use('/api/schema', schemaRoute);

// Serve static files from the "client/build" directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.set('io', io); // Set the io instance in the app object for global access

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized...');
  } catch (err) {
    console.error('Error synchronizing database:', err);
    process.exit(1);
  }
};

syncDatabase();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
