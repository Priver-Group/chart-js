// me muestra solo el primer valor del Dates del json

function interpolateData(dates, values, targetDate) {
    let prevDate = null
    let nextDate = null
    let prevValue = null
    let nextValue = null
  
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] <= targetDate) {
        prevDate = dates[i]
        prevValue = values[i]
      } else {
        nextDate = dates[i]
        nextValue = values[i]
        break
      }
    }
  
    if (prevValue === null || nextValue === null) {
      return prevValue === null ? nextValue : prevValue
    }
  
    const ratio = (targetDate - prevDate) / (nextDate - prevDate)
    return prevValue + ratio * (nextValue - prevValue)
  }
  
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
            datetime: `${date.getDate()} ${
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
      const labels = data.map((item) => item.datetime)
  
      fetch('short_average_crop_indices_farm-0000000014_04-A-1-4-121-907.json')
        .then((response) => response.json())
        .then((jsonData) => {
          const jsonNDVI = jsonData.data.NDVI
          const jsonAfectedArea = jsonData.data.AFECTED_AREA
          const jsonDates = jsonData.data.Dates
  
          // Format jsonDates to match the data.datetime format in UTC
          const formattedDates = jsonDates.map((date) => {
            const dateObj = new Date(date)
            dateObj.setDate(dateObj.getDate() + 1)
            const formattedMonth = dateObj
              .toLocaleString('en-US', { month: 'short' })
              .slice(0, 3)
            const formattedDay = dateObj.getDate().toString().padStart(1, '0')
            return `${formattedDay} ${formattedMonth}`
          })
  
          // Interpolate the values for each date in the JSON data
          const interpolatedNDVI = formattedDates.map((date) =>
            interpolateData(
              data.map((item) => item.datetime),
              jsonNDVI,
              date
            )
          )
          const interpolatedAfectedArea = formattedDates.map((date) =>
            interpolateData(
              data.map((item) => item.datetime),
              jsonAfectedArea,
              date
            )
          )
  
          // Create a new array for the interpolated values
          const interpolatedValues = interpolatedNDVI.map((value, index) => ({
            x: labels[index],
            y: value,
          }))
  
          const datasets = [
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
              fill: false,
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
              fill: false,
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
              fill: false,
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
              fill: false,
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
              fill: false,
              yAxisID: 'y2',
            },
            {
              label: 'Vigor',
              data: interpolatedValues,
              borderColor: '#FFC107',
              backgroundColor: '#FFC107',
              borderWidth: 3,
              tension: 0.1,
              pointRadius: (context) => {
                return 0
              },
              pointHitRadius: 10,
              spanGaps: true,
              fill: false,
              yAxisID: 'y3',
            },
            {
              label: 'Area Afectada',
              data: interpolatedAfectedArea.map((value, index) => ({
                x: labels[index],
                y: value,
              })),
              borderColor: '#2D1515',
              backgroundColor: '#2D1515',
              borderWidth: 3,
              tension: 0.1,
              pointRadius: (context) => {
                return 0
              },
              pointHitRadius: 10,
              spanGaps: true,
              fill: false,
              yAxisID: 'y1',
            },
          ]
  
          const gridColor = '#0070F3'
          const gridColor2 = '#4c8aba'
          const textColor = '#FFFFFF'
  
          const config = {
            type: 'line',
            data: {
              labels,
              datasets,
            },
            options: {
              animation: true,
              transitions: {
                show: {
                  animations: {
                    x: {
                      from: 0,
                    },
                    y: {
                      from: 0,
                    },
                  },
                },
                hide: {
                  animations: {
                    x: {
                      to: 0,
                    },
                    y: {
                      to: 0,
                    },
                  },
                },
              },
              events: ['mouseout', 'click', 'touchstart', 'touchmove'],
              interaction: {
                mode: 'index',
                intersect: false,
              },
              responsive: true,
              scales: {
                y3: {
                  type: 'linear',
                  min: 0,
                  max: 1,
                  position: 'left',
                  stack: 'y',
                  offset: true,
                  stackWeight: 0.5,
                  ticks: {
                    stepSize: 0.5,
                    color: textColor,
                    beginAtZero: true,
                  },
                  grid: {
                    color: gridColor,
                  },
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
                  grid: {
                    color: gridColor2,
                  },
                },
                y1: {
                  type: 'linear',
                  min: 0,
                  max: 400,
                  position: 'left',
                  stack: 'y',
                  stackWeight: 0.7,
                  ticks: {
                    stepSize: 100,
                    color: textColor,
                    beginAtZero: true,
                  },
                  grid: {
                    color: gridColor,
                  },
                },
                x: {
                  stacked: true,
                  offset: true,
                  ticks: {
                    color: textColor,
                    beginAtZero: true,
                  },
                  grid: {
                    display: true,
                    color: gridColor,
                    offset: false,
                    drawOnChartArea: true,
                    drawTicks: true,
                  },
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
  