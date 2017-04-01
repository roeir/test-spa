class Router {
    constructor() {
        this.routes = {};
        window.addEventListener('load', () => this.run());
        window.addEventListener('hashchange', () => this.run());
    }

    add(path, fn) {
        this.routes[path] = fn;
        return this;
    }

    navigateBack() {
        history.back();
    }

    run() {
        let path = location.hash.slice(1);
        if(!path) {
            path = '/';
        }
        const route = this.routes[path];
        if(route) {
            return route();
        }
        return this.routes['*']();
    }
}

const store = {
    get(key) {
        return localStorage.getItem(key)
    },
    set(key, value) {
        return localStorage.setItem(key, value);
    }
};

class Model {
    defineModel(options) {
        this[options.name] = new Collection(options, this);
    }
}

class Collection {
    constructor(options, rootModel) {
        this.__rootModel = rootModel;
        this.__name = options.name;
        this.__fields = options.fields;
        this.__data = {};
            // this.__getInitialData();
    }

    insert(data) {
        if(this.__validateData(data)) {
            this.__data[data.id] = data;
            this.__saveData(data);
        } else {
            throw new Error({
                message: 'Bad data',
                data
            });
        }
    }

    __getInitialData() {
        try{
            const data = store.get(this.__name);
            return JSON.parse(data);
        } catch (err) {
            console.log('Failed to load data');
        }
    }

    __saveData(data) {
        try {
            store.set(this.__name, JSON.stringify(this.__data));
        } catch (err) {
            console.log('Saving error', this.__data);
        }
    }

    __validateData(data) {
        const dataProps = Object.keys(data);
        return dataProps.every(prop => {
            const field = this.__fields[prop];
            if (!field) {
                return false;
            }
            if(field.type && !(field.type === typeof data[prop])) {
                return false;
            }
            if(field.presence && !data[prop]) {
                return false;
            }

            return true;
        });
    }
}

const model = new Model();

model.defineModel({
    name: 'author',
    fields: {
        id: {type: 'string'},
        fullName: {type: 'string', defaultTo: '', presence: true},
        avatarUrl: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        dateOfDeath: {type: 'string', defaultTo: ''},
        city: {type: 'string', defaultTo: ''},
        books: {ref: 'book'}
    }
});
model.defineModel({
    name: 'book',
    fields: {
        id: {type: 'string'},
        title: {type: 'string', defaultTo: ''},
        image: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        genre: {type: 'string', defaultTo: ''},
        year: {type: 'string', defaultTo: ''},
        authors: {ref: 'author'}
    }
});

model.author.insert({
    id: '1',
    fullName: 'Death Man Bill',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1']
});
model.author.insert({
    id: '2',
    fullName: 'Dead Star',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['2']
});

model.book.insert({
    id: '1',
    title: 'Book of Death Man',
    image: '',
    genre: 'Novel',
    year: '2000',
    authors: ['1']
});
model.book.insert({
    id: '2',
    title: 'Book of Dead Star',
    image: '',
    genre: 'Novel Drama',
    year: '2001',
    authors: ['2']
});

function p(elem, props, children) {
    const addPropsToElem = (elem, props) => {
        if(props) {
            Object.keys(props).forEach(prop => {
                elem[prop] = props[prop];
            });

            return elem;
        }

        return elem;
    };

    const makeKiddosList = kiddos => {
        return [].concat(kiddos);
    };

    const addKiddosToElem = (elem, kiddos) => {
        if(!kiddos) {
            return elem;
        }
        const kiddosList = makeKiddosList(kiddos);

        kiddosList.forEach(innerElem => {
            if(innerElem.nodeType === 1) {
                elem.appendChild(innerElem);
                return;
            }

            elem.appendChild(document.createTextNode(innerElem));
        });
        return elem;
    };

    let node = document.createElement(elem);
    node = addPropsToElem(node, props);
    node = addKiddosToElem(node, children);

    return node;
}

function renderView(view) {
    const root = document.querySelector('#app');
    while (root.lastChild) {
        root.removeChild(root.lastChild);
    }
    root.appendChild(renderHeader());
    root.appendChild(view);
}

function renderRoot() {
    const view = p('main', {className: 'site-main'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'site-title', textContent: 'Death poets\' community'})
        ])
    ]);
    return renderView(view);
}

function renderHeader() {
    return p('header', {className: 'site-header'}, [
        p('div', {className: 'container'}, [
            p('div', {className: 'site-logo'}, [
                p('a', {href: '#', textContent: 'Dp'})
            ]),
            p('div', {className: 'site-links'}, [
                p('a', {href: '#/authors', textContent: 'Authors'}),
                p('a', {href: '#/books', textContent: 'Books'}),
            ])
        ])
    ]);
}

function renderNone() {
    const view = p('main', {className: 'site-main'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'none-title', textContent: '404 page'}),
            p('h2', {className: 'none-subtitle', textContent: 'There is no hope!'}),
            p('p', {className: 'none-nav'},[
                p('a', {href: '#', textContent: 'Go back?', className: 'none-nav', onclick(evt) {evt.preventDefault(); router.navigateBack()}})
            ])
        ])
    ]);
    return renderView(view);
}


const router = new Router();
router.add('/', renderRoot)
    .add('*', renderNone);



