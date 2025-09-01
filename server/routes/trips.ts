import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "server", "data");
const csvPath = path.join(dataDir, "trips.csv");
const jsonlPath = path.join(dataDir, "trips.jsonl");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export const postTrip: RequestHandler = (req, res) => { /* placeholder to satisfy type */ } as any;
export const getCSV: RequestHandler = (req, res) => { /* placeholder */ } as any;

export const getJSON: RequestHandler = (_req, res) => {
  try {
    ensureDir();
    if (!fs.existsSync(jsonlPath)) return res.json([]);
    const lines = fs.readFileSync(jsonlPath, "utf-8").trim().split(/\n+/).filter(Boolean);
    const arr = lines.slice(-200).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    res.json(arr);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};