// script.js

document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const convertBtn = document.getElementById('convert-btn');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const chartCanvas = document.getElementById('historical-chart');
    let historicalChart;

    // Your API key
    const API_KEY = '78a2bcc9ba84fc19d14147c26580ae91'; // Replace with your actual API key

    // Base API URL
    const BASE_URL = 'https://api.exchangerate.host/live'; // Replace with your API's base URL

    // Fetch available currencies and populate the select elements
    async function fetchCurrencies() {
        try {
            const response = await fetch(`${BASE_URL}/symbols?api_key=${API_KEY}`);
            console.log('Fetching symbols:', response);
            const data = await response.json();
            console.log('Symbols data:', data);
            const symbols = data.symbols;

            for (const [code, details] of Object.entries(symbols)) {
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = `${code} - ${details.description}`;
                baseCurrencySelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = `${code} - ${details.description}`;
                targetCurrencySelect.appendChild(option2);
            }

            // Set default currencies
            baseCurrencySelect.value = 'USD';
            targetCurrencySelect.value = 'EUR';
        } catch (error) {
            console.error('Error fetching currencies:', error);
            alert('Failed to load currency symbols.');
        }
    }

    // Perform currency conversion
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        console.log(`Converting ${amount} from ${baseCurrency} to ${targetCurrency}`);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            const convertUrl = `${BASE_URL}/convert?api_key=${API_KEY}&from=${baseCurrency}&to=${targetCurrency}&amount=${amount}`;
            console.log('Fetching conversion data from:', convertUrl);
            const response = await fetch(convertUrl);
            console.log('Conversion response:', response);
            const data = await response.json();
            console.log('Conversion data:', data);

            if (data.result !== undefined) {
                convertedAmountDisplay.textContent = `${data.result.toFixed(2)} ${targetCurrency}`;
                fetchHistoricalData(baseCurrency, targetCurrency);
            } else {
                convertedAmountDisplay.textContent = 'Conversion failed.';
            }
        } catch (error) {
            console.error('Error converting currency:', error);
            alert('Failed to convert currency.');
        }
    }

    // Fetch historical exchange rates for the past 30 days
    async function fetchHistoricalData(base, target) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        try {
            const timeseriesUrl = `${BASE_URL}/timeseries?api_key=${API_KEY}&start_date=${startStr}&end_date=${endStr}&base=${base}&symbols=${target}`;
            console.log('Fetching historical data from:', timeseriesUrl);
            const response = await fetch(timeseriesUrl);
            console.log('Historical data response:', response);
            const data = await response.json();
            console.log('Historical data:', data);

            if (data.rates) {
                const labels = [];
                const rates = [];

                // Sort the dates to ensure correct order
                const sortedDates = Object.keys(data.rates).sort((a, b) => new Date(a) - new Date(b));

                sortedDates.forEach(date => {
                    labels.push(date);
                    rates.push(data.rates[date][target]);
                });

                renderChart(labels, rates, base, target);
            } else {
                alert('Failed to fetch historical data.');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            alert('Failed to fetch historical data.');
        }
    }

    // Render the historical data chart
    function renderChart(labels, data, base, target) {
        if (historicalChart) {
            historicalChart.destroy();
        }

        historicalChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Exchange Rate: ${base} to ${target}`,
                    data: data,
                    borderColor: '#007BFF',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: `Exchange Rate (${target} per ${base})`
                        }
                    }
                }
            }
        });
    }

    // Event listeners
    convertBtn.addEventListener('click', convertCurrency);

    // Initialize
    fetchCurrencies();
    convertCurrency(); // Perform an initial conversion and chart load
});
