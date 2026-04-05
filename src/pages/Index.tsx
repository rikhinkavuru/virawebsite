import React, { useEffect, useRef, useCallback, useState } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  }, [isDarkMode]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      {/* Skip to main content for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
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
              <text x="50" y="27" fill="var(--text-primary)" style={{ font: 'bold 22px Inter, sans-serif', letterSpacing: '-0.02em' }}>vira</text>
            </svg>
          </div>

          <nav className="nav">
            {['network', 'people'].map(tab => (
              <button key={tab} onClick={() => scrollToSection(tab)}>
                [{tab}]
              </button>
            ))}
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
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
      <div id="main-content" className="page-wrapper">
        <Hero />

        <main className="main-content">
          <section id="network" className="content-section">
            <NetworkTab />
          </section>
          <section id="people" className="content-section">
            <PeopleTab />
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
          <button 
            className="hero-btn" 
            onClick={scrollDown}
            aria-label="Get Started - Scroll to network section"
          >
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

// --- ABOUT SNIPPET ---
function DemoSnippet() {
  return (
    <div className="demo-container">
      <div className="demo-header">
        <div className="demo-dot red"></div>
        <div className="demo-dot yellow"></div>
        <div className="demo-dot green"></div>
        <span style={{ color: '#999', fontSize: '0.7rem', marginLeft: 'auto', fontFamily: 'monospace' }}>about@vira:~</span>
      </div>
      <div className="demo-content">
        <div style={{ display: 'flex' }}>
          <div style={{ color: '#999', paddingRight: '1rem', fontSize: '0.8rem', textAlign: 'right', minWidth: '2rem' }}>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
            <div>6</div>
            <div>7</div>
            <div>8</div>
            <div>9</div>
            <div>10</div>
            <div>11</div>
            <div>12</div>
            <div>13</div>
            <div>14</div>
            <div>15</div>
            <div>16</div>
            <div>17</div>
            <div>18</div>
            <div>19</div>
            <div>20</div>
          </div>
          <div>
            <div><span className="code-comment">/**</span></div>
            <div><span className="code-comment"> * Vira Hacks - Student-Run Hackathon Network</span></div>
            <div><span className="code-comment"> * Built by students, for students</span></div>
            <div><span className="code-comment"> */</span></div>
            <br />
            <div><span className="code-keyword">class</span> <span className="code-const">ViraNetwork</span> {'{'}</div>
            <div style={{ paddingLeft: '1rem' }}><span className="code-comment">// A student-run network of hackathons across the United States</span></div>
            <div style={{ paddingLeft: '1rem' }}><span className="code-comment">// Founded by a high school student at Homestead High School</span></div>
            <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">constructor</span>() {'{'}</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">this</span>.<span className="code-const">mission</span> = <span className="code-str">"Make hackathons accessible to every student in America"</span>;</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">this</span>.<span className="code-const">philosophy</span> = <span className="code-str">"Students living the experience inspire best"</span>;</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">this</span>.<span className="code-const">model</span> = <span className="code-str">"Empower students to run their own events under Vira name"</span>;</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">this</span>.<span className="code-const">activeChapters</span> = <span className="code-number">{DEPLOYMENT_STATS.total_deployments}</span>;</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">this</span>.<span className="code-const">hackathonParticipants</span> = <span className="code-number">{DEPLOYMENT_STATS.total_users}</span>;</div>
            <div style={{ paddingLeft: '1rem' }}>{'}'}</div>
            <br />
            <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">expandChapter</span>(school: <span className="code-keyword">string</span>) {'{'}</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-comment">// Instead of one big centralized program...</span></div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">const</span> chapter = <span className="code-keyword">new</span> <span className="code-const">StudentChapter</span>(school);</div>
            <div style={{ paddingLeft: '2rem' }}><span className="code-keyword">return</span> chapter.<span className="code-func">buildCommunity</span>();</div>
            <div style={{ paddingLeft: '1rem' }}>{'}'}</div>
            <br />
            <div style={{ paddingLeft: '1rem' }}><span className="code-comment">// The best people to inspire the next generation</span></div>
            <div style={{ paddingLeft: '1rem' }}><span className="code-comment">// are the students living that experience right now.</span></div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}



// --- NETWORK TAB ---
function NetworkTab() {
  const [selectedNode, setSelectedNode] = useState<typeof NETWORK_NODES[0] | null>(null);

  const handleNodeClick = (node: typeof NETWORK_NODES[0]) => {
    setSelectedNode(node === selectedNode ? null : node);
  };

  const handleNodeInteraction = (node: typeof NETWORK_NODES[0], e?: React.TouchEvent | React.MouseEvent) => {
    // Prevent event propagation and ensure selection works on mobile
    e?.preventDefault();
    e?.stopPropagation();
    setTimeout(() => {
      setSelectedNode(node === selectedNode ? null : node);
    }, 50);
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
                onTouchStart={(e) => handleNodeInteraction(node, e)}
                onClick={(e) => handleNodeInteraction(node, e)}
              >
                <circle
                  r={12}
                  className={`map-marker ${node.status === 'active' ? 'active' : 'pending'}`}
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                />
                <circle
                  r={20}
                  className={`map-marker-pulse ${node.status === 'active' ? 'active' : 'pending'}`}
                  style={{ pointerEvents: 'none' }}
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


