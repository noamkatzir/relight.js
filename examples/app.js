const { renderDOM } = require("../relight")(document);


class Post {
    constructor({props, componentId}) {
        this.title = props.title;
        this.body = props.body;
        this.componentId = componentId;
    }

    render() {
        return `<div>
				 <header>${this.title}</header>
				 <content>${this.body}</content>
				 </div>`;
    }
}

class Timeline {
    constructor({props, componentId}) {
        this.posts = props;
        this.componentId = componentId;
    }

    render() {
        return `<div>
					${this.posts.map(post => renderDOM(Post,post)).join('')}
				</div>`;
    }
}

class AppComponent {
    constructor(posts,componentId) {
    }

    render() {
        return `<div>
			${renderDOM(Timeline,[
            {title: "title 1", body: "body 1"},
            {title: "title 1", body: "body 1"},
            {title: "title 1", body: "body 1"},
            {title: "title 1", body: "body 1"},
            {title: "title 1", body: "body 1"}
        ])}

		${renderDOM(Timeline,[
            {title: "title 2", body: "body 2"},
            {title: "title 2", body: "body 2"},
            {title: "title 2", body: "body 2"},
            {title: "title 2", body: "body 2"},
            {title: "title 2", body: "body 2"}
        ])}
		</div>`
    }
}

document.body.insertAdjacentHTML('afterBegin',renderDOM(AppComponent));
