import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import geoUrl from '../us-states.json';

// --- DATA ---
const NETWORK_NODES = [
  // Active Chapters
  { id: 'hhs', name: 'Homestead High School', loc: 'Fort Wayne, IN', status: 'active', coordinates: [-85.25, 41.05] },
  { id: 'phs', name: 'Plainfield High School', loc: 'Plainfield, IN', status: 'active', coordinates: [-86.38, 39.70] },
  { id: 'chs', name: 'Columbus High School', loc: 'Columbus, IN', status: 'active', coordinates: [-85.92, 39.22] },
  { id: 'lhs', name: 'Lowell High School', loc: 'Lowell, IN', status: 'active', coordinates: [-87.42, 41.29] },
  { id: 'lex', name: 'Lexington High School', loc: 'Lexington, MA', status: 'active', coordinates: [-71.22, 42.44] },
  // Pending Chapters
  { id: 'rhs', name: 'Rouse High School', loc: 'Leander, TX', status: 'pending', coordinates: [-97.85, 30.56] },
  { id: 'ohs', name: 'Oakton High School', loc: 'Vienna, VA', status: 'pending', coordinates: [-77.29, 38.88] },
  { id: 'whs', name: 'Weddington High School', loc: 'Matthews, NC', status: 'pending', coordinates: [-80.68, 35.02] },
  { id: 'fhs', name: 'Franklin High School', loc: 'Franklin, TN', status: 'pending', coordinates: [-86.86, 35.92] },
  { id: 'aai', name: 'Alliance Academy for Innovation', loc: 'Cumming, GA', status: 'pending', coordinates: [-84.15, 34.19] },
  { id: 'hse', name: 'Hamilton Southeastern High School', loc: 'Fishers, IN', status: 'pending', coordinates: [-85.96, 39.96] },
  { id: 'bhs', name: 'Brownsburg High School', loc: 'Brownsburg, IN', status: 'pending', coordinates: [-86.39, 39.84] },
];

const DEPLOYMENTS = [
  { event: 'homestead hackathon', school: 'homestead high school', date: '09.14.25', part: 58, status: 'chapter active' },
  { event: 'plainfield hackathon', school: 'plainfield high school', date: '10.05.25', part: 42, status: 'chapter active' },
  { event: 'columbus hackathon', school: 'columbus high school', date: '11.15.25', part: 73, status: 'chapter active' },
  { event: 'lowell hackathon', school: 'lowell high school', date: '01.17.26', part: 88, status: 'chapter active' },
  { event: 'lexington hackathon', school: 'lexington high school', date: '02.08.26', part: 65, status: 'chapter active' },
];

const NODE_OPERATORS = [
  { name: 'rikhin', school: 'homestead high school', role: 'chapter president', uptime: '7 months active', status: 'active' },
  { name: 'kanav', school: 'rouse high school', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'marcus', school: 'plainfield high school', role: 'chapter president', uptime: '6 months active', status: 'active' },
  { name: 'ayush', school: 'oakton high school', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'bala', school: 'weddington high school', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'julian', school: 'columbus high school', role: 'chapter president', uptime: '5 months active', status: 'active' },
  { name: 'aadith', school: 'franklin high school', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'sofia', school: 'lowell high school', role: 'chapter president', uptime: '3 months active', status: 'active' },
  { name: 'kaushal', school: 'alliance academy', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'aiden', school: 'lexington high school', role: 'chapter president', uptime: '2 months active', status: 'active' },
  { name: 'cameron', school: 'hamilton southeastern', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
  { name: 'zara', school: 'brownsburg high school', role: 'chapter president (pending)', uptime: 'pending init', status: 'pending' },
];

const INITIAL_LOGS = [
  "[03.31.26 23:45] core systems online — initializing handshake",
  "[04.01.26 00:01] daily sync complete — 6 functional nodes",
  "[04.01.26 08:30] checking db cluster /health — status: OK",
  "[04.01.26 09:14] deployment initialized — purdue fort wayne",
  "[04.01.26 11:02] 312 participants onboarded — hackpurdue",
  "[04.01.26 12:44] bandwidth allocation adjusted for michigan region",
  "[04.01.26 14:10] scheduled backup completed successfully",
  "[04.01.26 16:30] connection established to secure relay",
  "[04.01.26 18:47] 87 projects submitted — awaiting validation",
  "[04.01.26 19:03] judging protocol complete — top 5 flagged",
];

// Stylized ASCII/Grid map of the US to serve as the background for the Nodes map
const US_GRID_MAP = [
  "        ........                            ",
  "      .............   ...                   ",
  "    .......................                 ",
  "  ..........................                ",
  "  ...........................               ",
  " ...........................                ",
  " ..........................                 ",
  "  ........................                  ",
  "   .......................                  ",
  "    ...................                     ",
  "      ..............                        ",
  "         .........                          ",
  "                      .                     "
];

// --- COMPONENTS ---

export default function Index() {
  const [activeTab, setActiveTab] = useState('network');
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Simulated live log append
  useEffect(() => {
    if (activeTab === 'logs') {
      const timer = setInterval(() => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
        const newLog = `[04.01.26 ${timeStr}] pinging inactive nodes — awaiting response...`;
        setLogs(prev => [...prev, newLog]);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  return (
    <div className="layout">
        <Hero />

        <header className="header" id="system-dashboard">
          <div className="system-label">
            <span className="mono text-[#888888]">system // virahacks.com</span>
          <span className="mono" style={{ color: 'var(--text-primary)' }}>network v1.0.3</span>
          <div className="system-metrics">
            <span>total_nodes: <span className="metric-val">{NETWORK_NODES.length}</span></span>
            <span>deployments: <span className="metric-val">{DEPLOYMENTS.length}</span></span>
            <span>processed_users: <span className="metric-val flicker-data">326</span></span>
          </div>
        </div>
        
        <nav className="nav">
          {['network', 'deployments', 'nodes', 'logs', 'access'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
              [{tab}]
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {activeTab === 'network' && <NetworkTab />}
        {activeTab === 'deployments' && <DeploymentsTab />}
        {activeTab === 'nodes' && <NodesTab />}
        {activeTab === 'logs' && <LogsTab logs={logs} />}
        {activeTab === 'access' && <AccessTab />}
      </main>

      <footer className="footer">
        <div>founder_id: rikhin kavuru</div>
        <div className="text-center">
          <a href="mailto:rikhinkavuru@gmail.com">req_contact: rikhinkavuru@gmail.com</a>
        </div>
        <div className="text-right">
          status: <span style={{color: 'var(--accent)'}}>operational</span>
        </div>
      </footer>
    </div>
  );
}

function Hero() {
  const scrollDown = () => {
    document.getElementById('system-dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-section">
      <div className="hero-bg">
        <div className="hero-radar"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-status mono"><span className="dot active"></span> UPLINK ESTABLISHED</div>
        <h1 className="hero-title">VIRA<br/>HACKS</h1>
        <p className="hero-sub">
          The infrastructure layer for high school healthcare innovation. <br />
          We deploy localized hackathons to solve clinical challenges.
        </p>
        <button className="hero-btn" onClick={scrollDown}>
          Initiate System Access <span className="mono" style={{opacity: 0.5}}>[↵]</span>
        </button>
      </div>

      <div className="hero-visual">
        <svg viewBox="0 0 500 500" className="hero-network-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Target/Radar Rings */}
          <circle cx="250" cy="250" r="240" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="160" fill="none" stroke="var(--border)" strokeWidth="1" />
          <circle cx="250" cy="250" r="80" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="15 10" className="spin-slow" />
          <circle cx="250" cy="250" r="10" fill="var(--accent-deploying)" className="pulse-svg" />

          {/* Core EKG Waveform */}
          <path 
            d="M 0 250 L 150 250 L 180 160 L 220 380 L 270 120 L 320 250 L 500 250"
            fill="none" stroke="var(--accent)" strokeWidth="4" filter="url(#glow)"
            className="ekg-hero-line"
          />

          {/* Node intersections on EKG */}
          <circle cx="150" cy="250" r="5" fill="var(--bg-color)" stroke="var(--text-primary)" strokeWidth="2" className="node-pop" style={{animationDelay: '0.45s'}} />
          <circle cx="180" cy="160" r="5" fill="var(--bg-color)" stroke="var(--text-primary)" strokeWidth="2" className="node-pop" style={{animationDelay: '0.55s'}} />
          <circle cx="220" cy="380" r="5" fill="var(--bg-color)" stroke="var(--text-primary)" strokeWidth="2" className="node-pop" style={{animationDelay: '0.65s'}} />
          <circle cx="270" cy="120" r="5" fill="var(--bg-color)" stroke="var(--text-primary)" strokeWidth="2" className="node-pop" style={{animationDelay: '0.80s'}} />
          <circle cx="320" cy="250" r="5" fill="var(--bg-color)" stroke="var(--text-primary)" strokeWidth="2" className="node-pop" style={{animationDelay: '0.90s'}} />
        </svg>
      </div>
    </div>
  );
}

function NetworkTab() {
  return (
    <div>
      <h2 className="section-title">01 // network architecture</h2>
      <div className="network-container">
        <div className="node-list">
          {NETWORK_NODES.map(node => (
            <div key={node.id} className="node-item">
              <div>
                <div className="node-name">{node.name.toLowerCase()}</div>
                <div className="node-loc">{node.loc.toLowerCase()}</div>
              </div>
              <div className="status-indicator">
                <div className={`dot ${node.status}`}></div>
                {node.status}
              </div>
            </div>
          ))}
        </div>
        
        <div className="map-container" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
          <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }} style={{ width: "100%", height: "100%" }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEA"
                    stroke="#D0D0D0"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#E0E0E0", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {NETWORK_NODES.map(node => (
              <Marker key={node.id} coordinates={node.coordinates as [number, number]}>
                {/* Node pulsing circle */}
                <circle 
                  r={6} 
                  fill={node.status === 'active' ? 'var(--accent)' : node.status === 'deploying' ? 'var(--accent-deploying)' : 'var(--accent-pending)'}
                  opacity={0.8}
                />
                <circle
                  r={12}
                  fill="none"
                  stroke={node.status === 'active' ? 'var(--accent)' : node.status === 'deploying' ? 'var(--accent-deploying)' : 'var(--accent-pending)'}
                  strokeWidth={1}
                  opacity={0.3}
                  className="pulse-svg"
                />
                {/* Minimal label tag for node */}
                <g className="map-node-svg-label-group">
                  <rect x={10} y={-14} width={30} height={14} fill="var(--bg-color)" stroke="var(--border)" strokeWidth={1} />
                  <text
                    textAnchor="start"
                    x={14}
                    y={-4}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", fill: "var(--text-primary)" }}
                  >
                    {node.id}
                  </text>
                </g>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}

function DeploymentsTab() {
  return (
    <div>
      <h2 className="section-title">02 // execution history</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="deployments-table">
          <thead>
            <tr>
              <th>operation</th>
              <th>target</th>
              <th>date</th>
              <th className="hide-mobile">metrics</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {DEPLOYMENTS.map((d, i) => (
              <tr key={i}>
                <td>{d.event}</td>
                <td className="mono">{d.school}</td>
                <td className="mono">{d.date}</td>
                <td className="hide-mobile mono" style={{ fontSize: '0.75rem' }}>
                  {d.part} attendees
                </td>
                <td className={`deploy-status ${d.status === 'chapter active' ? 'completed' : 'scheduled'}`}>[{d.status}]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NodesTab() {
  return (
    <div>
      <h2 className="section-title">03 // active personnel</h2>
      <div className="nodes-grid">
        {NODE_OPERATORS.map((op, i) => (
          <div key={i} className={`node-card ${op.status}`}>
            <div className="card-name">{op.name.toLowerCase()}</div>
            <div className="card-school">{op.school.toLowerCase()}</div>
            <div className="card-meta">
              <span>{op.role}</span>
              <span className="flicker-data">{op.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsTab({ logs }: { logs: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div>
      <h2 className="section-title">04 // system logs</h2>
      <div className="logs-container" ref={containerRef}>
        {logs.map((log, i) => {
          const isHighlight = log.includes('error') || log.includes('failed');
          const isAccent = log.includes('complete') || log.includes('online');
          const isAlert = log.includes('flagged') || log.includes('awaiting');
          return (
            <div key={i} className={`log-entry ${isHighlight ? 'log-highlight' : ''} ${isAccent ? 'log-accent' : ''} ${isAlert ? 'log-alert' : ''}`}>
              <span style={{opacity: 0.8}}>{log}</span>
            </div>
          );
        })}
        <div className="log-entry">
          <span className="log-time">[sys_idle]</span> awaiting further instructions <span className="cursor"></span>
        </div>
      </div>
    </div>
  );
}

function AccessTab() {
  return (
    <div>
      <h2 className="section-title">05 // request authorization</h2>
      <div className="access-container">
        <div className="access-header">
          initialize connection
        </div>
        <form className="access-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>full.name</label>
            <input className="form-input" type="text" placeholder="e.g. j. doe" required />
          </div>
          <div className="form-group">
            <label>institution.id</label>
            <input className="form-input" type="text" placeholder="e.g. university of ... " required />
          </div>
          <div className="form-group">
            <label>requested.role</label>
            <select className="form-input" required>
              <option value="student">node.student</option>
              <option value="organizer">node.organizer</option>
              <option value="sponsor">system.sponsor</option>
            </select>
          </div>
          <button className="btn-submit" type="submit">transmit request</button>
        </form>
      </div>
    </div>
  );
}
