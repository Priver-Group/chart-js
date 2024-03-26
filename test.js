{/*const { readFileSync } = require('fs')
const { parse } = require('csv-parse/sync')

const fileContent = readFileSync('./climate_service.csv', 'utf-8')
const csvContent = parse(fileContent, {
    columns: true,
    cast: (value, context) => {
        if (context.column === 'datetime') return new Date(value)
        if (context.column === 'tempmax') return Number(value)
        if (context.column === 'tempmin') return Number(value)
        if (context.column === 'temp') return Number(value)
        if (context.column === 'precip') return Number(value)
        if (context.column === 'windspeed') return Number(value)
        if (context.column === 'windgust') return Number(value)
        if (context.column === 'cloudcover') return Number(value)
        if (context.column === 'solarradiation') return Number(value)
        return value
    }
})
console.log(csvContent)

// Extrae los datos de temperatura
const tempData = csvContent.map((row) => ({
    date: row.datetime,
    temp: row.temp
}))

// Crea una gráfica usando los datos de temperatura
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: tempData.map((row) => row.date),
        datasets: [{
            label: 'Temperature',
            data: tempData.map((row) => row.temp),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            },
            y: {
                beginAtZero: true
            }
        }
    }
}); */}

{/*<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Data</title>
</head>
<body>
  <canvas id="weatherChart" width="800" height="400"></canvas>
  
  <script>
    // Function to load and parse CSV data
    async function loadCSV(url) {
      const rawData = await fetch(url);
      const text = await rawData.text();
      const data = d3.csvParse(text);
      return data;
    }

    // Wait for the CSV data to load and then create the chart
    loadCSV('data.csv').then((data) => {
      // Create arrays for labels and datasets
      const labels = data.map(d => d.datetime);
      const datasets = [
        // ... Create the datasets array as shown in the previous example ...
      ];

      // Create the chart
      const ctx = document.getElementById('weatherChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          scales: {
            x: {
              display: true,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 20,
              },
            },
            y: {
              display: true,
              ticks: {
                suggestedMin: 0,
                suggestedMax: 300,
              },
            },
          },
        },
      });
    });
  </script>
</body>
</html>*/}