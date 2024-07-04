const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const userRoutes = require('./routes/userRoute');
const excelRoutes = require('./routes/excelRoute');
const itEquipments = require('./routes/itEquipments'); // Import the IT Equipments route
const telecomRoutes = require('./routes/telecomRoute'); // Import the Telecom route
const sequelize = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Use CORS middleware with specific configuration
const corsOptions = {
  origin: '*', // Allow all origins (change to specific domains in production)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api', itEquipments); // Register the IT Equipments route
app.use('/api/telecom-packs', telecomRoutes); // Register the Telecom route

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate(); // Check if the connection is OK
    console.log('Database connection has been established successfully.');
    await sequelize.sync(); // Synchronize without force to avoid data loss
    console.log('Database synchronized...');
  } catch (err) {
    console.error('Error synchronizing database:', err);
    process.exit(1);
  }
};

syncDatabase();

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
