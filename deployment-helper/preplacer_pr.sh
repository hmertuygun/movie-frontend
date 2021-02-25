sed s/"true,"/"true,\n  \"homepage\" : \"https:\/\/dev.coinpanel.com\/pr\/$1\","/ package.json > package2.json
mv package2.json package.json