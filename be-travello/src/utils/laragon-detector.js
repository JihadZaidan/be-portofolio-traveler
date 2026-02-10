// Laragon Environment Detection Utility
// File: be-travello/src/utils/laragon-detector.js

const fs = require('fs');
const path = require('path');

class LaragonDetector {
    static isLaragonEnvironment() {
        // Check for Laragon installation
        const laragonPaths = [
            'C:\\laragon',
            'D:\\laragon',
            'C:\\laragon-lite',
            'D:\\laragon-lite'
        ];
        
        const laragonExists = laragonPaths.some(laragonPath => {
            try {
                return fs.existsSync(laragonPath) && fs.existsSync(path.join(laragonPath, 'laragon.exe'));
            } catch (error) {
                return false;
            }
        });
        
        // Check for Laragon environment variables
        const isLaragonEnv = process.env.LARAGON === 'true' || 
                           process.env.SERVER_SOFTWARE === 'Laragon' ||
                           process.env.HTTP_SERVER === 'Laragon';
        
        // Check for Laragon specific directories
        const wwwPath = 'C:\\laragon\\www';
        const hasLaragonWWW = fs.existsSync(wwwPath);
        
        // Check if running in Laragon context
        const currentDir = process.cwd();
        const isInLaragonWWW = currentDir.includes('laragon') && currentDir.includes('www');
        
        return {
            isLaragon: laragonExists || isLaragonEnv || isInLaragonWWW,
            hasLaragonInstallation: laragonExists,
            hasLaragonWWW: hasLaragonWWW,
            isInLaragonWWW: isInLaragonWWW,
            laragonPaths: laragonPaths.filter(p => fs.existsSync(p))
        };
    }
    
    static getLaragonConfig() {
        const detection = this.isLaragonEnvironment();
        
        if (!detection.isLaragon) {
            return {
                enabled: false,
                message: 'Laragon not detected'
            };
        }
        
        return {
            enabled: true,
            mysql: {
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: ''
            },
            apache: {
                port: 80,
                documentRoot: 'C:\\laragon\\www'
            },
            phpmyadmin: {
                url: 'http://localhost/phpmyadmin'
            },
            virtualHost: {
                enabled: true,
                domain: 'travello.local'
            },
            paths: {
                laragon: detection.laragonPaths[0] || 'C:\\laragon',
                www: 'C:\\laragon\\www',
                logs: 'C:\\laragon\\logs',
                etc: 'C:\\laragon\\etc'
            }
        };
    }
    
    static logLaragonInfo() {
        const config = this.getLaragonConfig();
        
        if (config.enabled) {
            console.log('🐉 Laragon Environment Detected');
            console.log(`📁 Laragon Path: ${config.paths.laragon}`);
            console.log(`🌐 Apache Port: ${config.apache.port}`);
            console.log(`📊 MySQL Port: ${config.mysql.port}`);
            console.log(`🗄️ phpMyAdmin: ${config.phpmyadmin.url}`);
            
            if (config.virtualHost.enabled) {
                console.log(`🏠 Virtual Host: ${config.virtualHost.domain}`);
            }
            
            console.log('✅ Laragon integration active');
        } else {
            console.log('⚠️  Laragon not detected - using default configuration');
        }
    }
    
    static setupLaragonEnvironment() {
        const config = this.getLaragonConfig();
        
        if (!config.enabled) {
            return false;
        }
        
        // Set environment variables for Laragon
        process.env.LARAGON = 'true';
        process.env.DB_HOST = config.mysql.host;
        process.env.DB_PORT = config.mysql.port.toString();
        process.env.DB_USER = config.mysql.user;
        process.env.DB_PASSWORD = config.mysql.password;
        
        // Update CORS origins for Laragon
        if (config.virtualHost.enabled) {
            process.env.CORS_ORIGIN = `http://${config.virtualHost.domain}`;
        }
        
        return true;
    }
}

module.exports = LaragonDetector;
