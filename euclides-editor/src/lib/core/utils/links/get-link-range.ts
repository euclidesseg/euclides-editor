import { EditorState } from "prosemirror-state";

/**
 * Obtiene el rango completo de un enlace (link mark)
 * cuando el cursor está dentro o justo en el borde de él.
 *
 * Devuelve:
 * {
 *   start: número donde inicia el enlace
 *   end: número donde termina el enlace
 *   link: instancia del mark de link encontrado
 * }
 *
 * Si el cursor no está dentro de un enlace → retorna null.
 */

export function getLinkRange(state: EditorState) {

  // $from representa la posición actual del cursor dentro del documento
  // Es un ResolvedPos que permite navegar el árbol del documento
  const { $from } = state.selection;

  // Obtenemos el tipo de mark "link" desde el schema
  const linkType = state.schema.marks["link"];

  // Si el schema no tiene definido el mark link, salimos
  if (!linkType) return null;

  /**
   * Buscamos si existe un enlace alrededor del cursor.
   *
   * Se revisan tres posibles lugares:
   * 1. Los marks activos en la posición actual
   * 2. El nodo inmediatamente antes del cursor
   * 3. El nodo inmediatamente después del cursor
   *
   * Esto es necesario porque en ProseMirror los marks viven
   * entre posiciones y el cursor puede quedar justo en el borde.
   */

  const link =
    $from.marks().find(m => m.type === linkType) ||
    $from.nodeBefore?.marks.find(m => m.type === linkType) ||
    $from.nodeAfter?.marks.find(m => m.type === linkType);

  // Si no encontramos un link alrededor del cursor → retornamos null
  if (!link) return null;

  // Posición inicial donde se encuentra el cursor
  let start = $from.pos;
  let end = $from.pos;

  /**
   * ⬅️ Expandir hacia la izquierda
   *
   * Retrocedemos nodo por nodo mientras
   * el nodo anterior tenga el mismo mark de link.
   *
   * Cuando encontramos un nodo sin el mark,
   * significa que ahí comienza realmente el enlace.
   */

  while (start > 0) {
    const $pos = state.doc.resolve(start);
    const nodeBefore = $pos.nodeBefore;

    // Si no hay nodo antes o no tiene el mark link → detener
    if (!nodeBefore || !linkType.isInSet(nodeBefore.marks)) break;

    // Retrocedemos el tamaño completo del nodo
    start -= nodeBefore.nodeSize;
  }

  /**
   * ➡️ Expandir hacia la derecha
   *
   * Avanzamos nodo por nodo mientras
   * el nodo siguiente tenga el mismo mark de link.
   */

  while (end < state.doc.content.size) {
    const $pos = state.doc.resolve(end);
    const nodeAfter = $pos.nodeAfter;

    // Si no hay nodo después o no tiene el mark link → detener
    if (!nodeAfter || !linkType.isInSet(nodeAfter.marks)) break;

    // Avanzamos el tamaño completo del nodo
    end += nodeAfter.nodeSize;
  }

  // Retornamos los límites completos del enlace encontrado
  return { start, end, link };
}