import { EditorState, Transaction } from "prosemirror-state";
import { EuclidesEditorSchema } from "../../schema/euclides-schema";

/**
 * Convierte el bloque actual de la selección en un nodo `heading`.
 *
 * Esta función construye una `Transaction` de ProseMirror que transforma
 * el bloque seleccionado (por ejemplo un `paragraph` o un `list_item`)
 * en un `heading` con el nivel indicado.
 *
 * Comportamiento:
 * 1. Obtiene el rango de bloques que abarca la selección actual.
 * 2. Si la selección se encuentra dentro de una lista (`bullet_list` o `ordered_list`),
 *    primero eleva (`lift`) el contenido fuera de la lista para evitar estructuras
 *    inválidas en el documento.
 * 3. Después de ajustar la estructura, convierte el bloque resultante
 *    en un nodo `heading` utilizando `setBlockType`.
 * 4. Usa `tr.mapping.map()` para recalcular las posiciones del rango,
 *    ya que el documento pudo haber cambiado tras ejecutar `lift`.
 *
 * Esta función **no ejecuta el dispatch**, únicamente construye la transacción.
 * El `dispatch` debe ejecutarse en la capa de servicio o controlador del editor.
 *
 * @param level Nivel del encabezado (por ejemplo: 1, 2, 3, 4).
 * @param state Estado actual del editor (`EditorState`).
 *
 * @returns
 * - `Transaction` si la operación es válida.
 * - `null` si no se pudo determinar un rango de bloque válido.
 *
 * Ejemplo de uso:
 *
 * ```ts
 * const tr = turnIntoHeading(2, view.state);
 * if (tr) {
 *   view.dispatch(tr);
 * }
 * ```
 */
export function turnIntoHeading(level: number, state: EditorState): Transaction | null {

  const { $from, $to } = state.selection;

  // Obtiene el rango de bloques que cubre la selección actual
  const range = $from.blockRange($to);
  if (!range) return null;

  let tr = state.tr;

  // Si el bloque actual está dentro de una lista, lo elevamos
  // para poder convertirlo correctamente en un heading
  if (range.depth > 0 && $from.node(range.depth - 1).type.name.includes("list")) {
    const target = 0;
    tr = tr.lift(range, target);
  }

  // Tipo de nodo heading definido en el schema
  const nodeType = EuclidesEditorSchema.nodes['heading'];

  // Convierte el bloque actual en un heading del nivel indicado
  tr = tr.setBlockType(
    tr.mapping.map(range.start),
    tr.mapping.map(range.end),
    nodeType,
    { level }
  );

  return tr;
}