/**
 *  Liszt is a vanilla js way to gain back the filtering
 *  options for our Databases A-Z page that we lost when
 *  making it a static page.
 *
 *  Adam Malantonio <amalantonio@muhlenberg.edu>, 2014
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
    var self = this;

    self.container = document.getElementsByTagName('tbody')[0];
    self.els = document.querySelectorAll(selector);
    self.databases = [];
    self.letters   = []; // master list of letters
    self.subjects  = []; // master list of subjects
    self.fields    = ['letter', 'subject'];

    for ( var i = 0; i < self.els.length; i++ ) {
        var name   = self.els[i].getElementsByTagName('a')[0].textContent
          , subs   = self.els[i].dataset.subject
          , letter = name.slice(0,1).toLowerCase()
            ;

        if ( self.letters.indexOf(letter) === -1 ) {
            self.letters.push(letter);
        }

        subs = subs ? subs.toLowerCase().split(/,\s/) : [];
        subs.forEach(function(s) {
                s = s.replace(' ', '-');
                if ( self.subjects.indexOf(s) === -1 ) {
                    self.subjects.push(s);
                }
        });

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
}

/**
 *  builds an `<ul>` list of `#letter` links for each
 *  unique letter in the inventory and appends to the
 *  selector provided
 *
 */

Liszt.prototype.buildLetterMenu = function(selector, classname) {
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
      , allA = document.createElement('a');
        ;

    allA.textContent = '[view all]';
    allA.href = './';
    
    all.appendChild(allA);
    ul.appendChild(all);

    ul.className = classname || '';
    el.appendChild(ul);
}

/**
 *  constructs a `<select>` menu of options
 *  for each unique subject. appends it to the selector'd element
 *
 */

Liszt.prototype.buildSubjectMenu = function(selector, classname) {
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
        document.location.href = './';
    }

    sel.className = classname || '';
    sel.insertBefore(all, sel.firstChild);
    el.appendChild(sel);
}

/**
 *  clears out the redrawn table and puts all of the initial
 *  elements back into place
 *
 */

Liszt.prototype.reset = function() {
    while ( this.container.firstChild ) {
        this.container.removeChild(this.container.firstChild);
    }

    for ( var i = 0; i < this.databases.length; i++ ) {
        this.container.appendChild(this.databases[i].element);
    }
}

// aliases for show, to display either based on letter or subject
Liszt.prototype.showLetter  = function(letter)  { return this.show('letter', letter);   }
Liszt.prototype.showSubject = function(subject) { return this.show('subject', subject.replace('-', ' ')); }

/**
 *  append elements that match `field` on `value` to the
 *  Liszt container
 */

Liszt.prototype.show = function(field, value) {
    console.log(this.fields.indexOf(field).toString());
    this.container.innerHTML = '';

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
}