// Main application logic
class AirQualityDashboard {
    constructor() {
        this.chartManager = new ChartManager();
        this.currentData = null;
        this.isConnected = false;
        this.currentTheme = 'dark';
        this.themeStorageKey = 'aqmps_theme';
        this.dataModeStorageKey = 'aqmps_data_mode';
        this.dataMode = 'thingspeak';
        this.selectedTimeRangeHours = 1;
        this.updateInterval = null;
        this.lastValues = {
            temperature: 28.5,
            humidity: 65.2,
            airQuality: 25,
            rawValue: 425
        };

        // Email alert state
        this.emailAlertsEnabled = false;
        this.alertStorageKey = 'aqmps_email_alerts';
        this.lastAlertTime = 0;
        this.emailjsInitialized = false;

        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.initializeTheme();
        this.initializeDataMode();
        this.initializeSelectedTimeRange();
        this.initializeEmailAlerts();
        this.updateTimeDisplay();
        this.startDataUpdates();

        // Time display update every second
        setInterval(() => this.updateTimeDisplay(), 1000);
    }

    initializeEventListeners() {
        // Time filter buttons (1H, 6H, 24H)
        document.querySelectorAll('.time-btn[data-hours]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                document
                    .querySelectorAll('.time-btn[data-hours]')
                    .forEach((b) => b.classList.remove('active'));
                e.target.classList.add('active');
                const hours = parseInt(e.target.dataset.hours);
                if (!isNaN(hours)) {
                    this.selectedTimeRangeHours = hours;
                    this.chartManager.updateTimeRange(hours);
                }
            });
        });

        // Export CSV button
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Forecast button (AQI prediction for next 60 minutes)
        const forecastBtn = document.getElementById('run-forecast');
        if (forecastBtn) {
            forecastBtn.addEventListener('click', () => {
                this.runForecastNextHour();
            });
        }

        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.handleThemeToggle();
            });
        }

        const dataSourceToggleBtn = document.getElementById('data-source-toggle');
        if (dataSourceToggleBtn) {
            dataSourceToggleBtn.addEventListener('click', () => {
                this.handleDataSourceToggle();
            });
        }

        const alertToggleBtn = document.getElementById('alert-toggle');
        if (alertToggleBtn) {
            alertToggleBtn.addEventListener('click', () => {
                this.toggleEmailAlerts();
            });
        }

        const testAlertBtn = document.getElementById('test-alert');
        if (testAlertBtn) {
            testAlertBtn.addEventListener('click', () => {
                this.sendTestAlert();
            });
        }
    }

    initializeTheme() {
        let savedTheme = null;
        try {
            savedTheme = localStorage.getItem(this.themeStorageKey);
        } catch (error) {
            savedTheme = null;
        }

        const initialTheme =
            savedTheme === 'light' || savedTheme === 'dark'
                ? savedTheme
                : document.body.classList.contains('theme-light')
                ? 'light'
                : 'dark';

        this.applyTheme(initialTheme, false);
    }

    handleThemeToggle() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme, true);
    }

    applyTheme(theme, persist = true) {
        const normalizedTheme = theme === 'light' ? 'light' : 'dark';
        this.currentTheme = normalizedTheme;

        const body = document.body;
        if (body) {
            body.classList.remove('theme-dark', 'theme-light');
            body.classList.add(`theme-${normalizedTheme}`);
        }

        this.updateThemeToggleButton();

        if (this.chartManager && typeof this.chartManager.setTheme === 'function') {
            this.chartManager.setTheme(normalizedTheme);
        }

        if (persist) {
            try {
                localStorage.setItem(this.themeStorageKey, normalizedTheme);
            } catch (error) {
                // Ignore storage failures (private mode, restricted env)
            }
        }
    }

    updateThemeToggleButton() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;

        if (this.currentTheme === 'dark') {
            themeToggleBtn.textContent = 'Light Mode';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
            themeToggleBtn.setAttribute('aria-pressed', 'false');
        } else {
            themeToggleBtn.textContent = 'Dark Mode';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            themeToggleBtn.setAttribute('aria-pressed', 'true');
        }
    }

    initializeDataMode() {
        let savedDataMode = null;
        try {
            savedDataMode = localStorage.getItem(this.dataModeStorageKey);
        } catch (error) {
            savedDataMode = null;
        }

        const defaultMode = CONFIG.SIMULATION.ENABLED ? 'simulation' : 'thingspeak';
        const initialMode =
            savedDataMode === 'simulation' || savedDataMode === 'thingspeak'
                ? savedDataMode
                : defaultMode;

        this.applyDataMode(initialMode, false);
    }

    async handleDataSourceToggle() {
        const nextMode = this.dataMode === 'thingspeak' ? 'simulation' : 'thingspeak';
        this.applyDataMode(nextMode, true);

        if (this.dataMode === 'thingspeak') {
            try {
                await this.loadThingSpeakHistory(this.selectedTimeRangeHours);
            } catch (error) {
                console.warn('Unable to preload ThingSpeak history:', error);
            }
        } else if (this.chartManager && typeof this.chartManager.setHistoricalData === 'function') {
            this.chartManager.setHistoricalData([]);
        }

        await this.fetchData();
    }

    applyDataMode(mode, persist = true) {
        const normalizedMode = mode === 'simulation' ? 'simulation' : 'thingspeak';
        this.dataMode = normalizedMode;
        this.updateDataSourceToggleButton();

        if (persist) {
            try {
                localStorage.setItem(this.dataModeStorageKey, normalizedMode);
            } catch (error) {
                // Ignore storage failures (private mode, restricted env)
            }
        }
    }

    updateDataSourceToggleButton() {
        const dataSourceToggleBtn = document.getElementById('data-source-toggle');
        if (!dataSourceToggleBtn) return;

        if (this.dataMode === 'thingspeak') {
            dataSourceToggleBtn.textContent = 'Data: Live API';
            dataSourceToggleBtn.setAttribute(
                'aria-label',
                'Switch to demo data mode'
            );
            dataSourceToggleBtn.setAttribute('aria-pressed', 'false');
            return;
        }

        dataSourceToggleBtn.textContent = 'Data: Demo';
        dataSourceToggleBtn.setAttribute(
            'aria-label',
            'Switch to live API data mode'
        );
        dataSourceToggleBtn.setAttribute('aria-pressed', 'true');
    }

    initializeSelectedTimeRange() {
        const activeRangeBtn = document.querySelector('.time-btn[data-hours].active');
        const parsed = parseInt(activeRangeBtn?.dataset?.hours, 10);
        this.selectedTimeRangeHours =
            Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

        if (
            this.chartManager &&
            typeof this.chartManager.updateTimeRange === 'function'
        ) {
            this.chartManager.updateTimeRange(this.selectedTimeRangeHours);
        }
    }

    updateTimeDisplay() {
        const now = new Date();
        const el = document.getElementById('current-time');
        if (!el) return;

        el.textContent = now.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    async startDataUpdates() {
        if (this.dataMode === 'thingspeak') {
            try {
                await this.loadThingSpeakHistory(this.selectedTimeRangeHours);
            } catch (error) {
                console.warn('Unable to preload ThingSpeak history:', error);
            }
        }

        // Initial fetch
        await this.fetchData();

        // Periodic updates
        this.updateInterval = setInterval(() => {
            this.fetchData();
        }, CONFIG.THINGSPEAK.UPDATE_INTERVAL);
    }

    async fetchData() {
        try {
            let data;

            if (this.dataMode === 'simulation') {
                // Local simulation
                data = this.generateRealisticData();
            } else {
                // ThingSpeak se live data
                data = await this.fetchThingSpeakData();
            }

            // Check if data fresh hai ya purana
            const now = Date.now();
            const ageMs = now - data.timestamp.getTime();

            const staleThreshold =
                CONFIG.THINGSPEAK.STALE_AFTER_MS ||
                CONFIG.THINGSPEAK.UPDATE_INTERVAL * 3; // fallback agar STALE_AFTER_MS na ho

            const isFresh = this.dataMode === 'simulation' ? true : ageMs <= staleThreshold;

            // Dashboard UI update
            this.updateDashboard(data);

            // Connection status update (fresh data hi "Connected" maana jayega)
            this.isConnected = isFresh;
            this.updateConnectionStatus(isFresh);
        } catch (error) {
            console.error('Error fetching data:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    generateRealisticData() {
        const now = new Date();

        // Daily pattern
        const tempVariation = Math.sin(now.getHours() * 0.26) * 5;
        const humidityVariation = Math.cos(now.getHours() * 0.26) * 15;

        this.lastValues = {
            temperature: this.addSmoothVariation(
                this.lastValues.temperature,
                28.5 + tempVariation,
                0.3
            ),
            humidity: this.addSmoothVariation(
                this.lastValues.humidity,
                65 + humidityVariation,
                2
            ),
            airQuality: this.addSmoothVariation(
                this.lastValues.airQuality,
                25 + Math.random() * 10,
                1
            ),
            rawValue: this.addSmoothVariation(
                this.lastValues.rawValue,
                400 + Math.random() * 100,
                20
            )
        };

        return {
            timestamp: now,
            temperature: parseFloat(this.lastValues.temperature.toFixed(1)),
            humidity: parseFloat(this.lastValues.humidity.toFixed(1)),
            airQuality: parseFloat(this.lastValues.airQuality.toFixed(1)),
            rawValue: Math.round(this.lastValues.rawValue),
            status: this.calculateStatus(this.lastValues.airQuality)
        };
    }

    addSmoothVariation(current, target, maxStep) {
        const diff = target - current;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
        return current + step + (Math.random() - 0.5) * 0.5;
    }

    getThingSpeakFieldValue(feed, fieldNumber, fallback = NaN) {
        const parsedFieldNumber = parseInt(fieldNumber, 10);
        if (!Number.isFinite(parsedFieldNumber) || parsedFieldNumber < 1) {
            return fallback;
        }

        const raw = feed?.[`field${parsedFieldNumber}`];
        const value = parseFloat(raw);
        return Number.isFinite(value) ? value : fallback;
    }

    parseThingSpeakReading(feed, fallbackValues = null) {
        if (!feed || typeof feed !== 'object') return null;

        const fieldMap = CONFIG.THINGSPEAK.FIELDS || {};
        const defaults = fallbackValues || this.lastValues || {};

        const fallbackTemp = Number.isFinite(defaults.temperature)
            ? defaults.temperature
            : CONFIG.SIMULATION.BASE_VALUES.temperature;
        const fallbackHumidity = Number.isFinite(defaults.humidity)
            ? defaults.humidity
            : CONFIG.SIMULATION.BASE_VALUES.humidity;
        const fallbackAqi = Number.isFinite(defaults.airQuality)
            ? defaults.airQuality
            : CONFIG.SIMULATION.BASE_VALUES.airQuality;
        const fallbackRaw = Number.isFinite(defaults.rawValue)
            ? defaults.rawValue
            : CONFIG.SIMULATION.BASE_VALUES.rawValue;

        const temperature = this.getThingSpeakFieldValue(
            feed,
            fieldMap.TEMPERATURE || 1,
            fallbackTemp
        );
        const humidity = this.getThingSpeakFieldValue(
            feed,
            fieldMap.HUMIDITY || 2,
            fallbackHumidity
        );
        const airQuality = this.getThingSpeakFieldValue(
            feed,
            fieldMap.AIR_QUALITY || 3,
            fallbackAqi
        );

        const statusFieldNumber = fieldMap.STATUS || 4;
        const statusFieldValue = this.getThingSpeakFieldValue(feed, statusFieldNumber);
        const field5 = this.getThingSpeakFieldValue(feed, 5);
        const field6 = this.getThingSpeakFieldValue(feed, 6);

        const status =
            Number.isFinite(statusFieldValue) &&
            statusFieldValue >= 1 &&
            statusFieldValue <= 4
                ? Math.round(statusFieldValue)
                : this.calculateStatus(airQuality);

        const rawValueCandidates = [
            field6,
            field5,
            Number.isFinite(statusFieldValue) && statusFieldValue > 4
                ? statusFieldValue
                : NaN
        ];
        const parsedRawValue = rawValueCandidates.find((v) => Number.isFinite(v));
        const rawValue = Number.isFinite(parsedRawValue) ? parsedRawValue : fallbackRaw;

        const parsedTimestamp = new Date(feed.created_at);
        const timestamp = Number.isFinite(parsedTimestamp.getTime())
            ? parsedTimestamp
            : null;

        if (!timestamp) return null;

        return {
            timestamp,
            temperature,
            humidity,
            airQuality,
            rawValue: Number.isFinite(rawValue) ? rawValue : null,
            status
        };
    }

    async loadThingSpeakHistory(hours = this.selectedTimeRangeHours) {
        const safeHours =
            Number.isFinite(hours) && hours > 0 ? hours : 1;
        const intervalMs = Math.max(
            5000,
            CONFIG.THINGSPEAK.UPDATE_INTERVAL || 20000
        );
        const pointsNeeded = Math.ceil((safeHours * 60 * 60 * 1000) / intervalMs);
        const results = Math.min(800, Math.max(40, pointsNeeded + 20));

        const url = `https://api.thingspeak.com/channels/${CONFIG.THINGSPEAK.CHANNEL_ID}/feeds.json?api_key=${CONFIG.THINGSPEAK.READ_API_KEY}&results=${results}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`ThingSpeak history request failed (${response.status})`);
        }

        const payload = await response.json();
        const feeds = Array.isArray(payload?.feeds) ? payload.feeds : [];
        if (!feeds.length) return;

        let rollingFallback = {
            temperature: this.lastValues.temperature,
            humidity: this.lastValues.humidity,
            airQuality: this.lastValues.airQuality,
            rawValue: this.lastValues.rawValue
        };

        const history = [];
        feeds.forEach((feed) => {
            const reading = this.parseThingSpeakReading(feed, rollingFallback);
            if (!reading) return;

            history.push(reading);
            rollingFallback = {
                temperature: reading.temperature,
                humidity: reading.humidity,
                airQuality: reading.airQuality,
                rawValue: Number.isFinite(reading.rawValue)
                    ? reading.rawValue
                    : rollingFallback.rawValue
            };
        });

        if (!history.length) return;

        this.lastValues = {
            ...this.lastValues,
            ...rollingFallback
        };

        if (
            this.chartManager &&
            typeof this.chartManager.setHistoricalData === 'function'
        ) {
            this.chartManager.setHistoricalData(history);
            this.chartManager.updateTimeRange(this.selectedTimeRangeHours);
        }
    }

    async fetchThingSpeakData() {
        const url = `https://api.thingspeak.com/channels/${CONFIG.THINGSPEAK.CHANNEL_ID}/feeds/last.json?api_key=${CONFIG.THINGSPEAK.READ_API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`ThingSpeak latest request failed (${response.status})`);
        }

        const data = await response.json();
        const reading = this.parseThingSpeakReading(data, this.lastValues);
        if (!reading) {
            throw new Error('ThingSpeak latest payload did not contain a valid reading');
        }

        this.lastValues = {
            ...this.lastValues,
            temperature: reading.temperature,
            humidity: reading.humidity,
            airQuality: reading.airQuality,
            rawValue: Number.isFinite(reading.rawValue)
                ? reading.rawValue
                : this.lastValues.rawValue
        };

        return reading;
    }

    calculateStatus(aqiValue) {
        if (aqiValue <= 40) return 1; // Good
        if (aqiValue <= 70) return 2; // Moderate
        if (aqiValue <= 90) return 3; // Poor
        return 4; // Hazardous
    }

    getHealthAdvisory(aqiValue) {
        if (!Number.isFinite(aqiValue)) {
            return {
                impact: 'Air quality data not available.',
                showWarning: false,
                severity: 'poor',
                title: 'Health Advisory',
                message: 'Live AQI data is unavailable. Please check again shortly.'
            };
        }

        if (aqiValue <= 40) {
            return {
                impact: 'Air is clean and suitable for normal outdoor activity.',
                showWarning: false,
                severity: 'poor',
                title: 'Health Advisory',
                message: ''
            };
        }

        if (aqiValue <= 70) {
            return {
                impact:
                    'Sensitive people may feel mild discomfort during long outdoor exposure.',
                showWarning: false,
                severity: 'poor',
                title: 'Health Advisory',
                message: ''
            };
        }

        if (aqiValue <= 90) {
            return {
                impact:
                    'Unhealthy for sensitive groups; reduce outdoor activity and wear a mask.',
                showWarning: true,
                severity: 'poor',
                title: 'Health Warning',
                message:
                    'Asthma patients, children, and elderly people should stay indoors and avoid heavy outdoor activity.'
            };
        }

        return {
            impact:
                'Air quality is hazardous; breathing risk is high even for healthy people.',
            showWarning: true,
            severity: 'hazardous',
            title: 'Critical Health Warning',
            message:
                'Everyone should stay indoors. Asthma and respiratory patients should keep rescue medication ready and avoid outdoor exposure.'
        };
    }

    updateDashboard(data) {
        this.currentData = data;

        // Main sensor values
        const tempEl = document.getElementById('temp-value');
        const humEl = document.getElementById('humidity-value');
        const rawEl = document.getElementById('raw-value');
        const aqiEl = document.getElementById('aqi-value');

        if (tempEl) tempEl.textContent = data.temperature.toFixed(1);
        if (humEl) humEl.textContent = data.humidity.toFixed(1);
        if (rawEl) {
            rawEl.textContent = Number.isFinite(data.rawValue)
                ? Math.round(data.rawValue)
                : 'N/A';
        }
        if (aqiEl) aqiEl.textContent = data.airQuality.toFixed(1);

        // Gauge update
        this.chartManager.updateGauge(data.airQuality);

        // Status category update
        this.updateStatusDisplay(data.status);

        // Charts update
        this.chartManager.updateTrendChart(data);

        // Recent table update
        this.updateReadingsTable(data);

        // Stats update
        this.updateStatistics();

        // Email alert check
        this.checkAndSendAlert(data.airQuality);

        // Animation
        this.addUpdateAnimation();
    }

    updateStatusDisplay(statusCode) {
        const statusFromCode = {
            1: CONFIG.AQI_STATUS.GOOD,
            2: CONFIG.AQI_STATUS.MODERATE,
            3: CONFIG.AQI_STATUS.POOR,
            4: CONFIG.AQI_STATUS.HAZARDOUS
        };

        const statusConfig =
            statusFromCode[statusCode] ||
            Object.values(CONFIG.AQI_STATUS).find(
                (s) =>
                    s.range[0] <= this.currentData.airQuality &&
                    this.currentData.airQuality < s.range[1]
            ) ||
            CONFIG.AQI_STATUS.GOOD;

        const statusElement = document.getElementById('overall-status');
        const categoryElement = document.getElementById('aqi-category');

        if (statusElement) {
            statusElement.textContent = statusConfig.label;
            statusElement.setAttribute(
                'data-status',
                statusConfig.label.toLowerCase()
            );
        }

        if (categoryElement) {
            categoryElement.textContent = statusConfig.label;
            categoryElement.className = `value status-${statusConfig.label.toLowerCase()}`;
        }

        const advisory = this.getHealthAdvisory(this.currentData.airQuality);
        const healthImpactElement = document.getElementById('health-impact-text');
        const warningElement = document.getElementById('health-warning');
        const warningTitleElement = document.getElementById('health-warning-title');
        const warningMessageElement = document.getElementById(
            'health-warning-message'
        );

        if (healthImpactElement) {
            healthImpactElement.textContent = advisory.impact;
        }

        if (warningTitleElement) {
            warningTitleElement.textContent = advisory.title;
        }

        if (warningMessageElement) {
            warningMessageElement.textContent = advisory.message;
        }

        if (warningElement) {
            warningElement.className = `health-warning severity-${advisory.severity}`;
            warningElement.hidden = !advisory.showWarning;
        }
    }

    updateReadingsTable(data) {
        const tableBody = document.getElementById('readings-table');
        if (!tableBody) return;

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${data.timestamp.toLocaleTimeString()}</td>
            <td>${data.temperature.toFixed(1)}</td>
            <td>${data.humidity.toFixed(1)}</td>
            <td>${data.airQuality.toFixed(1)}</td>
            <td><span class="status-${this.getStatusText(
                data.status
            ).toLowerCase()}">${this.getStatusText(data.status)}</span></td>
        `;

        // Naya row sabse upar
        tableBody.insertBefore(newRow, tableBody.firstChild);

        // Sirf last 10 rows rakhni ho to:
        while (tableBody.children.length > 10) {
            tableBody.removeChild(tableBody.lastChild);
        }

        // Agar tum 100 rows chahte ho:
        // while (tableBody.children.length > 100) {
        //     tableBody.removeChild(tableBody.lastChild);
        // }
    }

    getStatusText(statusCode) {
        switch (statusCode) {
            case 1:
                return 'Good';
            case 2:
                return 'Moderate';
            case 3:
                return 'Poor';
            case 4:
                return 'Hazardous';
            default:
                return 'Unknown';
        }
    }

    updateStatistics() {
        if (this.chartManager.historicalData.length > 0) {
            const temps = this.chartManager.historicalData.map(
                (d) => d.temperature
            );
            const humidities = this.chartManager.historicalData.map(
                (d) => d.humidity
            );
            const aqis = this.chartManager.historicalData.map(
                (d) => d.airQuality
            );
    
            const avgTemp =
                temps.reduce((a, b) => a + b, 0) / temps.length || 0;
            const avgHum =
                humidities.reduce((a, b) => a + b, 0) / humidities.length || 0;
            const avgAqi =
                aqis.reduce((a, b) => a + b, 0) / aqis.length || 0;
    
            const avgTempEl = document.getElementById('avg-temp');
            const avgHumEl = document.getElementById('avg-humidity');
            const avgAqiEl = document.getElementById('avg-aqi');
            const countEl = document.getElementById('readings-count');
    
            if (avgTempEl) avgTempEl.textContent = avgTemp.toFixed(1) + '\u00B0C';
            if (avgHumEl) avgHumEl.textContent = avgHum.toFixed(1) + '%';
            if (avgAqiEl) avgAqiEl.textContent = avgAqi.toFixed(1);
            if (countEl)
                countEl.textContent = this.chartManager.historicalData.length;
    
            // Calculate status distribution
            this.updateStatusDistribution(aqis);
        }
    
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) lastUpdateEl.textContent = 'Just now';
    }
    
    updateStatusDistribution(aqiValues) {
        if (!aqiValues || aqiValues.length === 0) return;
    
        // Count readings in each category
        const counts = {
            good: 0,
            moderate: 0,
            poor: 0,
            hazardous: 0
        };
    
        aqiValues.forEach(aqi => {
            if (aqi <= 40) counts.good++;
            else if (aqi <= 70) counts.moderate++;
            else if (aqi <= 90) counts.poor++;
            else counts.hazardous++;
        });
    
        const total = aqiValues.length;
    
        // Calculate percentages
        const percentages = {
            good: (counts.good / total) * 100,
            moderate: (counts.moderate / total) * 100,
            poor: (counts.poor / total) * 100,
            hazardous: (counts.hazardous / total) * 100
        };
    
        // Update the bars
        const goodBar = document.querySelector('.dist-bar.good');
        const moderateBar = document.querySelector('.dist-bar.moderate');
        const poorBar = document.querySelector('.dist-bar.poor');
        const hazardousBar = document.querySelector('.dist-bar.hazardous');
    
        if (goodBar) {
            goodBar.style.width = percentages.good + '%';
            goodBar.innerHTML = percentages.good > 5 ? `<span>Good: ${percentages.good.toFixed(0)}%</span>` : '';
        }
    
        if (moderateBar) {
            moderateBar.style.width = percentages.moderate + '%';
            moderateBar.innerHTML = percentages.moderate > 5 ? `<span>Moderate: ${percentages.moderate.toFixed(0)}%</span>` : '';
        }
    
        if (poorBar) {
            poorBar.style.width = percentages.poor + '%';
            poorBar.innerHTML = percentages.poor > 5 ? `<span>Poor: ${percentages.poor.toFixed(0)}%</span>` : '';
        }
    
        if (hazardousBar) {
            hazardousBar.style.width = percentages.hazardous + '%';
            hazardousBar.innerHTML = percentages.hazardous > 5 ? `<span>Hazardous: ${percentages.hazardous.toFixed(0)}%</span>` : '';
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        if (this.dataMode === 'simulation') {
            statusElement.textContent = 'Demo mode';
            statusElement.className = 'status-pill status-connected';
            return;
        }

        if (connected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'status-pill status-connected';
        } else {
            statusElement.textContent = 'No recent data';
            statusElement.className = 'status-pill status-disconnected';
        }
    }

    addUpdateAnimation() {
        const elements = document.querySelectorAll('.sensor-value');
        elements.forEach((el) => {
            el.classList.add('updating');
            setTimeout(() => el.classList.remove('updating'), 1000);
        });
    }

    exportData() {
        if (!this.chartManager.historicalData.length) return;

        const csvContent = this.convertToCSV(this.chartManager.historicalData);
        this.downloadCSV(csvContent, 'air_quality_data.csv');
    }

    convertToCSV(data) {
        const headers = [
            'Timestamp',
            'Temperature (\u00B0C)',
            'Humidity (%)',
            'Air Quality',
            'Status'
        ];
        const rows = data.map((d) => [
            d.timestamp.toISOString(),
            d.temperature.toFixed(1),
            d.humidity.toFixed(1),
            d.airQuality.toFixed(1),
            this.getStatusText(this.calculateStatus(d.airQuality))
        ]);

        return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ---------- PREDICTION (NEXT 60 MINUTES) ----------

    // Simple linear regression based forecast on recent AQI
    runForecastNextHour() {
        const data = this.chartManager.historicalData || [];
        const validData = data.filter(
            (d) =>
                d &&
                d.timestamp instanceof Date &&
                Number.isFinite(d.timestamp.getTime()) &&
                Number.isFinite(d.airQuality)
        );

        if (validData.length < 1) {
            alert('No valid AQI data available for prediction yet.');
            return;
        }

        // Last N valid points se trend uthao
        const N = Math.min(30, validData.length);
        const recent = validData.slice(validData.length - N);
        const anchorPoint = recent[recent.length - 1];

        // Time index: minutes from first recent timestamp
        const t0 = recent[0].timestamp.getTime();
        const t = recent.map(
            (d) => (d.timestamp.getTime() - t0) / 60000 // minutes
        );
        const y = recent.map((d) => d.airQuality);

        // Linear regression: y = a + b*t
        const n = t.length;
        const sumT = t.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumTT = t.reduce((a, b) => a + b * b, 0);
        const sumTY = t.reduce((acc, ti, i) => acc + ti * y[i], 0);

        const denom = n * sumTT - sumT * sumT;

        let a = y[y.length - 1];
        let b = 0;
        if (Number.isFinite(denom) && Math.abs(denom) > 1e-9) {
            b = (n * sumTY - sumT * sumY) / denom;
            a = (sumY - b * sumT) / n;
        }

        // Prevent unrealistic spikes due to noisy slope.
        const MAX_SLOPE_PER_MIN = 2;
        b = Math.max(-MAX_SLOPE_PER_MIN, Math.min(MAX_SLOPE_PER_MIN, b));

        // 60 minute future forecast
        const lastTs = recent[recent.length - 1].timestamp;
        const predictions = [];
        for (let i = 1; i <= 60; i++) {
            const futureTs = new Date(lastTs.getTime() + i * 60000);
            const futureTmin = (futureTs.getTime() - t0) / 60000;

            let predAQI = a + b * futureTmin;

            // Reasonable range
            if (predAQI < 0) predAQI = 0;
            if (predAQI > 100) predAQI = 100;

            predictions.push({
                timestamp: futureTs,
                airQuality: parseFloat(predAQI.toFixed(2))
            });
        }

        // Chart me show karo (include last observed AQI as anchor point)
        this.chartManager.updateForecastChart(predictions, anchorPoint);
    }

    // ---------- EMAIL ALERT SYSTEM ----------

    initializeEmailAlerts() {
        const alertConfig = CONFIG.EMAIL_ALERT;
        if (!alertConfig || !alertConfig.ENABLED) return;

        // Initialize EmailJS
        try {
            if (typeof emailjs !== 'undefined' && alertConfig.EMAILJS_PUBLIC_KEY &&
                alertConfig.EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE') {
                emailjs.init(alertConfig.EMAILJS_PUBLIC_KEY);
                this.emailjsInitialized = true;
                console.log('[EmailAlert] EmailJS initialized successfully.');
            } else {
                console.warn('[EmailAlert] EmailJS not initialized — public key missing or placeholder.');
            }
        } catch (error) {
            console.error('[EmailAlert] EmailJS init failed:', error);
        }

        // Restore saved preference
        let savedPref = null;
        try {
            savedPref = localStorage.getItem(this.alertStorageKey);
        } catch (e) { /* ignore */ }

        this.emailAlertsEnabled = savedPref === 'true';
        this.updateAlertToggleButton();
    }

    toggleEmailAlerts() {
        this.emailAlertsEnabled = !this.emailAlertsEnabled;

        try {
            localStorage.setItem(this.alertStorageKey, String(this.emailAlertsEnabled));
        } catch (e) { /* ignore */ }

        this.updateAlertToggleButton();

        if (this.emailAlertsEnabled && !this.emailjsInitialized) {
            const statusBar = document.getElementById('alert-status-bar');
            const statusText = document.getElementById('alert-status-text');
            if (statusBar && statusText) {
                statusBar.hidden = false;
                statusText.textContent = '⚠️ Set your EmailJS Public Key in config.js to enable email alerts';
            }
        }
    }

    updateAlertToggleButton() {
        const btn = document.getElementById('alert-toggle');
        if (!btn) return;

        if (this.emailAlertsEnabled) {
            btn.innerHTML = '&#128276; Alerts: On';
            btn.classList.add('alert-active');
            btn.setAttribute('aria-label', 'Disable email alerts');
        } else {
            btn.innerHTML = '&#128276; Alerts: Off';
            btn.classList.remove('alert-active');
            btn.setAttribute('aria-label', 'Enable email alerts');
        }
    }

    checkAndSendAlert(aqiValue) {
        if (!this.emailAlertsEnabled) return;
        if (!this.emailjsInitialized) return;
        if (!Number.isFinite(aqiValue)) return;

        const alertConfig = CONFIG.EMAIL_ALERT;
        const threshold = alertConfig.AQI_THRESHOLD || 70;

        if (aqiValue < threshold) return;

        // Cooldown check
        const now = Date.now();
        const cooldownMs = (alertConfig.COOLDOWN_MINUTES || 15) * 60 * 1000;
        if (now - this.lastAlertTime < cooldownMs) return;

        // Send email alert
        this.sendEmailAlert(aqiValue);
    }

    async sendEmailAlert(aqiValue) {
        const alertConfig = CONFIG.EMAIL_ALERT;
        const statusText = this.getStatusText(this.calculateStatus(aqiValue));
        const advisory = this.getHealthAdvisory(aqiValue);
        const timestamp = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium'
        });

        const templateParams = {
            to_email: alertConfig.RECIPIENT_EMAIL || '',
            email: alertConfig.RECIPIENT_EMAIL || '',
            name: 'Air Quality Monitor',
            title: `AQI Alert: ${statusText} (${aqiValue.toFixed(1)})`,
            aqi_value: aqiValue.toFixed(1),
            status: statusText,
            temperature: this.lastValues.temperature.toFixed(1) + '°C',
            humidity: this.lastValues.humidity.toFixed(1) + '%',
            time: timestamp,
            message: advisory.impact
        };

        try {
            await emailjs.send(
                alertConfig.EMAILJS_SERVICE_ID,
                alertConfig.EMAILJS_TEMPLATE_ID,
                templateParams
            );

            this.lastAlertTime = Date.now();
            console.log('[EmailAlert] Alert email sent! AQI:', aqiValue.toFixed(1));

            // Update status bar
            this.updateAlertStatusBar(
                `✅ Alert sent at ${new Date().toLocaleTimeString()} — AQI: ${aqiValue.toFixed(1)} (${statusText})`
            );

            // Flash the alert button
            const btn = document.getElementById('alert-toggle');
            if (btn) {
                btn.classList.add('alert-just-sent');
                setTimeout(() => btn.classList.remove('alert-just-sent'), 3000);
            }
        } catch (error) {
            console.error('[EmailAlert] Failed to send alert:', error);
            this.updateAlertStatusBar('❌ Email alert failed — check EmailJS config');
        }
    }

    updateAlertStatusBar(message) {
        const statusBar = document.getElementById('alert-status-bar');
        const statusText = document.getElementById('alert-status-text');
        if (statusBar && statusText) {
            statusBar.hidden = false;
            statusText.textContent = message;
        }
    }

    async sendTestAlert() {
        if (!this.emailjsInitialized) {
            alert('EmailJS not initialized! Check your Public Key in config.js');
            return;
        }

        const btn = document.getElementById('test-alert');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '&#9889; Sending...';
        }

        const currentAqi = this.currentData
            ? this.currentData.airQuality
            : this.lastValues.airQuality;
        const statusText = this.getStatusText(this.calculateStatus(currentAqi));
        const advisory = this.getHealthAdvisory(currentAqi);
        const timestamp = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium'
        });

        const alertConfig = CONFIG.EMAIL_ALERT;
        const templateParams = {
            to_email: alertConfig.RECIPIENT_EMAIL || '',
            email: alertConfig.RECIPIENT_EMAIL || '',
            name: 'Air Quality Monitor',
            title: `AQI Alert: ${statusText} (${currentAqi.toFixed(1)})`,
            aqi_value: currentAqi.toFixed(1),
            status: statusText,
            temperature: this.lastValues.temperature.toFixed(1) + '°C',
            humidity: this.lastValues.humidity.toFixed(1) + '%',
            time: timestamp,
            message: advisory.impact
        };

        try {
            await emailjs.send(
                alertConfig.EMAILJS_SERVICE_ID,
                alertConfig.EMAILJS_TEMPLATE_ID,
                templateParams
            );

            console.log('[EmailAlert] Test alert sent! AQI:', currentAqi.toFixed(1));
            this.updateAlertStatusBar(
                `\u2705 Test alert sent at ${new Date().toLocaleTimeString()} \u2014 AQI: ${currentAqi.toFixed(1)} (${statusText})`
            );

            if (btn) {
                btn.innerHTML = '&#9889; Sent \u2713';
                btn.classList.add('alert-just-sent');
                setTimeout(() => {
                    btn.innerHTML = '&#9889; Test Alert';
                    btn.disabled = false;
                    btn.classList.remove('alert-just-sent');
                }, 3000);
            }
        } catch (error) {
            const errMsg = error?.text || error?.message || String(error);
            console.error('[EmailAlert] Test alert failed:', errMsg, error);
            this.updateAlertStatusBar('\u274c Failed: ' + errMsg);
            if (btn) {
                btn.innerHTML = '&#9889; Failed';
                setTimeout(() => {
                    btn.innerHTML = '&#9889; Test Alert';
                    btn.disabled = false;
                }, 3000);
            }
        }
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.airQualityDashboard = new AirQualityDashboard();
});


