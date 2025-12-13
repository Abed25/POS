import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.mjs";
import salesRoutes from "./routes/salesRoutes.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import reportRoutes from "./routes/reportRoutes.mjs";
import businessRoutes from "./routes/businessRoute.mjs";
import kpiRoutes from "./routes/kpiRoute.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
// Routes
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/kpis", kpiRoutes);

app.get("/", (req, res) => {
  res.send("This  is my backend server");
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
