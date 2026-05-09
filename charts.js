// Chart initialization and management
class ChartManager {
    constructor() {
        this.trendChart = null;
        this.environmentChart = null;
        this.gaugeChart = null;
        this.forecastChart = null;   // Forecast chart
        this.currentTheme = document.body.classList.contains('theme-light')
            ? 'light'
            : 'dark';
        this.lastGaugeValue = 25;
        this.historicalData = [];
        this.activeTimeRangeHours = null;
        this.initCharts();
        this.setTheme(this.currentTheme);
    }

    initCharts() {
        this.initTrendChart();
        this.initEnvironmentChart();
        this.initGaugeChart();
        this.initForecastChart();    // Forecast chart
    }

    getThemePalette(theme = this.currentTheme) {
        if (theme === 'light') {
            return {
                chartText: '#0f172a',
                grid: '#cbd5e1',
                axis: '#94a3b8',
                muted: '#64748b',
                tooltip: 'light',
                gaugeTrack: '#e2e8f0',
                gaugeNeedle: '#0f172a'
            };
        }

        return {
            chartText: '#e5e7eb',
            grid: '#1f2933',
            axis: '#4b5563',
            muted: '#9ca3af',
            tooltip: 'dark',
            gaugeTrack: '#020617',
            gaugeNeedle: '#e5e7eb'
        };
    }

    setTheme(theme) {
        this.currentTheme = theme === 'light' ? 'light' : 'dark';
        const palette = this.getThemePalette(this.currentTheme);

        if (this.trendChart) {
            this.trendChart.updateOptions(
                {
                    chart: { foreColor: palette.chartText },
                    grid: { borderColor: palette.grid },
                    xaxis: {
                        axisBorder: { color: palette.axis },
                        axisTicks: { color: palette.axis }
                    },
                    yaxis: {
                        title: { style: { color: palette.muted } }
                    },
                    tooltip: { theme: palette.tooltip }
                },
                false,
                false,
                false
            );
        }

        if (this.environmentChart) {
            this.environmentChart.updateOptions(
                {
                    chart: { foreColor: palette.chartText },
                    grid: { borderColor: palette.grid },
                    xaxis: {
                        axisBorder: { color: palette.axis },
                        axisTicks: { color: palette.axis }
                    },
                    tooltip: { theme: palette.tooltip }
                },
                false,
                false,
                false
            );
        }

        if (this.forecastChart) {
            this.forecastChart.updateOptions(
                {
                    chart: { foreColor: palette.chartText },
                    grid: { borderColor: palette.grid },
                    xaxis: {
                        axisBorder: { color: palette.axis },
                        axisTicks: { color: palette.axis }
                    },
                    yaxis: {
                        title: { style: { color: palette.muted } }
                    },
                    tooltip: { theme: palette.tooltip }
                },
                false,
                false,
                false
            );
        }

        this.updateGauge(this.lastGaugeValue);
    }

    initTrendChart() {
        const options = {
            series: [{
                name: 'Air Quality',
                data: []
            }],
            chart: {
                height: 300,
                type: 'line',
                zoom: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
                toolbar: {
                    show: true,
                    tools: {
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                foreColor: '#e5e7eb'   // text color (dark theme friendly)
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 0,
                hover: {
                    size: 0
                }
            },
            colors: [CONFIG.CHARTS.COLOR_SCHEME.airQuality],
            grid: {
                borderColor: '#1f2933'
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false   // local time
                },
                axisBorder: {
                    color: '#4b5563'
                },
                axisTicks: {
                    color: '#4b5563'
                }
            },
            yaxis: {
                title: {
                    text: 'Air Quality Index',
                    style: { color: '#9ca3af' }
                },
                min: 0,
                max: 100,
                labels: {
                    formatter: function (val) {
                        return val.toFixed(1); // 1 decimal
                    }
                }
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                shared: true,
                intersect: false,
                followCursor: true,
                x: {
                    format: 'dd/MM/yy HH:mm'
                },
                y: {
                    formatter: function (val) {
                        if (!Number.isFinite(val)) return '-- AQI';
                        return val.toFixed(1) + ' AQI';
                    }
                },
                custom: function ({ series, dataPointIndex, w }) {
                    if (dataPointIndex < 0) return '';

                    const xValue = w.globals.seriesX[0][dataPointIndex];
                    const yValue = series[0][dataPointIndex];
                    if (!Number.isFinite(yValue)) return '';

                    const timeLabel = new Date(xValue).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });

                    return (
                        '<div class="aq-tooltip-box">' +
                        '<div class="aq-tooltip-title">' + timeLabel + '</div>' +
                        '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-aqi"></span>AQI: <strong>' +
                        yValue.toFixed(1) +
                        '</strong></div>' +
                        '</div>'
                    );
                }
            }
        };

        const el = document.querySelector("#trend-chart");
        if (!el) return;

        this.trendChart = new ApexCharts(el, options);
        this.trendChart.render();
        this.attachHoverPanel(this.trendChart, el, 'trend');
    }

    initEnvironmentChart() {
        const options = {
            series: [
                {
                    name: 'Temperature',
                    data: []
                },
                {
                    name: 'Humidity',
                    data: []
                }
            ],
            chart: {
                height: 300,
                type: 'line',
                zoom: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'linear'
                },
                foreColor: '#e5e7eb'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 2,
                hover: {
                    size: 6
                }
            },
            colors: [
                CONFIG.CHARTS.COLOR_SCHEME.temperature,
                CONFIG.CHARTS.COLOR_SCHEME.humidity
            ],
            grid: {
                borderColor: '#1f2933'
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    datetimeFormatter: {
                        hour: 'HH:mm',
                        minute: 'HH:mm'
                    }
                },
                axisBorder: {
                    color: '#4b5563'
                },
                axisTicks: {
                    color: '#4b5563'
                }
            },
            yaxis: [
                {
                    title: {
                        text: 'Temperature (\u00B0C)',
                        style: { color: '#f97373' }
                    },
                    min: 0,
                    max: 50,
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Humidity (%)',
                        style: { color: '#38bdf8' }
                    },
                    min: 0,
                    max: 100,
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                }
            ],
            tooltip: {
                enabled: true,
                theme: 'dark',
                shared: true,
                intersect: false,
                followCursor: true,
                x: {
                    format: 'dd/MM/yy HH:mm'
                },
                y: [
                    {
                        formatter: function (val) {
                            if (!Number.isFinite(val)) return '-- \u00B0C';
                            return val.toFixed(1) + '\u00B0C';
                        }
                    },
                    {
                        formatter: function (val) {
                            if (!Number.isFinite(val)) return '-- %';
                            return val.toFixed(1) + '%';
                        }
                    }
                ]
            }
        };

        const el = document.querySelector('#environment-chart');
        if (!el) return;

        this.environmentChart = new ApexCharts(el, options);
        this.environmentChart.render();
        this.attachHoverPanel(this.environmentChart, el, 'environment');
    }
    initGaugeChart() {
        const canvas = document.getElementById('aqi-gauge');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Draw gauge background
        this.drawGaugeBackground(ctx);

        // Initial gauge value
        this.updateGauge(25);
    }

    drawGaugeBackground(ctx) {
        const centerX = 100;
        const centerY = 100;
        const radius = 80;
        const palette = this.getThemePalette();

        // Draw gauge background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = palette.gaugeTrack;
        ctx.lineWidth = 20;
        ctx.stroke();

        // Draw colored segments
        const segments = [
            { start: 0, end: 0.4, color: CONFIG.CHARTS.COLOR_SCHEME.statusGood },
            { start: 0.4, end: 0.7, color: CONFIG.CHARTS.COLOR_SCHEME.statusModerate },
            { start: 0.7, end: 0.9, color: CONFIG.CHARTS.COLOR_SCHEME.statusPoor },
            { start: 0.9, end: 1.0, color: CONFIG.CHARTS.COLOR_SCHEME.statusHazardous }
        ];

        segments.forEach(segment => {
            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                radius,
                Math.PI + (segment.start * Math.PI),
                Math.PI + (segment.end * Math.PI)
            );
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = 20;
            ctx.stroke();
        });
    }

    updateGauge(value) {
        const canvas = document.getElementById('aqi-gauge');
        if (!canvas) return;
        this.lastGaugeValue = value;

        const ctx = canvas.getContext('2d');
        const centerX = 100;
        const centerY = 100;
        const palette = this.getThemePalette();

        // Clear full canvas so old value text does not overlap
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw background
        this.drawGaugeBackground(ctx);

        // Draw needle
        const angle = Math.PI + (value / 100) * Math.PI;
        const needleLength = 60;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * needleLength,
            centerY + Math.sin(angle) * needleLength
        );
        ctx.strokeStyle = palette.gaugeNeedle;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = palette.gaugeNeedle;
        ctx.fill();

        // Value text
        ctx.fillStyle = palette.gaugeNeedle;
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toFixed(1), centerX, canvas.height - 10);
    }

    setHistoricalData(dataPoints) {
        if (!Array.isArray(dataPoints)) {
            this.historicalData = [];
            this.renderMainSeries([]);
            return;
        }

        const normalized = dataPoints
            .filter(
                (d) =>
                    d &&
                    d.timestamp instanceof Date &&
                    Number.isFinite(d.timestamp.getTime()) &&
                    Number.isFinite(d.temperature) &&
                    Number.isFinite(d.humidity) &&
                    Number.isFinite(d.airQuality)
            )
            .map((d) => ({
                timestamp: d.timestamp,
                temperature: parseFloat(d.temperature.toFixed(1)),
                humidity: parseFloat(d.humidity.toFixed(1)),
                airQuality: parseFloat(d.airQuality.toFixed(1)),
                rawValue: Number.isFinite(d.rawValue) ? Math.round(d.rawValue) : null
            }))
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        this.historicalData = normalized.slice(-1000);
        this.renderMainSeries();
    }

    getVisibleHistoricalData() {
        if (!this.historicalData.length) return [];

        if (!Number.isFinite(this.activeTimeRangeHours) || this.activeTimeRangeHours <= 0) {
            return this.historicalData;
        }

        const now = Date.now();
        const threshold = now - this.activeTimeRangeHours * 60 * 60 * 1000;
        const filtered = this.historicalData.filter(
            (d) => d.timestamp.getTime() >= threshold
        );

        if (filtered.length) return filtered;

        // If all data is stale (older than selected range), show last chunk instead of blank chart.
        const fallbackCount = Math.min(120, this.historicalData.length);
        return this.historicalData.slice(-fallbackCount);
    }

    renderMainSeries(sourceData = this.getVisibleHistoricalData()) {
        const aqiData = sourceData.map((d) => ({
            x: d.timestamp.getTime(),
            y: d.airQuality
        }));

        const tempData = sourceData.map((d) => ({
            x: d.timestamp.getTime(),
            y: d.temperature
        }));

        const humidityData = sourceData.map((d) => ({
            x: d.timestamp.getTime(),
            y: d.humidity
        }));

        if (this.trendChart) {
            this.trendChart.updateSeries([
                {
                    name: 'Air Quality',
                    data: aqiData
                }
            ]);
        }

        if (this.environmentChart) {
            this.environmentChart.updateSeries([
                {
                    name: 'Temperature',
                    data: tempData
                },
                {
                    name: 'Humidity',
                    data: humidityData
                }
            ]);
        }
    }

    updateTrendChart(newData) {
        if (
            !newData ||
            !(newData.timestamp instanceof Date) ||
            !Number.isFinite(newData.timestamp.getTime()) ||
            !Number.isFinite(newData.temperature) ||
            !Number.isFinite(newData.humidity) ||
            !Number.isFinite(newData.airQuality)
        ) {
            return;
        }

        const nextPoint = {
            timestamp: newData.timestamp,
            temperature: parseFloat(newData.temperature.toFixed(1)),
            humidity: parseFloat(newData.humidity.toFixed(1)),
            airQuality: parseFloat(newData.airQuality.toFixed(1)),
            rawValue: Number.isFinite(newData.rawValue)
                ? Math.round(newData.rawValue)
                : null
        };

        const lastPoint = this.historicalData[this.historicalData.length - 1];
        if (
            lastPoint &&
            lastPoint.timestamp instanceof Date &&
            lastPoint.timestamp.getTime() === nextPoint.timestamp.getTime()
        ) {
            this.historicalData[this.historicalData.length - 1] = nextPoint;
        } else {
            this.historicalData.push(nextPoint);
        }

        // Yahan tum limit set kar sakte ho:
        // e.g. last 1000 points
        if (this.historicalData.length > 1000) {
            this.historicalData.shift();
        }
        this.renderMainSeries();
    }

    updateTimeRange(hours) {
        this.activeTimeRangeHours =
            Number.isFinite(hours) && hours > 0 ? hours : null;
        this.renderMainSeries();
    }

    // ---------- FORECAST CHART (PREDICTION) ----------

    initForecastChart() {
        const el = document.querySelector('#forecast-chart');
        if (!el) return; // agar HTML me nahi hai to skip

        const options = {
            series: [{
                name: 'Predicted AQI',
                data: []
            }],
            chart: {
                height: 300,
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: { speed: 800 }
                },
                toolbar: { show: false },
                foreColor: '#e5e7eb'
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 3,
                dashArray: 0
            },
            markers: {
                size: 0,
                hover: {
                    size: 5
                }
            },
            colors: ['#22d3ee'],
            grid: { borderColor: '#1f2933' },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    datetimeFormatter: {
                        hour: 'HH:mm',
                        minute: 'HH:mm'
                    }
                },
                axisBorder: { color: '#4b5563' },
                axisTicks: { color: '#4b5563' }
            },
            yaxis: {
                title: {
                    text: 'Predicted AQI',
                    style: { color: '#9ca3af' }
                },
                min: 0,
                max: 100,
                tickAmount: 5,
                labels: {
                    formatter: function (val) {
                        return Number.isFinite(val) ? val.toFixed(1) : '--';
                    }
                }
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                shared: false,
                intersect: false,
                followCursor: true,
                x: { format: 'dd/MM/yy HH:mm' },
                y: {
                    formatter: (val) => {
                        if (!Number.isFinite(val)) return '-- AQI';
                        return val.toFixed(1) + ' AQI';
                    }
                },
                custom: function ({ series, dataPointIndex, w }) {
                    if (dataPointIndex < 0) return '';

                    const xValue = w.globals.seriesX[0][dataPointIndex];
                    const yValue = series[0][dataPointIndex];
                    if (!Number.isFinite(yValue)) return '';

                    const timeLabel = new Date(xValue).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });

                    return (
                        '<div class="aq-tooltip-box">' +
                        '<div class="aq-tooltip-title">' + timeLabel + '</div>' +
                        '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-forecast"></span>Predicted AQI: <strong>' +
                        yValue.toFixed(1) +
                        '</strong></div>' +
                        '</div>'
                    );
                }
            }
        };

        this.forecastChart = new ApexCharts(el, options);
        this.forecastChart.render();
        this.attachHoverPanel(this.forecastChart, el, 'forecast');
    }

    formatHoverTime(timestamp) {
        const value = Number(timestamp);
        if (!Number.isFinite(value)) return '--';

        return new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    buildHoverPanelHtml(type, chartState, pointIndex) {
        const xSeries = chartState?.globals?.seriesX?.[0];
        if (!xSeries || !xSeries.length) {
            if (type === 'environment') {
                return (
                    '<div class="aq-tooltip-box chart-hover-box">' +
                    '<div class="aq-tooltip-title">Waiting For Readings</div>' +
                    '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-temp"></span>Temp: <strong>-- C</strong></div>' +
                    '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-humidity"></span>Humidity: <strong>-- %</strong></div>' +
                    '</div>'
                );
            }
            if (type === 'forecast') {
                return (
                    '<div class="aq-tooltip-box chart-hover-box">' +
                    '<div class="aq-tooltip-title">Forecast</div>' +
                    '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-forecast"></span>Run Predict to view points</div>' +
                    '</div>'
                );
            }

            if (type === 'trend') {
                return (
                    '<div class="aq-tooltip-box chart-hover-box">' +
                    '<div class="aq-tooltip-title">Waiting For Readings</div>' +
                    '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-aqi"></span>AQI: <strong>--</strong></div>' +
                    '</div>'
                );
            }

            return (
                '<div class="aq-tooltip-box chart-hover-box">' +
                '<div class="aq-tooltip-title">No Data</div>' +
                '</div>'
            );
        }

        const clampedIndex = Math.max(0, Math.min(pointIndex, xSeries.length - 1));
        const timestamp = xSeries[clampedIndex];
        const timeLabel = this.formatHoverTime(timestamp);
        const series = chartState.globals.series || [];

        if (type === 'environment') {
            const temp = series?.[0]?.[clampedIndex];
            const humidity = series?.[1]?.[clampedIndex];
            const tempText = Number.isFinite(temp) ? temp.toFixed(1) + '\u00B0C' : '-- \u00B0C';
            const humidityText = Number.isFinite(humidity) ? humidity.toFixed(1) + '%' : '-- %';

            return (
                '<div class="aq-tooltip-box chart-hover-box">' +
                '<div class="aq-tooltip-title">' + timeLabel + '</div>' +
                '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-temp"></span>Temp: <strong>' + tempText + '</strong></div>' +
                '<div class="aq-tooltip-row"><span class="aq-dot aq-dot-humidity"></span>Humidity: <strong>' + humidityText + '</strong></div>' +
                '</div>'
            );
        }

        const value = series?.[0]?.[clampedIndex];
        if (!Number.isFinite(value)) return '';
        const label = type === 'forecast' ? 'Predicted AQI' : 'AQI';
        const dotClass = type === 'forecast' ? 'aq-dot-forecast' : 'aq-dot-aqi';

        return (
            '<div class="aq-tooltip-box chart-hover-box">' +
            '<div class="aq-tooltip-title">' + timeLabel + '</div>' +
            '<div class="aq-tooltip-row"><span class="aq-dot ' + dotClass + '"></span>' + label + ': <strong>' + value.toFixed(1) + '</strong></div>' +
            '</div>'
        );
    }

    attachHoverPanel(chartInstance, containerEl, type) {
        if (!chartInstance || !containerEl || containerEl.dataset.hoverBound === '1') return;

        containerEl.dataset.hoverBound = '1';
        let panel = containerEl.querySelector('.chart-hover-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'chart-hover-panel';
            containerEl.appendChild(panel);
        }

        const updatePanel = (event) => {
            const chartState = chartInstance?.w;
            if (!chartState?.globals) return;
            const xSeries = chartState.globals.seriesX?.[0] || [];

            const rect = containerEl.getBoundingClientRect();
            const gridX = chartState.globals.gridRect?.x || 0;
            const gridWidth = chartState.globals.gridRect?.w || rect.width;
            const relativeX = Math.max(
                0,
                Math.min(gridWidth, event.clientX - rect.left - gridX)
            );

            const ratio = gridWidth > 0 ? relativeX / gridWidth : 0;
            const pointIndex = xSeries.length
                ? Math.round(ratio * (xSeries.length - 1))
                : 0;
            const html = this.buildHoverPanelHtml(type, chartState, pointIndex);

            if (!html) {
                panel.style.display = 'none';
                return;
            }

            panel.innerHTML = html;
            panel.style.display = 'block';
        };

        const hidePanel = () => {
            panel.style.display = 'none';
        };

        const bindHoverListeners = (target) => {
            if (!target || target.dataset.hoverBound === '1') return;
            target.dataset.hoverBound = '1';
            target.addEventListener('mousemove', updatePanel);
            target.addEventListener('mouseleave', hidePanel);
        };

        bindHoverListeners(containerEl);
        bindHoverListeners(containerEl.querySelector('.apexcharts-canvas'));
        bindHoverListeners(containerEl.querySelector('svg'));

        // Apex canvas render ho kar replace ho sakta hai, isliye delayed bind bhi.
        setTimeout(() => {
            bindHoverListeners(containerEl.querySelector('.apexcharts-canvas'));
            bindHoverListeners(containerEl.querySelector('svg'));
        }, 0);
    }

    // predictions: [{ timestamp: Date, airQuality: number }, ...]
    updateForecastChart(predictions, anchorPoint = null) {
        if (!this.forecastChart) return;

        const safePredictions = (predictions || []).filter(
            (p) =>
                p &&
                p.timestamp instanceof Date &&
                Number.isFinite(p.timestamp.getTime()) &&
                Number.isFinite(p.airQuality)
        );

        const seriesData = [];
        if (
            anchorPoint &&
            anchorPoint.timestamp instanceof Date &&
            Number.isFinite(anchorPoint.timestamp.getTime()) &&
            Number.isFinite(anchorPoint.airQuality)
        ) {
            seriesData.push({
                x: anchorPoint.timestamp.getTime(),
                y: anchorPoint.airQuality
            });
        }

        safePredictions.forEach((p) => {
            seriesData.push({
                x: p.timestamp.getTime(),
                y: p.airQuality
            });
        });

        if (!seriesData.length) {
            this.forecastChart.updateSeries([
                {
                    name: 'Predicted AQI',
                    data: []
                }
            ]);
            return;
        }

        const values = seriesData
            .map((point) => point.y)
            .filter((value) => Number.isFinite(value));

        let minY = Math.min(...values);
        let maxY = Math.max(...values);
        const span = Math.max(5, maxY - minY);
        minY = Math.max(0, minY - span * 0.2);
        maxY = Math.min(100, maxY + span * 0.2);

        if (maxY - minY < 5) {
            const center = (maxY + minY) / 2;
            minY = Math.max(0, center - 2.5);
            maxY = Math.min(100, center + 2.5);
        }

        this.forecastChart.updateOptions(
            {
                yaxis: {
                    min: parseFloat(minY.toFixed(1)),
                    max: parseFloat(maxY.toFixed(1)),
                    tickAmount: 5
                }
            },
            false,
            false,
            false
        );

        this.forecastChart.updateSeries([{
            name: 'Predicted AQI',
            data: seriesData
        }]);
    }
}

