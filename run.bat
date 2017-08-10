@echo off

:start
node Entrace.js --color
IF %ERRORLEVEL% EQU 2 (
	GOTO :start
)