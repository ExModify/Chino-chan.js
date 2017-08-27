@echo off
title Chino-chan
:start
node Entrace.js --color
IF %ERRORLEVEL% EQU 2 (
	GOTO :start
)

PAUSE