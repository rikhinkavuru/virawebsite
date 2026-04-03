import React, { useEffect, useRef, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import geoUrl from '../us-states.json';

// --- DATA ---
const NETWORK_NODES = [
  { id: 'hhs', name: 'Homestead High School', loc: 'Fort Wayne, IN', status: 'active', coordinates: [-85.25, 41.05] },
  { id: 'phs', name: 'Plainfield High School', loc: 'Plainfield, IN', status: 'active', coordinates: [-86.38, 39.70] },
  { id: 'chs', name: 'Columbus High School', loc: 'Columbus, IN', status: 'active', coordinates: [-85.92, 39.22] },
  { id: 'lhs', name: 'Lowell High School', loc: 'Lowell, IN', status: 'active', coordinates: [-87.42, 41.29] },
  { id: 'lex', name: 'Lexington High School', loc: 'Lexington, MA', status: 'active', coordinates: [-71.22, 42.44] },
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

// --- COMPONENTS ---

export default function Index() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      {/* Fixed header — completely outside the page flow */}
      {/* Fixed header — completely outside the page flow */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="vira-logo-svg">
              <defs>
                <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="#7c3aed" strokeWidth="1" />
                </pattern>
                <clipPath id="overlap">
                  <circle cx="16" cy="20" r="12" />
                </clipPath>
              </defs>
              {/* Left Circle */}
              <circle cx="16" cy="20" r="12" stroke="#7c3aed" strokeWidth="1.5" />
              {/* Right Circle */}
              <circle cx="28" cy="20" r="12" stroke="#7c3aed" strokeWidth="1.5" />
              {/* Hatch Overlap */}
              <circle cx="28" cy="20" r="12" fill="url(#hatch)" clipPath="url(#overlap)" />
              {/* Text */}
              <text x="50" y="27" fill="black" style={{ font: 'bold 22px Inter, sans-serif', letterSpacing: '-0.02em' }}>vira</text>
            </svg>
          </div>

          <nav className="nav">
            {['network', 'deployments', 'people', 'access'].map(tab => (
              <button key={tab} onClick={() => scrollToSection(tab)}>
                [{tab}]
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Metrics Bar — below header */}
      <div className="metrics-bar">
        <div className="metrics-inner">
          <div className="system-label-new">
            <span className="mono">system // virahacks.com</span>
            <span className="mono" style={{ color: 'var(--text-primary)' }}>network v1.0.3</span>
          </div>
          <div className="system-metrics-new">
            <span>total_nodes: <span className="metric-val">{NETWORK_NODES.length}</span></span>
            <span>deployments: <span className="metric-val">{DEPLOYMENTS.length}</span></span>
            <span>processed_users: <span className="metric-val flicker-data">326</span></span>
          </div>
        </div>
      </div>

      {/* Page content — pushed down to clear the fixed header and metrics bar */}
      <div className="page-wrapper">
        <Hero />

        <main className="main-content">
          <section id="network" className="content-section">
            <NetworkTab />
          </section>
          <section id="deployments" className="content-section">
            <DeploymentsTab />
          </section>
          <section id="people" className="content-section">
            <PeopleTab />
          </section>
          <section id="access" className="content-section">
            <AccessTab />
          </section>
        </main>
      </div>

      <footer className="footer">
        <div>founder_id: rikhin kavuru</div>
        <div className="text-center">
          <a href="mailto:rikhinkavuru@gmail.com">req_contact: rikhinkavuru@gmail.com</a>
        </div>
        <div className="text-right">
          status: <span style={{ color: 'var(--accent)' }}>operational</span>
        </div>
      </footer>
    </>
  );
}

// --- HERO ---
function Hero() {
  const scrollDown = () => {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hero-section">
      <div className="hero-bg">
        <div className="hero-radar"></div>
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-status mono"><span className="dot active" style={{ marginRight: 8 }}></span> UPLINK ESTABLISHED</div>
          <div className="hero-main-group">
            <h1 className="hero-title glitch">VIRA<br />HACKS</h1>
            <p className="hero-sub">
              The infrastructure layer for high school healthcare innovation. <br />
              We deploy localized hackathons to solve clinical challenges.
            </p>
          </div>
          <button className="hero-btn" onClick={scrollDown}>
            Get Started <span className="mono" style={{ opacity: 0.5 }}>[↵]</span>
          </button>
        </div>

        <div className="hero-visual">
          <DemoSnippet />
        </div>
      </div>
    </div>
  );
}

// --- DEMO CODE SNIPPET ---
function DemoSnippet() {
  return (
    <div className="demo-container">
      <div className="demo-header">
        <div className="demo-dot red"></div>
        <div className="demo-dot yellow"></div>
        <div className="demo-dot green"></div>
        <span style={{ color: '#999', fontSize: '0.7rem', marginLeft: 'auto', fontFamily: 'monospace' }}>terminal@vira:~</span>
      </div>
      <div className="demo-content">
        <div><span className="code-keyword">protocol</span> <span className="code-const">ViraHandshake</span> {'{'}</div>
        <div style={{ paddingLeft: '1rem' }}><span className="code-const">status</span>: <span className="code-str">"authenticating"</span>;</div>
        <div style={{ paddingLeft: '1rem' }}><span className="code-const">layers</span>: [<span className="code-str">"RSA"</span>, <span className="code-str">"P2P"</span>];</div>
        <div>{'}'}</div>
        <br />
        <div><span className="code-keyword">async function</span> <span className="code-func">deployNode</span>(loc: <span className="code-keyword">string</span>) {'{'}</div>
        <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">const</span> auth = <span className="code-keyword">await</span> vira.<span className="code-func">secureHandshake</span>();</div>
        <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">if</span> (auth.valid) {'{'}</div>
        <div style={{ paddingLeft: '2rem' }}><span className="code-comment">// Establish uplink to local clinic infrastructure</span></div>
        <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">const</span> node = <span className="code-keyword">await</span> vira.<span className="code-func">initiate</span>({'{'}
          location: loc,
          timestamp: <span className="code-const">Date</span>.<span className="code-func">now</span>(),
          priority: <span className="code-str">'HIGH'</span>
        {'}'});</div>
        <br />
        <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">if</span> (node.active) {'{'}</div>
        <div style={{ paddingLeft: '3rem' }}><span className="code-keyword">const</span> sync = <span className="code-keyword">await</span> node.<span className="code-func">syncState</span>();</div>
        <div style={{ paddingLeft: '3rem' }}><span className="code-keyword">return</span> sync.payload;</div>
        <div style={{ paddingLeft: '2rem' }}>{'}'}</div>
        <div style={{ paddingLeft: '1rem' }}>{'}'}</div>
        <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">throw new</span> <span className="code-const">Error</span>(<span className="code-str">"Deployment rejected: invalid handshake"</span>);</div>
        <div>{'}'}</div>
        <br />
        <div className="code-comment" style={{ opacity: 0.6 }}>// NETWORK LOG: Uplink established with ID #882</div>
        <div className="code-comment" style={{ opacity: 0.6 }}>// STATUS: Synchronizing network state...</div>
        <div className="code-comment" style={{ opacity: 0.6 }}>// LATENCY: 14ms [region: us-east-1]</div>
        <div className="code-comment" style={{ opacity: 0.6 }}>// SECURITY: RSA-4096 / AES-256 active</div>
      </div>
    </div>
  );
}



// --- NETWORK TAB ---
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
                <circle
                  r={6}
                  fill={node.status === 'active' ? 'var(--accent)' : 'var(--accent-pending)'}
                  opacity={0.8}
                />
                <circle
                  r={12}
                  fill="none"
                  stroke={node.status === 'active' ? 'var(--accent)' : 'var(--accent-pending)'}
                  strokeWidth={1}
                  opacity={0.3}
                  className="pulse-svg"
                />
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

// --- DEPLOYMENTS TAB ---
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
                <td className="hide-mobile mono" style={{ fontSize: '0.72rem' }}>
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

// --- PEOPLE TAB ---
function PeopleTab() {
  return (
    <div>
      <h2 className="section-title">03 // people</h2>
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

// --- ACCESS TAB ---
function AccessTab() {
  return (
    <div>
      <h2 className="section-title">04 // request authorization</h2>
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
