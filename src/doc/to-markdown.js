import {
  readFileAsync,
  templateAsync,
  writeFileAsync
} from "../async-helper";

import path from "path";

const source ={
	"name": "grimoirejs-fundamental",
	"nodes": {
		"goml": {
			"description": "\n\nツリーに唯一一つ必要なコンポーネントなどをつけておくためのノード。\n特に、`<canvas>`の初期化やループの管理など、最初の初期化時のパラメーターを受け取るためのコンポーネントとともに、\n`<canvas>`の設定(`width`や`height`)またはフルスクリーンなどのコンポーネントを含む。",
			"components": [
				"CanvasInitializer",
				"LoopManager",
				"AssetLoadingManager",
				"GeometryRegistory",
				"RendererManager",
				"Fullscreen"
			]
		},
		"scene": {
			"description": "\n\nカメラや、ライト、メッシュなど空間に配置するためのノードです。\n全ての場面に存在する座標を持ちうるノード(`TransformComponent`を含むノード)は必ずこのノードの子ノードのとして存在する必要があります。",
			"components": [
				"Scene"
			]
		},
		"object": {
			"description": "\n\nメッシュやカメラなどのベースとなるノードです。このノードの子要素には親要素の変型量(`position`や`rotation`)などが伝搬します。\n詳しくは`TransformComponent`を参照すると良いでしょう。",
			"components": [
				"Transform"
			]
		},
		"camera": {
			"description": "\n\n3D空間を撮影するためのカメラを意味するノードです。シーンをレンダリングするには最低一つのカメラがシーンに属していなければなりません。",
			"super": "object",
			"components": [
				"Camera"
			],
			"default": {
				"position": [
					0,
					0,
					10
				]
			}
		},
		"mesh": {
			"description": "\n\n3D空間上に存在する映るものを意味するノードです。シーンに何かを写すには最低一つのメッシュがシーンに属していなければなりません。\n\nメッシュは、マテリアル(材質)とジオメトリ(形状)からなります。この2つの指定を変えることで、様々な表現が3D空間上で可能になります。",
			"super": "object",
			"components": [
				"MaterialContainer",
				"MeshRenderer"
			]
		},
		"renderer": {
			"description": "\n\nキャンバス上の領域をどのように描画するかを示すためのノードです。gomlの読み込み時に一つも存在しない場合は、自動的にgoml直下に生成されます。\n\n1つ以上のレンダラーを含むことで、キャンバスの複数の領域をレンダリングしたりすることができるようになります。\nまた、この子要素に指定する`<render-XXX>`ノードなどによって、どのようにその領域を描画するかが決定されます。\n\n通常、`<renderer>`の子ノードに何も存在しない場合、自動的に`<render-scene>`タグが生成されます。",
			"components": [
				"Renderer"
			]
		},
		"geometry": {
			"description": "\n\n単純な変形(`scale`、`position`、`rotation`だけで表せない)、例えば円の分割数などを指定したい別の形状を明示的に生成するためのノードです。",
			"components": [
				"Geometry"
			]
		},
		"texture": {
			"description": "\n\nテクスチャを読み込むためのノードです。通常、テクスチャはurlをマテリアルに指定するなどして読み込まれますが、\nサンプラの指定などをしたい場合、このタグで明示的に読み込むことにより読み込むことができます。",
			"components": [
				"Texture"
			]
		},
		"material": {
			"description": "\n\nマテリアルを生成するためのノードです。メッシュからこのノードを参照して利用することにより、複数のメッシュで共通のマテリアルのインスタンスを参照させることができます。\n\nこれは、同時にマテリアルの値が編集できるだけでなく、パフォーマンス的にも大きな利点をもたらします。",
			"components": [
				"Material"
			]
		},
		"import-material": {
			"description": "\n\nGrimoire.jsのマテリアルファイル(*.sort)から新しい種類のマテリアルを読み込むためのノードです。",
			"components": [
				"MaterialImporter"
			]
		},
		"texture-buffer": {
			"description": "\n\n`<renderer>`ノードの直下に含まれうるノードの一つです。\n\nこのノードによってレンダリングに用いるカラーバッファを生成することができます。\nカラーバッファはオフスクリーンレンダリングなどへの利用など様々な面で利用することができます。",
			"components": [
				"TextureBuffer"
			]
		},
		"render-buffer": {
			"description": "\n\n`<renderer>`ノードの直下に含まれうるノードの一つです。\n\nこのノードによってレンダリングに用いる深度バッファやステンシルバッファを生成することができます。",
			"components": [
				"RenderBuffer"
			]
		},
		"render-scene": {
			"description": "\n\n`<renderer>`ノードの直下に含まれうるノードの一つです。\n\nこのノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、シーンの内容を描画します。",
			"components": [
				"RenderScene"
			],
			"default": {
				"material": null
			}
		},
		"render-quad": {
			"description": "\n\n`<renderer>`ノードの直下に含まれうるノードの一つです。\n\nこのノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、単純な四角形(`quad`)を指定されたマテリアルで描画します。",
			"components": [
				"MaterialContainer",
				"RenderQuad"
			],
			"default": {
				"material": null
			}
		}
	},
	"components": {
		"AssetLoadingManagerComponent": {
			"description": "",
			"attributes": {
				"loadingProgress": {
					"default": "0",
					"converter": "Number",
					"description": "\n\n現在の読み込み状況を0-1で表す。"
				},
				"autoStart": {
					"default": "true",
					"converter": "Boolean",
					"description": "リソースの読み込み完了後に、自動的にレンダリングループを開始するかどうか"
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
    return desc;
  }
  let shortDesc = desc.substr(0,index);
  if(shortDesc.trim().length === 0){
    shortDesc = getShortDescription(desc.substr(index + 1));
  }
  return shortDesc;
}

function reformat(jsonData){
  jsonData.short_name = jsonData.name.replace("grimoirejs","grimoire");
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
