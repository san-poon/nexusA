import TOC from "./components/toc";
import { TocProvider } from "./components/toc-context";
import Editor from "./editor/Editor";

export default function EditorPage() {
  return (
    <div className='editor-shell min-h-[92vh]'>
      <div className="flex">
        <TocProvider>
          <div className="w-1/5 h-full sticky top-16 left-0">
            <TOC />
          </div>
          <div className="w-4/5">
            <Editor />
          </div>
        </TocProvider>
      </div>
    </div>
  );
}
