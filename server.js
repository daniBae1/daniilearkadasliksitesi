import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Statik dosyalar (index.html, images, css vs)
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "leaderboard.json");

async function readData() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Leaderboard getir
app.get("/api/leaderboard", async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    console.error("GET /api/leaderboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Yeni kullanıcı kaydet
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score, levelType, levelLabel } = req.body;
    if (!name || typeof score !== "number") {
      return res.status(400).json({ message: "name ve score zorunlu" });
    }

    const data = await readData();
    data.push({
      name: name.trim(),
      score,
      levelType,
      levelLabel,
      timestamp: Date.now(),
    });

    await writeData(data);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("POST /api/leaderboard hata:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server http://localhost:${PORT} üzerinde çalışıyor`)
);
