"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from './ui/card';

export function CityNetworkGraph({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !containerRef.current || !svgRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 1.5);

    const node = svg.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => d.group === 1 ? '#e11d48' : '#3b82f6')
      // @ts-ignore
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    const text = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d: any) => d.id)
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("dx", 12)
      .attr("dy", 4)
      .style("font-family", "var(--font-jetbrains-mono)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => Math.max(8, Math.min(width - 8, d.source.x)))
        .attr("y1", (d: any) => Math.max(8, Math.min(height - 8, d.source.y)))
        .attr("x2", (d: any) => Math.max(8, Math.min(width - 8, d.target.x)))
        .attr("y2", (d: any) => Math.max(8, Math.min(height - 8, d.target.y)));

      node
        .attr("cx", (d: any) => d.x = Math.max(8, Math.min(width - 8, d.x)))
        .attr("cy", (d: any) => d.y = Math.max(8, Math.min(height - 8, d.y)));

      text
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [data]);

  return (
    <Card className="flex flex-col h-80">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>City Network</h2>
      <div ref={containerRef} className="flex-1 w-full min-h-0 relative">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <p className="text-xs text-blue-600 mt-2 font-medium" style={{ fontFamily: 'var(--font-inter)' }}>Insight: Shows which city pairs are most exploited.</p>
    </Card>
  );
}
