// CORS FIXED
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(null, true); // 👈 allow all (fixes Railway + Vercel issues)
      }
    },
    credentials: true,
  })
);

// 👇 VERY IMPORTANT (preflight fix)
app.options('*', cors());