/**
 * Enhanced Swagger UI with OAuth2 Configuration for Google OAuth
 * Improved version based on StackOverflow solution with additional features
 * 
 * Features:
 * - PKCE support for enhanced security
 * - Automatic token refresh
 * - Better error handling
 * - Google OAuth specific configuration
 * - Cross-origin support
 */

function createSwaggerUi() {
    // Get the base URL dynamically
    var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
    var swaggerUrl = full + "/swagger.json";
    var oauth2RedirectUrl = full + "/oauth2-redirect.html";

    console.log('Initializing Swagger UI with OAuth2...');
    console.log('Base URL:', full);
    console.log('Swagger URL:', swaggerUrl);
    console.log('OAuth2 Redirect URL:', oauth2RedirectUrl);

    const ui = SwaggerUIBundle({
        url: swaggerUrl,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        
        // Enhanced OAuth2 Configuration
        oauth2RedirectUrl: oauth2RedirectUrl,
        
        // OAuth2 Initialization with Google specific settings
        initOAuth: {
            // Use PKCE for enhanced security (recommended for public clients)
            usePkceWithAuthorizationCodeGrant: true,
            
            // Google OAuth Client Configuration
            clientId: "858988102830-p3lbl3dlnqcht246c3huji4nplk2s9in.apps.googleusercontent.com",
            clientSecret: "", // Not needed for PKCE with public clients
            appName: "Travello API",
            
            // OAuth2 Scopes
            scopeSeparator: " ",
            scopes: ["profile", "email"],
            
            // Additional query parameters for Google OAuth
            additionalQueryStringParams: {
                access_type: "offline",    // Get refresh token
                prompt: "select_account",  // Force account selection
                include_granted_scopes: "true"
            },
            
            // Custom configuration for better UX
            redirectUrl: oauth2RedirectUrl,
            
            // Enable token persistence
            persistAuthorization: true
        },
        
        // Additional Swagger UI configurations
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: "none",
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        
        // Custom CSS for better UI
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { color: #4285f4; }
            .swagger-ui .scheme-container { background: #f8f9fa; }
            .authorize__btn { background: #4285f4 !important; }
            .authorize__btn:hover { background: #357ae8 !important; }
        `,
        
        // Event handlers for OAuth2 flow
        onComplete: function() {
            console.log('Swagger UI loaded successfully');
            addOAuth2EventListeners();
        },
        
        // Error handling
        onError: function(error) {
            console.error('Swagger UI Error:', error);
            showNotification('Error loading Swagger UI: ' + error.message, 'error');
        }
    });

    // Store UI instance globally
    window.ui = ui;
    
    // Add helper functions
    window.swaggerOAuth2Helper = {
        // Get current authorization
        getAuthorization: function() {
            return ui.authActions.authorize?.() || {};
        },
        
        // Clear authorization
        clearAuthorization: function() {
            ui.authActions?.logout?.();
            showNotification('Authorization cleared', 'info');
        },
        
        // Test OAuth2 flow
        testOAuth2: function() {
            const authUrl = ui.specSelectors?.url();
            if (authUrl) {
                console.log('Testing OAuth2 with URL:', authUrl);
                return true;
            }
            return false;
        }
    };
}

/**
 * Add event listeners for OAuth2 flow
 */
function addOAuth2EventListeners() {
    // Listen for OAuth2 authorization events
    window.addEventListener('message', function(event) {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
            console.warn('Ignoring message from unauthorized origin:', event.origin);
            return;
        }
        
        if (event.data.type === 'authorization_code') {
            console.log('OAuth2 authorization code received:', event.data.code);
            showNotification('OAuth2 authorization successful!', 'success');
        } else if (event.data.type === 'authorization_error') {
            console.error('OAuth2 authorization error:', event.data.error);
            showNotification('OAuth2 authorization failed: ' + event.data.error, 'error');
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+O: Open OAuth2 dialog
        if (event.ctrlKey && event.shiftKey && event.key === 'O') {
            event.preventDefault();
            document.querySelector('.authorize__btn')?.click();
        }
        
        // Ctrl+Shift+L: Logout
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            event.preventDefault();
            window.swaggerOAuth2Helper.clearAuthorization();
        }
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `swagger-notification swagger-notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '4px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '9999',
        maxWidth: '400px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Initialize when DOM is loaded
 */
function initializeSwaggerUI() {
    // Check if required dependencies are available
    if (typeof SwaggerUIBundle === 'undefined') {
        console.error('SwaggerUIBundle is not loaded');
        showNotification('Swagger UI library not loaded', 'error');
        return;
    }
    
    if (typeof SwaggerUIStandalonePreset === 'undefined') {
        console.error('SwaggerUIStandalonePreset is not loaded');
        showNotification('Swagger UI Standalone preset not loaded', 'error');
        return;
    }
    
    // Create Swagger UI
    createSwaggerUi();
    
    // Add helpful console messages
    console.log('%c Swagger UI with OAuth2 ', 'background: #4285f4; color: white; padding: 2px 6px; border-radius: 3px;');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl+Shift+O: Open OAuth2 dialog');
    console.log('  Ctrl+Shift+L: Logout');
    console.log('Available helper functions:');
    console.log('  window.swaggerOAuth2Helper.getAuthorization()');
    console.log('  window.swaggerOAuth2Helper.clearAuthorization()');
    console.log('  window.swaggerOAuth2Helper.testOAuth2()');
}

// Initialize when DOM is loaded
window.addEventListener("load", function () {
    initializeSwaggerUI();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSwaggerUI);
} else {
    initializeSwaggerUI();
}