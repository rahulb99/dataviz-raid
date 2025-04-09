import {csvFormat} from "d3-dsv";
import {run} from "./postgres.ts";

process.stdout.write(
  csvFormat(
    await run(
      (sql) =>
        sql`SELECT EXTRACT(YEAR FROM crash_timestamp_ct) AS year,
              TO_CHAR(crash_timestamp_ct, 'Day') AS day_of_week,
              ROUND(EXTRACT(HOUR FROM crash_timestamp_ct)) AS time_of_day,
              COUNT(DISTINCT id) AS count
            FROM crash_reports
            WHERE EXTRACT(YEAR FROM crash_timestamp_ct) >= 2025
            GROUP BY 1,2,3
            ORDER BY 1 DESC,2,3;
      `
    )
  )
);