// Configuration file for the Air Quality Monitoring Dashboard
const CONFIG = {
    // ThingSpeak Configuration
    THINGSPEAK: {
        CHANNEL_ID: '3057645',
        READ_API_KEY: '7CXZ2OEIZCH5O981', // Replace with your actual API key
        UPDATE_INTERVAL: 20000, // 20 seconds
        FIELDS: {
            TEMPERATURE: 1,
            HUMIDITY: 2,
            AIR_QUALITY: 3,
            STATUS: 4
        }
    },

    // Air Quality Status Configuration
    AQI_STATUS: {
        GOOD: {
            range: [0, 40],
            color: '#27ae60',
            label: 'Good',
            description: 'Air quality is satisfactory'
        },
        MODERATE: {
            range: [40, 70],
            color: '#f39c12',
            label: 'Moderate',
            description: 'Acceptable air quality'
        },
        POOR: {
            range: [70, 90],
            color: '#e74c3c',
            label: 'Poor',
            description: 'May affect sensitive groups'
        },
        HAZARDOUS: {
            range: [90, 100],
            color: '#8e44ad',
            label: 'Hazardous',
            description: 'Emergency conditions'
        }
    },

    // Chart Configuration
    CHARTS: {
        COLOR_SCHEME: {
            temperature: '#e74c3c',
            humidity: '#3498db',
            airQuality: '#2ecc71',
            statusGood: '#27ae60',
            statusModerate: '#f39c12',
            statusPoor: '#e74c3c',
            statusHazardous: '#8e44ad'
        },
        ANIMATION_DURATION: 800
    },

    // Data Simulation (for demo purposes)
    SIMULATION: {
        ENABLED: false, // Set to false when using real ThingSpeak data
        BASE_VALUES: {
            temperature: 28.5,
            humidity: 65.2,
            airQuality: 25,
            rawValue: 425
        },
        VARIATION: {
            temperature: 2.0,
            humidity: 10.0,
            airQuality: 15.0,
            rawValue: 200
        }
    },

    // Email Alert Configuration (EmailJS)
    EMAIL_ALERT: {
        ENABLED: true,
        EMAILJS_PUBLIC_KEY: 'lwvwt1dVQ4TeRgS8T',   // EmailJS → Account → General → Public Key
        EMAILJS_SERVICE_ID: 'service_a5bw593',
        EMAILJS_TEMPLATE_ID: 'template_4b1slgq',
        AQI_THRESHOLD: 70,            // Send alert when AQI exceeds this value
        COOLDOWN_MINUTES: 15,          // Minimum gap between consecutive alerts
        RECIPIENT_EMAIL: 'goluprawal3@gmail.com'  // Email address to receive alerts
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
