import { NodeType } from "prosemirror-model";
import { liftListItem, wrapInList } from "prosemirror-schema-list";
import { Command } from "prosemirror-state";

/**
 * Alterna el tipo de lista (`bullet_list` u `ordered_list`) en el bloque actual.
 *
 * Este comando maneja correctamente distintos contextos del documento
 * para garantizar que la estructura resultante sea válida según el schema.
 *
 * Comportamiento:
 *
 * 1. Si el bloque actual es un `heading`, primero se convierte en `paragraph`,
 *    ya que los `list_item` normalmente esperan contener párrafos como hijos.
 *
 * 2. Luego se analiza la jerarquía del documento para determinar si la selección
 *    actual se encuentra dentro de una lista (`bullet_list` o `ordered_list`).
 *
 * 3. Si ya estamos dentro de una lista:
 *    - Si el tipo de lista es el mismo (`listType`), se elimina la lista
 *      elevando el `list_item` con `liftListItem`.
 *    - Si es un tipo diferente de lista, se reemplaza el nodo de lista actual
 *      usando `setNodeMarkup` para cambiar su tipo.
 *
 * 4. Si la selección no está dentro de ninguna lista, se envuelve el bloque
 *    actual dentro de una nueva lista mediante `wrapInList`.
 *
 * Este comportamiento reproduce el patrón típico de los editores de texto
 * enriquecido donde el mismo botón permite:
 *
 * - crear una lista
 * - cambiar entre tipos de lista
 * - eliminar una lista existente
 *
 * @param listType Tipo de nodo de lista (`bullet_list` o `ordered_list`)
 *
 * @returns
 * - `true` si el comando pudo ejecutarse
 * - `false` si no se pudo aplicar ninguna transformación
 *
 * Ejemplo de uso:
 *
 * ```ts
 * keymap({
 *   "Mod-Shift-8": switchList(schema.nodes.bullet_list),
 *   "Mod-Shift-7": switchList(schema.nodes.ordered_list)
 * })
 * ```
 */
export const switchList = (listType: NodeType): Command => {
  return (state, dispatch) => {

    const { schema, selection } = state;
    const { $from, from, to } = selection;

    // 1️⃣ Si estamos en heading → convertir a paragraph primero
    if ($from.parent.type === schema.nodes["heading"]) {

      if (dispatch) {
        dispatch(
          state.tr.setBlockType(from, to, schema.nodes["paragraph"])
        );
      }

      // actualizar state después del dispatch
      state = state.apply(
        state.tr.setBlockType(from, to, schema.nodes["paragraph"])
      );
    }

    const resolved = state.doc.resolve(state.selection.from);

    // 2️⃣ Revisar si ya estamos dentro de una lista
    for (let d = resolved.depth; d > 0; d--) {

      const node = resolved.node(d);

      if (
        node.type === schema.nodes["bullet_list"] ||
        node.type === schema.nodes["ordered_list"]
      ) {

        if (node.type === listType) {
          return liftListItem(schema.nodes["list_item"])(state, dispatch);
        }

        if (dispatch) {
          dispatch(
            state.tr.setNodeMarkup(resolved.before(d), listType)
          );
        }

        return true;
      }
    }

    // 3️⃣ Si no hay lista → crearla
    return wrapInList(listType)(state, dispatch);
  };
};