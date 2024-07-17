const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sslConfig = process.env.DB_USE_SSL === 'true' ? {
ssl: {
require: true,
rejectUnauthorized: false,
},
} : {};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
dialect: 'postgres',
protocol: 'postgres',
logging: false,
dialectOptions: sslConfig,
});

const connectDB = async () => {
try {
await sequelize.authenticate();
console.log('Database connected...');
} catch (err) {
console.error('Unable to connect to the database:', err);
process.exit(1);
}
};

connectDB();

module.exports = sequelize;