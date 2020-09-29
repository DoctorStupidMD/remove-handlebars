/*global jQuery, Handlebars, Router */
'use strict';

// Handlebars.registerHelper('eq', function (a, b, options) {
//   return a === b ? options.fn(this) : options.inverse(this);
// });

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var util = {
  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  },
  pluralize: function (count, word) {
    return count === 1 ? word : word + 's';
  },
  store: function (namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
};

var App = {
  init: function () {
    this.todos = util.store('todos-js');
    // this.todoTemplate = Handlebars.compile(document.getElementById('todo-template').innerHTML);
    // this.footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML);
    this.bindEvents();

    new Router({
      '/:filter': function (filter) {
        this.filter = filter;
        this.render();
      }.bind(this)
    }).init('/all');      
  },
  bindEvents: function () {
    document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));
    document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));
    document.getElementById('footer').addEventListener('click', function(e) {
      if (e.target.id === 'clear-completed') {
        this.destroyCompleted();
      }
    }.bind(this));

    document.getElementById('todo-list').addEventListener('change', function(e) {
      if (e.target.className === 'toggle') {
        this.toggle(e);
      }
    }.bind(this));
    document.getElementById('todo-list').addEventListener('dblclick', function (e) {
      if (e.target.localName === 'label') {
        this.edit(e);
      }
    }.bind(this));
    document.getElementById('todo-list').addEventListener('keyup', function (e) {
      if (e.target.className === 'edit') {
        this.editKeyup(e);
      }
    }.bind(this));
    document.getElementById('todo-list').addEventListener('focusout', function (e) {
      if (e.target.className === 'edit') {
        this.update(e);
      }
    }.bind(this));
    document.getElementById('todo-list').addEventListener('click', function (e) {
      if (e.target.className === 'destroy') {
        this.destroy(e);
      }
    }.bind(this));
  },
  
  // Refactor most of this method to replace the Handlebars template (see old temp for reference).
  render: function () {
    // New line here, because we need to reset the todo list to an empty string.
    document.getElementById('todo-list').innerHTML = '';
    var todos = this.getFilteredTodos();
    // .forEach will now loop through every todo item.
    todos.forEach(function(todo) {
      var li = document.createElement('li');
      if (todo.completed) {
        li.className = 'completed';
      }
      li.setAttribute('data-id', todo.id)
      
      var div = document.createElement('div');
      div.className = 'view';
      
      var input = document.createElement('input');
      input.className = 'toggle';
      input.setAttribute('type', 'checkbox');
      if (todo.completed) {
        input.checked = true;
      }
      
      var label = document.createElement('label');
      label.innerHTML = todo.title;
      
      var button = document.createElement('button');
      button.className = 'destroy';
      
      div.appendChild(input);
      div.appendChild(label);
      div.appendChild(button);
      
      var inputEdit = document.createElement('input');
      inputEdit.className = 'edit';
      inputEdit.setAttribute('value', todo.title);
      
      li.appendChild(div);
      li.appendChild(inputEdit);
      
      // This will append li to ul.
      document.getElementById('todo-list').appendChild(li);
    });
    
    // todoTemplate no longer exists, so we remove this line altogether.
    // document.getElementById('todo-list').innerHTML = this.todoTemplate(todos);
    // document.getElementById('main').style.display = todos.length > 0 ? 'block' : 'none';
    if (this.todos.length > 0) {
      document.getElementById('main').style.display = 'block';
    } else {
      document.getElementById('main').style.display = 'none';
    }
    document.getElementById('toggle-all').checked = this.getActiveTodos().length === 0;
    if (this.getActiveTodos().length === 0) {
      document.getElementById('toggle-all').checked = true;
    } else {
      document.getElementById('toggle-all').checked = false;
    }
    
    this.renderFooter();
    document.getElementById('new-todo').focus();
    util.store('todos-js', this.todos);
  },
  
  // Refactor most of this method to replace the Handlebars template (see old temp for reference).
  renderFooter: function () {
    var todoCount = this.todos.length;
    var activeTodoCount = this.getActiveTodos().length;
    var activeTodoWord = util.pluralize(activeTodoCount, 'item');
    var footer = document.getElementById('footer');
    
    document.getElementById('todo-count').innerHTML = '<strong>' + activeTodoCount + '</strong> ' + activeTodoWord + ' left';
    
    // var template = this.footerTemplate({
    //   activeTodoCount: activeTodoCount,
    //   completedTodos: todoCount - activeTodoCount,
    //   filter: this.filter
    // });
    
    // Grab anchor tags by their filters and set the corresponding class name to 'selected'.
    // Otherwise, set class name to an empty string.
    var grabAll = document.querySelector("a[href='#/all']");
    if (this.filter === 'all') {
      grabAll.className = 'selected';
    } else {
      grabAll.className = '';
    }
    
    var grabActive = document.querySelector("a[href='#/active']");
    if (this.filter === 'active') {
      grabActive.className = 'selected';
    } else {
      grabActive.className = '';
    }

    var grabCompleted = document.querySelector("a[href='#/completed']");
    if (this.filter === 'completed') {
      grabCompleted.className = 'selected';
    } else {
      grabCompleted.className = '';
    }
  
    // Remove the "clear completed" button when it isn't needed, from the get-go:
    document.getElementById('clear-button').innerHTML = '';
    // Create "clear completed" button, but only display when applicable:
    if (todoCount - activeTodoCount > 0) {
      var buttonClearCompleted = document.createElement('button');
      buttonClearCompleted.id = 'clear-completed';
      buttonClearCompleted.innerHTML = 'Clear completed';
      document.getElementById('clear-button').appendChild(buttonClearCompleted);
    }
    
    if (todoCount > 0) {
      // footer.style.display = 'block';
      // footer.innerHTML = template;
      document.getElementById('footer').style.display = 'block';
    } else {
      // footer.style.display = 'none';
      document.getElementById('footer').style.display = 'none';
    }
  },
  toggleAll: function (e) {
    var isChecked = e.target.checked;

    this.todos.forEach(function (todo) {
      todo.completed = isChecked;
    });

    this.render();
  },
  getActiveTodos: function () {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  getFilteredTodos: function () {
    if (this.filter === 'active') {
      return this.getActiveTodos();
    }

    if (this.filter === 'completed') {
      return this.getCompletedTodos();
    }

    return this.todos;
  },
  destroyCompleted: function () {
    this.todos = this.getActiveTodos();
    this.filter = 'all';
    this.render();
  },
  // accepts an element from inside the `.item` div and
  // returns the corresponding index in the `todos` array
  indexFromEl: function (el) {
    var id = el.closest('li').dataset.id;
    var todos = this.todos;
    var i = todos.length;

    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  },
  create: function (e) {
    var input = e.target;
    var val = input.value.trim();

    if (e.which !== ENTER_KEY || !val) {
      return;
    }

    this.todos.push({
      id: util.uuid(),
      title: val,
      completed: false
    });

    input.value = '';

    this.render();
  },
  toggle: function (e) {
    var i = this.indexFromEl(e.target);
    this.todos[i].completed = !this.todos[i].completed;
    this.render();
  },
  edit: function (e) {
    var el = e.target.closest('li');
    el.classList.add('editing');
    var input = el.querySelector('.edit');
    input.focus(); 
    var temp = input.value;
		input.value = '';
		input.value = temp;
  },
  editKeyup: function (e) {
    if (e.which === ENTER_KEY) {
      e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
      e.target.dataset.abort = true;
      e.target.blur();
    }
  },
  update: function (e) {
    var el = e.target;
    var val = el.value.trim();

    if (!val) {
      this.destroy(e);
      return;
    }

    if (el.dataset.abort) {
      el.dataset.abort = false;
    } else {
      this.todos[this.indexFromEl(el)].title = val;
    }

    this.render();
  },
  destroy: function (e) {
    this.todos.splice(this.indexFromEl(e.target), 1);
    this.render();
  }
};

App.init();
