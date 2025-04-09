import * as Plot from "npm:@observablehq/plot";

export function TimeOfDayHeatmap( data ) { 

  // Process data for the heatmap
  const processedData = data.map(row => ({
    day: row.day_of_week,
    hour: row.time_of_day,
    year: row.year,
    count: row.count
  }));
  
  console.log("Processed Data:", processedData[0]);
  // Determine color scale range based on data
  const counts = processedData.map(d => d.count);
  const maxCount = Math.max(...counts, 1); // Avoid division by zero
  
  // Days of week mapping for better sorting
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Create the heatmap
  return Plot.plot({
    width: 900,
    height: 500,
    marginLeft: 100,
    color: {
      type: "linear",
      scheme: "YlOrRd",
      legend: true,
      domain: [0, maxCount]
    },
    // x: {
    //   label: "Hour of Day",
    //   tickFormat: d => `${d}:00`,
    //   domain: [...Array(24).keys()] // 0-23 hours
    // },
    x: { axis: null },
    y: {tickFormat: d => d, domain: dayOrder},
    fy: { tickFormat: "" },
    // y: {
    //   label: "Day of Week",
    //   domain: dayOrder
    // },
    marks: [
      Plot.cell(processedData, {
        x: d => d.hour,
        y: d => d.day,
        fy: d => d.year,
        fill: d => d.count,
        inset: 0.5,
        title: d => `${d.day}, ${d.hour}:00: ${d.count} events`
      })
    ]
  });
}


