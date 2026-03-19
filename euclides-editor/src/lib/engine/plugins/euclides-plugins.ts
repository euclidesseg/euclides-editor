import { keymap } from 'prosemirror-keymap';
import { baseKeymap} from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { EuclidesEditorSchema } from '../schema/euclides-schema';
import { buildEuclidesKeymap } from '../keymaps/euclides-keymaps';
import { EditorStateService } from '../../core/services/editor-state.service';
import { buildHistoryStatePlugin } from './history-buttons.plugin';

/*
  Los plugins extienden el comportamiento del editor:

  Lógica personalizada

  Un plugin puede encargarse de cosas como:

  Atajos de teclado (keymap)

  Deshacer / rehacer (history)

  Reglas al escribir (inputRules)

  Reaccionar a cambios del editor

  Cambiar el estado según lo que haces
    
  Sincronización con el EditorStateService (Angular)

*/


export function buildPlugins(stateService: EditorStateService) {
  return [
    buildEuclidesKeymap(EuclidesEditorSchema), // 👈 PRIMERO
    keymap(baseKeymap),                        // 👈 DESPUÉS
    history(),
    buildHistoryStatePlugin(stateService),
  ];
}