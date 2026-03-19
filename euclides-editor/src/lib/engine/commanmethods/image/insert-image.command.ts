import { EditorView } from "prosemirror-view";
import { createParagraphNear } from "prosemirror-commands";

export const insertImage = (view: EditorView, src: string) => {
    const { state, dispatch } = view;
    const { schema } = state;
 
    const imageNode = schema.nodes["image"].create({ src });

    let tr = state.tr.replaceSelectionWith(imageNode);

    dispatch(tr.scrollIntoView());

    createParagraphNear(view.state, view.dispatch);

    return true;
};