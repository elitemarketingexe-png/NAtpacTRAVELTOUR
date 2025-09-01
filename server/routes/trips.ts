import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "server", "data");
const csvPath = path.join(dataDir, "trips.csv");
const jsonlPath = path.join(dataDir, "trips.jsonl");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export const postTrip: RequestHandler = (req, res) => {
  try {
    ensureDir();
    const t = req.body ?? {};
    const headers = [
      "tripId","userId","startedAt","endedAt","mode","purpose","companions","companionsDetails","startLat","startLng","destName","destLat","destLng","distanceKm","costEstimate","costActual","pathPoints","busStops","metro","attractions"
    ];
    const row = [
      t.tripId,
      t.userId,
      new Date(t.startedAt).toISOString(),
      new Date(t.endedAt).toISOString(),
      t.mode,
      t.purpose,
      t.companions,
      Array.isArray(t.companionsDetails) ? JSON.stringify(t.companionsDetails) : "",
      t.start?.lat,
      t.start?.lng,
      t.destination?.name ?? "",
      t.destination?.position?.lat ?? "",
      t.destination?.position?.lng ?? "",
      t.distanceKm ?? "",
      t.costEstimate ?? "",
      t.costActual ?? "",
      Array.isArray(t.path) ? t.path.length : 0,
      Array.isArray(t.pois?.busStops) ? t.pois.busStops.join(";") : "",
      Array.isArray(t.pois?.metro) ? t.pois.metro.join(";") : "",
      Array.isArray(t.pois?.attractions) ? t.pois.attractions.join(";") : "",
    ];
    const line = row.map((v) => String(v ?? "").replaceAll('"','""')).join(",") + "\n";
    if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, headers.join(",") + "\n");
    fs.appendFileSync(csvPath, line);
    // append JSON line
    fs.appendFileSync(jsonlPath, JSON.stringify(t) + "\n");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};

export const getCSV: RequestHandler = (_req, res) => {
  try {
    ensureDir();
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, "tripId,userId,startedAt,endedAt,mode,purpose,companions,startLat,startLng,destName,destLat,destLng,distanceKm,costEstimate,costActual,pathPoints,busStops,metro,attractions\n");
    }
    res.setHeader("Content-Type", "text/csv");
    res.send(fs.readFileSync(csvPath));
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};
