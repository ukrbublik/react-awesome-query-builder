rm -rf build/global
NODE_ENV=production webpack modules/index.js
#NODE_ENV=production COMPRESS=1 webpack modules/index.js
#echo "gzipped, the global build is `gzip -c build/global/ReactAwesomeQueryBuilder.min.js | wc -c` bytes"

