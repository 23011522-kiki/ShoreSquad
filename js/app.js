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
    }

    async loadWeatherData() {
        const weatherContainer = document.getElementById('weather-current');
        if (!weatherContainer) return;

        try {            // Simulate weather API call with mock data
            // In a real app, you'd use a weather API like OpenWeatherMap
            const mockWeatherData = {
                location: 'Pasir Ris Beach, Singapore',
                temperature: 26,
                condition: 'Sunny',
                humidity: 65,
                windSpeed: 19,
                uvIndex: 6,
                forecast: [
                    { day: 'Today', temp: 26, condition: '☀️', description: 'Perfect cleanup weather!' },
                    { day: 'Tomorrow', temp: 24, condition: '⛅', description: 'Partly cloudy' },
                    { day: 'Friday', temp: 22, condition: '🌧️', description: 'Light rain expected' }
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.displayWeatherData(mockWeatherData);
            
        } catch (error) {
            console.error('Weather loading error:', error);
            weatherContainer.innerHTML = `
                <div class="weather-error">
                    <p>Unable to load weather data</p>
                    <button onclick="app.loadWeatherData()" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    }

    displayWeatherData(data) {
        const currentWeather = document.getElementById('weather-current');
        const forecast = document.getElementById('weather-forecast');

        if (currentWeather) {
            currentWeather.innerHTML = `
                <div class="current-weather">                    <div class="weather-main">
                        <h3>${data.location}</h3>
                        <div class="temp">${data.temperature}°C</div>
                        <div class="condition">${data.condition}</div>
                    </div>
                    <div class="weather-details">
                        <div class="detail">
                            <span class="label">Humidity:</span>
                            <span class="value">${data.humidity}%</span>
                        </div>
                        <div class="detail">
                            <span class="label">Wind:</span>
                            <span class="value">${data.windSpeed} km/h</span>
                        </div>
                        <div class="detail">
                            <span class="label">UV Index:</span>
                            <span class="value">${data.uvIndex}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (forecast && data.forecast) {
            forecast.innerHTML = data.forecast.map(day => `                <div class="forecast-day">
                    <div class="day-name">${day.day}</div>
                    <div class="day-condition">${day.condition}</div>
                    <div class="day-temp">${day.temp}°C</div>
                    <div class="day-description">${day.description}</div>
                </div>
            `).join('');
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
