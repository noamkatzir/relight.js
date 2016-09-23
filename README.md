# relight.js

Should we use Backbone, or maybe Angular? React? No.

Modern web browsers improved, javascript has a rich syntax and you don't need frameworks.

Then why do you need this project? you don't.

relight.js is a simple yet powerful components dom rendering library which levrage existing standards.
its goal is to inspire web developers, and change current perspective.

Also examples are presented in ES2015, you can use it with ES5 with minor changes.

# simple example - lets render a timeline
``` javascript
class Post {
    constructor({props, componentId}) {
        this.title = props.title;
        this.body = props.body;
        this.componentId = componentId;
    });
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
```

the example use ES2015 classes and template string and code look similar to React, however it is vanila javascript


# advanced example - lets render build a todo app using "Reactive" architecture
``` javascript
class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    addEventListener(eventName, callback) {
        (eventName || '').split(' ').forEach(name => {
            this.listeners[name] = this.listeners[name] || [];
            this.listeners[name].push(callback);
        });
    }

    once(eventName, callback) {
        var listener = (...params) => {
            this.removeEventListener(eventName,listener);
            callback(...params);
        };

        this.addEventListener(eventName, listener);
    }

    removeEventListener(eventName, callback) {
        (eventName || '').split(' ').forEach(name => {
            if(!Array.isArray(this.listeners[eventName])) return;

            if(callback) {
                var index = this.listeners[eventName].indexOf(callback);
                index > -1 && this.listeners[eventName].splice(index,1);
            } else {
                delete this.listeners[eventName];
            }
        });
    }

    emit(eventName, ...params) {
        var listeners = this.listeners[eventName] || [];
        [...listeners].forEach(listener => listener(...params));
    }
}

class Component {
    constructor(componentId) {
        this.componentId = componentId;
        this.afterRender = () => {
            this.component = getComponentElem(this.componentId);
            this.link(this.component);
        };
        dispatcher.once('finishedRender', this.afterRender);
    }

    destroy() {
        dispatcher.removeEventListener('finishedRender', this.afterRender);
        this.component.remove();
        this.component = null;
    }
}


class TodosStore extends EventEmitter{
    constructor() {
        super();
        this.nextTodoId=1;
        this.todos = [];
    }

    addTodo(todoMission) {
        var todo = {
            id: this.nextTodoId++,
            text: todoMission,
            pending: true
        };
        this.todos.push(todo);
        this.emit('todoAdded',todo);
    }

    toggleTodo(todoId) {
        var todo = this.todos.find(todo => todo.id == todoId);
        if(todo) {
            todo.pending = !todo.pending;
            this.emit('toggledTodo',todo);
        }
    }

    toggleSelection(todoId) {
        var todo = this.todos.find(todo => todo.id == todoId);
        if(todo) {
            todo.selection = !todo.selection;
        }
    }

    removeSelected() {
        var todos = this.todos.filter(todo => !todo.selection),
            removed = this.todos.filter(todo => todo.selection);
        if(todos.length != this.todos.length) {
            this.todos = todos;
            dispatcher.emit('removeItems', removed);
        }
    }
}

class Todo extends Component {
    constructor({props, componentId}) {
        super(componentId);
        this.todo = props;
        this.listeners = [];
    }

    link(element) {
        this.checkbox = element.querySelector('input[type=checkbox]');
        this.content = element.querySelector('span');
        this.listeners = [
            {
                target: todos,
                event: 'toggledTodo',
                callback: todo => {if (this.todo.id == todo.id) this.component.classList.toggle('finished', !todo.pending)}
            },
            {
                target: this.content,
                event: 'click',
                callback: (event) => dispatcher.emit('toggleToDo',this.todo.id)
            },
            {
                target: this.checkbox,
                event: 'click',
                callback: (event) => dispatcher.emit('toggleSelection',this.todo.id)
            },
            {
                target: dispatcher,
                event: 'removeItems',
                callback: (removedTodos) => {
                    if(removedTodos.find(todo => todo.id == this.todo.id)) this.destroy();
                }
            }
        ];

        this.listeners.forEach(listener => listener.target.addEventListener(listener.event,listener.callback));
    }

    destroy() {
        super.destroy();
        this.listeners.forEach(listener => listener.target.removeEventListener(listener.event,listener.callback));
        this.checkbox = this.content = null;
    }

    render() {
        return `<li class="${!this.todo.pending? 'finished' : ''}"><input type="checkbox"><span>${this.todo.id} - ${this.todo.text}</span></li>`;
    }
}

class TodoList extends Component {
    constructor({props, componentId}) {
        super(componentId);
    }

    link(element) {
        this.addButton = element.querySelector('button.add');
        this.removeButton = element.querySelector('button.remove');
        this.refreshButton = element.querySelector('button.refresh');
        this.input = element.querySelector('input');
        this.list = element.querySelector('.list');

        this.listeners = [
            {
                target: todos,
                event: 'todoAdded',
                callback: todo => {
                    this.list.insertAdjacentHTML('beforeEnd', renderDOM(Todo,todo));
                    dispatcher.emit('finishedRender');
                }
            },
            {
                target: this.addButton,
                event: 'click',
                callback: (event) => dispatcher.emit('addToDo', this.input.value)
            },
            {
                target: this.removeButton,
                event: 'click',
                callback: (event) => dispatcher.emit('removeSelected')
            },
            {
                target: this.refreshButton,
                event: 'click',
                callback: (todos) => {
                    destroyComponents(this.component.querySelector('ul.list'));
                    this.list.insertAdjacentHTML('beforeEnd', this.generateList());
                    dispatcher.emit('finishedRender');
                }
            }
        ];

        this.listeners.forEach(listener => listener.target.addEventListener(listener.event,listener.callback));
    }

    destroy() {
        super.destroy();
        this.addButton = this.removeButton = this.refreshButton = this.input = this.list = null;
        this.listeners.forEach(listener => listener.target.removeEventListener(listener.event,listener.callback));
    }

    generateList() {
        return todos.todos.map(todo => renderDOM(Todo,todo)).join('');
    }

    render() {
        return `<div>
                    <input />
                    <button class="add">Add todo</button>
                    <button class="remove">remove selected todos</button>
                    <button class="refresh">refresh</button>
                    <ul class="list">
                    ${this.generateList()}
                    </ul>
                </div>`;
    }
}

var dispatcher = new EventEmitter();
var todos = new TodosStore();

dispatcher.addEventListener('toggleToDo', todoId => todos.toggleTodo(todoId));
dispatcher.addEventListener('toggleSelection', todoId => todos.toggleSelection(todoId));
dispatcher.addEventListener('addToDo', todoText => todos.addTodo(todoText));
dispatcher.addEventListener('removeSelected', () => todos.removeSelected());
document.body.insertAdjacentHTML('afterBegin',renderDOM(TodoList));
dispatcher.emit('finishedRender');
```