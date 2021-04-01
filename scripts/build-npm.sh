rm -rf lib
babel -d lib ./modules
node-sass css/ -o lib/css/ --output-style compressed
cp modules/index.d.ts lib/index.d.ts
cp modules/config/antd/index.d.ts lib/config/antd/index.d.ts
cp modules/components/widgets/antd/index.d.ts lib/components/widgets/antd/index.d.ts
# find lib -type d -name __tests__ | xargs rm -rf
