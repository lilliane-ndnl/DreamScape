@echo off
echo Checking for changes...
git status
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "Update: %date% %time%"
echo.
echo Pushing to GitHub...
git push
echo.
echo Done!
pause 