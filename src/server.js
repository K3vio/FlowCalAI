import express from "express";
import cors from "cors";
import eventRoute from "./routes/eventRoute.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// Allows the frontend to communicate with the backend.
app.use(cors());

// Allows the server to read JSON request bodies.
app.use(express.json());


// Check whether server is running.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Calendar backend is running."
  });
});


// Calendar endpoints.
app.use("/api/events", eventRoute);


// Unknown route.
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    reason: "not_found",
    message: `Route ${req.method} ${req.originalUrl} was not found.`
  });
});


// Unexpected server errors.
app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    status: "error",
    reason: "server_error",
    message: "An unexpected server error occurred."
  });
});


app.listen(PORT, () => {
  console.log(
    `Calendar backend running on http://localhost:${PORT}`
  );
});
