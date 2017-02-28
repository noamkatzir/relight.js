const http = require('http');
const { renderDOM } = require("../relight")(null,false);

class menuItem {
    constructor({props, componentId}) {
        this.title = props.title;
        this.link = props.link;
        this.componentId = componentId;
    }

    render() {
        return `<div>
				 <header>${this.title}</header>
				 <a href="${this.link}">${this.link}</a>
				 </div>`;
    }
}

class Menu {
    constructor() {
        this.items = [
            {title: "google", link: "http://www.google.com"},
            {title: "facebook", link: "http://www.facebook.com"},
            {title: "github", link: "http://www.github.com"}
        ];
    }

    render() {
        return `<div>${this.items.map(itemProps => renderDOM(menuItem, itemProps)).join('')}</div`;


    }
}



http.createServer( (request, response) => {
    response.writeHead(200, {'Content-Type':'text/html'});
    response.end(renderDOM(Menu,[]));
}).listen(8080);