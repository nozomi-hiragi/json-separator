# json-separator
RPGツクール用のデータベースのjsonを分割結合するやつ

## ビルド
`npx nexe index.js --python {python} --target {target}`

## 実行
config.jsonを用意  
`json-separator {dataPath} {separatePath} separate|merge`

## config.jsonの例
    {
      "Actors.json": {
        "rootType": "array",
        "key": "id"
      },
      "Animations.json": {
        "rootType": "array",
        "key": "id"
      },
      "Armors.json": {
        "rootType": "array",
        "key": "id"
      },
      "Classes.json": {
        "rootType": "array",
        "key": "id"
      },
      "CommonEvents.json": {
        "rootType": "array",
        "key": "id"
      },
      "Enemies.json": {
        "rootType": "array",
        "key": "id"
      },
      "Items.json": {
        "rootType": "array",
        "key": "id"
      },
      "Map{}.json": {
        "rootType": "object",
        "default": "base",
        "toFiles": [
          "data"
        ]
      },
      "MapInfos.json": {
        "rootType": "array",
        "key": "id"
      },
      "Skills.json": {
        "rootType": "array",
        "key": "id"
      },
      "States.json": {
        "rootType": "array",
        "key": "id"
      },
      "System.json": {
        "rootType": "object",
        "default": "base",
        "toFiles": [
          {
            "name": "opts",
            "props": [
              "optDisplayTp",
              "optDrawTitle",
              "optExtraExp",
              "optFloorDeath",
              "optFollowers",
              "optSideView",
              "optSlipDeath",
              "optTransparent"
            ]
          },
          "terms",
          "sounds",
          "attackMotions",
          "testBattlers"
        ]
      },
      "Tilesets.json": {
        "rootType": "array",
        "key": "id"
      },
      "Troops.json": {
        "rootType": "array",
        "key": "id"
      },
      "Weapons.json": {
        "rootType": "array",
        "key": "id"
      }
    }