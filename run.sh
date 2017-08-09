#!/bin/bash

node ./Entrace.js --color
until [ $? -ne 2 ]; do
  node ./Entrace.js --color
done