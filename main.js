class Router {
    constructor() {
        this.routes = {};
        this.init();
    }

    add(path, callback) {
        this.routes[path] = callback;
        return this;
    }

    handleChange(event) {
        const path = location.pathname;
        const route = this.routes[path];
        if(route) {
            route();
        } else {
            this.routes['*']();
        }
    }

    navigate(path) {
        history.pushState({message: 'new state'}, null, path);
        window.dispatchEvent(new PopStateEvent('popstate', {
            bubbles: false,
            cancelable: false,
            state: history.state
        }));
    }

    init() {
        window.addEventListener('load', this.handleChange.bind(this));
        window.addEventListener('popstate', this.handleChange.bind(this));
    }
}

function linkClick(event) {
    event.preventDefault();
    router.navigate('/home');
}

const router = new Router();
router
    .add('/', function () {
        const p = document.createElement('p');
        p.textContent = 'root';
        app.appendChild(p);
    })
    .add('*', function () {
        console.log('hello 404');
    })
    .add('/home', function () {
        const p = document.createElement('p');
        p.textContent = 'home';
        app.appendChild(p);
    });
