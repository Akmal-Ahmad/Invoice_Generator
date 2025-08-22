import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();

// Basic CORS first
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  invoices: [
    {
      invoiceNo: String,
      billedByName: String,
      billedToName: String,
      paymentStatus: String,
      grandTotal: Number,
      amountPaid: Number,
      amountRemaining: Number,
      dueDate: Date,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
const User = mongoose.model("User", userSchema);

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Cannot run the server.');
  process.exit(1);
}

// Routes - using simple paths
app.post("/api/auth", async (req, res) => {
  try {
    const { email, password, isLogin } = req.body;

    if (isLogin) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ field: "email", message: "Email not registered" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ field: "password", message: "Incorrect password" });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ message: "Login successful", token, user: { email: user.email } });

    } else {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ field: "email", message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ message: "Registered successfully", token, user: { email: user.email } });
    }
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ field: "server", message: "Server error" });
  }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ invoices: user.invoices, totalCount: user.invoices.length });
  } catch (err) {
    console.error("Get invoices error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/invoices", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { header, billedBy, billedTo, payment, grandTotal } = req.body;
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    let amountPaid = 0;
    let amountRemaining = 0;

    if (payment.paymentStatus === "paid") {
      amountPaid = grandTotal;
    } else if (payment.paymentStatus === "partially_paid") {
      amountPaid = parseFloat(payment.amountPaid) || 0;
      amountRemaining = Math.max(grandTotal - amountPaid, 0);
    } else if (payment.paymentStatus === "to_be_paid") {
      amountRemaining = grandTotal;
    }

    user.invoices.push({
      invoiceNo: header?.invoiceNo || "",
      billedByName: billedBy?.businessName || "",
      billedToName: billedTo?.businessName || "",
      paymentStatus: payment?.paymentStatus || "",
      grandTotal: grandTotal || 0,
      amountPaid: amountPaid,
      amountRemaining: amountRemaining,
      dueDate: payment?.dueDate ? new Date(payment.dueDate) : null,
      createdAt: new Date(),
    });

    await user.save();
    res.json({ message: "Invoice saved", totalInvoices: user.invoices.length });
  } catch (err) {
    console.error("Save invoice error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update routes
app.post("/api/update-invoice", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { index, invoice: updateData } = req.body;
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.invoices[index]) {
      const inv = user.invoices[index];

      if (updateData.amountPaid !== undefined) inv.amountPaid = updateData.amountPaid;
      if (updateData.paymentStatus !== undefined) inv.paymentStatus = updateData.paymentStatus;
      if (updateData.dueDate !== undefined) inv.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;

      inv.amountRemaining = Math.max((inv.grandTotal || 0) - (inv.amountPaid || 0), 0);

      await user.save();
      res.json({ message: "Invoice updated" });
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));