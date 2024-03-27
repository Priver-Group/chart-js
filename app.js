document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'climate_service.csv'
  let data = {}

  Papa.parse(csvUrl, {
    header: true,
    download: true,
    complete: function (results) {
      data = results.data.map((item) => {
        const date = new Date(item.datetime)
        return {
          datetime: `${date.getDate()}-${
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
      crearGrafica()
    },
  })

  const monthNames = {
    Jan: 'JAN',
    Feb: 'FEB',
    Mar: 'MAR',
    Apr: 'APR',
    May: 'MAY',
    Jun: 'JUN',
    Jul: 'JUL',
    Aug: 'AUG',
    Sep: 'SEP',
    Oct: 'OCT',
    Nov: 'NOV',
    Dec: 'DEC',
  }

  function formatearMeses(date) {
    const [day, month] = date.split(' ')
    return `${day}-${monthNames[month.toUpperCase()]}`
  }

  function crearGrafica() {
    // Preparar los datos para Chart.js
    const labels = data.map((item) => item.datetime)
    const datasets = [
      {
        label: 'Nubosidad',
        data: data.map((item) => item.cloudcover),
        borderColor: '#E5E5E5',
        backgroundColor: '#E5E5E5',
        yAxisID: 'y1'
      },
      {
        label: 'Rad. Solar',
        data: data.map((item) => item.solarradiation),
        borderColor: '#800080',
        backgroundColor: '#800080',
        yAxisID: 'y1'
      },
      {
        label: 'Temperatura',
        data: data.map((item) => item.temp),
        borderColor: '#ff6384',
        backgroundColor: '#ff6384',
        yAxisID: 'y2'
      },
      {
        label: 'Vel. de Viento',
        data: data.map((item) => item.windspeed),
        borderColor: '#228B22',
        backgroundColor: '#228B22',
        yAxisID: 'y2'
      },
      {
        label: 'Precipitación',
        data: data.map((item) => item.precip),
        borderColor: '#36a2eb',
        backgroundColor: '#36a2eb',
        yAxisID: 'y2'
      },
    ]

    // Configurar opciones de la gráfica
    const gridColor = '#0070F3'
    const textColor = '#FFFFFF'

    const config = {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            offset: true,
            ticks: { color: textColor},
            grid: {
              color: gridColor,
            },
          },
          y1: {
            type: 'linear',
            min: 0,
            max: 400,
            position: 'left',
            stack: 'y',
            stackWeight: 1.2,
            ticks: {
              stepSize: 100,
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
        },
      },
    }

    // Crear la gráfica
    const ctx = document.getElementById('chart').getContext('2d')
    new Chart(ctx, config)
  }
})
