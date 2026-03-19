import { toggleMark , setBlockType} from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { undo, redo } from "prosemirror-history";
import {splitListItem} from 'prosemirror-schema-list'
import { Schema } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { turnIntoCodeBlock } from "../commanmethods/blocks/code-block.command";

export function buildEuclidesKeymap(schema:Schema):Plugin{

    return keymap({
        "Mod-b": toggleMark(schema.marks["strong"]),
        "Mod-i": toggleMark(schema.marks["em"]),
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-Alt-c":turnIntoCodeBlock(),
    
        "Shift-Mod-z": redo, // Mac usa este comando
        "Shift-Enter": cmd,
        // agrega una nuevo item de lista
        "Enter": splitListItem(schema.nodes["list_item"]),
        "Shift-Ctrl-c": setBlockType(schema.nodes['code_block'])
    })
} 

// insertar comando un salto de linea para listas
const cmd = (state:EditorState, dispatch?:(tr:Transaction) => void) => {
  const brType = state.schema.nodes["hard_break"];
  if (!brType) return false;
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(brType.create()).scrollIntoView());
  }
  return true;
};  
