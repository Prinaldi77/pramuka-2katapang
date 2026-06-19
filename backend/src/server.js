const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`==========================================================`);
  console.log(` REST API Sistem Informasi Pramuka SMPN 2 Katapang`);
  console.log(` Running on port: ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`==========================================================`);
});
