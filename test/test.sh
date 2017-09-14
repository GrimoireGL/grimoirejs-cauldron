mkdir temp
cd ./temp
../bin/cauldron init --name "grimoirejs-test"
../bin/cauldron scaffold -t "component" -n "Test"
../bin/cauldron scaffold -t "converter" -n "Test"
sed -i -e "s/SOMETHING/parseFloat/g" ./src/Converters/TestConverter.ts
npm install
npm run build -- --env.prod