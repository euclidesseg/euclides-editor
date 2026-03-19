import { Plugin } from "prosemirror-state";
import { undoDepth, redoDepth } from "prosemirror-history";
import { EditorStateService } from "../../core/services/editor-state.service";

export function buildHistoryStatePlugin(stateService: EditorStateService):Plugin {

  return new Plugin({

    //Esta función se ejecuta una sola vez, cuando el plugin se conecta al editor.
    view(view) {

      const updateState = () => {
        // undoDepth(view.state) pregunta cuantos pasos hay disponibles par deshacer si es mayor que cero
        // podemos hacer undo
        stateService.canUndo.set(undoDepth(view.state) > 0);
        stateService.canRedo.set(redoDepth(view.state) > 0);
      };

      // updateState escuha cuando el editor se inicia y revisa si hay algo que deshacer o rehacer
      updateState();
      

      // cada que el editor cambia ProseMirror ejecuta update()
      return {
        update() {
          updateState();
        }
      };
    }
  });
}
