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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return `${date.getDate()} ${
    monthNames[
      date.toLocaleString('en-US', {
        month: 'short',
      })
    ]
  }`
}

function graphic(data, short_average_crop_indices_url) {
  const labels = data.filter((item) => item.datetime !== '' && item.datetime !== null).map((item) => formatDate(item.datetime))
  console.log(labels)

  const formattedLabels = data.map((item) => item.datetime)
  console.log(formattedLabels)

  // format labels to new date
  function stringToDate(formattedLabels) {
    const dateLabels = formattedLabels.map((label) => {
      const [day, month, year] = label.split(' ')
      const dateObj = new Date(`${year}-${month}-${day}`)
      return dateObj
    })
    return dateLabels
  }
  const dateLabels = stringToDate(formattedLabels)
  console.log(dateLabels)

  fetch(short_average_crop_indices_url)
    .then((response) => response.json())
    .then((jsonData) => {
      const jsonNDVI = jsonData.data.NDVI
      const jsonAfectedArea = jsonData.data.AFECTED_AREA
      const jsonDates = jsonData.data.Dates
      console.log(jsonDates)

      // format json dates in new Dates
      function stringJsonToDate(jsonDates) {
        const dateJson = jsonDates.map((label) => {
          const [year, month, day] = label.split('-')
          const dateObj = new Date(+year, +month - 1, +day)
          return dateObj
        })
        return dateJson
      }
      const dateJson = stringJsonToDate(jsonDates)
      console.log(dateJson)

      function interpolateData(dates, values, targetDate) {
        const interpolatedValues = []

        for (let i = 0; i < targetDate.length; i++) {
          const { prevDate, nextDate, prevValue, nextValue } =
            findPreviousAndNext(dates, values, targetDate[i])
          interpolatedValues.push(
            interpolate(
              prevDate,
              nextDate,
              prevValue,
              nextValue,
              targetDate[i]
            )[0]
          )
        }

        return interpolatedValues
      }

      const interpolateNDVI = interpolateData(dateJson, jsonNDVI, dateLabels)
      console.log(interpolateNDVI)

      // fill in missing data values
      function fillMissingDays(jsonDates, jsonAfectedArea, formattedLabels) {
        const result = []
        const jsonDatesSet = new Set(jsonDates)

        for (const label of formattedLabels) {
          if (jsonDatesSet.has(label)) {
            const index = jsonDates.indexOf(label)
            result.push(jsonAfectedArea[index])
          } else {
            result.push('')
          }
        }

        return result
      }

      const filledAfectedArea = fillMissingDays(
        jsonDates,
        jsonAfectedArea,
        formattedLabels
      )
      console.log(filledAfectedArea)

      const datasets = [
        {
          label: 'Nubosidad',
          data: data.map((item) => item.cloudcover),
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
          yAxisID: 'y1',
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Nubosidad: ${context.parsed.y.toFixed(2)}%`
              },
            },
          },
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
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Rad. Solar: ${context.parsed.y.toFixed(2)}W/m2`
              },
            },
          },
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
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Temperatura: ${context.parsed.y.toFixed(2)}ºC`
              },
            },
          },
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
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Vel. de Viento: ${context.parsed.y.toFixed(2)}m/s`
              },
            },
          },
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
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Precipitacion: ${context.parsed.y.toFixed(2)}mm`
              },
            },
          },
        },
        {
          label: 'Vigor',
          data: interpolateNDVI.map((value, index) => ({
            x: labels[index],
            y: value,
          })),
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
          yAxisID: 'y3',
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Vigor: ${context.parsed.y.toFixed(2)}`
              },
            },
          },
        },
        {
          label: 'Area Afectada',
          type: 'bar',
          categoryPercentage: 0.6,
          barPercentage: 0.6,
          data: filledAfectedArea,
          borderColor: '#E4684E',
          backgroundColor: '#E4684E',
          tension: 0.1,
          pointRadius: (context) => {
            return 0
          },
          pointHitRadius: 10,
          spanGaps: true,
          fill: false,
          yAxisID: 'y4',
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Area Afectada: ${context.parsed.y.toFixed(2)}%`
              },
            },
          },
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
          maintainAspectRatio: false,
          responsive: true,
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
          scales: {
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
              grid: {
                color: gridColor,
              },
            },
            y2: {
              type: 'linear',
              min: 0,
              max: 30,
              suggestedMin: 30,
              suggestedMax: 100,
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
            y5: {
              display: false,
              type: 'linear',
              min: 0,
              max: 30,
              position: 'right',
              stack: 'y1',
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
            y6: {
              display: false,
              type: 'linear',
              min: 0,
              max: 400,
              position: 'right',
              stack: 'y1',
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
            y4: {
              type: 'linear',
              min: 0,
              max: 100,
              position: 'right',
              stack: 'y1',
              stackWeight: 0.5,
              ticks: {
                stepSize: 50,
                color: '#E4684E',
                beginAtZero: true,
              },
              grid: {
                color: gridColor,
              },
            },
            x: {
              stacked: true,
              offset: false,
              ticks: {
                color: textColor,
                beginAtZero: true,
                minRotation: window.matchMedia('(max-width: 480px)').matches
                ? 45
                : 50,
              maxRotation: window.matchMedia('(max-width: 480px)').matches
                ? 45
                : 50,
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
            htmlLegend: {
              containerID: 'legend-container',
            },
            legend: {
              display: false,
              position: 'top',
              align: 'center',
              labels: {
                color: textColor,
                padding: 10,
                boxHeight: 14,
                font: {
                  size: 14,
                },
              },
            },
          },
        },
        plugins: [htmlLegendPlugin],
      }
      const ctx = document.getElementById('chart').getContext('2d')
      new Chart(ctx, config)
    })
}

const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(id)
  let listContainer = legendContainer.querySelector('ul')

  if (!listContainer) {
    listContainer = document.createElement('ul')
    if (window.matchMedia('(max-width: 400px)').matches) {
      listContainer.classList.add('chartLegend')
      listContainer.style.display = 'grid'
      listContainer.style.gridTemplateColumns = '120px 120px'
      listContainer.style.gridTemplateRows = '12px 12px 12px 12px'
      listContainer.style.flexDirection = 'row'
      listContainer.style.margin = 0
      listContainer.style.padding = 0
      listContainer.style.alignItems = 'center'
      listContainer.style.justifyContent = 'space-between'
    } else {
      listContainer.style.display = 'flex'
      listContainer.style.flexDirection = 'row'
      listContainer.style.margin = 0
      listContainer.style.padding = 0
    }
    legendContainer.appendChild(listContainer)
  }

  return listContainer
}

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID)

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove()
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart)

    items.forEach((item) => {
      const li = document.createElement('li')
      if (window.matchMedia('(max-width: 400px)').matches) {
        li.style.alignItems = 'center'
        li.style.cursor = 'pointer'
        li.style.display = 'flex'
        li.style.flexDirection = 'row'
        li.style.margin = '1px 15px'
        li.style.justifyContent = 'start'
        li.style.height = '12px'
        li.style.width = '140px'
        li.style.fontSize = '12px'
        ;(li.style.fontFamily = 'Inter'), 'sans-serif'
      } else {
        li.style.alignItems = 'center'
        li.style.cursor = 'pointer'
        li.style.display = 'flex'
        li.style.flexDirection = 'row'
        li.style.marginLeft = '10px'
        li.style.justifyContent = 'center'
        li.style.fontSize = '12px'
        ;(li.style.fontFamily = 'Inter'), 'sans-serif'
      }

      li.onclick = () => {
        const { type } = chart.config
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index)
        } else {
          chart.setDatasetVisibility(
            item.datasetIndex,
            !chart.isDatasetVisible(item.datasetIndex)
          )
        }
        chart.update()
      }

      // Color box
      const boxSpan = document.createElement('span')
      if (window.matchMedia('(max-width: 400px)').matches) {
        boxSpan.style.background = item.fillStyle
        boxSpan.style.borderColor = item.strokeStyle
        boxSpan.style.borderWidth = item.lineWidth + 'px'
        boxSpan.style.display = 'flex'
        boxSpan.style.flexShrink = 0
        boxSpan.style.height = '12px'
        boxSpan.style.marginRight = '10px'
        boxSpan.style.width = '12px'
      } else {
        boxSpan.style.background = item.fillStyle
        boxSpan.style.borderColor = item.strokeStyle
        boxSpan.style.borderWidth = item.lineWidth + 'px'
        boxSpan.style.display = 'inline-block'
        boxSpan.style.flexShrink = 0
        boxSpan.style.height = '12px'
        boxSpan.style.width = '12px'
        boxSpan.style.marginRight = '10px'
      }

      // Text
      const textContainer = document.createElement('p')
      textContainer.style.color = item.fontColor
      textContainer.style.margin = 0
      textContainer.style.padding = 0
      textContainer.style.textDecoration = item.hidden ? 'line-through' : ''

      const text = document.createTextNode(item.text)
      textContainer.appendChild(text)

      li.appendChild(boxSpan)
      li.appendChild(textContainer)
      ul.appendChild(li)
    })
  },
}
