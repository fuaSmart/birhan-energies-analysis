import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './App.css';

//  Custom Tooltip for a better user experience
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Date: ${label}`}</p>
        <p className="price">{`Price: $${payload[0].value.toFixed(2)}`}</p>
        <p className="type">{`Type: ${payload[0].payload.type}`}</p>
      </div>
    );
  }
  return null;
};

//  Function to format the date on the X-axis for readability
const formatDateTick = (tickItem) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/data');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch data from the server. Is the backend running?');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <div className="App-header"><h1>Error: {error}</h1></div>;
  }

  if (!data) {
    return <div className="App-header"><h1>Loading Analysis Data...</h1></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Birhan Energies: Brent Oil Price Analysis</h1>
        <p> Change Point Dashboard</p>
      </header>
      
      <div className="dashboard-content">
        
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={500}>

            <LineChart
              data={data.price_data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatDateTick} />
              <YAxis domain={['auto', 'auto']} label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} name="Brent Price (Historical)" is-animation-active={false} />
              <Line type="monotone" dataKey={entry => entry.type === 'Simulated' ? entry.price : null} stroke="#82ca9d" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Simulated Price" />
              {data.change_points.map((cp, index) => (
                <ReferenceLine key={index} x={cp.date} stroke="red" strokeDasharray="3 3" label={{/* value: cp.event_name, position: 'insideTop', fill: 'red', fontSize: 14 */}} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* We'll also rename this for clarity */}
        <div className="report-wrapper">
          <h2>Key Event Analysis</h2>
          {data.change_points.map((cp, index) => (
            <div className="event-card" key={index}>
              <h3>{cp.event_name} (~{new Date(cp.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</h3>
              <p>{cp.event_description}</p>
            </div>
          ))}
        </div>

      </div> {/* End of new dashboard-content container */}

    </div>
  );
}

export default App;