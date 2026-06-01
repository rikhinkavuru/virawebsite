import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * GET /api/chapters — the typed network roster.
 * Self-contained: Vercel deploys each /api function in isolation and does NOT
 * include files imported from outside /api, so the data is inlined here. Keep in
 * sync with src/data/chapters.json (the client's copy / react-query fallback).
 */
const CHAPTERS = [
  { id: "hhs", name: "Homestead High School", loc: "Fort Wayne, IN", status: "active", coordinates: [-85.25, 41.05], event: "Homestead Hackathon", date: "09.14.25", attendees: 58, website: "https://hhs.sacs.k12.in.us/", info: "Vira foundation node. Focused on rural clinical access." },
  { id: "phs", name: "Plainfield High School", loc: "Plainfield, IN", status: "active", coordinates: [-86.38, 39.70], event: "Plainfield Hackathon", date: "10.05.25", attendees: 42, website: "https://phs.plainfield.k12.in.us", info: "Primary expansion hub for Indiana network." },
  { id: "chs", name: "Columbus High School", loc: "Columbus, IN", status: "active", coordinates: [-85.92, 39.22], event: "Columbus Hackathon", date: "11.15.25", attendees: 73, website: "https://east.bcscschools.org", info: "Testing high-density participant load protocols." },
  { id: "lhs", name: "Lowell High School", loc: "Lowell, IN", status: "active", coordinates: [-87.42, 41.29], event: "Lowell Hackathon", date: "01.17.26", attendees: 88, website: "https://lhs.tricreek.k12.in.us", info: "Record-setting attendance for Q1 deployments." },
  { id: "lex", name: "Lexington High School", loc: "Lexington, MA", status: "active", coordinates: [-71.22, 42.44], event: "Lexington Hackathon", date: "02.08.26", attendees: 65, website: "https://lhs.lexingtonma.org/", info: "East Coast flagship node. Research-integrated events." },
  { id: "rhs", name: "Rouse High School", loc: "Leander, TX", status: "pending", coordinates: [-97.85, 30.56], website: "https://rouse.leanderisd.org", info: "Finalizing hardware logistics for Texas rollout." },
  { id: "ohs", name: "Oakton High School", loc: "Vienna, VA", status: "pending", coordinates: [-77.29, 38.88], website: "https://oaktonhs.fcps.edu", info: "Awaiting chapter president orientation." },
  { id: "whs", name: "Weddington High School", loc: "Matthews, NC", status: "pending", coordinates: [-80.68, 35.02], website: "https://whs.ucpsnc.org", info: "Uplink handshake pending local board approval." },
  { id: "fhs", name: "Franklin High School", loc: "Franklin, TN", status: "pending", coordinates: [-86.86, 35.92], website: "https://wcs.edu/fhs", info: "Scheduled for Q3 deployment window." },
  { id: "aai", name: "Alliance Academy for Innovation", loc: "Cumming, GA", status: "pending", coordinates: [-84.15, 34.19], website: "https://www.forsyth.k12.ga.us/alliance", info: "Infrastructure audit in progress." },
  { id: "hse", name: "Hamilton Southeastern High School", loc: "Fishers, IN", status: "pending", coordinates: [-85.96, 39.96], website: "https://hseh.hseschools.org", info: "Evaluating local facility bandwidth." },
  { id: "bhs", name: "Brownsburg High School", loc: "Brownsburg, IN", status: "pending", coordinates: [-86.39, 39.84], website: "https://www.brownsburg.k12.in.us/bhs", info: "Node allocation approved; awaiting site visit." },
  { id: "chr", name: "Cherokee High School", loc: "Canton, GA", status: "pending", coordinates: [-84.49, 34.24], website: "https://cherokee.ccsdrift.org", info: "North Georgia expansion node." },
  { id: "mun", name: "Munster High School", loc: "Munster, IN", status: "pending", coordinates: [-87.50, 41.56], website: "https://munsterhs.munster.us", info: "Northwest Indiana chapter initialization." },
  { id: "lam", name: "Lambert High School", loc: "Suwanee, GA", status: "pending", coordinates: [-84.07, 34.05], website: "https://lambert.forsyth.k12.ga.us", info: "Metro Atlanta node pending activation." },
  { id: "cmh", name: "Cox Mill High School", loc: "Concord, NC", status: "pending", coordinates: [-80.58, 35.41], website: "https://coxmill.cabarrus.k12.nc.us", info: "Carolinas network expansion pending." },
  { id: "map", name: "Maple High School", loc: "Dallas, TX", status: "pending", coordinates: [-96.79, 32.78], website: "https://maple.dallasisd.org", info: "Texas metro node scheduled for activation." },
  { id: "ach", name: "Atlantic Coast High School", loc: "Jacksonville, FL", status: "pending", coordinates: [-81.53, 30.28], website: "https://atlanticcoast.duval.k12.fl.us", info: "Florida coast deployment pending infrastructure." },
  { id: "ahs", name: "American High School", loc: "Fremont, CA", status: "pending", coordinates: [-121.99, 37.55], website: "https://ahs.fremont.k12.ca.us", info: "West Coast node pending integration." },
  { id: "wak", name: "Wakeland High School", loc: "Frisco, TX", status: "pending", coordinates: [-96.82, 33.15], website: "https://wakeland.friscoisd.org", info: "North Texas expansion awaiting final approval." },
  { id: "zch", name: "Zionsville Community High School", loc: "Zionsville, IN", status: "pending", coordinates: [-86.28, 39.95], website: "https://zcs.k12.in.us/zchs", info: "Indianapolis metro node evaluation ongoing." },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET.", code: "method_not_allowed" });
    return;
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ chapters: CHAPTERS });
}
