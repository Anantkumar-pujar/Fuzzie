@echo off
echo Testing Google Drive Notification Endpoint
echo.

curl -k -X POST https://localhost:3000/api/drive-activity/notification ^
  -H "Content-Type: application/json" ^
  -H "x-goog-resource-id: 58uVhpQsd1yV1bv9Z2BQHPuG6Ak" ^
  -H "x-goog-message-number: test-123456789" ^
  -v

echo.
echo Test complete.
pause
