const funcParamKey = "__DATA__";

function compileToFunctionStr (tpl) {
  const tplCode = tpl;
  const regTpl = /<directive:([^>]+)?>|<\/directive:>|{{([^}}]+)?}}/ig;
  // const regDirectStart = /<directive:([^>]+)?>|<\/directive:>/i;
  const regDirectEnd = /<\/directive:>/i;
  const regDirectIf = /if="([^"]+)?"/i;
  const regDirectForArray = /for-array="([^"]+)?"/i;
  const regDirectForArrayIndex = /for-array-index="([^"]+)?"/i;
  const regDirectForArrayItem = /for-array-item="([^"]+)?"/i;
  const regDirectForJSON = /for-json="([^"]+)?"/i;
  const regDirectForJSONKey = /for-json-key="([^"]+)?"/i;
  const regDirectForJSONVal = /for-json-value="([^"]+)?"/i;
  const regData = /{{([^}}]+)?}}/i;
  const directiveStock = [];
  let funcCodeStr = "";
  let match = true;
  let codeIndex = 0;
  funcCodeStr += "\n let _row=[];\n";

  const addFuncCode = function (params) {
    const { currentExec, restCode } = params;

    if (regData.test(currentExec) === true) {
      const currentDirective = directiveStock[directiveStock.length - 1];
      if (["for-array", "for-json"].indexOf(currentDirective) >= 0) {
        funcCodeStr += `\n _row.push(${regData.exec(currentExec)[1]});`;
      } else {
        funcCodeStr += `\n _row.push(${funcParamKey}.${regData.exec(currentExec)[1]});`;
      }
    } else if (regDirectIf.test(currentExec) === true) {
      funcCodeStr += `\n if (${funcParamKey}.${regDirectIf.exec(currentExec)[1]}) {`;
      directiveStock.push("if");
    } else if (regDirectForArray.test(currentExec) === true) {
      const forArrayName = regDirectForArray.exec(currentExec)[1];
      const forArrayIndexName = regDirectForArrayIndex.exec(currentExec)[1] || "index";
      const forArrayIndexItem = regDirectForArrayItem.exec(currentExec)[1] || "item";
      funcCodeStr += `
      \n for ( let ${forArrayIndexName}=0; ${forArrayIndexName}<${funcParamKey}.${forArrayName}.length; ${forArrayIndexName}++ ) {
          const ${forArrayIndexItem} = ${funcParamKey}.${forArrayName}[${forArrayIndexName}]; 
      `;
      directiveStock.push("for-array");
    } else if (regDirectForJSON.test(currentExec) === true) {
      const forJSONName = regDirectForJSON.exec(currentExec)[1];
      const forJSONKey = regDirectForJSONKey.exec(currentExec)[1] || "key";
      const forJSONValue = regDirectForJSONVal.exec(currentExec)[1] || "value";
      funcCodeStr += `
      \n for ( const ${forJSONKey} in ${funcParamKey}.${forJSONName} ) {
          const ${forJSONValue} = ${funcParamKey}.${forJSONName}[${forJSONKey}]; 
      `;
      directiveStock.push("for-json");
    } else if (regDirectEnd.test(currentExec) === true) {
      funcCodeStr += `\n }`;
      directiveStock.pop();
    } else {
      funcCodeStr += `\n _row.push(\`${restCode}\`); `;
    }
  };
  let excecResult;
  while (match) {
    excecResult = regTpl.exec(tplCode);
    if (match && excecResult) {
      const restCode = tplCode.slice(codeIndex, excecResult.index);
      const currentExec = excecResult[0];
      const currentMatch = excecResult[1];
      addFuncCode({ restCode });
      addFuncCode({ currentExec, currentMatch, restCode });
      codeIndex = excecResult.index + excecResult[0].length;
    } else {
      match = false;
    }
  }
  addFuncCode({ restCode: tplCode.substr(codeIndex, tplCode.length) });

  funcCodeStr += `\n return _row.join("");`;
  funcCodeStr = funcCodeStr.replace(/[\r\t\n]/g, "");
  return funcCodeStr;
}

const template = {
  compile (tpl, data) {
    const funcStr = compileToFunctionStr(tpl);
    const func = new Function(funcParamKey, funcStr.replace(/[\r\t\n]/g, ""));
    const html = func(data);
    return html;
  }
};
export const compileTemplate = template.compile;
