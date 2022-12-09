rm -rf lib

babel -d lib ./modules

cp modules/index.d.ts lib/index.d.ts

