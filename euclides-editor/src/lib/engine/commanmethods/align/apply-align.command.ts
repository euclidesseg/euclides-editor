import { EditorState, Transaction } from "prosemirror-state";

export function setTextAlign(align: string) {

  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {

    const { selection } = state;
    let tr = state.tr;

    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {

      // solo bloques
      if (!node.isBlock) return;

      // solo nodos que soporten textAlign
      if (!node.type.spec.attrs?.["textAlign"]) return;

      tr = tr.setNodeMarkup(pos, node.type, {
        ...node.attrs,
        textAlign: align
      });
    });

    if (!tr.docChanged) return false;

    dispatch?.(tr);
    return true;
  };
}