import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import geoUrl from "../../us-states.json";
import type { Chapter } from "@/lib/schema";
import { useChapters } from "@/hooks/useChapters";
import { SectionHeader } from "@/components/SectionHeader";

/**
 * The interactive US network map. Code-split (lazy-loaded) because
 * react-simple-maps + d3-geo + the states topojson are heavy; keeping them out
 * of the initial bundle is the biggest single Lighthouse win. Reads from the
 * typed react-query layer, so the optimistic "apply" node appears here too.
 */
export default function NetworkSection() {
  const { chapters } = useChapters();
  // Track selection by id (not object reference) so it survives an array refetch
  // in live mode — the rendered node is resolved by id each render.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPersistent, setIsPersistent] = useState(false);
  const selectedNode = selectedId ? chapters.find((c) => c.id === selectedId) ?? null : null;

  const closeDialog = () => {
    setSelectedId(null);
    setIsPersistent(false);
  };

  const handleNodeClick = (
    node: Chapter,
    e?: React.TouchEvent | React.MouseEvent | React.KeyboardEvent,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (selectedId === node.id && isPersistent) {
      closeDialog();
    } else {
      setSelectedId(node.id);
      setIsPersistent(true);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).classList.contains("map-geo")) {
      closeDialog();
    }
  };

  const handleNodeHover = (node: Chapter) => {
    if (!isPersistent) setSelectedId(node.id);
  };

  const handleNodeLeave = () => {
    if (!isPersistent) setSelectedId(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <SectionHeader eyebrow="01 // network architecture" title="A live map of every chapter node." />

      <div className="map-wrapper-large">
        <div className="map-container-enhanced">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1300 }}
            width={1200}
            height={700}
            style={{ width: "100%", height: "auto" }}
            className="interactive-map"
            onClick={handleMapClick}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} className="map-geo" />
                ))
              }
            </Geographies>
            {/* Network backbone: animated arcs from the founding node to each active chapter. */}
            {(() => {
              const active = chapters.filter((c) => c.status === "active");
              const hub = active[0];
              if (!hub) return null;
              return active.slice(1).map((node) => (
                <Line
                  key={`arc-${node.id}`}
                  from={hub.coordinates as [number, number]}
                  to={node.coordinates as [number, number]}
                  className="map-arc"
                  strokeLinecap="round"
                />
              ));
            })()}
            {chapters.map((node) => (
              <Marker
                key={node.id}
                coordinates={node.coordinates as [number, number]}
                onMouseEnter={() => handleNodeHover(node)}
                onMouseLeave={handleNodeLeave}
                onTouchStart={(e) => handleNodeClick(node, e)}
                onClick={(e) => handleNodeClick(node, e)}
              >
                <circle
                  r={12}
                  className={`map-marker ${node.status === "active" ? "active" : "pending"}`}
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.name}, ${node.loc} — status ${node.status}`}
                  onFocus={() => handleNodeHover(node)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleNodeClick(node, e);
                    if (e.key === "Escape") closeDialog();
                  }}
                />
                <circle
                  r={20}
                  className={`map-marker-pulse ${node.status === "active" ? "active" : "pending"}`}
                  style={{ pointerEvents: "none" }}
                />
              </Marker>
            ))}
          </ComposableMap>

          {/* Screen-reader-accessible equivalent of the SVG map. */}
          <ul className="sr-only">
            {chapters.map((node) => (
              <li key={node.id}>
                {node.name}, {node.loc} — {node.status}. {node.info}
              </li>
            ))}
          </ul>

          {/* Dialog Box / Tooltip */}
          {selectedNode && (
            <div className="node-dialog" role="dialog" aria-label={`${selectedNode.name} details`}>
              <div className="dialog-header">
                <span className="dialog-id">[{selectedNode.id}]</span>
                <button className="dialog-close" onClick={closeDialog} aria-label="Close details">×</button>
              </div>
              <div className="dialog-body">
                <h3 className="dialog-title">{selectedNode.name}</h3>
                <p className="dialog-loc mono">{selectedNode.loc}</p>

                <div className="dialog-status-tag mono">
                  STATUS: <span className={selectedNode.status}>{selectedNode.status.toUpperCase()}</span>
                </div>

                {selectedNode.status === "active" && (
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
