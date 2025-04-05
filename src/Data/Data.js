// Sidebar imports
import {
  UilEstate,
  UilClipboardAlt,  
  UilSetting,
  UilApps,
  UilFocusTarget,
} from "@iconscout/react-unicons";

// Analytics Cards imports
import { UilHeartbeat , UilHospital, UilCar, UilExclamationTriangle } from "@iconscout/react-unicons";

// Recent Card Imports
import img1 from "../imgs/img1.png";
import img2 from "../imgs/img2.png";
import img3 from "../imgs/img3.png";
import { path } from "d3";

// Sidebar Data
export const SidebarData = [
  {
    icon: UilEstate,
    heading: "Home",
    path : "/home",
  },
  {
    icon: UilApps,
    heading: "Dashboard",
    path : "/dashboard",
  },
  {
    icon: UilFocusTarget,
    heading: "Hotspots",
    path : "/hotspots",
  },
  {
    icon: UilSetting,
    heading: 'Settings'
  },
];

// Analytics Cards Data
export const cardsData = [
  {
    title: "Fatalities",
    color: {
      backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
      boxShadow: "0px 10px 20px 0px #e0c6f5",
    },
    barValue: 70,
    value: "25,970",
    png: UilHeartbeat,
    series: [
      {
        name: "Fatalities",
        data: [5, 15, 9, 20, 14, 18, 22],
      },
    ],
  },
  {
    title: "Total Crashes",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    barValue: 80,
    value: "14,270",
    png: UilCar,
    series: [
      {
        name: "Crashes",
        data: [20, 30, 50, 70, 90, 120, 150],
      },
    ],
  },
  {
    title: "Serious Injuries",
    color: {
      backGround:
        "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
      boxShadow: "0px 10px 20px 0px #F9D59B",
    },
    barValue: 60,
    value: "4,270",
    png: UilHospital,
    series: [
      {
        name: "Injuries",
        data: [12, 18, 25, 30, 35, 40, 45],
      },
    ],
  },
  {
    title: "High-Risk Areas",
    color: {
      backGround: "linear-gradient(180deg, #FFAA33 0%, #FF6600 100%)",
      boxShadow: "0px 10px 20px 0px #FFCC99",
    },
    barValue: 90,
    value: "128",
    png: UilExclamationTriangle,
    series: [
      {
        name: "Risk Areas",
        data: [3, 5, 7, 9, 11, 15, 18],
      },
    ],
  },
];

// Recent Incident Updates Data
export const UpdatesData = [
  {
    img: img1,
    name: "Austin Police Department",
    noti: "Reported a major crash at I-35 & 6th St.",
    time: "10 minutes ago",
  },
  {
    img: img2,
    name: "Traffic Control Center",
    noti: "Multiple lane closures due to an accident on Mopac Expy.",
    time: "30 minutes ago",
  },
  {
    img: img3,
    name: "EMS Alert",
    noti: "Serious injury crash at Lamar Blvd & 24th St. Emergency responders on site.",
    time: "1 hour ago",
  },
];