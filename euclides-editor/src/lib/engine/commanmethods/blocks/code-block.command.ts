import { setBlockType } from "prosemirror-commands";
import { Command, EditorState, Transaction } from "prosemirror-state";
import { EuclidesEditorSchema } from "../../schema/euclides-schema";

/**
 * Convierte el bloque actual en un nodo `code_block`.
 *
 * Este comando maneja correctamente el caso especial donde la selección
 * se encuentra dentro de una lista (`bullet_list` u `ordered_list`).
 *
 * Comportamiento:
 *
 * 1. Se recorre la jerarquía del documento desde la posición actual (`$from`)
 *    para detectar si el cursor está dentro de una lista.
 *
 * 2. Si se encuentra una lista:
 *    - Se extrae el texto de todos los `list_item` contenidos en la lista.
 *    - Cada elemento de la lista se convierte en una línea dentro del bloque
 *      de código, separada por saltos de línea (`\n`).
 *    - Luego la lista completa es reemplazada por un único nodo `code_block`
 *      que contiene todo el texto concatenado.
 *
 *    Ejemplo:
 *
 *    Antes:
 *    ```
 *    bullet_list
 *      ├ list_item → "console.log('hola')"
 *      ├ list_item → "console.log('mundo')"
 *    ```
 *
 *    Después:
 *    ```
 *    code_block
 *    console.log('hola')
 *    console.log('mundo')
 *    ```
 *
 * 3. Si la selección **no está dentro de una lista**, el comando delega
 *    el comportamiento estándar a `setBlockType`, que convierte el bloque
 *    actual directamente en `code_block`.
 *
 * Este patrón permite que el botón "Code Block" funcione correctamente
 * tanto en contenido normal como dentro de listas.
 *
 * @returns
 * - `true` si el comando pudo ejecutarse correctamente.
 * - `false` si no se pudo aplicar ninguna transformación.
 *
 * Ejemplo de uso:
 *
 * ```ts
 * keymap({
 *   "Mod-Alt-c": turnIntoCodeBlock()
 * })
 * ```
 */
export const turnIntoCodeBlock = (): Command => {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {

    const { selection, tr } = state;
    const { $from } = selection;

    // Buscar si estamos dentro de una lista
    for (let d = $from.depth; d > 0; d--) {

      const node = $from.node(d);

      if (
        node.type === EuclidesEditorSchema.nodes["bullet_list"] ||
        node.type === EuclidesEditorSchema.nodes["ordered_list"]
      ) {

        // Extraer texto de todos los elementos de la lista
        let text = "";

        node.forEach((listItem: any) => {
          const para = listItem.firstChild;

          if (para) {
            text += para.textContent + "\n";
          }
        });

        text = text.trimEnd();

        // Crear el nuevo nodo code_block con el texto concatenado
        const codeBlock = EuclidesEditorSchema.nodes["code_block"].create(
          null,
          EuclidesEditorSchema.text(text)
        );

        // Reemplazar la lista completa por el bloque de código
        if (dispatch) {
          dispatch(
            tr.replaceWith(
              $from.before(d),
              $from.after(d),
              codeBlock
            )
          );
        }

        return true;
      }
    }

    // Si no está dentro de lista, usar el comportamiento estándar
    return setBlockType(EuclidesEditorSchema.nodes["code_block"])(state, dispatch);
  };
};