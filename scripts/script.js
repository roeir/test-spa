class Router {
    constructor() {
        this.routes = [];
        window.addEventListener('load', () => this.run());
        window.addEventListener('hashchange', () => this.run());
    }

    add(path, fn) {
        this.routes.push({
            path,
            fn
        });
        return this;
    }

    navigateBack() {
        history.back();
    }

    __findRoute(path) {
        return this.routes.find(obj => {
            if (typeof obj.path === 'string') {
                if (obj.path === path) {
                    return obj;
                }
            } else {
                if (path.match(obj.path)) {
                    return obj;
                }
            }
        });
    }

    run() {
        let path = location.hash.slice(1);
        if (!path) {
            path = '/';
        }

        let route = this.__findRoute(path);
        if (!route) {
            route = this.__findRoute('*');
        }

        route.fn();
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
        if (this.__validateData(data)) {
            this.__data[data.id] = data;
            this.__saveData(data);
        } else {
            throw new Error({
                message: 'Bad data',
                data
            });
        }
    }

    update(id, data) {
        const item = this.__data[id];
        if(!item) {
            throw new Error({message: 'there is no such id' + id});
        }
        if(this.__validateData(data)) {
            Object.keys(item).forEach(field => {
                if(item[field] !== data[field]) {
                    item[field] = data[field];
                }
            });
        }
        this.__saveData(this.__data);
    }

    remove(id) {
        if(this.__data[id]) {
            delete this.__data[id];
            this.__saveData(this.__data);
        } else  {
            throw new Error({message: 'there is no such id' + id});
        }
    }

    findSome(value, key = 'id') {
        return this.findAll()
            .find(item => {
                return item[key] === value;
            });
    }

    findAll() {
        return Object.keys(this.__data).map(key => {
            return this.__data[key];
        });
    }

    __getInitialData() {
        try {
            const data = store.get(this.__name);
            return JSON.parse(data);
        } catch (err) {
            console.log('Failed to load data');
        }
    }

    __saveData(data) {
        try {
            store.set(this.__name, JSON.stringify(data));
        } catch (err) {
            console.log('Saving error', data);
        }
    }

    __validateData(data) {
        const dataProps = Object.keys(data);
        return dataProps.every(prop => {
            const field = this.__fields[prop];
            if (!field) {
                return false;
            }
            if (field.type && !(field.type === typeof data[prop])) {
                return false;
            }
            if (field.defaultTo && !data[prop]) {
                data[prop] = field.defaultTo;
                return true;
            }
            if (field.ref) {
                const refKey = '__' + field.ref;

                data[refKey] = () => {
                    return data[prop].map(id => {
                        return this.__rootModel[field.ref].findSome(id, 'id');
                    });
                };

                return true;
            }
            if (field.presence && !data[prop]) {
                return false;
            }

            return true;
        });
    }
}

class BooksController {
    index() {
        const books = model.book.findAll();
        const view = renderBooksIndex(books);
        renderView(view);
    }

    show() {
        const id = location.hash.split('/')[2];
        const book = model.book.findSome(id);
        const view = renderBookShow(book);
        renderView(view);
    }

    ref() {
        const id = location.hash.split('/')[2];
        const book = model.book.findSome(id);
        const authors = book.__author();
        const view = renderBookAuthors(authors, book.title);
        renderView(view);
    }

    edit() {
        const id = location.hash.split('/')[2];
        model.book.update('3', {
            id: '3',
            title: 'Delete book updated',
            image: '',
            genre: 'Novel Drama',
            year: '2001',
            authors: ['1', '2']
        });
        const book = model.book.findSome(id);
        const view = renderBookShow(book);
        renderView(view);
    }

    delete() {
        const id = location.hash.split('/')[2];
        const book = model.book.findSome(id);
        const authors = book.__author();
        authors.forEach(author => {
           const index = author.books.indexOf(id);
           author.books.splice(index, 1);
        });
        model.book.remove(id);
        router.navigateBack();
    }
}

class AuthorsController {
    index() {
        const authors = model.author.findAll();
        const view = renderAuthorsIndex(authors);
        renderView(view);
    }

    show() {
        const id = location.hash.split('/')[2];
        const author = model.author.findSome(id);
        const view = renderAuthorsShow(author);
        renderView(view);
    }

    ref() {
        const id = location.hash.split('/')[2];
        const author = model.author.findSome(id);
        const books = author.__book();
        const view = renderAuthorBooks(books, author.fullName);
        renderView(view);
    }

    edit() {
        const id = location.hash.split('/')[2];
        model.author.update(id, {
            id: '1',
            fullName: 'The Name of Updated Author',
            avatarUrl: '',
            dateOfDeath: '',
            city: '',
            books: ['1', '3']
        });
        const author = model.author.findSome(id);
        const view = renderAuthorsShow(author);
        renderView(view);
    }

    delete() {
        const id = location.hash.split('/')[2];
        const author = model.author.findSome(id);
        const books = author.__book();
        books.forEach(book => {
            const index = book.authors.indexOf(id);
            book.authors.splice(index, 1);
        });
        model.author.remove(id);
        router.navigateBack();
    }
}

const booksController = new BooksController();
const authorsController = new AuthorsController();

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

model.book.insert({
    id: '1',
    title: 'Book of Death Man',
    image: '',
    genre: 'Novel',
    year: '2000',
    authors: ['1', '2']
});
model.book.insert({
    id: '2',
    title: 'Book of Dead Star',
    image: '',
    genre: 'Novel Drama',
    year: '2001',
    authors: ['2']
});
model.book.insert({
    id: '3',
    title: 'Delete book',
    image: '',
    genre: 'Novel Drama',
    year: '2001',
    authors: ['1']
});

model.author.insert({
    id: '1',
    fullName: 'Death Man Bill',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1', '3']
});
model.author.insert({
    id: '2',
    fullName: 'Dead Star',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1', '2']
});

// model.book.update('3', {
//     id: '3',
//     title: 'Delete book updated',
//     image: '',
//     genre: 'Novel Drama',
//     year: '2001',
//     authors: ['1', '2']
// });
// model.book.remove('3');

function p(elem, props, children) {
    const addPropsToElem = (elem, props) => {
        if (props) {
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
        if (!kiddos) {
            return elem;
        }
        const kiddosList = makeKiddosList(kiddos);

        kiddosList.forEach(innerElem => {
            if (innerElem.nodeType === 1) {
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
            p('h1', {className: 'site-title', textContent: 'Death poets\' community'}),
            p('div', {className: 'site-actions'}, [
                p('a', {className: 'add-btn add-author', href: '#', onclick(evt) {
                    evt.preventDefault();
                    console.log('add author');
                }}, 'Add new author'),
                p('a', {className: 'add-btn add-book', href: '#', onclick(evt) {
                    evt.preventDefault();
                    console.log('add book');
                }}, 'Add new book')
            ])
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
            p('p', {className: 'none-nav'}, [
                p('a', {
                    href: '#', textContent: 'Go back?', className: 'none-nav', onclick(evt) {
                        evt.preventDefault();
                        router.navigateBack()
                    }
                })
            ])
        ])
    ]);
    return renderView(view);
}

function renderBooksIndex(data) {
    const renderBook = book => {
        return p('div', {className: 'book'}, [
            p('div', {className: 'book-image'}, [
                p('img', {src: book.image, alt: book.title})
            ]),
            p('div', {className: 'book-info'}, [
                p('a', {href: location.hash + '/' + book.id}, book.title)
            ])
        ])
    };

    return p('div', {className: 'books'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'books-title'}, 'Community books: ')
        ]),
        p('div', {className: 'container'}, data.map(renderBook))
    ]);
}

function renderBookShow(book) {
    return p('div', {className: 'book-body'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'book-title'}, book.title + ' page')
        ]),
        p('div', {className: 'book'}, [
            p('div', {className: 'book-image'}, [
                p('img', {src: book.image, alt: book.title})
            ]),
            p('div', {className: 'book-info'}, [
                p('a', {href: location.hash + '/authors'}, book.title)
            ]),
            p('div', {className: 'book-actions'}, [
                p('a', {
                    href: '#',
                    textContent: 'Edit',
                    className: 'action-edit book-edit',
                    onclick(evt) {
                        evt.preventDefault();
                        booksController.edit();
                    }
                }),
                p('a', {
                    href: '#',
                    textContent: 'Delete',
                    className: 'action-delete book-delete',
                    onclick(evt) {
                        evt.preventDefault();
                        booksController.delete();
                    }
                })
            ])
        ])
    ])
}

function renderAuthorsIndex(data) {
    const renderAuthor = author => {
        return p('div', {className: 'author'}, [
            p('div', {className: 'author-avatar'}, [
                p('img', {src: author.avatarUrl, alt: author.fullName})
            ]),
            p('div', {className: 'author-info'}, [
                p('a', {href: location.hash + '/' + author.id}, author.fullName)
            ])
        ]);
    };

    return p('div', {className: 'authors'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'authors-title'}, 'Community authors: ')
        ]),
        p('div', {className: 'container'}, data.map(renderAuthor))
    ]);
}

function renderAuthorsShow(author) {
    return p('div', {className: 'author-body'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'author-title'}, author.fullName + ' page')
        ]),
        p('div', {className: 'author'}, [
            p('div', {className: 'author-avatar'}, [
                p('img', {src: author.avatarUrl, alt: author.fullName})
            ]),
            p('div', {className: 'author-info'}, [
                p('a', {href: location.hash + '/books'}, author.fullName)
            ]),
            p('div', {className: 'authors-actions'}, [
                p('a', {
                    href: '#',
                    textContent: 'Edit',
                    className: 'action-edit author-edit',
                    onclick(evt) {
                        evt.preventDefault();
                        authorsController.edit();
                    }
                }),
                p('a', {
                    href: '#',
                    textContent: 'Delete',
                    className: 'action-delete author-delete',
                    onclick(evt) {
                        evt.preventDefault();
                        authorsController.delete();
                    }
                })
            ])
        ])
    ])
}

function renderBookAuthors(data, bookName) {
    const renderAuthor = author => {
        return p('div', {className: 'author'}, [
            p('div', {className: 'author-avatar'}, [
                p('img', {src: author.avatarUrl, alt: author.fullName})
            ]),
            p('div', {className: 'author-info'}, [
                p('a', {href: '#/authors/' + author.id}, author.fullName)
            ])
        ]);
    };

    return p('div', {className: 'authors'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'book-name'}, 'Authors of ' + bookName)
        ]),
        p('div', {className: 'container'}, data.map(renderAuthor))
    ]);
}

function renderAuthorBooks(data, authorName) {
    const renderBook = book => {
        return p('div', {className: 'book'}, [
            p('div', {className: 'book-image'}, [
                p('img', {src: book.image, alt: book.title})
            ]),
            p('div', {className: 'book-info'}, [
                p('a', {href: '#/books/' + book.id}, book.title)
            ])
        ])
    };

    return p('div', {className: 'books'}, [
        p('div', {className: 'container'}, [
            p('h1', {className: 'books-title'}, 'Books written by ' + authorName + ': ')
        ]),
        p('div', {className: 'container'}, data.map(renderBook))
    ]);
}


const router = new Router();
router.add('/', renderRoot)
    .add('*', renderNone)
    .add('/books', booksController.index)
    .add(/(\/books\/)(\d+)$/, booksController.show)
    .add(/(\/books\/)(\d+)?(\/authors)/, booksController.ref)
    .add('/authors', authorsController.index)
    .add(/(\/authors\/)(\d+)$/, authorsController.show)
    .add(/(\/authors\/)(\d+)?(\/books)/, authorsController.ref);



