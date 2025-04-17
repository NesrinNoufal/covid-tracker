import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.css";
import Plot from "react-plotly.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Dropdown from "../../styles/dropdown/dropdown";
import covidData from "../../covid-data.json";
import L from "leaflet";
import locationMarker from "../../styles/images/location-marker.svg";

interface StateData {
  state: string;
  reported: number;
  active: number;
  recovered: number;
  deaths: number;
  locations?: Location[];
}
interface CovidData {
  states: StateData[];
}
interface Location {
  place: string;
  latitude: number;
  longitude: number;
}
const redIcon = new L.Icon({
  iconUrl: locationMarker,
  iconSize: [32, 32], 
  iconAnchor: [16, 32], 
  popupAnchor: [0, -32], 
});

export default function Dashboard() {
  const [state, setState] = useState<string>("Kerala");
  const [stateData, setStateData] = useState<StateData | undefined>();
  const [stateNames, setStateNames] = useState<string[]>([]);
  const [greeting, setGreeting] = useState("");

  const allStates: StateData[] = covidData.India.states;

  const totals = allStates.reduce(
    (acc, state) => {
      acc.reported += state.reported;
      acc.active += state.active;
      acc.recovered += state.recovered;
      acc.deaths += state.deaths;
      return acc;
    },
    { reported: 0, active: 0, recovered: 0, deaths: 0 }
  );

  const totalReported = totals.reported;
  const totalActive = totals.active;
  const totalRecovered = totals.recovered;
  const totalDeaths = totals.deaths;

  const handleSelect = (value: string) => {
    setState(value);
  };
  useEffect(() => {
    const data: StateData = covidData.India.states.find(
      (item) => item.state === state
    )!;
    setStateData(data);
  }, [state]);

  useEffect(() => {
    const filteredStateNames = covidData.India.states
      .map((item) => item.state)
      .sort();
    setStateNames(filteredStateNames);
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);
  return (
    <div className="dashboard">
      <p id="title">Dashboard</p>
      <hr></hr>
      <div className="content">
        <span>
          <h2 id="hi">Hi </h2>
          <h2>{greeting} 👋</h2>
        </span>
        <div className="highlights">
          <p>{totalReported} Total Cases</p>
          <div className="vertical-line" />
          <p>{totalActive} Active Cases</p>
          <div className="vertical-line" />
          <p>{totalRecovered} Recovered Cases</p>
          <div className="vertical-line" />
          <p>{totalDeaths} Death Cases</p>
        </div>
        <div className="statistics">
          <Dropdown
            label="Select State"
            options={stateNames}
            onSelect={(value) => handleSelect(value)}
          />
          <div className="first-row">
            <div className="pie-chart">
              <h3>Covid cases by states</h3>
              <p>These are the insights of covid cases by states in India</p>
              <Plot
                data={[
                  {
                    values: [
                      stateData?.reported,
                      stateData?.active,
                      stateData?.recovered,
                      stateData?.deaths,
                    ],
                    labels: ["Reported", "Active", "Recovered", "Deaths"],
                    marker: {
                      colors: ["orange", "red", "green", "black"], // Customize your slice colors here
                    },
                    type: "pie",
                  },
                ]}
                layout={{
                  title: "COVID-19 Cases Distribution",
                  height: 300,
                  width: 500,
                  margin: {
                    l: 50,
                    r: 50,
                    t: 50,
                    b: 50,
                  },
                }}
              />
            </div>
            <div className="line-chart">
              <h3>Covid cases by states</h3>
              <p>These are the insights of covid cases by states in India</p>
              <Plot
                data={[
                  {
                    x: ["Reported"],
                    y: [stateData?.reported],
                    type: "bar",
                    name: "Reported",
                    marker: { color: "orange" },
                    width: 0.3,
                  },
                  {
                    x: ["Active"],
                    y: [stateData?.active],
                    type: "bar",
                    name: "Active",
                    marker: { color: "red" },
                    width: 0.3,
                  },
                  {
                    x: ["Recovered"],
                    y: [stateData?.recovered],
                    type: "bar",
                    name: "Recovered",
                    marker: { color: "green" },
                    width: 0.3,
                  },
                  {
                    x: ["Deaths"],
                    y: [stateData?.deaths],
                    type: "bar",
                    name: "Deaths",
                    marker: { color: "black" },
                    width: 0.3,
                  },
                ]}
                layout={{
                  barmode: "group",
                  bargap: 0.1,
                  height: 300,
                  width: 600,
                  title: "Current Stats for Selected State",
                }}
              />
            </div>
          </div>
          <div className="map">
            <h3>Covid case locations</h3>
            <p>These are the locations of covid cases in {state}</p>
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{
                height: "400px",
                width: "100%",
                margin: "1rem auto 1rem auto",
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {stateData?.locations?.map((loc, index) => (
                <Marker
                  key={index}
                  position={[loc.latitude, loc.longitude]}
                  icon={redIcon}
                >
                  <Popup>{loc.place}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
