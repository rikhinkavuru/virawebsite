import React, { useEffect, useRef, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import geoUrl from '../us-states.json';

// --- DATA ---
const NETWORK_NODES = [
  { id: 'hhs', name: 'Homestead High School', loc: 'Fort Wayne, IN', status: 'active', coordinates: [-85.25, 41.05], event: 'Homestead Hackathon', date: '09.14.25', attendees: 58, website: 'https://hhs.sacs.k12.in.us/', info: 'Vira foundation node. Focused on rural clinical access.' },
  { id: 'phs', name: 'Plainfield High School', loc: 'Plainfield, IN', status: 'active', coordinates: [-86.38, 39.70], event: 'Plainfield Hackathon', date: '10.05.25', attendees: 42, website: 'https://phs.plainfield.k12.in.us', info: 'Primary expansion hub for Indiana network.' },
  { id: 'chs', name: 'Columbus High School', loc: 'Columbus, IN', status: 'active', coordinates: [-85.92, 39.22], event: 'Columbus Hackathon', date: '11.15.25', attendees: 73, website: 'https://east.bcscschools.org', info: 'Testing high-density participant load protocols.' },
  { id: 'lhs', name: 'Lowell High School', loc: 'Lowell, IN', status: 'active', coordinates: [-87.42, 41.29], event: 'Lowell Hackathon', date: '01.17.26', attendees: 88, website: 'https://lhs.tricreek.k12.in.us', info: 'Record-setting attendance for Q1 deployments.' },
  { id: 'lex', name: 'Lexington High School', loc: 'Lexington, MA', status: 'active', coordinates: [-71.22, 42.44], event: 'Lexington Hackathon', date: '02.08.26', attendees: 65, website: 'https://lhs.lexingtonma.org/', info: 'East Coast flagship node. Research-integrated events.' },
  { id: 'rhs', name: 'Rouse High School', loc: 'Leander, TX', status: 'pending', coordinates: [-97.85, 30.56], website: 'https://rouse.leanderisd.org', info: 'Finalizing hardware logistics for Texas rollout.' },
  { id: 'ohs', name: 'Oakton High School', loc: 'Vienna, VA', status: 'pending', coordinates: [-77.29, 38.88], website: 'https://oaktonhs.fcps.edu', info: 'Awaiting chapter president orientation.' },
  { id: 'whs', name: 'Weddington High School', loc: 'Matthews, NC', status: 'pending', coordinates: [-80.68, 35.02], website: 'https://whs.ucpsnc.org', info: 'Uplink handshake pending local board approval.' },
  { id: 'fhs', name: 'Franklin High School', loc: 'Franklin, TN', status: 'pending', coordinates: [-86.86, 35.92], website: 'https://wcs.edu/fhs', info: 'Scheduled for Q3 deployment window.' },
  { id: 'aai', name: 'Alliance Academy for Innovation', loc: 'Cumming, GA', status: 'pending', coordinates: [-84.15, 34.19], website: 'https://www.forsyth.k12.ga.us/alliance', info: 'Infrastructure audit in progress.' },
  { id: 'hse', name: 'Hamilton Southeastern High School', loc: 'Fishers, IN', status: 'pending', coordinates: [-85.96, 39.96], website: 'https://hseh.hseschools.org', info: 'Evaluating local facility bandwidth.' },
  { id: 'bhs', name: 'Brownsburg High School', loc: 'Brownsburg, IN', status: 'pending', coordinates: [-86.39, 39.84], website: 'https://www.brownsburg.k12.in.us/bhs', info: 'Node allocation approved; awaiting site visit.' },
];

// DEPLOYMENTS data moved into NETWORK_NODES for interactivity
const DEPLOYMENT_STATS = {
  total_nodes: NETWORK_NODES.length,
  total_deployments: NETWORK_NODES.filter(n => n.status === 'active').length,
  total_users: 326
};

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
          <div className="logo" onClick={() => scrollToSection('hero')} style={{ cursor: 'pointer' }}>
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
            {['network', 'people', 'contact'].map(tab => (
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
            <span>total_nodes: <span className="metric-val">{DEPLOYMENT_STATS.total_nodes}</span></span>
            <span>deployments: <span className="metric-val">{DEPLOYMENT_STATS.total_deployments}</span></span>
            <span>processed_users: <span className="metric-val flicker-data">{DEPLOYMENT_STATS.total_users}</span></span>
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
          <section id="people" className="content-section">
            <PeopleTab />
          </section>
          <section id="contact" className="content-section">
            <ContactTab />
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
    <div id="hero" className="hero-section">
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



import { useState } from 'react';

// --- NETWORK TAB ---
function NetworkTab() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node === selectedNode ? null : node);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2 className="section-title">01 // network architecture</h2>

      <div className="map-wrapper-large">
        <div className="map-container-enhanced">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1300 }}
            width={1200}
            height={700}
            style={{ width: "100%", height: "auto" }}
            className="interactive-map"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="map-geo"
                  />
                ))
              }
            </Geographies>
            {NETWORK_NODES.map(node => (
              <Marker
                key={node.id}
                coordinates={node.coordinates as [number, number]}
                onMouseEnter={() => setSelectedNode(node)}
                onMouseLeave={() => setSelectedNode(null)}
                onClick={() => setSelectedNode(node)}
              >
                <circle
                  r={8}
                  className={`map-marker ${node.status === 'active' ? 'active' : 'pending'}`}
                />
                <circle
                  r={15}
                  className={`map-marker-pulse ${node.status === 'active' ? 'active' : 'pending'}`}
                />
              </Marker>
            ))}
          </ComposableMap>

          {/* Dialog Box / Tooltip */}
          {selectedNode && (
            <div className="node-dialog">
              <div className="dialog-header">
                <span className="dialog-id">[{selectedNode.id}]</span>
                <button className="dialog-close" onClick={() => setSelectedNode(null)}>×</button>
              </div>
              <div className="dialog-body">
                <h3 className="dialog-title">{selectedNode.name}</h3>
                <p className="dialog-loc mono">{selectedNode.loc}</p>

                <div className="dialog-status-tag mono">
                  STATUS: <span className={selectedNode.status}>{selectedNode.status.toUpperCase()}</span>
                </div>

                {selectedNode.status === 'active' && (
                  <div className="dialog-metrics mono">
                    <div className="metric-row">
                      <span>EVENT:</span>
                      <span className="val">{selectedNode.event}</span>
                    </div>
                    <div className="metric-row">
                      <span>DATE:</span>
                      <span className="val">{selectedNode.date}</span>
                    </div>
                    <div className="metric-row">
                      <span>ATTENDEES:</span>
                      <span className="val">{selectedNode.attendees}</span>
                    </div>
                  </div>
                )}

                <p className="dialog-info">{selectedNode.info}</p>

                {selectedNode.website && (
                  <a href={selectedNode.website} target="_blank" rel="noopener noreferrer" className="dialog-link">
                    portal.school_site [↗]
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// --- PEOPLE TAB ---
function PeopleTab() {
  return (
    <div>
      <h2 className="section-title">02 // people</h2>
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

// --- CONTACT TAB ---
function ContactTab() {
  const [formData, setFormData] = useState({ name: '', school: '', request: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('sent');
        setFormData({ name: '', school: '', request: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Contact Form Error:', err);
      setStatus('error');
    }
  };

  return (
    <div>
      <h2 className="section-title">03 // contact</h2>
      <div className="access-container">
        <div className="access-header">
          {status === 'sent' ? 'message_transmitted' : 'initialize portal handshake'}
        </div>
        
        {status === 'sent' ? (
          <div className="contact-success mono">
            <span style={{ color: 'var(--accent)' }}>SUCCESS:</span> Uplink established. Your request has been queued for routing to admin.rikhinkavuru.
            <br /><br />
            <button className="btn-submit" onClick={() => setStatus('idle')}>new_transmission</button>
          </div>
        ) : (
          <form className="access-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>full.name</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g. j. doe" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
                disabled={status === 'sending'}
              />
            </div>
            <div className="form-group">
              <label>target.school</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g. homestead high school" 
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                required 
                disabled={status === 'sending'}
              />
            </div>
            <div className="form-group">
              <label>transmission.payload</label>
              <textarea 
                className="form-input" 
                rows={4}
                placeholder="Describe your request or node allocation inquiry..."
                value={formData.request}
                onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                required 
                disabled={status === 'sending'}
              />
            </div>
            {status === 'error' && (
              <div className="transmission-error-box">
                CRITICAL ERROR: Packet delivery failed. Internal system timeout.
              </div>
            )}
            <button className="btn-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'transmitting...' : 'transmit request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

