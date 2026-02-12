const { spawn } = require('child_process');
const path = require('path');

// Check if XAMPP MySQL is running
const checkMySQL = () => {
  return new Promise((resolve, reject) => {
    const mysql = spawn('C:\\xampp\\mysql\\bin\\mysql.exe', ['-u', 'root', '-e', 'SELECT 1;']);
    
    mysql.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    mysql.on('error', () => {
      resolve(false);
    });
  });
};

// Start XAMPP MySQL
const startMySQL = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting XAMPP MySQL...');
    const mysql = spawn('C:\\xampp\\mysql\\bin\\mysqld.exe', [
      '--defaults-file=C:\\xampp\\mysql\\bin\\my.ini',
      '--standalone'
    ]);
    
    mysql.stdout.on('data', (data) => {
      console.log(`MySQL: ${data}`);
    });
    
    mysql.stderr.on('data', (data) => {
      console.error(`MySQL Error: ${data}`);
    });
    
    mysql.on('close', (code) => {
      console.log(`MySQL process exited with code ${code}`);
    });
    
    // Wait a bit for MySQL to start
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

// Start backend server
const startBackend = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Travello Backend...');
    const backend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'be-travello'),
      stdio: 'inherit',
      shell: true
    });
    
    backend.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
    
    resolve(backend);
  });
};

// Start frontend server
const startFrontend = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Travello Frontend...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'fe-travello'),
      stdio: 'inherit',
      shell: true
    });
    
    frontend.on('close', (code) => {
      console.log(`Frontend process exited with code ${code}`);
    });
    
    resolve(frontend);
  });
};

// Main startup function
const startAll = async () => {
  try {
    console.log('========================================');
    console.log('       TRAVELLO - XAMPP STARTUP');
    console.log('========================================');
    console.log();
    
    // Check and start MySQL
    const mysqlRunning = await checkMySQL();
    if (!mysqlRunning) {
      await startMySQL();
      
      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 10000));
      const mysqlRunningAfterStart = await checkMySQL();
      if (!mysqlRunningAfterStart) {
        console.error('❌ Failed to start MySQL');
        console.log('💡 Please check XAMPP Control Panel');
        process.exit(1);
      }
    }
    
    console.log('✅ MySQL is running');
    console.log();
    
    // Start backend and frontend
    const backendProcess = await startBackend();
    await new Promise(resolve => setTimeout(resolve, 5000));
    const frontendProcess = await startFrontend();
    
    console.log();
    console.log('========================================');
    console.log('       ✅ ALL SERVICES STARTED');
    console.log('========================================');
    console.log('📍 Frontend: http://localhost:5173');
    console.log('📍 Backend:  http://localhost:5000');
    console.log('📍 phpMyAdmin: http://localhost/phpmyadmin');
    console.log();
    console.log('💡 Press Ctrl+C to stop all services');
    
    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log();
      console.log('🛑 Shutting down services...');
      
      if (backendProcess) {
        backendProcess.kill('SIGTERM');
      }
      
      if (frontendProcess) {
        frontendProcess.kill('SIGTERM');
      }
      
      console.log('✅ All services stopped');
      process.exit(0);
    };
    
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
};

// Start everything
startAll();
