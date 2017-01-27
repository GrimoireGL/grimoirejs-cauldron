import {
  readFileAsync,
  templateAsync,
  writeFileAsync
} from "../async-helper";

import path from "path";

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
      if(attrV.default === ""){
        attrV.default = `(Empty string)`;
      }
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

export default async function generate(input){
  return await templateAsync(path.normalize(__dirname + "/../../src/doc/templates/api-reference.md"), reformat(input));
}
