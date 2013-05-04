/*jslint browser: true, continue: true, forin: true, regexp: true, sloppy: true, white: true */
/* uses: jquery, jquery-ui, ColorPicker */

/**
 * Methods that bubble down (parent to children):
 *      Panel.get() > Section.get() > Wrapper.get()
 *      Panel.css() > Section.css() > Wrapper.get()
 *      Panel.read() > Section.read() > Wrapper.read()
 *
 * Methods that bubble up (children to parent):
 *      Wrapper.change() > Section.change() > Panel.change()
 *
 * Methods automatically registered under an event:
 *      read()
 */
(function($){
    /**
     * Utilities:
     *
     *    toolbox.buttonset:    create radio buttons from hash
     *    toolbox.dropdown:     create select tag from hash
     *          nested hashes generate <optgroup> tags
     */
    var toolbox = {
        /**
         * @property:string     base name for the radio buttons
         * @values:hash         list of values:labels
         */
        buttonset: function (property,values) {
            var key, value, built = [], random = Math.random().toString().replace(/^0\./,'');
            
            for (key in values) {
                built.push(
                    [
                        '<input type="radio" name="%property%-%random%" value="%key%" id="buttonset-%property%-%key%-%random%">',
                        '<label for="buttonset-%property%-%key%-%random%">%value%</label>'
                    ]
                    .join('')
                    .replace(/%property%/g,property)
                    .replace(/%key%/g,key)
                    .replace(/%value%/g,values[key])
                    .replace(/%random%/g,random)
                );
            }
            
            return $('<span class="buttonset">' + built.join('') + '</span>').buttonset();
        },
        /**
         * @property:string     base name for the radio buttons
         * @values:hash         list of values:labels.
         *                  Optionally, list of group:hash
         */
        dropdown: function (property,values) {
            var key, value, built = [];
            
            function option (key,value) {
                return '<option value="' + key + '">' + value + '</option>';
            }
            
            for (key in values) {
                if ($.isPlainObject(values[key])) {
                    built.push('<optgroup label="' + key + '">');
                    
                    for (value in values[key]) {
                        built.push(option(value,values[key][value]));
                    }
                    
                    built.push('</optgroup>');
                }
                else {
                    built.push(option(key,values[key]));
                }
            }
            
            return $('<select name="' + property + '">' + built.join('') + '</select>');
        }
    },
    /**
     * List of fonts, from www.typetester.org
     */
    default_fonts = {
        "inherit": "Default font",
        "- accesibility ------------------": {
            "opendyslexic": "OpenDyslexic"
        },
        "- safe list --------------------": {
            "serif": "serif",
            "sans-serif": "sans-serif",
            "monospace": "monospace",
            "Arial": "Arial",
            "Arial Black": "Arial Black",
            "Comic Sans MS": "Comic Sans MS",
            "Courier New": "Courier New",
            "Georgia": "Georgia",
            "Impact": "Impact",
            "Times New Roman": "Times New Roman",
            "Trebuchet MS": "Trebuchet MS",
            "Verdana": "Verdana"
        },
        "- Win default ------------------": {
            "Arial": "Arial",
            "Arial Black": "Arial Black",
            "Comic Sans MS": "Comic Sans MS",
            "Courier New": "Courier New",
            "Georgia": "Georgia",
            "Impact": "Impact",
            "Lucida Console": "Lucida Console",
            "Lucida Sans Unicode": "Lucida Sans Unicode",
            "Microsoft Sans Serif": "Microsoft Sans Serif",
            "MS Mincho": "MS Mincho",
            "Palatino Linotype": "Palatino Linotype",
            "Symbol": "Symbol",
            "Tahoma": "Tahoma",
            "Times New Roman": "Times New Roman",
            "Trebuchet MS": "Trebuchet MS",
            "Verdana": "Verdana"
        },
        "- Mac default ------------------": {
            "American Typewriter": "American Typewriter",
            "Andale Mono": "Andale Mono",
            "Arial": "Arial",
            "Arial Black": "Arial Black",
            "Arial Narrow": "Arial Narrow",
            "Brush Script MT": "Brush Script MT",
            "Capitals": "Capitals",
            "Apple Chancery": "Apple Chancery",
            "Baskerville": "Baskerville",
            "Big Caslon": "Big Caslon",
            "Charcoal": "Charcoal",
            "Chicago": "Chicago",
            "Comic Sans MS": "Comic Sans MS",
            "Copperplate": "Copperplate",
            "Courier": "Courier",
            "Courier New": "Courier New",
            "Didot": "Didot",
            "Gadget": "Gadget",
            "Georgia": "Georgia",
            "Geneva": "Geneva",
            "Gill Sans": "Gill Sans",
            "Futura": "Futura",
            "Helvetica": "Helvetica",
            "Helvetica Neue": "Helvetica Neue",
            "Herculanum": "Herculanum",
            "Hoefler Text": "Hoefler Text",
            "Impact": "Impact",
            "Lucida Grande": "Lucida Grande",
            "Marker Felt": "Marker Felt",
            "Monaco": "Monaco",
            "New York": "New York",
            "Optima": "Optima",
            "Papyrus": "Papyrus",
            "Sand": "Sand",
            "Skia": "Skia",
            "Techno": "Techno",
            "Textile": "Textile",
            "Times": "Times",
            "Times New Roman": "Times New Roman",
            "Trebuchet MS": "Trebuchet MS",
            "Verdana": "Verdana",
            "Zapfino": "Zapfino"
        },
        "- Windows Vista ----------------": {
            "Calibri": "Calibri",
            "Cambria": "Cambria",
            "Candara": "Candara",
            "Consolas": "Consolas",
            "Constantia": "Constantia",
            "Corbel": "Corbel",
            "Nyala": "Nyala",
            "Segoe UI": "Segoe UI",
            "Segoe Print": "Segoe Print",
            "Segoe Script": "Segoe Script"
        },
        "- Google Fonts ----------------": {
            "Cantarell": "Cantarell",
            "Cardo": "Cardo",
            "Crimson Text": "Crimson Text",
            "Droid Sans": "Droid Sans",
            "Droid Sans Mono": "Droid Sans Mono",
            "Droid Serif": "Droid Serif",
            "IM Fell": "IM Fell",
            "Inconsolata": "Inconsolata",
            "Josefin Sans Std Light": "Josefin Sans Std Light",
            "Lobster": "Lobster",
            "Molengo": "Molengo",
            "Neuton": "Neuton",
            "Nobile": "Nobile",
            "OFL Sorts Mill Goudy TT": "OFL Sorts Mill Goudy TT",
            "Old Standard TT": "Old Standard TT",
            "Reenie Beanie": "Reenie Beanie",
            "Tangerine": "Tangerine",
            "Vollkorn": "Vollkorn",
            "Yanone Kaffeesatz": "Yanone Kaffeesatz"
        }
    },
    /**
     * To be defined later
     */
    defaults = {};
    
    /**
     * Inherits: none
     *
     * Methods to register and fire events
     */
    function EventCalls () {
        this.events = {};
        
        var self = this;
        
        /**
         * Register a function under an event
         *
         * @events:string       list of events, space separated
         * @action:function     action to register
         */
        this.on = function (events,action) {
            var event = '', n;
            
            events = events.replace(/^[\s\t]*(.*)[\s\t]*$/,'$1');
            events = events.split(/[\s\t]+/);
            
            for (n in events) {
                event = events[n];
                
                if (!self.events.hasOwnProperty(event)) {
                    self.events[event] = [];
                }
                
                if ($.isFunction(action)) {
                    self.events[event].push(action);
                }
            }
        };
        
        /**
         * Triggers an event
         *
         * @event:string        Name of event
         */
        this.trigger = function (event) {
            var each;
            
            if (!self.events.hasOwnProperty(event) || !self.events[event].length) {
                return;
            }
            
            for (each in self.events[event]) {
                self.events[event][each].apply(self,[event]);
            }
        };
    }
    
    /**
     * Inherits: EventCalls
     *
     * @options:hash        Set of options
     * @parent:object||null Parent object
     *
     * All of the functions/classes that rely on this one
     * expect a template option, to generate DOM content,
     * and a set of functions: get, set, filter, read
     *
     * this                 Base object
     *    |
     *    + -- get          Base get(), returns empty string
     *    + -- set          Base set(), does nothing
     *    + -- filter       Base filter(), does nothing
     *    + -- read         Base read(), does nothing
     *
     * By default, these methods will call its counterpart
     * set at the options hash, overriding them.
     *
     * this.defaults        Default options
     * this.parent          Parent object (if any)
     * this.options         Extended options
     *    |
     *    + -- get          Overriden get()
     *    + -- set          Overriden set()
     *    + -- filter       Overriden filter()
     *    + -- read         Overriden read()
     */
    function Wrapper (options,parent) {
        EventCalls.apply(this);
        
        var self = this;
        
        /**
         * Expects a default hash defined before
         * applying this function/method/class
         */
        this.options = $.extend(this.defaults,options);
        this.parent = parent || false;
        
        /**
         * get()    Read a property, or set of properties
         */
        this.get = function () {
            if (self.options.get || false) {
                return self.options.get.apply(self);
            }
            
            return '';
        };
        
        /**
         * set:       Set a property, or hash of properties
         */
        this.set = function (value) {
            if (self.options.set || false) {
                return self.options.set.apply(self,[value]);
            }
        };
        
        /**
         * read:      Retrieve property from target
         */
        this.read = function () {
            if (self.options.read || false) {
                return self.options.read.apply(self);
            }
            
            return $(self.options.target).css(self.options.property);
        };
        
        /**
         * filter:    Process value before being set
         */
        this.filter = function (value) {
            if (self.options.filter || false) {
                return self.options.filter.apply(self,[value]);
            }
            
            return value;
        };
        
        /**
         * Register "read" event for all objects
         */
        this.on('read',function(event){
            event = self[event];
            event.apply(self);
        });
        
        /**
         * Generate a node frm the given template
         * Assume a template is **always** given
         */
        this.element = $(
            self.options.template
            .replace(/%title%/g,(self.options.title || ''))
            .replace(/%property%/g,(self.options.property || ''))
            .replace(/%undashed-property%/g,(self.options.property || '').replace(/[_\-]+/g,' '))
        );
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     */
    function Colorpicker () {
        this.defaults = {
            property: 'color',
            buttons: {
                transparent: 'transparent',
                inherit: 'inherit',
                auto: 'auto',
                solid: 'solid'
            },
            get: function(){
                var color = this.element.find('.color-picker').css('background-color'),
                value = this.element.find(':checked').val();
                
                return (value !== 'solid') ? value : color;
            },
            set: function(color){
                var element = this.element.find('.color-picker'),
                rgb = { r: 0, g: 0, b: 0 };
                
                /**
                 * Filter text string colors
                 *
                 * Default color is black
                 */
                if (!color.match(/inherit|transparent|auto/)) {
                    /**
                     * Turn "rgb(\d+,\d+,\d+)" into a hash
                     */
                    if (color.match(/rgb.*?(\d+),.*?(\d+),.*?(\d+).*/)) {
                        color = color.replace(/rgb.*?(\d+),.*?(\d+),.*?(\d+).*/,'{"r":$1,"g":$2,"b":$3}');
                        rgb = JSON.parse(color);
                    }
                    else {
                        rgb = color;
                    }
                    
                    color = 'solid';
                }
                
                element.css('background-color','rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
                element.ColorPickerSetColor(rgb);
                this.element.find('[value=' + color + ']').click();
            }
        };
        
        Wrapper.apply(this,Array.prototype.slice.apply(arguments));
        
        var self = this;
        
        /**
         * Setup buttons and colorpicker
         */
        this.element.find('.container').append(toolbox.buttonset(this.options.property,this.options.buttons));
        this.element.find('.container').append('<span class="' + this.options.property + ' color-picker"><span></span></span>');
        
        /**
         * Trigger change event when buttons or colorpicker change
         */
        this.element.find('.color-picker').ColorPicker({
            onChange: function(hsb,hex,rgb,el){
                self.element.find('.color-picker').css('background-color','#' + hex);
                self.trigger('change');
            }
        });
        this.element.find('input:radio').bind('change',function(){
            self.trigger('change');
        });
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     */
    function Buttonset () {
        this.defaults = {
            property: '',
            values: {},
            get: function(){
                return this.element.find(':checked').val();
            },
            set: function(value){
                value = this.filter(value);
                this.element.find('[value=' + value + ']').click();
            },
            filter: function(value){
                return value.replace(/['"]+/g,'');
            }
        };
        
        Wrapper.apply(this,Array.prototype.slice.apply(arguments));
        
        var self = this;
        
        /**
         * Setup buttonset
         */
        this.element.find('.container').append(toolbox.buttonset(this.options.property,this.options.values));
        
        /**
         * Trigger change event when buttons change
         */
        this.element.find('input:radio').bind('change',function(){
            self.trigger('change');
        });
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     */
    function Dropdown () {
        this.defaults = {
            property: '',
            values: {},
            get: function(){
                return this.element.find('select').val();
            },
            set: function(value){
                value = this.filter(value);
                this.element.find('select').val(value);
            },
            filter: function(value){
                return value.replace(/['"]+/g,'');
            }
        };
        
        Wrapper.apply(this,Array.prototype.slice.apply(arguments));
        
        var self = this;
        
        /**
         * Setup select element
         */
        this.element.find('.container').append(toolbox.dropdown(this.options.property,this.options.values));
        
        /**
         * Trigger change event when option changes
         */
        this.element.find('select').bind('change keyup',function(){
            self.trigger('change');
        });
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     *
     * This object does not have a template by the moment, it is too
     * specific from the project this code was generated for
     */
    function Uploader () {
        this.image = 'none';
        this.defaults = {
            property: 'background-image',
            get: function(){
                return this.image;
            }
        };
        
        Wrapper.apply(this,Array.prototype.slice.apply(arguments));
        
        var self = this;
        
        /**
         * Setup iframe and message nodes to upload files
         * The layout means to show an image after being uploaded
         * CSS missing here, to show images at a defined size
         *
         * No template for this at the moment
         *
         * TO DO: template, replace URLs
         */
        this.element.find('.container').append(
            ['<iframe src="/images/upload-background.php" style="width:0;height:0;display:none;visibility:hidden;"/>',
            '<div class="loading-background-image">',
                '<img alt="loading..." src="/images/wait.gif"> <span class="loading-message">processing...</span>',
            '</div>',
            '<div class="upload-background-image">',
                '<button class="btn" data-icon="ui-icon-plus" data-text="false">new background</button>',
            '</div>',
            '<div class="delete-background-image">',
                '<div class="scaled-image">',
                    '<div class="alignment-wrapper">',
                        '<div class="buffer-wrapper">',
                            '<img src="" />',
                        '</div>',
                    '</div>',
                '</div>',
                '<button class="btn" data-icon="ui-icon-close" data-text="false">delete background</button>',
            '</div>',
            ' <span class="message-background-image"></span>'].join('')
        );
        this.element.find('.btn').button();
        
        /**
         * Control iframe for image upload
         *
         * Timeout function to check the status of the upload async.
         * Listen to iframe status
         */
        function iframe_listener (wait_message,delay) {
            /**
             * Setup message, default means the iframe is loading
             */
            wait_message = wait_message || 'processing...';
            
            /**
             * Default state: loading message
             */
            self.element.find('.message-background-image').html('');
            self.element.find('.loading-message').html(wait_message);
            self.element.find('.loading-background-image').show();
            self.element.find('.delete-background-image, .upload-background-image').hide();
            
            /**
             * Setting up the iframe "src" attribute doesn't update the node immediately
             *
             * Binding the "load" method/event is delayed because of this
             */
            setTimeout(function(){
                self.element.find('iframe').load(function(){
                    /**
                     * Find the status message and the image URL at the iframe
                     */
                    var $iframe = $(this).contents(),
                    message = $iframe.find('.message').html(),
                    image = $iframe.find('img').attr('src') || '';
                    
                    self.image = image ? 'url(' + image + ')' : 'none';
                    
                    /**
                     * Show the message, hide the rest of the messages
                     */
                    self.element.find('.message-background-image').html(message);
                    self.element.find('.loading-background-image, .delete-background-image, .upload-background-image').hide();
                    
                    /**
                     * The iframe is ready, fire the "change" event
                     */
                    self.trigger('change');
                    
                    /**
                     * Determine if the iframe will upload a new image, or if it
                     * has just uploaded one, and show the corresponding message
                     */
                    if ($iframe.find('[name=delete-background-image]').length) {
                        self.element.find('.scaled-image img').attr('src',image);
                        self.element.find('.delete-background-image').show();
                    }
                    else if ($iframe.find('[name=background-image]').length) {
                        self.element.find('.upload-background-image').show();
                    }
                    else {
                        /**
                         * If no matches are found, assume the page is redirecting to a login page
                         */
                        self.element.find('.message-background-image').html('<strong>Your session has expired and no further changes will be saved</strong>');
                    }
                });
            },delay||1000);
        }
        
        /**
         * Hide default messages
         */
        self.element.find('.loading-background-image').hide();
        
        /**
         * Bind the upload button with the input:file at the iframe
         *
         * This allows to control the iframe form from the parent document
         */
        self.element.find('.upload-background-image button').bind('click',function(){
            var action = self.element.find('iframe').contents().find('[type=file]'),
            form = action.closest('form');
            
            /**
             * Check if the form has been already binded
             */
            if (!form.data('iframe_listener')) {
                /**
                 * Mark the form as already binded
                 */
                form.data('iframe_listener',true);
                
                /**
                 * If the file is being uploaded, fire the iframe listener to let the
                 * user know its action is being processed
                 */
                form.bind('submit.iframe_listener',function(){
                    iframe_listener('uploading image...');
                    return true;
                });
                
                /**
                 * Send the form as soon as the input:file changes its contents
                 */
                action.bind('change.iframe_listener',function(){
                    if (action.val()) {
                        form.submit();
                    }
                });
            }
            
            /**
             * Activate the input:file
             */
            action.click();
        });
        
        /**
         * Bind the delete button with the corresponding delete button at the iframe
         */
        self.element.find('.delete-background-image button').bind('click',function(){
            var form = self.element.find('iframe').contents().find('[name=delete-background-image]').closest('form');
            
            /**
             * Fire the iframe listener as soon as the form is submitted
             */
            form.bind('submit',function(){
                iframe_listener('deleting image...');
                return true;
            });
            
            /**
             * Submit immediately
             */
            form.submit();
        });
        
        iframe_listener('',1);
        /**
         * /iframe
         */
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     *
     * Children:
     * Section
     *    |
     *    + -- Colorpicker
     *    |
     *    + -- Buttonset
     *    |
     *    + -- Dropdown
     *    |
     *    + -- Uploader
     *
     * Section contains utilities to modify the css properties
     * related to a particular selector
     */
    function Section () {
        this.properties = {};
        this.defaults = {
            title: 'Section',
            selector: 'body',
            properties: [],
            template: '<table class="property-section"><tr><th class="text-center">%title%</th></tr></table>',
            property_template: '<tr><td class="container text-center"></td></tr>'
        };
        
        Wrapper.apply(this,Array.prototype.slice.apply(arguments));
        
        var self = this,
        /**
         * As soon as an element changes, the parent of the Section object should
         * compile the new css rules
         */
        trigger_css_compilation = function(){ this.parent.trigger('change'); },
        each, property, options, n;
        
        /**
         * Generate all the properties received as array
         */
        for (n in this.options.properties) {
            each = this.options.properties[n];
            property = each.property || '';
            options = $.extend(true,{ template: this.options.property_template }, each || {});
            
            /**
             * Avoid unnamed or duplicated properties
             */
            if (!property || this.properties.hasOwnProperty(property)) {
                continue;
            }
            
            switch (each.type || false) {
                case 'colorpicker':
                    this.properties[property] = new Colorpicker(options,this);
                    break;
                case 'buttonset':
                    this.properties[property] = new Buttonset(options,this);
                    break;
                case 'dropdown':
                    this.properties[property] = new Dropdown(options,this);
                    break;
                case 'uploader':
                    this.properties[property] = new Uploader(options,this);
                    break;
                default:
            }
            
            /**
             * Children change: parent compiles css
             */
            if (this.properties.hasOwnProperty(property)) {
                this.element.append(this.properties[property].element);
                this.properties[property].on('change',trigger_css_compilation);
            }
        }
        
        /**
         * Define default actions for the Section object
         */
        
        /**
         * get()        Return hash with css properties
         */
        this.get = function () {
            var properties = {}, each, n, css = {};
            
            /**
             * Execute get() method for each property
             *
             * Assume each.get() return a valid css value
             */
            for (n in self.properties) {
                each = self.properties[n];
                properties[each.options.property] = each.get();
            }
            
            /**
             * The main key is the selector of the properties
             */
            css[self.options.selector] = properties;
            
            return css;
        };
        
        /**
         * set()        Set a single property, or hash of properties
         *
         * @property:string||hash   Name of property, or hash of properties
         * @value:string||null      Value of property, or empy
         */
        this.set = function (property,value) {
            var properties = {}, each, n;
            
            /**
             * Determine if the method received a name:value pair, or a hash
             */
            properties = $.isPlainObject(property) ? property : { property: value };
            
            /**
             * Walk the properties
             */
            for (each in properties) {
                if (self.properties.hasOwnProperty(each)) {
                    self.properties[each].set(properties[each]);
                }
            }
        };
        
        /**
         * read()       Read/retrieve properties from the given selector
         */
        this.read = function () {
            var properties = {}, each, n;
            
            /**
             * Execute read() method for each property
             */
            for (n in self.properties) {
                self.properties[n].read();
            }
        };
        
        /**
         * No filter needed for this object
         * All filtering occurs at property object level
         */
        this.filter = function(){};
        
        /**
         * css()        Return css properties as css rules
         */
        this.css = function () {
            var css = [], each, properties, selector;
            
            properties = self.get();
            
            /**
             * "properties" contains a single selector
             * for .. in used for the sake of generality
             */
            for (selector in properties) {
                for (each in properties[selector]) {
                    css.push(each + ':' + properties[selector][each] + ';');
                }
            }
            
            /**
             * css rule
             */
            css = self.options.selector + '{' + css.join('') + '}';
            
            return css;
        };
        
        /**
         * Bubble up the change event
         *
         * This allows to notify the parent when a child property
         * changes, and the css needs to be rebuilt
         */
        this.on('change',function(){
            this.parent.trigger('change');
        });
    }
    
    /**
     * Inherits: Wrapper > EventCalls
     *
     * Children:
     * Panel
     *   |
     *   + -- Section
     *          |
     *          + -- Colorpicker
     *          |
     *          + -- Buttonset
     *          |
     *          + -- Dropdown
     *          |
     *          + -- Uploader
     *
     * Panel contains Section collection
     *
     * Panel creates a jQuery UI dialog at creation
     *
     * It expects to receive a selector to modify a stylesheet
     * to inject the modified css generated by the properties
     * and show live changes of the properties
     */
    function Panel (options) {
        this.sections = [];
        this.defaults = {
            title: 'Panel',
            width: 500,
            height: 400,
            /**
             * Stylesheet selector, where to store the modified css rules
             */
            stylesheet: '#css',
            sections: [],
            /**
             * Template to generate a DOM element where each section will be appended to
             */
            template: '<div id="css-properties" class="css-properties" />',
            /**
             * Buttons template, to be appended after all the sections have benn appended
             */
            save_template: '<p class="text-center save-remove-section"> <button class="btn">Save changes</button> <button class="btn">Remove custom style</button> </p>',
            /**
             * Event fired as soon as Panel constructor reaches its end
             */
            create: function(){
                var self = this;
                
                /**
                 * TO DO: better way to detect if the style tag has been created
                 */
                if (!$(this.options.stylesheet).length) {
                    /**
                     * TO DO: better way to create the style tag if none is present
                     */
                    $('body').append('<style type="text/css" id="' + this.options.stylesheet.replace(/#/g,'') + '" />');
                }
                
                /**
                 * Bind save/remove buttons to save/remove events
                 *
                 * TO DO: better way to detect these buttons, and tie them to events
                 */
                this.element.find('.save-remove-section .btn:contains(Save)').click(function(){
                    self.trigger('save');
                });
                this.element.find('.save-remove-section .btn:contains(Remove)').click(function(){
                    self.trigger('remove');
                });
                
                /**
                 * Create the dialog, it will append the element to the body automatically
                 *
                 * Bind load/unload events to dialog open/close
                 *
                 * Assume all components have been appended
                 */
                $(this.element).dialog({
                    title: this.options.title,
                    width: this.options.width,
                    height: this.options.height,
                    autoOpen: false,
                    open: function(){
                        self.trigger('load');
                    },
                    close: function(){
                        self.trigger('unload');
                    }
                });
            },
            /**
             * Event fired when the panel is opened
             */
            load: function(){},
            /**
             * Event fired when an option is modified
             */
            change: function(){
                $(this.stylesheet).text(this.css());
            },
            /**
             * Event fired when the "save" button is pressed
             */
            save: function(){},
            /**
             * Event fired when the "remove" button is pressed
             */
            remove: function(){},
            /**
             * Event fired when the dialog is closed
             */
            unload: function(){}
        };
        
        Wrapper.apply(this,[options,false]);
        
        var self = this, each, section;
        
        /**
         * Walk all sections passed at the options, generate and append them
         */
        for (each in this.options.sections) {
            section = new Section(this.options.sections[each],this);
            this.sections.push(section);
            this.element.append(section.element);
        }
        
        /**
         * Append the "save" and "remove" buttons
         */
        this.element.append(this.options.save_template);
        this.element.find('.save-remove-section .btn').button();
        this.element.find('.save-remove-section .buttonset').buttonset();
        
        /**
         * get()        Return an array of css hashes
         *              Array preferred to avoid css selectors collisions
         *
         * This call will fire the get() method from each section
         */
        this.get = function () {
            var css = [], each;
            
            for (each in self.sections) {
                css.push(self.sections[each].get());
            }
            
            return css;
        };
        
        /**
         * css()        Return css rules, as text
         *
         * This call will fire the css() method from each section
         */
        this.css = function () {
            var css = [], each;
            
            for (each in self.sections) {
                css.push(self.sections[each].css());
            }
            
            css = css.join('\n');
            
            return css;
        };
        
        /**
         * read()       Populate the options from their corresponding selectors
         *
         * This call will fire the read() method from each section
         */
        this.read = function () {
            var each;
            
            for (each in self.sections) {
                self.sections[each].read();
            }
        };
        
        /**
         * Associate all the events this object responds to
         */
        this.on('create load change save remove unload',function(event){
            this.options[event].apply(this);
        });
        
        /**
         * Object setup ready, trigger "create" event
         */
        this.trigger('create');
    }
    
    defaults = {
        title: 'Customize',
        stylesheet: '#css',
        context_class: 'context',
        test_context_class: 'test-context',
        sections: [],
        /**
         * Methods to handle events fired by the "Panel" object
         */
        load: function(){
            /**
             * Read properties from given nodes
             */
            this.trigger('read');
        },
        change: function(){
            var css = this.css();
            
            /**
             * Compiled css expects to have a "%context%" replacement word
             *
             * This will help to delimit where to apply the css changes using a selector
             */
            css = css.replace(/%context%/g,'.' + this.options.test_context_class);
            
            /**
             * Insert the compiled css into the style tag
             *
             * TO DO: a better way to save these changes and reflect them into the document
             */
            $(this.options.stylesheet).html(css);
        },
        save: function(){
            /**
             * Avoid showing animations when saving
             *
             * TO DO: better feedback
             */
            $(this.element).dialog('close');
        },
        remove: function(){
            /**
             * Avoid showing animations when removing changes
             *
             * TO DO: better feedback
             */
            $(this.element).dialog('close');
        },
        unload: function(){}
    };
    
    $.fn.styleDialog = function (command) {
        return this.each(function(){
            var $this = $(this),
            init = $this.data('styleDialog'),
            options, panel;
            
            /**
             * Hash received, init the object
             */
            if ($.isPlainObject(command || {})) {
                if (init) {
                    return true;
                }
                
                options = $.extend(true,defaults,command);
                panel = new Panel(options);
                $this.data('styleDialog',panel);
                
                return true;
            }
            
            panel = $this.data('styleDialog');
            
            switch (command) {
                /**
                 * Dialog events
                 */
                case 'open':
                case 'close':
                    $(panel.element).dialog(command);
                    break;
                /**
                 * Panel events
                 */
                case 'load':
                case 'change':
                case 'save':
                case 'remove':
                case 'unload':
                    panel.trigger(command);
                    break;
            }
        });
    };
}(jQuery));