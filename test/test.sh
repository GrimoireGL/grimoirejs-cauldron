mkdir temp
cd ./temp
../bin/cauldron init --name "grimoirejs-test"
../bin/cauldron scaffold -t "component" -n "TestComponent"
../bin/cauldron scaffold -t "converter" -n "TestConverter"
sed -i -e "s/SOMETHING/parseFloat/g" ./src/Converter/TestConverter.ts
npm install
npm run build -- --env.prod