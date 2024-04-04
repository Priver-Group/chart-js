function findPreviousAndNext(dates, values, targetDate) {
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

  return { prevDate, nextDate, prevValue, nextValue }
}

function handleOutOfRange(prevValue, nextValue) {
  return prevValue === null ? nextValue : prevValue
}

function interpolate(prevDate, nextDate, prevValue, nextValue, targetDate) {
  const ratio = (targetDate - prevDate) / (nextDate - prevDate)
  return [prevValue + ratio * (nextValue - prevValue)]
}

function interpolateData(dates, values, targetDate) {
  const { prevDate, nextDate, prevValue, nextValue } = findPreviousAndNext(
    dates,
    values,
    targetDate
  )

  if (prevValue === null || nextValue === null) {
    return handleOutOfRange(prevValue, nextValue)
  }

  return interpolate(prevDate, nextDate, prevValue, nextValue, targetDate)
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
    console.log(labels)

    // format labels in new Dates
    function stringToDate(labels) {
      const dateLabels = labels.map((label) => {
        const [day, month, year] = label.split(' ')
        const dateObj = new Date(`${year}-${month}-${day}`)
        return dateObj
      })
      return dateLabels
    }
    const dateLabels = stringToDate(labels)
    console.log(dateLabels)



    const dates = csvUrl.map((row) => {
      const [, year, month, day] = row.datetime.match(/\d+/g)
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    })
    console.log(dates);

    fetch('short_average_crop_indices_farm-0000000014_04-A-1-4-121-907.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const jsonNDVI = jsonData.data.NDVI
        const jsonAfectedArea = jsonData.data.AFECTED_AREA
        const jsonDates = jsonData.data.Dates

        // format json dates in new Dates
        function stringJsonToDate(jsonDates) {
          const dateJson = jsonDates.map((label) => {
            const [day, month, year] = label.split(' ')
            const dateObj = new Date(`${year}-${month}-${day}`)
            return dateObj
          })
          return dateJson
        }
        const dateJson = stringJsonToDate(jsonDates)
        console.log(dateJson)

        // get targetDate
        function getMissingDates(dateLabels, dateJson) {
          const missingDates = []

          // Convert the date objects to strings for easier comparison
          const stringDateLabels = dateLabels.map((date) =>
            date.toLocaleDateString()
          )
          const stringDateJson = dateJson.map((date) =>
            date.toLocaleDateString()
          )

          // Iterate over the labels and check if each date is in the json array
          stringDateLabels.forEach((label) => {
            if (!stringDateJson.includes(label)) {
              missingDates.push(new Date(label))
            }
          })
          return missingDates
        }
        const missingDates = getMissingDates(dateLabels, dateJson)
        console.log(missingDates)

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
            data: [],
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
            data: [],
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
        console.log(datasets)

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
