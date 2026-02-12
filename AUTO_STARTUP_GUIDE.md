# Auto-Startup Guide for Travel Journal System
# Created: 2026-02-03
# Purpose: Ensure system starts automatically after laptop restart

## 🚀 Method 1: Windows Task Scheduler (Recommended)

### Create Startup Task
1. Open Task Scheduler (Press Win + R, type `taskschd.msc`)
2. Click "Create Basic Task..."
3. Name: `Start Travel Journal System`
4. Trigger: "When the computer starts"
5. Action: "Start a program"
6. Program/script:
   ```
   cmd /c "C:\Users\ACER\workandshop\START_TRAVELLO.bat"
   ```
7. Conditions: Uncheck "Start only if user is logged on"
8. Click Finish

## 🔧 Method 2: Windows Startup Folder

### Create Shortcut
1. Press `Win + R`, type `shell:startup`
2. Copy `START_TRAVELLO.bat` to startup folder
3. Right-click → Properties → Advanced → Run as administrator

## 📂 Method 3: Windows Services (Advanced)

### Install as Service
1. Download NSSM (Non-Sucking Service Manager)
2. Create service configuration:
   ```xml
   <service>
     <id>TravelJournal</id>
     <name>Travel Journal System</name>
     <description>Travel Journal Management Backend</description>
     <executable>C:\Users\ACER\workandshop\be-travello\server-minimal.js</executable>
     <arguments></arguments>
     <logmode>append</logmode>
     <depend></depend>
     <startmode>auto</startmode>
   </service>
   ```

## 🌐 Browser Auto-Start

### Chrome Auto-Open
1. Right-click Chrome shortcut → Properties
2. Target: `"C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:5173/admin/landing/travel-journal`
3. Add to startup folder

### Edge Auto-Open
1. Right-click Edge shortcut → Properties
2. Target: `"msedge.exe" http://localhost:5173/admin/landing/travel-journal`
3. Add to startup folder

## 📋 File Locations

### Main Scripts
- **Main Start**: `C:\Users\ACER\workandshop\START_TRAVELLO.bat`
- **Restart Only**: `C:\Users\ACER\workandshop\RESTART_TRAVELLO.bat`
- **Config**: `C:\Users\ACER\workandshop\TRAVEL_JOURNAL_FINAL_CONFIG.md`

### Important Files
- **Backend**: `C:\Users\ACER\workandshop\be-travello\server-minimal.js`
- **Frontend**: `C:\Users\ACER\workandshop\fe-travello\package.json`
- **API Routes**: `C:\Users\ACER\workandshop\be-travello\src\routes\travel-journal.routes.js`

## ⚙️ Configuration Files

### Environment Variables
Create `.env` files if needed:
```bash
# Backend (.env)
NODE_ENV=production
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

### Port Configuration
- **Backend**: Port 5000 (change in server-minimal.js)
- **Frontend**: Port 5173 (change in vite.config.js)

## 🔍 Troubleshooting Auto-Startup

### Common Issues
1. **Port Already in Use**
   - Check: `netstat -an | findstr ":5000"`
   - Kill processes: `taskkill /F /IM node.exe`

2. **Permission Issues**
   - Run as administrator
   - Check UAC settings

3. **Path Issues**
   - Verify file paths in scripts
   - Use absolute paths: `C:\Users\ACER\workandshop\...`

### Debug Mode
Add to `START_TRAVELLO.bat`:
```batch
@echo off
echo Debug Mode Enabled
echo.
cd /d "C:\Users\ACER\workandshop\be-travello"
node server-minimal.js --debug
pause
```

## 📱 Auto-Open URLs

### Add to Scripts
```batch
# Add these lines to START_TRAVELLO.bat
start http://localhost:5173/admin/landing/travel-journal
start http://localhost:5173
start http://localhost:5000/api
```

## 🔄 Maintenance

### Weekly Tasks
1. Check for broken image paths
2. Review server logs
3. Update sample data if needed

### Monthly Tasks
1. Update dependencies
2. Clean up temporary files
3. Review performance metrics

## 📞 System Requirements

### Minimum Requirements
- Windows 10/11
- Node.js 16+ (for backend)
- npm 7+ (for frontend)
- 4GB RAM minimum
- 2GB disk space

### Recommended
- Windows 11
- Node.js 18+
- npm 9+
- 8GB RAM
- 5GB disk space

---

**Status: ✅ Ready for Auto-Startup**  
**Last Updated: 2026-02-03**  
**Auto-Startup: Configured**
