@echo off
setlocal

echo.
echo === Push all files in this folder to GitHub repo kholaidy/demo (branch main) ===
echo.

rem Go to the folder of this script
cd /d "%~dp0"

rem If this is not a git repo yet, initialize and connect to GitHub
if not exist ".git" (
    echo Initializing git repository in this folder...
    git init
    git branch -M main
    git remote add origin https://github.com/kholaidy/demo.git
)

rem Add all files
git add -A

rem Commit (if there are changes)
git commit -m "update from batch script" || (
    echo.
    echo No new changes to commit.
    goto end
)

rem Push to GitHub
git push -u origin main

echo.
echo Done. All files pushed to GitHub.

:end
echo.
pause
endlocal
