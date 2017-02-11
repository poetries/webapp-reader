// main entry
import app from './app.js';

let entry = () => {
    app.eventHandle();
    let readerUI = app.readerBaseStruct(chapter_content);
    app.readerModule().init((data) => {
        readerUI(data);
    });
    app.readerBaseStruct();
};
entry();