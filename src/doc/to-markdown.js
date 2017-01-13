import {
  readFileAsync,
  templateAsync,
  writeFileAsync
} from "../async-helper";

import path from "path";

const source = {
	"name": "grimoirejs-fundamental",
	"nodes": {
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
	},
	"components": {
		"AssetLoadingManagerComponent": {
			"description": "",
			"attributes": {
				"loadingProgress": {
					"default": "0",
					"converter": "Number",
					"description": "アセットのロード状況(読み取り専用)\n0-1で表す。"
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
		"CameraComponent": {
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
		"FullscreenComponent": {
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
		"GeometryComponent": {
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
		"GeometryRegistoryComponent": {
			"description": "",
			"attributes": {
				"defaultGeometry": {
					"converter": "StringArray",
					"default": "quad,cube,sphere",
					"description": ""
				}
			}
		},
		"HTMLBinderComponent": {
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
		"MaterialComponent": {
			"description": "",
			"attributes": {
				"type": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		"MaterialContainerComponent": {
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
		"MaterialImporterComponent": {
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
		"MeshRenderer": {
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
		"MouseCameraControlComponent": {
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
		"RenderBufferComponent": {
			"description": "",
			"attributes": {
				"name": {
					"converter": "String",
					"default": "null",
					"description": ""
				}
			}
		},
		"RendererComponent": {
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
		"RendererManagerComponent": {
			"description": "",
			"attributes": {}
		},
		"RenderQuadComponent": {
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
		"RenderSceneComponent": {
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
		"SceneComponent": {
			"description": "",
			"attributes": {}
		},
		"TextureBufferComponent": {
			"description": "",
			"attributes": {}
		},
		"TextureComponent": {
			"description": "",
			"attributes": {}
		},
		"TransformComponent": {
			"description": "",
			"attributes": {
				"position": {
					"converter": "Vector3",
					"default": "0,0,0",
					"description": ""
				},
				"rotation": {
					"converter": "Rotation3",
					"default": "0,0,0,1",
					"description": ""
				},
				"scale": {
					"converter": "Vector3",
					"default": "1,1,1",
					"description": ""
				},
				"rawMatrix": {
					"converter": "Object",
					"default": "null",
					"description": ""
				}
			}
		}
	},
	"converters": {
		"CanvasSizeConverter": {
			"description": "",
			"parameters": {}
		},
		"GeometryConverter": {
			"description": "",
			"parameters": {}
		},
		"MaterialConverter": {
			"description": "",
			"parameters": {}
		},
		"NodeConverter": {
			"description": "",
			"parameters": {}
		},
		"PositionConverter": {
			"description": "",
			"parameters": {}
		},
		"TextureConverter": {
			"description": "",
			"parameters": {}
		},
		"ViewportConverter": {
			"description": "",
			"parameters": {}
		}
	}
};

function getShortDescription(desc){
  const index = desc.indexOf("\n");
  if(index === -1){
    return " ";
  }
  return desc.substr(0,index);
}

function reformat(jsonData){
  for(let key in jsonData.components){
    const comp = jsonData.components[key];
    comp.short_description = getShortDescription(comp.description);
    for(let attr in comp.attributes){
      const attrV = comp.attributes[attr];
      attrV.short_description = getShortDescription(attrV.description);
    }
  }
  for(let key in jsonData.nodes){
    const node = jsonData.nodes[key];
    node.short_description = getShortDescription(node.description);
  }
  for(let key in jsonData.converters){
    const conv = jsonData.converters[key];
    conv.short_description = getShortDescription(conv.description);
  }
  return jsonData;
}

async function generate(){
  console.log(await templateAsync(path.normalize(__dirname + "/../../src/doc/templates/api-reference.md"), reformat(source)));
}

generate();
