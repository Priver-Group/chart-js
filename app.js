document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = "climate_service.csv";
    let data = {};
  
    Papa.parse(csvUrl, {
      header: true,
      download: true,
      complete: function (results) {
        data = results.data.map((item) => {
          const date = new Date(item.datetime);
          return {
            datetime: `${date.getDate()}-${
              monthNames[date.toLocaleString("en-US", {
                month: "short",
              })]
            }`,
            cloudcover: item.cloudcover,
            solarradiation: item.solarradiation,
          };
        });
        crearGrafica();
      },
    });
  
    const monthNames = {
      Jan: "JAN",
      Feb: "FEB",
      Mar: "MAR",
      Apr: "APR",
      May: "MAY",
      Jun: "JUN",
      Jul: "JUL",
      Aug: "AUG",
      Sep: "SEP",
      Oct: "OCT",
      Nov: "NOV",
      Dec: "DEC",
    };
  
    function formatearMeses(date) {
      const [day, month] = date.split(" ");
      return `${day}-${monthNames[month.toUpperCase()]}`;
    }
  
    function crearGrafica() {
      // Preparar los datos para Chart.js
      const labels = data.map((item) => item.datetime);
      const datasets = [
        {
          label: "Nubosidad",
          data: data.map((item) => item.cloudcover),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
        {
          label: "Rad. Solar",
          data: data.map((item) => item.solarradiation),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
        // Agregar más datasets según sea necesario
      ];
  
      // Configurar opciones de la gráfica
      const config = {
        type: "line",
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              min: 0,
              max: 400,
              ticks: {
                stepSize: 100,
              },
            },
          },
        },
      };
  
      // Crear la gráfica
      const ctx = document.getElementById("chart").getContext("2d");
      new Chart(ctx, config);
    }
  });