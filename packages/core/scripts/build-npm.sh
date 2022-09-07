rm -rf lib

babel -d lib ./modules
sass css/:lib/css/ --no-source-map --style=expanded
cp css/antd.less lib/css/antd.less

cp modules/index.d.ts lib/index.d.ts

find lib -type d -name __tests__ | xargs rm -rf
