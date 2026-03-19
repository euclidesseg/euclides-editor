import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditorStateService {

  canUndo = signal(false);
  canRedo = signal(false);

}
