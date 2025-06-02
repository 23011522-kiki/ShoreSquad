// ShoreSquad App - Interactive Beach Cleanup Platform
// Main JavaScript functionality for weather, events, and user interactions

class ShoreSquadApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadInitialData();
    }

    init() {
        console.log('🏄‍♂️ ShoreSquad App Initialized!');
        
        // Initialize app state
        this.state = {
            user: {
                cleanupsJoined: 0,
                trashCollected: 0,
                squadMembers: 0
            },
            events: [],
            weather: null
        };
        
        // Load user data from localStorage
        this.loadUserData();
    }

    bindEvents() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                const isExpanded = navMenu.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isExpanded);
            });
        }

        // Hero action buttons
        this.bindButton('join-cleanup-btn', () => this.joinCleanup());
        this.bindButton('create-event-btn', () => this.createEvent());
        
        // Squad action buttons
        this.bindButton('invite-friends-btn', () => this.inviteFriends());
        this.bindButton('share-progress-btn', () => this.shareProgress());
        
        // Load more events
        this.bindButton('load-more-events', () => this.loadMoreEvents());
        
        // Smooth scrolling for navigation links
        this.setupSmoothScrolling();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    bindButton(id, callback) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', callback);
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    callback();
                }
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard navigation for cards and interactive elements
        const interactiveElements = document.querySelectorAll('.event-card, .stat-card');
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '0');
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    element.click();
                }
            });
        });
    }    async loadInitialData() {
        try {
            // Load weather data
            await this.loadWeatherData();
            
            // Load cleanup events
            await this.loadCleanupEvents();
            
            // Load cleanup location info
            await this.loadCleanupLocation();
            
            // Update user stats display
            this.updateUserStats();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Unable to load some data. Please check your connection.', 'error');
        }
    }    async loadWeatherData() {
        const weatherContainer = document.getElementById('weather-current');
        if (!weatherContainer) return;

        try {
            // Show loading state
            weatherContainer.innerHTML = `
                <div class="loading" role="status" aria-live="polite">
                    <div class="loading-spinner"></div>
                    <p>Loading real-time weather data from NEA Singapore...</p>
                </div>
            `;

            // Fetch real weather data from Singapore's NEA APIs
            const [forecastData, temperatureData, humidityData] = await Promise.all([
                this.fetchForecastData(),
                this.fetchTemperatureData(),
                this.fetchHumidityData()
            ]);            // Process and combine the data
            const weatherData = this.processWeatherData(forecastData, temperatureData, humidityData);
            
            this.displayWeatherData(weatherData);
            
            // Check for weather alerts
            const alerts = this.checkWeatherAlerts(weatherData);
            this.displayWeatherAlerts(alerts);
            
        } catch (error) {
            console.error('Weather loading error:', error);
            weatherContainer.innerHTML = `
                <div class="weather-error">
                    <div class="error-icon">⚠️</div>
                    <p>Unable to load weather data from NEA Singapore</p>
                    <p class="error-detail">Please check your internet connection</p>
                    <button onclick="app.loadWeatherData()" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    }    async fetchForecastData() {
        try {
            const response = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Forecast data received:', data);
            return data;
        } catch (error) {
            console.warn('Failed to fetch real forecast data, using fallback:', error);
            // Fallback data if API fails
            return this.getFallbackForecastData();
        }
    }

    async fetchTemperatureData() {
        try {
            const response = await fetch('https://api.data.gov.sg/v1/environment/air-temperature', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Temperature API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Temperature data received:', data);
            return data;
        } catch (error) {
            console.warn('Failed to fetch real temperature data, using fallback:', error);
            return this.getFallbackTemperatureData();
        }
    }

    async fetchHumidityData() {
        try {
            const response = await fetch('https://api.data.gov.sg/v1/environment/relative-humidity', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Humidity API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Humidity data received:', data);
            return data;
        } catch (error) {
            console.warn('Failed to fetch real humidity data, using fallback:', error);
            return this.getFallbackHumidityData();
        }
    }    getFallbackForecastData() {
        // Generate realistic fallback data with dynamic dates starting from today
        const today = new Date();
        const forecasts = [];
        
        for (let i = 0; i < 4; i++) {
            const forecastDate = new Date(today);
            forecastDate.setDate(today.getDate() + i);
            
            forecasts.push({
                date: forecastDate.toISOString().split('T')[0], // YYYY-MM-DD format
                temperature: { low: 25 + Math.floor(Math.random() * 2), high: 31 + Math.floor(Math.random() * 3) },
                forecast: this.getFallbackForecastText(i),
                relative_humidity: { low: 55 + Math.floor(Math.random() * 10), high: 85 + Math.floor(Math.random() * 10) },
                wind: { speed: { low: 10 + Math.floor(Math.random() * 5), high: 20 + Math.floor(Math.random() * 10) }, direction: ['SW', 'SSW', 'S', 'SE'][Math.floor(Math.random() * 4)] }
            });
        }
        
        return {
            items: [{
                forecasts: forecasts
            }]
        };
    }

    getFallbackForecastText(dayIndex) {
        const forecasts = [
            'Late morning and early afternoon thundery showers',
            'Partly cloudy with brief showers', 
            'Morning thundery showers',
            'Fair and warm'
        ];
        return forecasts[dayIndex % forecasts.length];
    }

    getFallbackTemperatureData() {
        return {
            items: [{
                readings: [
                    { station_id: 'S107', value: 29.5 } // East Coast Parkway
                ]
            }]
        };
    }

    getFallbackHumidityData() {
        return {
            items: [{
                readings: [
                    { station_id: 'S107', value: 75 } // East Coast Parkway
                ]
            }]
        };
    }    processWeatherData(forecastData, temperatureData, humidityData) {
        // Find closest weather station to Pasir Ris (East Coast Parkway is closest)
        const targetStations = ['S107', 'S106']; // East Coast Parkway, Pulau Ubin (closest to beaches)
        
        // Get current temperature
        let currentTemp = 29; // fallback for Singapore
        let currentHumidity = 75; // fallback for Singapore
        let isRealData = true;
        
        if (temperatureData.items && temperatureData.items.length > 0) {
            const tempReading = temperatureData.items[0].readings.find(r => 
                targetStations.includes(r.station_id)
            ) || temperatureData.items[0].readings[0];
            currentTemp = Math.round(tempReading.value);
        } else {
            isRealData = false;
        }
        
        if (humidityData.items && humidityData.items.length > 0) {
            const humidityReading = humidityData.items[0].readings.find(r => 
                targetStations.includes(r.station_id)
            ) || humidityData.items[0].readings[0];
            currentHumidity = Math.round(humidityReading.value);
        } else {
            isRealData = false;
        }        // Process forecast data
        let forecast = [];
        if (forecastData.items && forecastData.items.length > 0) {
            const today = new Date();
            console.log('Processing weather data, today is:', today.toLocaleDateString('en-CA'));
            
            forecast = forecastData.items[0].forecasts.map((day, index) => {
                const date = new Date(day.date);
                const dayName = this.getDayName(date, today, index);
                
                console.log(`Forecast day ${index}: ${day.date} -> ${dayName}`);
                
                return {
                    day: dayName,
                    date: day.date,
                    tempLow: day.temperature.low,
                    tempHigh: day.temperature.high,
                    condition: this.getWeatherEmoji(day.forecast),
                    description: day.forecast,
                    humidity: `${day.relative_humidity.low}-${day.relative_humidity.high}%`,
                    windSpeed: `${day.wind.speed.low}-${day.wind.speed.high} km/h`,
                    windDirection: day.wind.direction
                };
            });
        }

        // Show notification about data source
        if (isRealData) {
            setTimeout(() => {
                this.showNotification('✅ Real-time weather data from NEA Singapore', 'success');
            }, 2000);
        } else {
            setTimeout(() => {
                this.showNotification('⚠️ Using sample weather data (API may be temporarily unavailable)', 'info');
            }, 2000);
        }

        return {
            location: isRealData ? 'Singapore (Live from NEA)' : 'Singapore (Sample Data)',
            temperature: currentTemp,
            condition: this.getCurrentCondition(forecast[0]?.description || ''),
            humidity: currentHumidity,
            windSpeed: forecast[0]?.windSpeed || '10-20 km/h',
            windDirection: forecast[0]?.windDirection || 'Variable',
            updateTime: new Date().toLocaleTimeString('en-SG', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Asia/Singapore'
            }),
            forecast: forecast,
            isRealData: isRealData
        };
    }    getDayName(date, today, index) {
        // Normalize dates to Singapore timezone for proper comparison
        const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        // Calculate difference in days
        const todayTime = new Date(todayStr).getTime();
        const dateTime = new Date(dateStr).getTime();
        const diffDays = Math.round((dateTime - todayTime) / (1000 * 60 * 60 * 24));
        
        console.log(`Date comparison: today=${todayStr}, forecast=${dateStr}, diff=${diffDays} days`);
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday'; // In case of timezone edge cases
        
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    getWeatherEmoji(description) {
        const desc = description.toLowerCase();
        if (desc.includes('thundery') || desc.includes('thunder')) return '⛈️';
        if (desc.includes('showers') || desc.includes('rain')) return '🌧️';
        if (desc.includes('cloudy')) return '☁️';
        if (desc.includes('partly cloudy')) return '⛅';
        if (desc.includes('fair') || desc.includes('sunny')) return '☀️';
        if (desc.includes('windy')) return '💨';
        return '🌤️'; // default partly sunny
    }

    getCurrentCondition(forecastDescription) {
        const desc = forecastDescription.toLowerCase();
        if (desc.includes('thundery')) return 'Thunderstorms';
        if (desc.includes('showers') || desc.includes('rain')) return 'Showers';
        if (desc.includes('cloudy')) return 'Cloudy';
        if (desc.includes('fair')) return 'Fair';
        return 'Partly Cloudy';
    }    displayWeatherData(data) {
        const currentWeather = document.getElementById('weather-current');
        const forecast = document.getElementById('weather-forecast');

        if (currentWeather) {
            currentWeather.innerHTML = `
                <div class="current-weather">
                    <div class="weather-main">
                        <div class="weather-header">
                            <h3>${data.location}</h3>
                            <button onclick="app.loadWeatherData()" class="refresh-btn" aria-label="Refresh weather data" title="Refresh weather data">
                                🔄
                            </button>
                        </div>
                        <div class="current-temp-display">
                            <div class="temp">${data.temperature}°C</div>
                            <div class="condition">${data.condition}</div>
                        </div>
                        <div class="update-time">
                            Updated: ${data.updateTime} SGT
                            ${data.isRealData ? '• Live Data ✅' : '• Sample Data ⚠️'}
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="detail">
                            <span class="label">💧 Humidity:</span>
                            <span class="value">${data.humidity}%</span>
                        </div>
                        <div class="detail">
                            <span class="label">💨 Wind:</span>
                            <span class="value">${data.windSpeed} ${data.windDirection}</span>
                        </div>
                        <div class="detail">
                            <span class="label">📍 Station:</span>
                            <span class="value">East Coast</span>
                        </div>
                        <div class="detail">
                            <span class="label">🏖️ Beach Conditions:</span>
                            <span class="value">${this.getBeachCondition(data.temperature, data.humidity)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (forecast && data.forecast && data.forecast.length > 0) {
            forecast.innerHTML = `
                <div class="forecast-header">
                    <h4 class="forecast-title">4-Day Singapore Weather Forecast</h4>
                    <div class="forecast-source">Source: National Environment Agency (NEA)</div>
                </div>
                <div class="forecast-grid">
                    ${data.forecast.map(day => `
                        <div class="forecast-day ${day.day === 'Today' ? 'today' : ''}">
                            <div class="day-header">
                                <div class="day-name">${day.day}</div>
                                <div class="day-date">${this.formatForecastDate(day.date)}</div>
                            </div>
                            <div class="day-condition">${day.condition}</div>
                            <div class="temp-range">
                                <span class="temp-high">${day.tempHigh}°</span>
                                <span class="temp-separator">/</span>
                                <span class="temp-low">${day.tempLow}°</span>
                            </div>
                            <div class="day-description">${day.description}</div>
                            <div class="day-details">
                                <div class="detail-item">
                                    <span class="detail-icon">💧</span>
                                    <span class="detail-text">${day.humidity}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">💨</span>
                                    <span class="detail-text">${day.windSpeed}</span>
                                </div>
                            </div>
                            ${day.day === 'Today' ? this.getCleanupRecommendation(day.description) : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    getBeachCondition(temperature, humidity) {
        if (temperature >= 30 && humidity <= 70) return 'Excellent 🌟';
        if (temperature >= 28 && humidity <= 80) return 'Very Good 👍';
        if (temperature >= 26 && humidity <= 85) return 'Good ✅';
        if (humidity > 90) return 'Very Humid 💦';
        if (temperature < 24) return 'Cool 🌤️';
        return 'Fair ⛅';
    }

    formatForecastDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    getCleanupRecommendation(description) {
        const desc = description.toLowerCase();
        let recommendation = '';
        let recommendationClass = '';

        if (desc.includes('thundery') || desc.includes('thunder')) {
            recommendation = '⚠️ Monitor weather - potential delays';
            recommendationClass = 'warning';
        } else if (desc.includes('showers') || desc.includes('rain')) {
            recommendation = '🌂 Bring rain gear - cleanup may continue';
            recommendationClass = 'caution';
        } else if (desc.includes('fair') || desc.includes('sunny')) {
            recommendation = '✨ Perfect beach cleanup weather!';
            recommendationClass = 'excellent';
        } else {
            recommendation = '👍 Good conditions for cleanup';
            recommendationClass = 'good';
        }

        return `
            <div class="cleanup-recommendation ${recommendationClass}">
                <div class="recommendation-text">${recommendation}</div>
            </div>
        `;
    }

    // Weather Alert System
    checkWeatherAlerts(weatherData) {
        const alerts = [];
        const today = weatherData.forecast[0];
        
        if (!today) return alerts;

        // Temperature alerts
        if (today.tempHigh >= 35) {
            alerts.push({
                type: 'warning',
                message: '🌡️ Very hot conditions expected - bring extra water and sun protection',
                priority: 'high'
            });
        }

        // Rain alerts
        if (today.description.toLowerCase().includes('thundery')) {
            alerts.push({
                type: 'warning',
                message: '⛈️ Thunderstorms possible - cleanup may be postponed for safety',
                priority: 'high'
            });
        } else if (today.description.toLowerCase().includes('showers')) {
            alerts.push({
                type: 'caution',
                message: '🌧️ Rain expected - bring waterproof gear',
                priority: 'medium'
            });
        }

        // Wind alerts
        const windSpeed = parseInt(today.windSpeed.split('-')[1]) || 20;
        if (windSpeed > 25) {
            alerts.push({
                type: 'caution',
                message: '💨 Strong winds expected - secure loose items',
                priority: 'medium'
            });
        }

        // Humidity alerts
        const humidity = parseInt(today.humidity.split('-')[1]) || 80;
        if (humidity > 90) {
            alerts.push({
                type: 'info',
                message: '💦 Very humid conditions - take frequent breaks',
                priority: 'low'
            });
        }

        // Perfect conditions
        if (alerts.length === 0 && today.tempHigh <= 32 && !today.description.toLowerCase().includes('rain')) {
            alerts.push({
                type: 'success',
                message: '✨ Perfect conditions for beach cleanup!',
                priority: 'low'
            });
        }

        return alerts;
    }

    displayWeatherAlerts(alerts) {
        if (alerts.length === 0) return;

        // Show the most important alert as a notification
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const topAlert = alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])[0];
        
        setTimeout(() => {
            this.showNotification(topAlert.message, topAlert.type);
        }, 3000);

        // Add alerts to the weather display
        const alertsContainer = document.createElement('div');
        alertsContainer.className = 'weather-alerts';
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="weather-alert ${alert.type}">
                <span class="alert-message">${alert.message}</span>
            </div>
        `).join('');

        const weatherSection = document.querySelector('.weather-section .container');
        if (weatherSection) {
            const existingAlerts = weatherSection.querySelector('.weather-alerts');
            if (existingAlerts) {
                existingAlerts.remove();
            }
            weatherSection.appendChild(alertsContainer);
        }
    }

    async loadCleanupEvents() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;

        try {            // Mock cleanup events data
            const mockEvents = [
                {
                    id: 1,
                    title: 'Pasir Ris Beach Weekend Cleanup',
                    date: '2025-06-07',
                    time: '9:00 AM',
                    location: 'Pasir Ris Beach, Singapore',
                    participants: 24,
                    difficulty: 'Easy',
                    description: 'Join us at beautiful Pasir Ris Beach! Meet at Street View Asia coordinates 1.381497, 103.955574. Perfect for beginners!',
                    featured: true
                },
                {
                    id: 2,
                    title: 'East Coast Park Earth Day Special',
                    date: '2025-06-14',
                    time: '8:00 AM',
                    location: 'East Coast Park',
                    participants: 18,
                    difficulty: 'Moderate',
                    description: 'Special Earth Day cleanup with environmental education activities along Singapore\'s coastline.'
                },
                {
                    id: 3,
                    title: 'Sentosa Sunrise Squad',
                    date: '2025-06-21',
                    time: '6:30 AM',
                    location: 'Sentosa Beach',
                    participants: 12,
                    difficulty: 'Easy',
                    description: 'Early morning cleanup followed by a beautiful sunrise viewing at Sentosa.'
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            this.state.events = mockEvents;
            this.displayEvents(mockEvents);
            
        } catch (error) {
            console.error('Events loading error:', error);
            eventsGrid.innerHTML = `
                <div class="events-error">
                    <p>Unable to load cleanup events</p>
                    <button onclick="app.loadCleanupEvents()" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    }

    displayEvents(events) {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card ${event.featured ? 'featured-event' : ''}" role="listitem" tabindex="0" data-event-id="${event.id}">
                ${event.featured ? '<div class="featured-badge">🌟 Featured Event</div>' : ''}
                <div class="event-header">
                    <h3 class="event-title">${event.title}</h3>
                    <span class="event-difficulty ${event.difficulty.toLowerCase()}">${event.difficulty}</span>
                </div>
                <div class="event-details">
                    <div class="event-datetime">
                        <span class="date">📅 ${this.formatDate(event.date)}</span>
                        <span class="time">🕐 ${event.time}</span>
                    </div>
                    <div class="event-location">📍 ${event.location}</div>
                    <div class="event-participants">👥 ${event.participants} signed up</div>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="app.joinEvent(${event.id})">Join Cleanup</button>
                    <button class="btn btn-outline" onclick="app.shareEvent(${event.id})">Share</button>
                </div>
            </div>
        `).join('');

        // Add click handlers for event cards
        eventsGrid.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    const eventId = parseInt(card.dataset.eventId);
                    this.viewEventDetails(eventId);
                }
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    loadUserData() {
        const savedData = localStorage.getItem('shoreSquadUserData');
        if (savedData) {
            this.state.user = { ...this.state.user, ...JSON.parse(savedData) };
        }
    }

    saveUserData() {
        localStorage.setItem('shoreSquadUserData', JSON.stringify(this.state.user));
    }

    updateUserStats() {
        document.getElementById('cleanups-joined').textContent = this.state.user.cleanupsJoined;
        document.getElementById('trash-collected').textContent = this.state.user.trashCollected;
        document.getElementById('squad-members').textContent = this.state.user.squadMembers;
    }

    async loadCleanupLocation() {
        // Update the cleanup info with current data
        const cleanupInfo = document.querySelector('.cleanup-info');
        if (cleanupInfo) {
            // You can update this with dynamic data from an API
            const nextCleanupData = {
                name: 'Pasir Ris Beach',
                location: 'Street View Asia',
                coordinates: { lat: 1.381497, lng: 103.955574 },
                date: 'This Weekend',
                time: '9:00 AM',
                description: 'Join us at Singapore\'s beautiful Pasir Ris Beach for our next cleanup event!'
            };

            // Add click handler for map overlay
            cleanupInfo.addEventListener('click', () => {
                this.showCleanupDetails(nextCleanupData);
            });

            // Add keyboard accessibility
            cleanupInfo.setAttribute('tabindex', '0');
            cleanupInfo.setAttribute('role', 'button');
            cleanupInfo.setAttribute('aria-label', 'View cleanup details for Pasir Ris Beach');
            
            cleanupInfo.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showCleanupDetails(nextCleanupData);
                }
            });
        }
    }

    showCleanupDetails(cleanupData) {
        const message = `
            🏖️ ${cleanupData.name}
            📍 ${cleanupData.location}
            📅 ${cleanupData.date} at ${cleanupData.time}
            
            ${cleanupData.description}
            
            Click "Join Next Cleanup" to sign up!
        `;
        
        this.showNotification(message, 'info');
        
        // Scroll to join button
        setTimeout(() => {
            const joinButton = document.getElementById('join-cleanup-btn');
            if (joinButton) {
                joinButton.focus();
                joinButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000);
    }

    // Event Handlers
    joinCleanup() {
        this.showNotification('Awesome! Finding the perfect cleanup for you...', 'success');
        // Scroll to cleanups section
        document.getElementById('cleanups').scrollIntoView({ behavior: 'smooth' });
    }

    createEvent() {
        this.showNotification('Event creation coming soon! Currently in development.', 'info');
    }

    joinEvent(eventId) {
        const event = this.state.events.find(e => e.id === eventId);
        if (event) {
            this.state.user.cleanupsJoined++;
            this.saveUserData();
            this.updateUserStats();
            this.showNotification(`You're signed up for ${event.title}! 🎉`, 'success');
              // Simulate adding points for trash collected
            setTimeout(() => {
                this.state.user.trashCollected += Math.floor(Math.random() * 5) + 2; // 2-6 kg range
                this.saveUserData();
                this.updateUserStats();
            }, 2000);
        }
    }

    shareEvent(eventId) {
        const event = this.state.events.find(e => e.id === eventId);
        if (event && navigator.share) {
            navigator.share({
                title: event.title,
                text: `Join me for a beach cleanup: ${event.description}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback for browsers without Web Share API
            this.copyToClipboard(`Check out this beach cleanup: ${event.title} - ${window.location.href}`);
            this.showNotification('Event link copied to clipboard!', 'success');
        }
    }

    viewEventDetails(eventId) {
        const event = this.state.events.find(e => e.id === eventId);
        if (event) {
            this.showNotification(`Viewing details for ${event.title}`, 'info');
            // In a real app, this would open a modal or navigate to a detail page
        }
    }

    inviteFriends() {
        if (navigator.share) {
            navigator.share({
                title: 'Join ShoreSquad!',
                text: 'Rally your crew and join me in cleaning up our beautiful beaches! 🏖️',
                url: window.location.href
            }).catch(console.error);
        } else {
            this.copyToClipboard(`Join me on ShoreSquad for beach cleanups! ${window.location.href}`);
            this.showNotification('Invitation link copied to clipboard!', 'success');
        }
        
        // Simulate adding a squad member
        setTimeout(() => {
            this.state.user.squadMembers++;
            this.saveUserData();
            this.updateUserStats();
        }, 1000);
    }    shareProgress() {
        const message = `I've joined ${this.state.user.cleanupsJoined} beach cleanups and helped collect ${this.state.user.trashCollected} kilograms of trash with my ${this.state.user.squadMembers} squad members! 🌊 #ShoreSquad #BeachCleanup`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My ShoreSquad Progress',
                text: message,
                url: window.location.href
            }).catch(console.error);
        } else {
            this.copyToClipboard(message);
            this.showNotification('Progress shared to clipboard!', 'success');
        }
    }

    loadMoreEvents() {
        this.showNotification('Loading more cleanup events...', 'info');
        // Simulate loading more events
        setTimeout(() => {
            this.showNotification('No more events available at this time. Check back soon!', 'info');
        }, 1000);
    }

    // Utility Functions
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(console.error);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            maxWidth: '400px',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: type === 'success' ? '#20B2AA' : 
                            type === 'error' ? '#FF6B6B' : 
                            type === 'info' ? '#0077BE' : '#666'
        });

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => this.removeNotification(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ShoreSquadApp();
});

// Service Worker registration for PWA capabilities (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoreSquadApp;
}
