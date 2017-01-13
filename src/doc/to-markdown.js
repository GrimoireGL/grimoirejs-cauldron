import {
  readFileAsync,
  templateAsync,
  writeFileAsync
} from "../async-helper";

import path from "path";

const source = {
	"name": "grimoirejs-fundamental",
	"nodes": [
		{
			"goml": {
				"description": "ルートノード",
				"components": [
					"CanvasInitializer",
					"LoopManager",
					"AssetLoadingManager",
					"GeometryRegistory",
					"RendererManager",
					"Fullscreen"
				]
			}
		}
	],
	"components": [
		{
			"name": "AssetLoadingManagerComponent",
			"description": "",
			"attributes": {
				"loadingProgress": {
					"default": "0",
					"converter": "Number",
					"description": ""
				},
				"autoStart": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"enableLoader": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				}
			}
		},
		{
			"name": "CameraComponent",
			"description": "",
			"attributes": {
				"fovy": {
					"default": "45d",
					"converter": "Angle2D",
					"description": ""
				},
				"near": {
					"default": "0.01",
					"converter": "Number",
					"description": ""
				},
				"far": {
					"default": "100",
					"converter": "Number",
					"description": ""
				},
				"aspect": {
					"default": "1.6",
					"converter": "Number",
					"description": ""
				},
				"autoAspect": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"orthoSize": {
					"default": "100",
					"converter": "Number",
					"description": ""
				},
				"orthogonal": {
					"default": "false",
					"converter": "Boolean",
					"description": ""
				}
			}
		},
		{
			"name": "FullscreenComponent",
			"description": "",
			"attributes": {
				"fullscreen": {
					"converter": "Boolean",
					"default": "false",
					"description": ""
				},
				"fullscreenTarget": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		{
			"name": "GeometryComponent",
			"description": "",
			"attributes": {
				"type": {
					"converter": "String",
					"default": "null",
					"description": ""
				},
				"name": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		{
			"name": "GeometryRegistoryComponent",
			"description": "",
			"attributes": {
				"defaultGeometry": {
					"converter": "StringArray",
					"default": "quad,cube,sphere",
					"description": ""
				}
			}
		},
		{
			"name": "HTMLBinderComponent",
			"description": "",
			"attributes": {
				"htmlQuery": {
					"default": "null",
					"converter": "String",
					"description": ""
				},
				"targetRenderer": {
					"default": "render-scene",
					"converter": "String",
					"description": ""
				}
			}
		},
		{
			"name": "MaterialComponent",
			"description": "",
			"attributes": {
				"type": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		{
			"name": "MaterialContainerComponent",
			"description": "",
			"attributes": {
				"material": {
					"converter": "Material",
					"default": "new(unlit)",
					"componentBoundTo": "_materialComponent",
					"description": ""
				},
				"drawOrder": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		{
			"name": "MaterialImporterComponent",
			"description": "",
			"attributes": {
				"typeName": {
					"default": "null",
					"converter": "String",
					"description": ""
				},
				"src": {
					"default": "null",
					"converter": "String",
					"description": ""
				}
			}
		},
		{
			"name": "MeshRenderer",
			"description": "",
			"attributes": {
				"geometry": {
					"converter": "Geometry",
					"default": "quad",
					"description": ""
				},
				"targetBuffer": {
					"converter": "String",
					"default": "default",
					"description": ""
				},
				"layer": {
					"converter": "String",
					"default": "default",
					"description": ""
				},
				"drawCount": {
					"converter": "Number",
					"default": "1.7976931348623157e+308",
					"description": ""
				},
				"drawOffset": {
					"converter": "Number",
					"default": "0",
					"description": ""
				}
			}
		},
		{
			"name": "MouseCameraControlComponent",
			"description": "",
			"attributes": {
				"rotateSpeed": {
					"default": "1",
					"converter": "Number",
					"description": ""
				},
				"zoomSpeed": {
					"default": "1",
					"converter": "Number",
					"description": ""
				},
				"moveSpeed": {
					"default": "1",
					"converter": "Number",
					"description": ""
				},
				"center": {
					"default": "0,0,0",
					"converter": "Vector3",
					"description": ""
				},
				"distance": {
					"default": "null",
					"converter": "Number",
					"description": ""
				}
			}
		},
		{
			"name": "RenderBufferComponent",
			"description": "",
			"attributes": {
				"name": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		{
			"name": "RendererComponent",
			"description": "",
			"attributes": {
				"camera": {
					"converter": "Component",
					"default": "camera",
					"target": "Camera",
					"description": ""
				},
				"viewport": {
					"converter": "Viewport",
					"default": "auto",
					"description": ""
				}
			}
		},
		{
			"name": "RendererManagerComponent",
			"description": "",
			"attributes": {}
		},
		{
			"name": "RenderQuadComponent",
			"description": "",
			"attributes": {
				"out": {
					"default": "default",
					"converter": "String",
					"description": ""
				},
				"depthBuffer": {
					"default": "null",
					"converter": "String",
					"description": ""
				},
				"targetBuffer": {
					"default": "default",
					"converter": "String",
					"description": ""
				},
				"clearColor": {
					"default": "#0000",
					"converter": "Color4",
					"description": ""
				},
				"clearColorEnabled": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"clearDepthEnabled": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"clearDepth": {
					"default": "1",
					"converter": "Number",
					"description": ""
				},
				"technique": {
					"default": "default",
					"converter": "String",
					"description": ""
				}
			}
		},
		{
			"name": "RenderSceneComponent",
			"description": "",
			"attributes": {
				"layer": {
					"converter": "String",
					"default": "default",
					"description": ""
				},
				"depthBuffer": {
					"default": "null",
					"converter": "String",
					"description": ""
				},
				"out": {
					"converter": "String",
					"default": "default",
					"description": ""
				},
				"clearColor": {
					"default": "#0000",
					"converter": "Color4",
					"description": ""
				},
				"clearColorEnabled": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"clearDepthEnabled": {
					"default": "true",
					"converter": "Boolean",
					"description": ""
				},
				"clearDepth": {
					"default": "1",
					"converter": "Number",
					"description": ""
				},
				"camera": {
					"default": "null",
					"converter": "Component",
					"target": "Camera",
					"description": ""
				},
				"technique": {
					"default": "default",
					"converter": "String",
					"description": ""
				}
			}
		},
		{
			"name": "SceneComponent",
			"description": "",
			"attributes": {}
		},
		{
			"name": "TextureBufferComponent",
			"description": "",
			"attributes": {}
		},
		{
			"name": "TextureComponent",
			"description": "",
			"attributes": {}
		},
		{
			"name": "TransformComponent",
			"description": "",
			"attributes": {}
		}
	],
	"converters": [
		{
			"name": "CanvasSizeConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "GeometryConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "MaterialConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "NodeConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "PositionConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "TextureConverter",
			"description": "",
			"parameters": {}
		},
		{
			"name": "ViewportConverter",
			"description": "",
			"parameters": {}
		}
	]
};

async function generate(){
  console.log(await templateAsync(path.normalize(__dirname + "/../../src/doc/templates/api-reference.md"), source));
}

generate();
