const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5432;

// Middleware
app.use(cors());
app.use(express.json());


// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// API endpoint to get accident data
app.get('/api/traffic_accidents', async (req, res) => {
  try {
    // Get data from the last 24 hours
    // const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const query = `
      SELECT count(distinct traffic_report_id), CAST(published_date AS DATE) FROM traffic_accidents 
      WHERE CAST(published_date AS DATE) >= '2018-01-01' GROUP BY CAST(published_date AS DATE)
      ORDER BY CAST(published_date AS DATE) DESC;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    // console.log('Accident data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get latest 7 incident data
app.get('/api/updates', async (req, res) => {
  try {
    const query = `
      SELECT * FROM traffic_accidents 
      ORDER BY published_date DESC LIMIT 7;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    // console.log('Accident data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get crash data for different travel modes
app.get('/api/travel_mode', async (req, res) => {
  try {
    const query = `
      SELECT 
          EXTRACT(YEAR FROM Crash_timestamp_ct) AS crash_year, 
          SUM(motor_vehicle_death_count) AS motor_vehicle_death,
          SUM(motor_vehicle_serious_injury_count) AS motor_vehicle_serious_injury,
          SUM(bicycle_death_count) AS bicycle_death,
          SUM(bicycle_serious_injury_count) AS bicycle_serious_injury,
          SUM(pedestrian_death_count) AS pedestrian_death,
          SUM(pedestrian_serious_injury_count) AS pedestrian_serious_injury,
          SUM(motorcycle_death_count) AS motorcycle_death,
          SUM(motorcycle_serious_injury_count) AS motorcycle_serious_injury,
          SUM(other_death_count) AS other_death,
          SUM(other_serious_injury_count) AS other_serious_injury,
          SUM(micromobility_serious_injury_count) AS micromobility_serious_injury,
          SUM(micromobility_death_count) AS micromobility_death
      FROM crash_reports
      GROUP BY EXTRACT(YEAR FROM Crash_timestamp_ct)
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    // console.log('Crash data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get top 5 areas with highest incidents
app.get('/api/top_5', async (req, res) => {
  try {
    const query = `
      SELECT address, count(*) as count_address 
      FROM traffic_accidents 
      GROUP BY address 
      ORDER BY 2 DESC
      LIMIT 7
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    // console.log('Accident data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// API endpoint to get card data for Main Dashboard
app.get('/api/cards-data', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const queries = {
      fatalities: `
        SELECT EXTRACT(MONTH FROM Crash_timestamp_ct) AS month, SUM(Death_cnt) AS count
        FROM crash_reports
        WHERE crash_fatal_fl = TRUE AND EXTRACT(YEAR FROM Crash_timestamp_ct) = $1
        GROUP BY month ORDER BY month
      `,
      crashes: `
        SELECT EXTRACT(MONTH FROM Crash_timestamp_ct) AS month, COUNT(*) AS count
        FROM crash_reports
        WHERE EXTRACT(YEAR FROM Crash_timestamp_ct) = $1
        GROUP BY month ORDER BY month
      `,
      injuries: `
        SELECT EXTRACT(MONTH FROM Crash_timestamp_ct) AS month, SUM(sus_serious_injury_cnt) AS count
        FROM crash_reports
        WHERE EXTRACT(YEAR FROM Crash_timestamp_ct) = $1
        GROUP BY month ORDER BY month
      `,
      compensation: `
        SELECT EXTRACT(MONTH FROM Crash_timestamp_ct) AS month, 1.0*SUM(est_total_person_comp_cost)/1000000 AS cost
        FROM crash_reports
        WHERE EXTRACT(YEAR FROM Crash_timestamp_ct) = $1
        GROUP BY month ORDER BY month
      `
    };

    // Execute queries
    const [fatalitiesRes, crashesRes, injuriesRes, costRes] = await Promise.all([
      pool.query(queries.fatalities, [currentYear]),
      pool.query(queries.crashes, [currentYear]),
      pool.query(queries.injuries, [currentYear]),
      pool.query(queries.compensation, [currentYear])
    ]);

    // Helper: convert rows to full month array (Jan–Dec)
    const formatMonthlyData = (rows, key = 'count') => {
      const data = new Array(12).fill(0);
      rows.forEach(row => {
        const monthIndex = parseInt(row.month, 10) - 1;
        data[monthIndex] = parseFloat(row[key]);
      });
      return data;
    };

    // JSON formatting for cards' data
    const formatted = [
      {
        title: "Fatalities",
        value: fatalitiesRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        series: [
          {
            name: "Fatalities",
            data: formatMonthlyData(fatalitiesRes.rows)
          }
        ]
      },
      {
        title: "Crashes",
        value: crashesRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        series: [
          {
            name: "Crashes",
            data: formatMonthlyData(crashesRes.rows)
          }
        ]
      },
      {
        title: "Injuries",
        value: injuriesRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        series: [
          {
            name: "Injuries",
            data: formatMonthlyData(injuriesRes.rows)
          }
        ]
      },
      {
        title: "Compensation",
        value: parseFloat(costRes.rows.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0)).toFixed(2),
        series: [
          {
            name: "Est Total Person Compensation Cost (in millions)",
            data: formatMonthlyData(costRes.rows, 'cost')
          }
        ]
      }
    ];

    res.json(formatted);
    // console.log("Card data fetched successfully:", JSON.stringify(formatted, null, 2));
  } catch (error) {
    console.error('Error fetching card data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
