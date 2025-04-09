import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './TravelMode.css';

const TravelMode = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [view, setView] = useState('death');

  // Fetch data from backend API
  useEffect(() => {
    fetch('/api/travel_mode')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching travel mode data:', err));
  }, []);

  // Use D3.js to plot the bar chart
  useEffect(() => {
    if (!data.length) return;

    d3.select(svgRef.current).selectAll('*').remove();

    // Grouping columns to Death and Serious Injury
    const metricGroups = {
      death: [
        'motor_vehicle_death',
        'bicycle_death',
        'pedestrian_death',
        'motorcycle_death',
        'micromobility_death',
        'other_death',
      ],
      injury: [
        'motor_vehicle_serious_injury',
        'bicycle_serious_injury',
        'pedestrian_serious_injury',
        'motorcycle_serious_injury',
        'micromobility_serious_injury',
        'other_serious_injury',
      ],
    };

    const keys = metricGroups[view];
    const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(["#FCCA74", "#CBAACB", "#EC8995", "#FFD1BA", "#A03D5D", "#B4E1D7"]);
    const stackedData = d3.stack().keys(keys)(data);

    const containerWidth = svgRef.current.clientWidth;
    const margin = { top: 30, right: 50, bottom: 20, left: 30},
          width = containerWidth - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
                .domain(data.map(d => d.crash_year))
                .range([margin.left, width])
                .padding(0.2);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => keys.reduce((sum, key) => sum + +d[key], 0))])
                .nice()
                .range([height - margin.bottom, margin.top]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 2 === 0)))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
    
    // Add horizontal grid lines
    svg.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y)
            .tickSize(- width)
            .tickFormat(''))
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .select('.domain')
      .remove();

    // Add X axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .text(view === 'death' ? 'Number of Deaths' : 'Number of Serious Injuries')
      .attr('y', height + margin.bottom)
      .text('Year of Incidents')
      .style('font-size', '14px');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(view === 'death' ? 'Number of Deaths' : 'Number of Serious Injuries')
      .style('font-size', '14px');


    // Tooltip setup
    const tooltip = d3.select('#travel-mode-tooltip');

    // Bars
    svg.selectAll('.layer')
      .data(stackedData)
      .join('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
          .attr('x', d => x(d.data.crash_year))
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          .attr('class', 'bar')
          .on('mouseover', (event, d) => {
            tooltip
              .style('opacity', 1)
              .html(`Year: ${d.data.crash_year}<br>${keys.map(key => 
                `${key.replace('_death', '').replace('_serious_injury', '').replace('_', ' ')}: ${d.data[key]}`).join('<br>')}`)
              .style('left', `${event.pageX}px`)
              .style('top', `${event.pageY}px`);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", `${event.pageX-400}px`)
              .style("top", `${event.pageY - 100}px`);
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0);
          });
    
    
    // Legend
    const itemsPerRow = 3;
    const legend = svg.selectAll('.legend')
      .data(keys)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * 110}, ${row * 20 - 20})`;
      });

    legend.append('rect')
      .attr('x', 110)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', d => color(d));

    legend.append('text')
      .attr('x', 130)
      .attr('y', 12)
      .text(d => d.replace(view === 'death' ? '_death' : '_serious_injury', '').replace('_', ' '))
      .style('font-size', '12px')
      .attr("class", "legend");
  }, [data, view]);

  return (
    <div className="container">
      {/* Toggle button for showing death and serious injuries */}
      <h2 className="text-xl font-semibold mb-4">{view === 'death' ? 'Deaths' : 'Serious Injuries'} by Travel Mode</h2>
      <div className="travel-mode-tooltip" id="travel-mode-tooltip"></div>
      <div className="mb-4 flex gap-4 justify-center">
        <button
          className={`toggle-button ${view === 'death' ? 'active' : 'inactive'}`}
          onClick={() => setView('death')}
        >
          Deaths
        </button>
        <button
          className={`toggle-button ${view === 'injury' ? 'active' : 'inactive'}`}
          onClick={() => setView('injury')}
        >
          Serious Injuries
        </button>
      </div>

      <svg ref={svgRef} className="chart"></svg>
    </div>
  );
};

export default TravelMode;
