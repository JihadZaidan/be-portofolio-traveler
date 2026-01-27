// Script untuk menambahkan GitHub OAuth ke auth.html

const fs = require('fs');
const path = require('path');

// Baca file auth.html
const authHtmlPath = path.join(__dirname, 'public', 'auth.html');
let content = fs.readFileSync(authHtmlPath, 'utf8');

// Tambahkan CSS untuk GitHub button
const githubCSS = `
        .btn-github {
            background-color: #24292e;
            color: white;
            border: 1px solid #30363d;
        }
        
        .btn-github:hover {
            background-color: #30363d;
            border-color: #8b949e;
        }
`;

// Tambahkan CSS setelah .btn-google
content = content.replace(
    /(\.btn-google:hover \{[^}]+\}\s*)/,
    `$1${githubCSS}`
);

// Tambahkan GitHub login function
const githubFunction = `
        // GitHub Login
        function githubLogin() {
            showMessage('Mengalihkan ke GitHub...', 'info');
            window.location.href = \`\${API_BASE}/auth/github\`;
        }
`;

// Tambahkan function setelah googleLogin
content = content.replace(
    /(function googleLogin\(\) \{[^}]+\}\s*)/,
    `$1${githubFunction}`
);

// Tambahkan GitHub button setelah Google button
const githubButton = `
            <!-- GitHub Login -->
            <button onclick="githubLogin()" class="w-full btn-github py-3 rounded-lg font-semibold flex items-center justify-center space-x-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Login dengan GitHub</span>
            </button>
`;

// Tambahkan button setelah Google button
content = content.replace(
    /(<!-- Google Login -->[\s\S]*?<\/button>\s*)/,
    `$1${githubButton}`
);

// Update auth callback handler untuk GitHub
content = content.replace(
    /(Check for auth callback[\s\S]*?else if \(auth === 'error'\) \{[^}]+\})/,
    `$1
            else if (auth === 'github_success' && token) {
                showMessage('Login dengan GitHub berhasil!', 'success');
                localStorage.setItem('token', token);
                
                // Get user info
                fetch(\`\${API_BASE}/auth/me\`, {
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('user', JSON.stringify(data.data.user));
                        setTimeout(() => {
                            window.location.href = '/chat.html';
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('Get user info error:', error);
                });
            }`
);

// Tulis kembali file
fs.writeFileSync(authHtmlPath, content);

console.log('GitHub OAuth berhasil ditambahkan ke auth.html!');
