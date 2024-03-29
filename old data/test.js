document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'climate_service.csv'
  let data = {}

  const monthNames = {
    Jan: 'jan',
    Feb: 'feb',
    Mar: 'mar',
    Apr: 'apr',
    May: 'may',
    Jun: 'jun',
    Jul: 'jul',
    Aug: 'aug',
    Sep: 'sep',
    Oct: 'oct',
    Nov: 'nov',
    Dec: 'dec',
  }

  Papa.parse(csvUrl, {
    header: true,
    download: true,
    complete: function (results) {
      data = results.data.map((item) => {
        const date = new Date(item.datetime)
        date.setDate(date.getDate() + 1)
        return {
          datetime:`${date.getDate()} ${
            monthNames[
              date.toLocaleString('en-US', {
                month: 'short',
              })
            ]
          }`,
          tempmax: item.tempmax,
          tempmin: item.tempmin,
          temp: item.temp,
          precip: item.precip,
          windspeed: item.windspeed,
          windgust: item.windgust,
          cloudcover: item.cloudcover,
          solarradiation: item.solarradiation,
        }
      })
      graphic()
    },
  })

  function graphic() {
    fetch('short_json_average_ndvi.json')
    .then((response) => response.json())
    .then((jsonData) => {
      const jsonNDVI = jsonData.data.NDVI;
      const jsonDates = jsonData.data.Dates;

      // Format jsonDates to match the data.datetime format in UTC
      const formattedDates = jsonDates.map((date) => {
        const dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + 1);
        const formattedMonth = dateObj
          .toLocaleString('en-US', { month: 'short' })
          .slice(0, 3);
        const formattedDay = dateObj.getDate().toString().padStart(2, '0');
        return `${formattedDay} ${formattedMonth}`;
      });

      // Combine CSV and JSON dates
      const combinedDates = [
        ...data.map((item) => item.datetime),
        ...formattedDates,
      ].filter((value, index, self) => self.indexOf(value) === index);

      const uniqueDates = [...new Set(combinedDates)];

    const labels = uniqueDates
    const datasets = [
      {
        label: 'Vigor',
        data: jsonNDVI.map((value, index) => ({
          x: formattedDates[index],
          y: value,
        })),
        borderColor: '#FFC107',
        backgroundColor: '#FFC107',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y3',
      },
      {
        label: 'Nubosidad',
        data: data.map((item) => item.cloudcover),
        borderColor: '#E5E5E5',
        backgroundColor: '#E5E5E5',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y1',
      },
      {
        label: 'Rad. Solar',
        data: data.map((item) => item.solarradiation),
        borderColor: '#800080',
        backgroundColor: '#800080',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y1',
      },
      {
        label: 'Temperatura',
        data: data.map((item) => item.temp),
        borderColor: '#ff6384',
        backgroundColor: '#ff6384',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y2',
      },
      {
        label: 'Vel. de Viento',
        data: data.map((item) => item.windspeed),
        borderColor: '#228B22',
        backgroundColor: '#228B22',
        borderWidth: 3,
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y2',
      },
      {
        label: 'Precipitación',
        type: 'bar',
        categoryPercentage: 0.6,
        barPercentage: 0.6,
        data: data.map((item) => item.precip),
        borderColor: '#36a2eb',
        backgroundColor: '#36a2eb',
        tension: 0.1,
        pointRadius: (context) => {
          return 0
        },
        pointHitRadius: 10,
        spanGaps: true,
        yAxisID: 'y2',
      },
    ]

    const gridColor = '#0070F3'
    const textColor = '#FFFFFF'

    const config = {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        animation: true,
        events: ['mouseout', 'click', 'touchstart', 'touchmove'],
        interaction: {
          mode: 'index',
          intersect: false,
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            offset: true,
            ticks: { color: textColor, beginAtZero: true },
            grid: {
              display: true,
              color: gridColor,
              offset: false,
              drawOnChartArea: true,
              drawTicks: true,
            },
          },
          y3: {
            type: 'linear',
            min: 0,
            max: 1,
            position: 'left',
            stack: 'y',
            stackWeight: 0.5,
            ticks: {
              stepSize: 0.5,
              color: textColor,
              beginAtZero: true,
            },
            grid: { color: gridColor },
          },
          y2: {
            type: 'linear',
            min: 0,
            max: 30,
            position: 'left',
            stack: 'y',
            offset: true,
            stackWeight: 1.2,
            ticks: {
              stepSize: 5,
              color: textColor,
              beginAtZero: true,
            },
            grid: { color: gridColor },
          },
          y1: {
            type: 'linear',
            min: 0,
            max: 400,
            position: 'left',
            stack: 'y',
            stackWeight: 0.75,
            ticks: {
              stepSize: 100,
              color: textColor,
              beginAtZero: true,
            },
            grid: { color: gridColor },
          },
        },
        plugins: {
          tooltip: {
            enabled: true,
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              color: textColor,
              boxHeight: 14,
              font: {
                size: 14,
              },
            },
          },
        },
      },
    }
    const ctx = document.getElementById('chart').getContext('2d')
    new Chart(ctx, config)
  })
}
})
