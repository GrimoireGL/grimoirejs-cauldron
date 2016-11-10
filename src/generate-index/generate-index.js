import {
    globAsync,
    readFileAsync,
    templateAsync
} from "../async-helper";
import {
    argv
} from "yargs";
import path from "path";

function generateStructureRecursively(obj, sepDirs,basePath) {
    if (sepDirs.length < 2) {
        return;
    }
    if (sepDirs[0] === '') {
        obj[sepDirs[1]] = jsSafeString(basePath + sepDirs[1]);
        return;
    }
    basePath = basePath + sepDirs[0];
    if (sepDirs[0] !== '' && obj[sepDirs[0]] === void 0) {
        obj[sepDirs[0]] = {};
    }
    if (sepDirs.length > 2) {
        generateStructureRecursively(obj[sepDirs[0]], sepDirs.slice(1),basePath);
    } else if (sepDirs.length === 2) {
        obj[sepDirs[0]][sepDirs[1]] = jsSafeString(basePath + sepDirs[1]);
    }
}

function jsSafeString(str){
  return str.replace(/\./g,"_").replace(/\-/g,"_");
}

function asJSIndex(jsonStr, sepDirs) {
    for (let pathKey in sepDirs) {
      const keyName = jsSafeString(sepDirs[pathKey].reduce((p, c) => p + c));
      const regex = new RegExp(`"${keyName}"`);
      jsonStr = jsonStr.replace(regex,keyName);
    }
    jsonStr = jsonStr.replace(/,/g,";");
    return jsonStr;
}

async function generateIndex() {
    try {
        const cwd = process.cwd(); // current working directory
        const baseUrl = path.join(cwd, argv.src); // absolute path of source directory
        const detectedFiles = await globAsync(path.join(cwd, argv.src, "**/*.js")); // glob all javascript files
        const pathMap = {};
        // listup files containing `export default`
        for (let i = 0; i < detectedFiles.length; i++) {
            const content = await readFileAsync(detectedFiles[i]);
            if (content.indexOf("export default") >= 0) { // to ignore interfaces
                const relative = path.relative(baseUrl, detectedFiles[i]);
                pathMap[relative] = path.parse(relative);
            }
        }
        // separate relative path by '/' or '\'
        const separated = {};
        for (let keyPath in pathMap) {
            separated[keyPath] = pathMap[keyPath].dir.split(path.sep);
            separated[keyPath].push(pathMap[keyPath].name); // last element of separated[path] is file name without extension
        }
        // make structure of index
        const structureObject = {};
        for (let keyPath in separated) {
            generateStructureRecursively(structureObject, separated[keyPath],"");
        }
        // example
        const jsonCode = JSON.stringify(structureObject);
      //  console.log(jsonCode);
        // sample output of the code above
        /*
        {
"Asset": {
  "AssetLoader": "AssetAssetLoader",
  "CacheResolver": "AssetCacheResolver",
  "defaultLoader.html": "AssetdefaultLoader.html",
  "ExternalResourceResolver": "AssetExternalResourceResolver",
  "ImageResolver": "AssetImageResolver",
  "TextFileResolver": "AssetTextFileResolver"
},
"Camera": {
  "PerspectiveCamera": "CameraPerspectiveCamera"
},
"Components": {
  "AssetLoadingManagerComponent": "ComponentsAssetLoadingManagerComponent",
  "CameraComponent": "ComponentsCameraComponent",
  "CanvasInitializerComponent": "ComponentsCanvasInitializerComponent",
  "FullscreenComponent": "ComponentsFullscreenComponent",
  "GeometryComponent": "ComponentsGeometryComponent",
  "GeometryRegistoryComponent": "ComponentsGeometryRegistoryComponent",
  "HTMLBinderComponent": "ComponentsHTMLBinderComponent",
  "LoopManagerComponent": "ComponentsLoopManagerComponent",
  "MaterialComponent": "ComponentsMaterialComponent",
  "MaterialContainerComponent": "ComponentsMaterialContainerComponent",
  "MaterialImporterComponent": "ComponentsMaterialImporterComponent",
  "MaterialManagerComponent": "ComponentsMaterialManagerComponent",
  "MeshRendererComponent": "ComponentsMeshRendererComponent",
  "MouseCameraControlComponent": "ComponentsMouseCameraControlComponent",
  "RenderBufferComponent": "ComponentsRenderBufferComponent",
  "RendererComponent": "ComponentsRendererComponent",
  "RendererManagerComponent": "ComponentsRendererManagerComponent",
  "RenderQuadComponent": "ComponentsRenderQuadComponent",
  "RenderSceneComponent": "ComponentsRenderSceneComponent",
  "SceneComponent": "ComponentsSceneComponent",
  "TextureBufferComponent": "ComponentsTextureBufferComponent",
  "TextureComponent": "ComponentsTextureComponent",
  "TransformComponent": "ComponentsTransformComponent"
},
"Constraint": {
  "ChildrenComponentConstraint": "ConstraintChildrenComponentConstraint",
  "NoChildConstraint": "ConstraintNoChildConstraint",
  "ParentConstraint": "ConstraintParentConstraint",
  "RootConstraint": "ConstraintRootConstraint"
},
"Converters": {
  "Angle2DConverter": "ConvertersAngle2DConverter",
  "BooleanConverter": "ConvertersBooleanConverter",
  "CanvasSizeConverter": "ConvertersCanvasSizeConverter",
  "Color3Converter": "ConvertersColor3Converter",
  "Color4Converter": "ConvertersColor4Converter",
  "ComponentConverter": "ConvertersComponentConverter",
  "EnumConverter": "ConvertersEnumConverter",
  "GeometryConverter": "ConvertersGeometryConverter",
  "MaterialConverter": "ConvertersMaterialConverter",
  "NumberArrayConverter": "ConvertersNumberArrayConverter",
  "NumberConverter": "ConvertersNumberConverter",
  "ObjectConverter": "ConvertersObjectConverter",
  "Rotation3Converter": "ConvertersRotation3Converter",
  "StringArrayConverter": "ConvertersStringArrayConverter",
  "StringConverter": "ConvertersStringConverter",
  "Texture2DConverter": "ConvertersTexture2DConverter",
  "TextureConverter": "ConvertersTextureConverter",
  "Vector2Converter": "ConvertersVector2Converter",
  "Vector3Converter": "ConvertersVector3Converter",
  "Vector4Converter": "ConvertersVector4Converter",
  "ViewportConverter": "ConvertersViewportConverter"
}
}
         */
        const objectCode = asJSIndex(jsonCode,separated);
        const imports = [];
        for(let keyPath in separated){
          imports.push({
            path:"./" + keyPath,
            key:jsSafeString(separated[keyPath].reduce((p, c) => p + c))
          });
        }
        const templateArgs = {
          exportObject:objectCode,
          imports:imports
        };
         console.log(await templateAsync(path.normalize(__dirname + "/../../src/generate-index/index-template.template"),templateArgs));
    } catch (e) {
        console.log(e);
    }
}

generateIndex();
