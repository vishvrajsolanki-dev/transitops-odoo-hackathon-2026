const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`TransitOps backend running on port ${PORT}`);
});
