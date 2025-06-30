@echo off
setlocal enabledelayedexpansion

echo 🔍 Running ESLint to fix fixable issues...
npx eslint --fix "src\**\*.js" "src\**\*.jsx"

echo 🔎 Checking for unused dependencies...
npx depcheck

echo 🧹 Removing unused imports and variables...
npx eslint --fix --no-inline-config --rule "no-unused-vars: error" "src\**\*.js" "src\**\*.jsx" | findstr "defined but never used"

echo 🔧 Fixing component imports...
powershell -Command "(Get-Content src\components\Dashboard.js) -replace 'import {.*(Spacer|Home|AlertCircle|User|Settings).*}', 'import { } from ''@chakra-ui/react'';' | Set-Content src\components\Dashboard.js"
powershell -Command "(Get-Content src\components\Register.js) -replace 'import {.*(Box|Flex|FormControl|Text|useToast).*}', 'import { } from ''@chakra-ui/react'';' | Set-Content src\components\Register.js"

echo 🚮 Removing dead code...
findstr /s /n /i /c:"console.log" src\*.js src\*.jsx
set /p remove_logs="Found above console.log statements. Remove them? (y/n) "
if /i "!remove_logs!"=="y" (
    powershell -Command "Get-ChildItem -Path src -Include *.js,*.jsx -Recurse | ForEach-Object { (Get-Content $_.FullName) -replace 'console.log.*', '' | Set-Content $_.FullName }"
)

echo 🧽 Cleaning node_modules and cache...
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force

echo 📦 Reinstalling dependencies...
npm install

echo 🎨 Formatting code with Prettier...
npx prettier --write "src\**\*.js" "src\**\*.jsx" "src\**\*.css" "src\**\*.scss"

echo 📦 Handling dependencies...
echo Removing unused packages:
npm uninstall @mui/material @radix-ui/react-icons @radix-ui/react-slot @testing-library/user-event class-variance-authority clsx tailwind-merge

echo Adding required i18n dependencies:
npm install i18next react-i18next i18next-browser-languagedetector

echo 🔧 Fixing prop-types (optional):
set /p install_proptypes="Install prop-types? (y/n) "
if /i "!install_proptypes!"=="y" (
    npm install prop-types
)

echo 📦 Adding ESLint config...
npm install --save-dev eslint-config-react-app

echo 🗑️ Removing dead files...
del src\App.test.js
del src\setupTests.js
del src\reportWebVitals.js
rmdir /s /q src\components\widgets\WeeklyHeatmap.js
rmdir /s /q src\pages\ExpensesPage.js
rmdir /s /q src\pages\ImpactPage.js

echo 🖼️ Cleaning unused assets...
del src\assets\images\kg_img.png
del src\assets\images\Lihle.png
del src\assets\images\Mpho.png

echo ✅ Cleanup complete! Press any key to exit...
pause >nul