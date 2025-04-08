const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5432;

// Middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DATABASE_URL);
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
    const oneDayAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const query = `
      SELECT * FROM traffic_accidents 
      WHERE CAST(published_date AS DATE) >= $1
    `;
    
    const result = await pool.query(query, [oneDayAgo]);
    res.json(result.rows);
    // console.log('Accident data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get latest incident data
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
    console.log('Accident data fetched successfully:', result.rows);
  } catch (error) {
    console.error('Error fetching accident data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// API endpoint to get card data
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
        title: "Total Crashes",
        value: crashesRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        series: [
          {
            name: "Crashes",
            data: formatMonthlyData(crashesRes.rows)
          }
        ]
      },
      {
        title: "Serious Injuries",
        value: injuriesRes.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        series: [
          {
            name: "Injuries",
            data: formatMonthlyData(injuriesRes.rows)
          }
        ]
      },
      {
        title: "Compensation Cost",
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