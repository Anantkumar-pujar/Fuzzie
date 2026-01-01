@echo off
echo ========================================
echo Creating Portable Fuzzie Package
echo ========================================
echo.

REM Create distribution folder
if not exist "portable-fuzzie" mkdir portable-fuzzie
if not exist "portable-fuzzie\.next" mkdir portable-fuzzie\.next

echo Step 1/5: Copying standalone build...
xcopy /E /I /Y ".next\standalone" "portable-fuzzie\.next\standalone"

echo Step 2/5: Copying static files...
xcopy /E /I /Y ".next\static" "portable-fuzzie\.next\static"
xcopy /E /I /Y "public" "portable-fuzzie\public"

echo Step 3/5: Copying Prisma files...
if exist "prisma" xcopy /E /I /Y "prisma" "portable-fuzzie\prisma"

echo Step 4/5: Creating environment file...
copy ".env" "portable-fuzzie\.env.production"

echo Step 5/5: Creating launcher scripts...

REM Create Windows launcher
(
echo @echo off
echo echo ========================================
echo echo    Fuzzie Workflow Automation
echo echo ========================================
echo echo.
echo echo Starting server on port 3000...
echo echo.
echo echo Press Ctrl+C to stop the server
echo echo.
echo cd "%%~dp0.next\standalone"
echo node server.js
) > "portable-fuzzie\START-FUZZIE.bat"

REM Create README
(
echo ========================================
echo FUZZIE WORKFLOW AUTOMATION - PORTABLE
echo ========================================
echo.
echo REQUIREMENTS:
echo - Node.js 18 or later must be installed
echo - Download from: https://nodejs.org/
echo.
echo QUICK START:
echo 1. Double-click START-FUZZIE.bat
echo 2. Open browser to: http://localhost:3000
echo 3. Press Ctrl+C in the console to stop
echo.
echo CONFIGURATION:
echo - Edit .env.production to change settings
echo - Update NEXT_PUBLIC_URL if using ngrok
echo.
echo NGROK SETUP ^(for webhooks^):
echo 1. Install ngrok: https://ngrok.com/download
echo 2. Run: ngrok http 3000
echo 3. Update NEXT_PUBLIC_URL in .env.production
echo 4. Restart the application
echo.
echo TROUBLESHOOTING:
echo - Make sure Node.js is installed and in PATH
echo - Check firewall allows port 3000
echo - Verify database connection in .env.production
echo.
echo For support, check the documentation files
echo ========================================
) > "portable-fuzzie\README.txt"

echo.
echo ========================================
echo ✅ Portable package created successfully!
echo ========================================
echo.
echo Location: portable-fuzzie\
echo.
echo To distribute:
echo 1. Zip the "portable-fuzzie" folder
echo 2. Share the ZIP file
echo 3. Recipients should:
echo    - Extract the ZIP
echo    - Install Node.js if needed
echo    - Run START-FUZZIE.bat
echo.
echo ========================================
pause
