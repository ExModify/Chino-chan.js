@ECHO off
TITLE Chino-chan
:start
node Entrace.js --color
IF %ERRORLEVEL% == 2 (
	GOTO :start
)
IF NOT %ERRORLEVEL% == 772362 (
	DEL lockMain
	DEL lock
) ELSE (
	ECHO Chino-chan is already running!
)
PAUSE