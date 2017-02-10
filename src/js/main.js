// main entry
let readerModule;
let readerUI;
let entry = () => {
    eventHandle();
    readerUI = readerBaseStruct(chapter_content);
    readerModule = readerModule();
    readerModule.init((data) => {
        readerUI(data);
    });
    readerBaseStruct();
};
entry();