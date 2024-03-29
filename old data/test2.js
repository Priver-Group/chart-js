document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'climate_service.csv'
    let data = []
  
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
  
    function interpolateDates(dates, jsonDates, jsonNDVI, jsonAfectedArea) {
      const interpolatedData = new Map()
      const jsonDatesMap = new Map(jsonDates.map((date, index) => [date, [jsonNDVI[index], jsonAfectedArea[index]]]))
  
      dates.forEach((date) => {
        let previousDate = null
        let previousValue = null
        let previousJsonValue = null
        let nextDate = null
        let nextValue = null
        let nextJsonValue = null
  
        for (let [jsonDate, values] of jsonDatesMap.entries()) {
          if (date < jsonDate) {
            if (previousDate === null || jsonDate < previousDate) {
              previousDate = jsonDate
              previousValue = values[0]
              previousJsonValue = values[1]
            }
          } else if (nextDate === null || jsonDate > nextDate) {
            nextDate = jsonDate
            nextValue = values[0]
            nextJsonValue = values[1]
          }
        }
  
        if (previousDate !== null && nextDate !== null) {
          const slopeNDVI = (nextValue - previousValue) / (nextDate - previousDate)
          const slopeAfectedArea = (nextJsonValue - previousJsonValue) / (nextDate - previousDate)
          const interpolatedNDVI = previousValue + (date - previousDate) * slopeNDVI
          const interpolatedAfectedArea = previousJsonValue + (date - previousDate) * slopeAfectedArea
  
          interpolatedData.set(date, {
            NDVI: interpolatedNDVI,
            AFECTED_AREA: interpolatedAfectedArea,
          })
        } else {
          interpolatedData.set(date, {
            NDVI: previousValue,
            AFECTED_AREA: previousJsonValue,
          })
        }
      })
  
      return interpolatedData
    }
  
    Papa.parse(csvUrl, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        data = results.data
        data.forEach((item) => {
          const date = new Date(item.datetime)
          date.setDate(date.getDate() + 1)
          item.datetime = `${date.getDate()} ${
            monthNames[
              date.toLocaleString('en-US', {
                month: 'short',
              })
            ]
          }`
        })
  
        fetch('short_average_crop_indices_farm-0000000014_04-A-1-4-121-907.json')
          .then((response) => response.json())
          .then((jsonData) => {
            const jsonDates = jsonData.data.Dates
            const jsonNDVI = jsonData.data.NDVI
            const jsonAfectedArea = jsonData.data.AFECTED_AREA
  
            const interpolatedData = interpolateDates(
              data.map((item) => item.datetime),
              jsonDates,
              jsonNDVI,
              jsonAfectedArea
            )
  
            const labels = Array.from(interpolatedData.keys())
            const datasets = [
              {
                label: 'Nubosidad',
                data: data.map((item) => item.cloudcover),
                borderColor: '#E5E5E5',
                backgroundColor:'#E5E5E5',
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
                label: 'Vigor',
                data: labels.map((date) => interpolatedData.get(date).NDVI),
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
                data: labels.map((date) => interpolatedData.get(date).AFECTED_AREA),
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
                animation: {
                  duration: 0,
                },
                transitions: {
                  show: {
                    animations: {
                      x: {
                        from: 0,
                        duration: 1000,
                        easing: 'easeOutQuart',
                      },
                      y: {
                        from: 0,
                        duration: 1000,
                        easing: 'easeOutQuart',
                      },
                    },
                  },
                  hide: {
                    animations: {
                      x: {
                        to: 0,
                        duration: 1000,
                        easing: 'easeOutQuart',
                      },
                      y: {
                        to: 0,
                        duration: 1000,
                        easing: 'easeOutQuart',
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
                    offset: true,
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
      },
    })
  })