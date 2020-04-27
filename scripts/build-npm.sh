rm -rf lib
babel -d lib ./modules
find lib -type d -name __tests__ | xargs rm -rf
