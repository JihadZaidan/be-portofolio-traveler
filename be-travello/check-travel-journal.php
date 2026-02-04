<?php
/**
 * Script untuk mengecek dan membuat tabel travel_journals di phpMyAdmin
 * Jalankan di browser: http://localhost/be-travello/check-travel-journal.php
 */

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'travello_db';

try {
    // Connect to database
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "<h2>🗄️ Database Connection Status</h2>";
    echo "<p>✅ Connected to database: <strong>$database</strong></p>";
    
    // Check if table exists
    $tableName = 'travel_journals';
    $result = $conn->query("SHOW TABLES LIKE '$tableName'");
    
    echo "<h2>📋 Table Status</h2>";
    
    if ($result->num_rows > 0) {
        echo "<p>✅ Table <strong>$tableName</strong> exists</p>";
        
        // Show table structure
        echo "<h3>📊 Table Structure</h3>";
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
        echo "<tr style='background-color: #f0f0f0;'>";
        echo "<th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th>";
        echo "</tr>";
        
        $structure = $conn->query("DESCRIBE $tableName");
        while ($row = $structure->fetch_assoc()) {
            echo "<tr>";
            echo "<td><strong>{$row['Field']}</strong></td>";
            echo "<td>{$row['Type']}</td>";
            echo "<td>{$row['Null']}</td>";
            echo "<td>{$row['Key']}</td>";
            echo "<td>{$row['Default']}</td>";
            echo "<td>{$row['Extra']}</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Show current data
        echo "<h3>📝 Current Data</h3>";
        $data = $conn->query("SELECT * FROM $tableName ORDER BY created_at DESC");
        
        if ($data->num_rows > 0) {
            echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
            echo "<tr style='background-color: #f0f0f0;'>";
            echo "<th>ID</th><th>Name</th><th>Cover</th><th>Images</th><th>Status</th><th>Created At</th>";
            echo "</tr>";
            
            while ($row = $data->fetch_assoc()) {
                // Handle JSON decode safely
                $imagesArray = json_decode($row['images'], true);
                $imageCount = is_array($imagesArray) ? count($imagesArray) : 0;
                $firstImage = is_array($imagesArray) && $imageCount > 0 ? $imagesArray[0] : 'No images';
                
                echo "<tr>";
                echo "<td><code style='font-size: 10px;'>" . substr($row['id'], 0, 8) . "...</code></td>";
                echo "<td><strong>{$row['name']}</strong></td>";
                echo "<td><img src='{$row['cover']}' width='50' height='50' style='object-fit: cover;' onerror=\"this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTVlN2ViIi8+CjxwYXRoIGQ9Ik0yNSAzMkwxNSAyMkwzNSAyMEwyNSAzMloiIGZpbGw9IiM5Y2EzYWYiLz4KPHN2Zz4K'\"></td>";
                echo "<td>" . htmlspecialchars($firstImage) . " (" . ($imageCount - 1) . " more)</td>";
                echo "<td><span style='color: {$row['status'] == 'active' ? 'green' : 'red'}; font-weight: bold;'>{$row['status']}</span></td>";
                echo "<td>" . date('M j, Y H:i', strtotime($row['created_at'])) . "</td>";
                echo "</tr>";
            }
            echo "</table>";
            
            // Show raw data for debugging
            echo "<h3>🔍 Raw Data (JSON)</h3>";
            echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;'>";
            $rawData = [];
            $data->data_seek(0); // Reset pointer
            while ($row = $data->fetch_assoc()) {
                $rawData[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'cover' => $row['cover'],
                    'images' => json_decode($row['images'], true),
                    'status' => $row['status'],
                    'created_at' => $row['created_at']
                ];
            }
            echo json_encode($rawData, JSON_PRETTY_PRINT);
            echo "</pre>";
            
        } else {
            echo "<p>📭 No data in table yet</p>";
            echo "<p><em>💡 Tip: Add data via <a href='http://localhost:5173/admin/landing/travel-journal' target='_blank'>Admin Panel</a> or API</em></p>";
        }
        
    } else {
        echo "<p>❌ Table <strong>$tableName</strong> does not exist</p>";
        
        // Create table
        echo "<h3>🔧 Creating Table...</h3>";
        $createTableSQL = "
        CREATE TABLE $tableName (
            id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
            name VARCHAR(255) NOT NULL,
            cover TEXT NOT NULL,
            images JSON NOT NULL DEFAULT (JSON_ARRAY()),
            status ENUM('active', 'expired') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_name (name),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        if ($conn->query($createTableSQL)) {
            echo "<p>✅ Table <strong>$tableName</strong> created successfully!</p>";
        } else {
            echo "<p>❌ Error creating table: " . $conn->error . "</p>";
        }
    }
    
    echo "<h2>🔗 Quick Links</h2>";
    echo "<ul>";
    echo "<li><a href='http://localhost/phpmyadmin/db.php?db=$database&table=$tableName' target='_blank'>📊 Open in phpMyAdmin</a></li>";
    echo "<li><a href='http://localhost:5000/api/travel-journal' target='_blank'>🔌 View API Data</a></li>";
    echo "<li><a href='http://localhost:5173/admin/landing/travel-journal' target='_blank'>🎨 Admin Panel</a></li>";
    echo "<li><a href='http://localhost:5173/#stories' target='_blank'>👁️ Frontend View</a></li>";
    echo "<li><a href='?refresh=1' style='color: orange;'>🔄 Refresh Page</a></li>";
    echo "</ul>";
    
    echo "<h2>🧪 Test API Connection</h2>";
    echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px;'>";
    echo "<button onclick='testAPI()' style='background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>🔌 Test API Connection</button>";
    echo "<div id='apiResult' style='margin-top: 10px;'></div>";
    echo "</div>";
    
    echo "<script>
    function testAPI() {
        const resultDiv = document.getElementById('apiResult');
        resultDiv.innerHTML = '⏳ Testing API...';
        
        fetch('http://localhost:5000/api/travel-journal')
            .then(response => response.json())
            .then(data => {
                resultDiv.innerHTML = '✅ API Response: <pre style=\"background: #e8f5e8; padding: 10px; border-radius: 5px; font-size: 12px; overflow-x: auto;\">' + 
                    JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                resultDiv.innerHTML = '❌ API Error: <pre style=\"background: #ffe8e8; padding: 10px; border-radius: 5px; color: red;\">' + 
                    error.message + '</pre>';
            });
    }
    
    // Auto-test on page load
    window.onload = function() {
        setTimeout(testAPI, 1000);
    };
    </script>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<h2>❌ Error</h2>";
    echo "<p style='color: red; font-weight: bold;'>" . $e->getMessage() . "</p>";
    
    echo "<h3>🔧 Troubleshooting</h3>";
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;'>";
    echo "<h4>Common Issues:</h4>";
    echo "<ul>";
    echo "<li><strong>XAMPP MySQL not running</strong> - Start XAMPP and enable MySQL service</li>";
    echo "<li><strong>Database not found</strong> - Create database 'travello_db' in phpMyAdmin</li>";
    echo "<li><strong>Wrong credentials</strong> - Default: username='root', password='empty'</li>";
    echo "<li><strong>Port conflict</strong> - Make sure MySQL runs on port 3306</li>";
    echo "</ul>";
    
    echo "<h4>Quick Fix Steps:</h4>";
    echo "<ol>";
    echo "<li>Open XAMPP Control Panel</li>";
    echo "<li>Start Apache and MySQL services</li>";
    echo "<li>Open phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
    echo "<li>Create database 'travello_db' if not exists</li>";
    echo "<li>Refresh this page</li>";
    echo "</ol>";
    echo "</div>";
    
    echo "<h3>🔍 Debug Information</h3>";
    echo "<div style='background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;'>";
    echo "<strong>PHP Version:</strong> " . PHP_VERSION . "<br>";
    echo "<strong>MySQL Extension:</strong> " . (extension_loaded('mysqli') ? '✅ Loaded' : '❌ Not Loaded') . "<br>";
    echo "<strong>Database Host:</strong> $host<br>";
    echo "<strong>Database Name:</strong> $database<br>";
    echo "<strong>Username:</strong> $username<br>";
    echo "<strong>Current Time:</strong> " . date('Y-m-d H:i:s') . "<br>";
    echo "</div>";
}
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
table { margin: 10px 0; }
th { background-color: #f0f0f0; }
h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
h3 { color: #666; }
a { color: #007bff; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
