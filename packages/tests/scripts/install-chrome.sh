#!/bin/bash

if [[ "$CSB" == "true" || "$CODESPACES" == "true" ]]; then
  echo "CHROME_BIN=$CHROME_BIN"
  PUPPETEER_VERSION=$(./node_modules/.bin/puppeteer --version)
  echo "puppeteer version: $PUPPETEER_VERSION"
  INSTALL_RES=$(./node_modules/.bin/puppeteer browsers install chrome@115)
  echo "install result: $INSTALL_RES"
  INSTALL_PATH=$(echo $INSTALL_RES | cut -d' ' -f2)
  echo "install path: $INSTALL_PATH"
  export CHROME_BIN="$INSTALL_PATH"
fi
