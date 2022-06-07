const fs = require('fs')

// separate
const saveJson = (path, json) => {
  fs.writeFileSync(path, JSON.stringify(json, undefined, 2))
}

const saveFromConfigObject = (path, json, fileConfig) => {
  const fileName = fileConfig.name
  if (!fileName) { console.error(`${fileName} name error`) }
  const props = fileConfig.props
  if (!props) console.error(`${fileName} props error`)
  const body = {}
  for (const propName of props) {
    body[propName] = json[propName]
    delete json[propName]
  }
  if (!fs.existsSync(path)) fs.mkdirSync(path)
  saveJson(`${path}/${fileName}.json`, body)
}

const separateFromObject = (path, name, json, defaultName, toFiles) => {
  const jsonPath = `${path}/${name}`
  for (let fileConfig of toFiles) {
    if (typeof fileConfig === 'string') {
      fileConfig = {
        name: fileConfig,
        props: [fileConfig]
      }
    }
    saveFromConfigObject(jsonPath, json, fileConfig)
  }
  saveJson(`${jsonPath}/${defaultName}.json`, json)
}

const separateFromArray = (path, name, json, keyName) => {
  const jsonPath = `${path}/${name}`
  if (!fs.existsSync(jsonPath)) fs.mkdirSync(jsonPath)
  const index = []
  json.forEach((item) => {
    if (item === null) {
      index.push(null)
      return
    }
    const key = item[keyName]
    saveJson(`${jsonPath}/${name}${key}.json`, item)
    index.push(key)
  })
  saveJson(`${jsonPath}/index.json`, index)
}

const separateFromConfigItem = (dataPath, fileName, configItem, exportPath) => {
  const json = JSON.parse(fs.readFileSync(`${dataPath}/${fileName}`))
  const dirName = fileName.split('.')[0]

  switch (configItem.rootType) {
    case "object":
      const defaultName = configItem.default
      if (!defaultName) throw new Error(`${fileName} default error`)
      const toFiles = configItem.toFiles
      if (!toFiles) throw new Error(`${fileName} toFiles error`)
      separateFromObject(exportPath, dirName, json, defaultName, toFiles)
      break

    case "array":
      const key = configItem.key
      if (!key) new Error(`${fileName} key error`)
      separateFromArray(exportPath, dirName, json, key)
      break

    default:
      throw new Error(`${fileName} rootType error`)
  }
}

const dataFileToSeparateJson = (dataPath, config, exportPath) => {
  if (!fs.existsSync(exportPath)) fs.mkdirSync(exportPath)
  const configKeyRegs = Object.keys(config)
    .filter((key) => key.search(/.*?{}.*?/g) === 0)
    .map((key) => {
      return { name: key, reg: new RegExp(key.replace('{}', '.*?')) }
    })

  const dataDir = fs.readdirSync(dataPath)
  dataDir.forEach((fileName) => {
    let configItem = config[fileName]
    if (!configItem) {
      let configName
      for (const key of configKeyRegs) {
        if (fileName.search(key.reg) === 0) {
          configName = key.name
          break
        }
      }
      if (!configName) return
      configItem = config[configName]
    }
    if (!configItem) return
    separateFromConfigItem(dataPath, fileName, configItem, exportPath)
  })
}

////

const separateJsonToDataFile = (separatePath, config, dataPath) => {
  if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)
  const configKeyRegs = Object.keys(config)
    .filter((key) => key.search(/.*?{}.*?/g) === 0)
    .map((key) => {
      return { name: key, reg: new RegExp(key.replace('{}', '.*?')) }
    })

  const separateDir = fs.readdirSync(separatePath)
  separateDir.forEach((dir) => {
    const jsonName = `${dir}.json`
    let configItem = config[jsonName]
    if (!configItem) {
      let configName
      for (const key of configKeyRegs) {
        if (jsonName.search(key.reg) === 0) {
          configName = key.name
          break
        }
      }
      if (!configName) return
      configItem = config[configName]
    }
    if (!configItem) return
    const fileNames = fs.readdirSync(`${separatePath}/${dir}`)

    switch (configItem.rootType) {
      case "object":
        if (!fileNames.includes(`${configItem.default}.json`)) {
          console.error(`${dir} cant find {config.default}.json`)
          return
        }
        const bodyObject = JSON.parse(fs.readFileSync(`${separatePath}/${dir}/${configItem.default}.json`))

        for (const propFileConfig of configItem.toFiles) {
          if (typeof propFileConfig === 'string') {
            const propName = propFileConfig
            const propData = JSON.parse(fs.readFileSync(`${separatePath}/${dir}/${propName}.json`))
            bodyObject[propName] = propData[propName]
          } else {
            const propFileName = propFileConfig.name
            const propData = JSON.parse(fs.readFileSync(`${separatePath}/${dir}/${propFileName}.json`))
            for (const propName of propFileConfig.props) {
              bodyObject[propName] = propData[propName]
            }
          }
        }

        // const pairs = Object.entries(bodyObject)
        // pairs.sort((p1, p2) => {
        //   const p1Key = p1[0], p2Key = p2[0]
        //   if (p1Key < p2Key) return -1
        //   if (p1Key > p2Key) return 1
        //   return 0
        // })
        // const sortedBodyObject = Object.fromEntries(pairs)

        fs.writeFileSync(`${dataPath}/${dir}.json`, JSON.stringify(bodyObject))
        break

      case "array":
        if (!fileNames.includes('index.json')) {
          console.error(`${dir} cant find index.json`)
          return
        }
        const index = JSON.parse(fs.readFileSync(`${separatePath}/${dir}/index.json`))

        const bodyArray = []
        for (const i of index) {
          if (i === null) {
            bodyArray.push(null)
            continue
          }
          const fileName = `${dir}${i}.json`
          const filePath = `${separatePath}/${dir}/${fileName}`
          if (!fs.existsSync(filePath)) {
            console.error(`${filePath} cant find`)
            continue
          }
          const item = JSON.parse(fs.readFileSync(filePath))
          bodyArray.push(item)
        }

        fs.writeFileSync(`${dataPath}/${dir}.json`, JSON.stringify(bodyArray))
        break

      default:
        throw new Error(`${configName} rootType error`)
    }
  })
}


const CONFIG_PATH = './config.json'
const config = JSON.parse(fs.readFileSync(CONFIG_PATH))

const dataPath = process.argv[2]
const exportPath = process.argv[3]
const command = process.argv[4]

switch (command) {
  case 'separate':
    dataFileToSeparateJson(dataPath, config, exportPath)
    break
  case 'merge':
    separateJsonToDataFile(exportPath, config, dataPath)
    break
  default:
    console.log('dataPath separatePath separate|merge')
}
