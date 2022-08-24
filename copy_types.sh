# This script copies generated types from contracts-v2
# Ideally we want to publish them as npm package, but until the contracts-v2 repo is made public we have to use this script
# It assumes that this repo is in the same folder as `contracts-v2` repo

rm -rf src/types
mkdir src/types
# cp -R ../contracts-v2/types/@chainlink src/types/@chainlink
# cp -R ../contracts-v2/types/@openzeppelin src/types/@openzeppelin
# cp -R ../contracts-v2/types/contracts src/types/contracts
# cp -R ../contracts-v2/types/common.ts ../contracts-v2/types/index.ts src/types
# sed -i "" "/factories/d" src/types/index.ts

cp -R ../contracts-v2/types src