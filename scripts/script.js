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
            p('div', {className: 'links'}, [
                p('a', {href: '#/authors', textContent: 'Authors'}),
                p('a', {href: '#/books', textContent: 'Books'}),
            ])
        ])
    ]);
}

const router = new Router();
router.add('/', renderRoot);



