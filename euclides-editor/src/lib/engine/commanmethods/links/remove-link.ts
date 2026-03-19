/**
 * Elimina un enlace (mark `link`) del editor.
 *
 * Esta función maneja dos escenarios:
 *
 * 1. Si el usuario tiene texto seleccionado:
 *    - Se elimina el mark `link` únicamente dentro del rango seleccionado.
 *
 * 2. Si solo hay un cursor (sin selección):
 *    - Se intenta detectar si el cursor está dentro de un enlace.
 *    - Si es así, se obtiene el rango completo del enlace usando `getLinkRange`
 *      y se elimina el mark en todo ese rango.
 *
 * @param view Instancia del EditorView de ProseMirror.
 *
 * @returns
 * - `true` si se eliminó un enlace correctamente.
 * - `false` si no se encontró ningún enlace para eliminar.
 *
 * Flujo interno:
 * 1. Obtiene el estado actual del editor (`state`) y la función `dispatch`.
 * 2. Obtiene el mark `link` desde el schema.
 * 3. Verifica si la selección está vacía o contiene texto.
 * 4. Si hay selección → elimina el link en ese rango.
 * 5. Si no hay selección → busca el enlace alrededor del cursor con `getLinkRange`.
 * 6. Si se encuentra → elimina el mark en todo el rango del enlace.
 */

import { EditorView } from "prosemirror-view";
import { getLinkRange } from "../../../core/utils/links/get-link-range";

export const removeLink = (view: EditorView): boolean => {
  const { state, dispatch } = view;

  const linkMark = state.schema.marks["link"];

  const { from, to, empty } = state.selection;

  // si hay texto seleccionado
  if (!empty) {
    dispatch(state.tr.removeMark(from, to, linkMark));
    return true;
  }else{

  }

  // si solo hay cursor
  const linkInfo = getLinkRange(state);
  if (!linkInfo) return false;

  dispatch(
    state.tr.removeMark(linkInfo.start, linkInfo.end, linkMark)
  );

  return true;
};