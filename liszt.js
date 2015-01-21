/**
 *  Liszt is a vanilla js way to gain back the filtering
 *  options for our Databases A-Z page that we lost when
 *  making it a static page (as opposed to a database querying
 *  app).
 *
 *  Adam Malantonio <amalantonio@muhlenberg.edu>, 2014-2015
 *  MIT License; do what thou wilt.
 */

/**
 *  constructor takes an optional selector argument (defaults to .dbaz).
 *  this is what how we'll grab all of the individual elements to create
 *  a master inventory.
 *
 *  ** TODO ** we're expecting our names to be coming from within `<a>` tags
 *             let's change this to something like getting the text out of the last child?
 */

var Liszt = function (selector) {
    selector = selector || '.dbaz';
    var self = this
      , i
      ;

    self.container = document.getElementsByTagName('tbody')[0];
    self.captionEl = document.querySelector('table caption');
    self.els = document.querySelectorAll(selector);
    self.databases = [];
    self.letters   = []; // master list of letters
    self.subjects  = []; // master list of subjects
    self.fields    = ['letter', 'subject'];

    for ( i = 0; i < self.els.length; i++ ) {
        var name   = self.els[i].getElementsByTagName('a')[0].textContent
          , subs   = self.els[i].dataset.subject
          , letter = name.slice(0,1).toLowerCase()
            ;

        if ( self.letters.indexOf(letter) === -1 ) {
            self.letters.push(letter);
        }

        subs = subs ? subs.toLowerCase().split(/,\s/) : [];
        subs.forEach(function(s) { addUniqueToArray(s.replace(' ', '-'), self.subjects); });

        self.databases.push({
            'name': name,
            'subjects': subs,
            'letter': letter,
            'element': self.els[i]
        });    
    }

    self.subjects.sort(function(a,b) {
        return a.toLowerCase() > b.toLowerCase();
    });
};

function addUniqueToArray(item, arr) {
    if ( arr.indexOf(item) === -1 ) {
        arr.push(item);
    }
}

/**
 *  adds html to caption element, but doesn't throw
 *  an error if no caption element exists
 */

Liszt.prototype.addCaption = function addCaption(html) {
    var self = this;
    if ( self.captionEl ) {
        self.captionEl.innerHTML = html;
    }
}

/**
 *  builds an `<ul>` list of `#letter` links for each
 *  unique letter in the inventory and appends to the
 *  selector provided
 *
 */

Liszt.prototype.buildLetterMenu = function buildLetterMenu(selector, classname) {
    selector = selector || '.dbaz-menu';
    var el = document.querySelector(selector)
      , ul = document.createElement('ul')
      , self = this
        ;

    for ( var i = 0; i < self.letters.length; i++ ) {
        var li = document.createElement('li');
        var a  = document.createElement('a');
        var letter = self.letters[i];
        a.href = '#' + letter;
        a.textContent = letter.toUpperCase();
        
        a.onclick = function(e) { 
            e.preventDefault();
            document.location.hash = e.target.href.slice(e.target.href.lastIndexOf('#') + 1);
            self.showLetter(document.location.hash.slice(document.location.hash.lastIndexOf('/') + 2));
        };
        
        li.appendChild(a);
        ul.appendChild(li);
    }

    var all  = document.createElement('li')
      , allA = document.createElement('a')
        ;

    allA.textContent = '[view all]';
    allA.href = '#all';
    allA.onclick = function(e) {
        e.preventDefault();
        document.location.hash = '#all';
        self.reset();
    };
    
    all.appendChild(allA);
    ul.appendChild(all);

    ul.className = classname || '';
    el.appendChild(ul);
};

/**
 *  constructs a `<select>` menu of options
 *  for each unique subject. appends it to the selector'd element
 *
 */

Liszt.prototype.buildSubjectMenu = function buildSubjectMenu(selector, classname) {
    selector = selector || '.dbaz-menu';
    var el = document.querySelector(selector)
      , sel = document.createElement('select')
      , self = this
        ;

    for ( var i = 0; i < self.subjects.length; i++ ) {
        var opt = document.createElement('option');
        var subject = self.subjects[i];
        opt.value = '#' + subject;
        opt.textContent = subject.split(/\-/).map(function(w) { return w.slice(0,1).toUpperCase() + w.slice(1); }).join(' ');
        
        opt.onclick = function(e) { 
            e.preventDefault();
            document.location.hash = e.target.value;
            self.showSubject(document.location.hash.slice(document.location.hash.lastIndexOf('/') + 2));
        };

        sel.appendChild(opt);
    }

    var all  = document.createElement('option');

    all.textContent = '--view all --';
    all.selected = true;
    all.onclick = function(e) { 
        e.preventDefault();
        document.location.hash = '#all';
        self.reset();
    };

    sel.className = classname || '';
    sel.insertBefore(all, sel.firstChild);
    el.appendChild(sel);
};

/**
 *  clears out the redrawn table and puts all of the initial
 *  elements back into place (and adds caption)
 */

Liszt.prototype.reset = function reset() {
    var caption = 'Showing all databases';

    while ( this.container.firstChild ) {
        this.container.removeChild(this.container.firstChild);
    }

    this.addCaption(caption);

    for ( var i = 0; i < this.databases.length; i++ ) {
        this.container.appendChild(this.databases[i].element);
    }
};

// aliases for show, to display either based on letter or subject + add appropriate captions
Liszt.prototype.showLetter  = function showLetter(letter)  { 
    var caption = 'Showing databases that begin with <strong>' + letter.toUpperCase() + '</strong>';

    this.addCaption(caption);
    return this.show('letter', letter);
};

Liszt.prototype.showSubject = function showSubject(subject) {
    var sub = subject.replace('-', ' ')
      , sub_nice = sub.split(' ')
                      .map(function(w) { return w.slice(0,1).toUpperCase() + w.slice(1); })
                      .join(' ')
      , caption = 'Showing databases that cover <strong>' + sub_nice + '</strong>';

    this.addCaption(caption);
    return this.show('subject', sub);
};

/**
 *  append elements that match `field` on `value` to the
 *  Liszt container
 */

Liszt.prototype.show = function show(field, value) {
    this.container.innerHTML = '';

    if ( value === 'all' ) {
        this.reset();
        return;
    }

    var okay = this.databases.filter(function(db) {
        if ( field === 'letter' ) {
            return db.letter === value;
        } else if ( field === 'subject' ) {
            return db.subjects.indexOf(value) !== -1;
        }
    });

    for ( var i = 0; i < okay.length; i++ ) {
        this.container.appendChild(okay[i].element);
    }
};
