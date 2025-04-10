# RAID - Roadway Analytics & Incident Dashboard
Welcome to RAID - Roadway Analytics & Incident Dashboard, your go-to web app for real-time traffic incident updates in Austin, TX. With dynamic visualizations powered by D3.js and a responsive design built with React.js, RAID provides you with up-to-the-minute data on roadway incidents, helping you stay informed and navigate the city more efficiently. Whether you're a commuter, traveler, or city planner, RAID offers an intuitive interface to track traffic events and enhance your planning and decision-making.


## Authors
- [@Adarsh Kumar](https://github.com/adarsh-k-tiwari/)
- [@Rahul Baid](https://github.com/rahulb99/)


## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [License](#license)


## Features
- **Real-Time Incident Updates**: Stay informed with live data on traffic incidents in Austin, TX. RAID pulls real-time information to ensure you never miss important updates about accidents, construction zones, or road closures.

- **Interactive Visualizations**: Experience clear, interactive maps and charts built with D3.js. Track incidents across the city with visual representations that make it easy to understand traffic patterns and trends.

- **Accurate and Reliable Data**: Powered by a robust public API, RAID ensures you receive up-to-date and accurate traffic incident information directly from trusted sources.

- **City-Wide Coverage**: From downtown Austin to the surrounding neighborhoods, RAID covers incidents across the entire city, providing a comprehensive view of road conditions.

- **Data-Driven Insights**: With access to historical incident data and visual analytics, you can gain a deeper understanding of traffic patterns and help contribute to smarter urban planning.

## Technologies
### Frontend
- **React.js**: For layout and framework
- **D3.js**: For Visualizations

### Backend
- **Express.js**: For handling HTTP requests
- **Middleware**: CORS, JSON

### Database
- **PostgreSQL**: For storing data


## Installation
### Using Docker
1. Clone the repository:
```
git clone https://github.com/rahulb99/dataviz-raid
cd dataviz-raid
```

2. Run:
```
docker build -t raid .
docker run --rm -p 3000:3000 -t raid
```

3. Open http://localhost:3000 in your browser.


### Without Docker
Ensure you have the following installed:
* Node.js
* yarn

### Steps
1. Clone the repository:
```
git clone https://github.com/rahulb99/dataviz-raid
cd dataviz-raid
yarn install
```

2. Install dependencies for both frontend and backend:
#### For Frontend:
```
cd client
yarn install
```

#### For Backend:
```
cd server
yarn install
```

3. Set up environment variables:
- Create `.env` files in both `server` and `client` directories.
- Define `DATABASE_URL` in the `.env` file of `server`.
- Define `REACT_APP_BACKEND_URL` and `REACT_APP_MAPBOX_GL_ACCESS_TOKEN` in the `.env` file of `server` and `client` respectively.

## Usage
#### Development Mode
Run both servers in development mode:
1. Start the **backend** server:
```
cd server
yarn start
```
Open [http://localhost:5432](http://localhost:5432) to view it in your browser.

You need to restart the server if any changes are made in `server.js`.

2. Start the **frontend** server:
```
cd client
yarn start
```

Runs the server in the development mode\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.


---
## Folder Structure

```
.dataviz-raid/
|-- server/  
|  |-- server.js           # Express js app setup and API routes
|  |-- package.json        # Backend dependencies
|  |-- yarn.lock           # Backend dependencies version
|  |-- .env                # Backend environment variables
|-- client/                
|  |-- public/             # React public files
|  |-- src/                # File for D3.js container for Level 1
|  |  |-- components       # React components
|  |  |-- Data             # React components for Sidebar
|  |  |-- imgs             # Images and Logos
|  |  |-- App.css          # CSS for App.jsx
|  |  |-- App.jsx          # Main React app entry point
|  |-- .env                # Frontend environment variables
|  |-- package.json        # Frontend dependencies
|  |-- yarn.lock           # Backend dependencies version
|-- package.json           # Project dependencies
|-- .gitignore             # Contains files/fodlers to ignore
|-- README.md              # Project documentation (this file)
|-- LICENSE                # Project's MIT License
```

---


## Scripts

### Backend Scripts (from `/server`)
- `yarn start`: Starts the server in development mode.

### Frontend Scripts (from `/client`)
- `yarn start`: Runs the React app in development mode.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgments

- [MAP Box](https://www.mapbox.com/)
- [City of Austin Open Data Portal](https://data.austintexas.gov/)
