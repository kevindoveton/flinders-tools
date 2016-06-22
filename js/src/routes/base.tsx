export abstract class Page {
    path:string;
    page;
 
    constructor(path:string,page)  {
        this.path = path;
        this.page = page;

        page(path,(data) => {
            this.render(data);
        });

        this.initialise();
    }

    abstract initialise():void;

    abstract render(data):void;
}
