import { inputRules, textblockTypeInputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";


/*
Los InputRules son reglas que escuchan lo que el usuario escribe y, 
cuando el texto coincide con un patrón, transforman automáticamente el contenido.
Ocurren mientras escribes, no cuando presionas un botón ni un atajo de teclado.
*/
export function buildInputRules(schema: Schema) { //aqui Scheme solo es el tipo del dato
  const rules = [];

  // ``` → code_block
  if (schema.nodes["code_block"]) {
    rules.push(
      textblockTypeInputRule(
        /^```$/,
        schema.nodes["code_block"]
      )
    );
  }

  // # → heading
  if (schema.nodes["heading"]) {
    rules.push(
      textblockTypeInputRule(
        /^#\s$/,
        schema.nodes["heading"],
        { level: 1 }
      )
    );
  }

  return inputRules({ rules });
}
