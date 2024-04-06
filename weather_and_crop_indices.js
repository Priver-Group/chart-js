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

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'climate_service.csv'
  let data = {}

  Papa.parse(csvUrl, {
    header: true,
    download: true,
    complete: function (results) {
      data = results.data.map((item) => {
        const date = new Date(item.datetime)
        date.setDate(date.getDate() + 1)
        return {
          datetime: item.datetime,
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
    const labels = data.map((item) => formatDate(item.datetime))
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

    fetch('short_average_crop_indices_farm-0000000014_04-A-1-4-121-907.json')
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

        function interpolateData(dates, values, targetDate) {
          const interpolatedValues = [];
        
          for (let i = 0; i < targetDate.length; i++) {
            const { prevDate, nextDate, prevValue, nextValue } = findPreviousAndNext(dates, values, targetDate[i]);
            const interpolatedValue = interpolate(prevDate, nextDate, prevValue, nextValue, targetDate[i]);
            interpolatedValues.push(interpolatedValue.toString());
          }
        
          return interpolatedValues;
        }

        const interpolateNDVI = interpolateData(dateJson, jsonNDVI, dateLabels)
        console.log(interpolateNDVI)

        const interpolateAfectedArea = interpolateData(
          dateJson,
          jsonAfectedArea,
          dateLabels
        )
        console.log(interpolateAfectedArea)

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
            data: interpolateNDVI.map((value, index) => ({
              x: labels[index],
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
            fill: false,
            yAxisID: 'y4',
          },
          {
            label: 'Area Afectada',
            type: 'bar',
            categoryPercentage: 0.6,
            barPercentage: 0.6,
            data: interpolateAfectedArea.map((value, index) => ({
              x: labels[index],
              y: value,
            })),
            borderColor: '#9e1a1a',
            backgroundColor: '#9e1a1a',
            tension: 0.1,
            pointRadius: (context) => {
              return 0
            },
            pointHitRadius: 10,
            spanGaps: true,
            fill: false,
            yAxisID: 'y3',
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
              y4: {
                type: 'linear',
                min: 0,
                max: 1,
                position: 'left',
                stack: 'y',
                offset: false,
                stackWeight: 0.1,
                ticks: {
                  color: textColor,
                  beginAtZero: true,
                },
                grid: {
                  color: gridColor2,
                },
              },
              y3: {
                type: 'linear',
                min: 0,
                max: 100,
                position: 'left',
                stack: 'y',
                offset: true,
                stackWeight: 0.5,
                ticks: {
                  stepSize: 20,
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
                stackWeight: 0.4,
                ticks: {
                  stepSize: 10,
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
                stackWeight: 0.4,
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
})

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
        li.style.fontFamily = 'Inter', 'sans-serif'
      } else {
        li.style.alignItems = 'center'
        li.style.cursor = 'pointer'
        li.style.display = 'flex'
        li.style.flexDirection = 'row'
        li.style.marginLeft = '10px'
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
        boxSpan.style.height = '20px'
        boxSpan.style.marginRight = '10px'
        boxSpan.style.width = '20px'
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
