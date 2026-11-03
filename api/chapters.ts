import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/chapters — the typed network roster.
 * Self-contained: Vercel deploys each /api function in isolation and does NOT
 * include files imported from outside /api, so the data is inlined here. Keep in
 * sync with src/data/chapters.json (the client's copy / react-query fallback).
 */
const CHAPTERS = [
  { id: "hhs", name: "Homestead High School", loc: "Fort Wayne, IN", status: "active", coordinates: [-85.25, 41.05], event: "Homestead Hackathon", date: "09.14.25", attendees: 58, website: "https://hhs.sacs.k12.in.us/", info: "Vira foundation node. Focused on rural clinical access." },
  { id: "rhs", name: "Rouse High School", loc: "Leander, TX", status: "active", coordinates: [-97.85, 30.56], event: "Rouse Hackathon", date: "03.14.26", attendees: 71, website: "https://rouse.leanderisd.org", info: "Texas flagship node." },
  { id: "ohs", name: "Oakton High School", loc: "Vienna, VA", status: "active", coordinates: [-77.29, 38.88], event: "Oakton Hackathon", date: "02.21.26", attendees: 64, website: "https://oaktonhs.fcps.edu", info: "DC-metro node running clinician-judged builds." },
  { id: "whs", name: "Weddington High School", loc: "Matthews, NC", status: "active", coordinates: [-80.68, 35.02], event: "Weddington Hackathon", date: "03.07.26", attendees: 59, website: "https://whs.ucpsnc.org", info: "Carolinas anchor node with a standing mentor bench." },
  { id: "aai", name: "Alliance Academy for Innovation", loc: "Cumming, GA", status: "active", coordinates: [-84.15, 34.19], event: "Alliance Hackathon", date: "03.21.26", attendees: 52, website: "https://www.forsyth.k12.ga.us/alliance", info: "Innovation-academy node with integrated health-science track." },
  { id: "hse", name: "Hamilton Southeastern High School", loc: "Fishers, IN", status: "active", coordinates: [-85.96, 39.96], event: "Fishers Hackathon", date: "04.04.26", attendees: 66, website: "https://hseh.hseschools.org", info: "Indy-metro node in Fishers." },
  { id: "mun", name: "Munster High School", loc: "Munster, IN", status: "active", coordinates: [-87.5, 41.56], event: "Munster Hackathon", date: "04.25.26", attendees: 49, website: "https://munsterhs.munster.us", info: "Northwest Indiana node bridging the Chicago metro." },
  { id: "lam", name: "Lambert High School", loc: "Suwanee, GA", status: "active", coordinates: [-84.07, 34.05], event: "Lambert Hackathon", date: "05.02.26", attendees: 61, website: "https://lambert.forsyth.k12.ga.us", info: "Metro Atlanta node; strongest sponsor pipeline in the region." },
  { id: "cmh", name: "Cox Mill High School", loc: "Concord, NC", status: "active", coordinates: [-80.58, 35.41], event: "Cox Mill Hackathon", date: "05.16.26", attendees: 43, website: "https://coxmill.cabarrus.k12.nc.us", info: "Concord node running joint events with Weddington." },
  { id: "map", name: "Maple High School", loc: "Dallas, TX", status: "active", coordinates: [-96.79, 32.78], event: "Maple Hackathon", date: "05.30.26", attendees: 43, website: "https://maple.dallasisd.org", info: "Dallas-metro node." },
  { id: "ach", name: "Atlantic Coast High School", loc: "Jacksonville, FL", status: "active", coordinates: [-81.53, 30.28], website: "https://atlanticcoast.duval.k12.fl.us", info: "Northeast Florida node on the Atlantic coast." },
  { id: "ahs", name: "American High School", loc: "Fremont, CA", status: "active", coordinates: [-121.99, 37.55], website: "https://ahs.fremont.k12.ca.us", info: "West Coast node in the Bay Area." },
  { id: "wak", name: "Wakeland High School", loc: "Frisco, TX", status: "active", coordinates: [-96.82, 33.15], website: "https://wakeland.friscoisd.org", info: "North Texas node in Frisco." },
  { id: "zch", name: "Zionsville Community High School", loc: "Zionsville, IN", status: "active", coordinates: [-86.28, 39.95], website: "https://zcs.k12.in.us/zchs", info: "Indianapolis metro node in Zionsville." },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET.", code: "method_not_allowed" });
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ chapters: CHAPTERS });
}
