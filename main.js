'use strict';

(function () {
    class App {
        constructor() {
            this.router = new Router();
            this.view = document.querySelector('#app');
            this.router
                .add('/', this.renderRoot.bind(this))
                .add('/hello', this.renderHello.bind(this))
                .add('*', this.renderNone.bind(this));
            this.init();
        }

        init() {
            window.addEventListener('load', () => this.router.run());
            window.addEventListener('hashchange', () => this.router.run());
        }

        renderHello() {
            // Рисуєм кучу непонятного контенту Lul
            const p = this.createElem;
            const html = p('div', {id: 'header'}, [
                p('div', {style: 'font-size: 2rem;'}, 'Сторінка привітання'),
                p('br'),
                p('div', null, 'Привіт Привіт  Привіт Привіт Привіт Привіт Привіт Привіт Привіт!'),
                p('br'),
                p('a', {href: '#'}, 'Перейти на головну'),
                ' ',
                p('a', {href: '#', onclick(evt) {evt.preventDefault(); app.router.navigateBack()}}, [
                    'Перейти ',
                    p('span', {style: {color: 'black'}}, 'назад')
                ])
            ]);
            this.view.innerHTML = '';
            this.view.appendChild(html);
        }

        renderNone() {
            const p = this.createElem;
            const html = p('div', {id: 'header'}, [
                p('div', {style: 'font-size: 2rem;'}, 'Тут нічого немає('),
                p('a', {href: '#'}, 'Перейти на головну'),
                ' ',
                p('a', {href: '#', onclick(evt) {evt.preventDefault(); app.router.navigateBack()}}, [
                    'Перейти ',
                    p('span', {style: {color: 'black'}}, 'назад')
                ])
            ]);
            this.view.innerHTML = '';
            this.view.appendChild(html);
        }

        renderRoot() {
            const p = this.createElem;
            const html = p('div', {id: 'header'}, [
                p('div', {style: 'font-size: 2rem;'}, 'Привіт, TernopilJS!'),
                p('br'),
                p('div', null, 'Базовий приклад SPA без використання сторонніх бібліотек.'),
                p('br'),
                p('a', {href: '#/hello'}, 'Перейти на привітання'),
                ' ',
                p('a', {href: '#', onclick(evt) {evt.preventDefault(); app.router.navigateBack()}}, [
                    'Перейти ',
                    p('span', {style: {color: 'black'}}, 'назад')
                ])
            ]);
            this.view.innerHTML = '';
            this.view.appendChild(html);
        }

        createElem(elem, props, children) {
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
        };
    }

    class Router {
        constructor() {
            this.routes = {};
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

    const app = new App();
})();


