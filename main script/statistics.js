<!DOCTYPE html>
<html>
<head>
    <title>Финансовая отчетность</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        #chartContainer {
            width: 800px;
            height: 400px;
            margin: 20px auto;
        }
    </style>
</head>
<body>

    <div>
      <label for="companySelect">Компания:</label>
      <select id="companySelect">
          <option value="mts">МТС</option>
          <option value="beeline">Билайн</option>
          <option value="megafon">Мегафон</option>
      </select>
      <label for="metricSelect">Показатель:</label>
      <select id="metricSelect">
          <option value="assets">Активы</option>
          <option value="capital">Капитал</option>
          <option value="longTermLiabilities">Долгосрочные обязательства</option>
          <option value="shortTermLiabilities">Краткосрочные обязательства</option>
          <option value="revenue">Выручка</option>
          <option value="operatingProfit">Операционная прибыль</option>
          <option value="annualProfit">Прибыль за год</option>
          <option value="totalAnnualIncome">Совокупный доход за год</option>
      </select>
      <label for="chartTypeSelect">Тип графика:</label>
      <select id="chartTypeSelect">
          <option value="line">Линейный график</option>
          <option value="bar">Столбчатая диаграмма</option>
          <option value="pie">Круговая диаграмма</option>
      </select>

  </div>



    <div id="chartContainer">
        <canvas id="myChart"></canvas>
    </div>

    <script>
      const data = {
        mts: {
            assets: [551.07, 915.993, 823.91, 919.203, 1015.818, 1082.930, 1291.545],
            capital: [124.205, 77.565, 36.394, 36.394, 14.604, 3.3617, 1.72],
            longTermLiabilities: [270.194, 542.957, 439.059, 439.059, 557.899, 535.202, 472.688],
            shortTermLiabilities: [156.671, 295.471, 348.457, 348.457, 328.614, 551.345, 817.137],
            revenue: [417.918, 451.466, 476.106, 494.926, 527.921, 541.749, 605.991],
            operatingProfit: [90.241, 109.021, 114.188, 112.603, 118.005, 109.437, 12.846],
            annualProfit: [56.59, 7.832, 55.099, 62.073, 64.269, 33.435, 55.529],
            totalAnnualIncome: [53.766, 15.631, 63.53, 63.717, 65.466, 35.331, 60.358]
        },
        // ... данные для других компаний
        // Добавьте данные для Beeline и Megafon в таком же формате
    };
    const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023];

      let myChart;

      function updateChart() {
          const selectedCompany = document.getElementById('companySelect').value;
          const selectedMetric = document.getElementById('metricSelect').value;
          const selectedChartType = document.getElementById('chartTypeSelect').value;


          const chartData = {
            labels: years,
            datasets: [{
                label: selectedMetric,
                data: data[selectedCompany][selectedMetric],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
             }]
         };


         const config = {
            type: selectedChartType, // Тип графика
            data: chartData,
            options: {
                scales: {
                  y: {
                     beginAtZero: true,
                     title: {
                         display: true,
                         text: selectedMetric // Здесь можно динамически менять название оси
                   }
                 }
              }
            }
         };


        if (myChart) {
           myChart.destroy();
        }

         myChart = new Chart(
              document.getElementById('myChart'),
              config
         );

}


      document.getElementById('companySelect').addEventListener('change', updateChart);
      document.getElementById('metricSelect').addEventListener('change', updateChart);
      document.getElementById('chartTypeSelect').addEventListener('change', updateChart);


      updateChart(); // Первоначальное построение графика


  </script>

</body>
</html>