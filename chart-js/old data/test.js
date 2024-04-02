// no usa la function interpolateData y me muestra valores erroneos

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

  function graphic() {
    fetch('short_average_crop_indices_farm-0000000014_04-A-1-4-121-907.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const jsonNDVI = jsonData.data.NDVI
        const jsonAfectedArea = jsonData.data.AFECTED_AREA
        const jsonDates = jsonData.data.Dates
        const jsonNdviLabels = jsonData.acronyms.NDVI.split(',')

        // Sort JSON dates
        jsonDates.sort((a, b) => {
          const dateA = new Date(a)
          const dateB = new Date(b)

          if (dateA < dateB) return -1
          if (dateA > dateB) return 1
          return 0
        })

        const formattedDates = jsonDates.map((date) => {
          const dateObj = new Date(date)
          dateObj.setDate(dateObj.getDate() + 1)
          const formattedMonth = dateObj
            .toLocaleString('en-US', { month: 'short' })
            .slice(0, 3)
          const formattedDay = dateObj.getDate().toString().padStart(1, '0')
          return `${formattedDay} ${formattedMonth}`
        })

        const originalNdviLabels = jsonNdviLabels.map((acronym) => {
          return acronym.trim()
        })

        const originalNdviData = jsonNDVI
        const originalAfectedAreaData = jsonAfectedArea

        const interpolatedNdviData = []
        for (let i = 0; i < data.length; i++) {
          const csvDate = data[i].datetime
          const date = new Date(csvDate)
          date.setDate(date.getDate() + 1)
          const dateString = `${date.getDate()} ${
            monthNames[date.toLocaleString('en-US', {month: 'short',})]
          }`
          const dateIndex = originalNdviLabels.indexOf(dateString)
          if (dateIndex > -1) {
            interpolatedNdviData.push(originalNdviData[dateIndex])
          } else {
            const prevDateIndex = formattedDates.findIndex((d) => d <= csvDate)
            const prevDateValue = originalNdviData[prevDateIndex]
            const nextDateIndex = formattedDates.findIndex(
              (d, index) => d > csvDate && index < originalNdviData.length
            )
            const nextDateValue = originalNdviData[nextDateIndex]

            if (prevDateIndex !== -1 && nextDateIndex !== -1) {
              const prevDate = new Date(formattedDates[prevDateIndex])
              const nextDate = new Date(formattedDates[nextDateIndex])
              const deltaDays = (nextDate - prevDate) / (1000 * 60 * 60 * 24)
              const interpolatedValue =
                prevDateValue +
                ((nextDateValue - prevDateValue) / deltaDays) *
                  ((new Date(csvDate).getTime() - prevDate.getTime()) /
                    (1000 * 60 * 60 * 24))
              interpolatedNdviData.push(interpolatedValue)
            } else if (prevDateIndex !== -1) {
              interpolatedNdviData.push(prevDateValue)
            } else if (nextDateIndex !== -1) {
              interpolatedNdviData.push(nextDateValue)
            }
          }
        }

        const interpolatedAfectedAreaData = []
        for (let i = 0; i < data.length; i++) {
          const csvDate = data[i].datetime
          const date = new Date(csvDate)
          date.setDate(date.getDate() + 1)
          const dateString = `${date.getDate()} ${
            monthNames[date.toLocaleString('en-US', { month: 'short' })]
          }`
          const datesIndex = originalNdviLabels.indexOf(dateString)
          if (datesIndex > -1) {
            interpolatedAfectedAreaData.push(originalAfectedAreaData[datesIndex])
          } else {
            const prevDateIndex = formattedDates.findIndex((d) => d <= csvDate)
            const prevDateValue = originalAfectedAreaData[prevDateIndex]
            const nextDateIndex = formattedDates.findIndex(
              (d, index) =>
                d > csvDate && index < originalAfectedAreaData.length
            )
            const nextDateValue = originalAfectedAreaData[nextDateIndex]

            if (prevDateIndex !== -1 && nextDateIndex !== -1) {
              const prevDate = new Date(formattedDates[prevDateIndex])
              const nextDate = new Date(formattedDates[nextDateIndex])
              const deltaDays = (nextDate - prevDate) / (1000 * 1000 * 24)
              const interpolatedValue =
                prevDateValue +
                ((nextDateValue - prevDateValue) / deltaDays) *
                  ((new Date(csvDate).getTime() - prevDate.getTime()) /
                    (1000 * 1000 * 24))
              interpolatedAfectedAreaData.push(interpolatedValue)
            } else if (prevDateIndex !== -1) {
              interpolatedAfectedAreaData.push(prevDateValue)
            } else if (nextDateIndex !== -1) {
              interpolatedAfectedAreaData.push(nextDateValue)
            }
          }
        }

        const labels = data.map((item) => item.datetime)
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
            data: interpolatedNdviData.map((value, index) => ({
              x: labels[index],
              y: value,
            })),
            borderColor: '#FFC107',
            backgroundColor: '#FFC107',
            borderWidth: 3,
            tension: 0.1,
            cubicInterpolationMode: 'default',
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
            data: interpolatedAfectedAreaData.map((value, index) => ({
              x: labels[index],
              y: value,
            })),
            borderColor: '#9e1a1a',
            backgroundColor: '#9e1a1a',
            borderWidth: 3,
            tension: 0.1,
            cubicInterpolationMode: 'default',
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
