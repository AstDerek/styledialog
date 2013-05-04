# Style Dialog

Unpolished jQuery plugin to generate a jQuery UI Dialog that shows a set of options, to modify the CSS for a given *target*, determined by a CSS selector.

The main purpose is to be able to manipulate CSS properties, and preview the changes live, by generating CSS rules from the options and injecting these rules into a `style` tag.

## Basics

The dialog consist of a *panel div* (`Panel` object), which holds several *section tables* (array of `Section` objects). Each section is related to a particular CSS selector, and a number of properties to manipulate (buttonset, colorpicker, dropdown, file uploader). These properties are stored using a hash, so no duplicated properties can exist for a given target/selector/section.

* Change of any option trigger a `change` event, that's *bubbled up* to notify the Panel object it needs to take action.
* Reading default values can be triggered with a `read` event, that *bubbles down* (so to speak) to notify each property object.

## Options

All the usable objects inherit from the same `Wrapper` object, the following options can be set for them (default options are always set for this options):

* Properties
    * `template` HTML template to generate a DOM element. Most objects just `append` the child nodes here. Placeholders may be used to be replaced with the values of other options, such as `%title%`, `%property%` or `%undashed-property%`. Meaningfulness of the options to be replaced depend on the kind of object
    * `title` Unescaped title. Its location will depend on the kind of object and its corresponding `template`. For the `Panel` object, this is the title of the dialog panel
* Methods
    * `get()` Retrieve a property value from the object
    * `set()` Set the value of a property for an object
    * `filter()` Process a value before being set
    * `read()` Read a property value from the given selector

The `Section` object works as a propagation layer between options (`Buttonset`, `Colorpicker`, `Dropdown`, `Uploader` objects) adn the `Panel` object. It is recommended either not to override any methods for these objects, or to call the default method to avoid breaking the event propagation chain. This default method can be accessed at `this.defaults.<method>`.

### Panel options

* `width` Width of dialog panel
* `height` Height of dialog panel
* `stylesheet` Selector of the style tag to inject the css rules. By now it expects an `id` selector (`#css-style-tag` or alike)
* `context_class` Class under which the css rules are applied on a regular basis
* `test_context_class` Class under which the css will be applied dynamically, by switching between classes of root/key elements
* `sections` **Array of sections** to generate sections
* `save_template` HTML string to generate the `save` and `remove` buttons. The plugin expects these buttons to be child of a `.save-remove-section` element

`context_class` and `test_context_class` are meant to be replaced dynamically at css rules creation. By default, the plugin expects the selector of each section to have a `%context%` placeholder, to replace it with these classes when appropiate.

### Section options

* `selector` CSS selector that represents the properties of this section. If desired, can include the string `%context%` that will be replaced by any of the two context classes set at the `Panel` object, to preview changes live
* `properties` **Array of properties** to set css properties
* `property_template` HTML string to pass to each property setup, as a default template. It overrides the default template, but is ignored if a `template` is set for any property

### Properties options

There are four types of property objects: `Buttonset`, `Colorpicker`, `Dropdown` and `Uploader`.

* `type` Type of property object to use to set the options. Lowercase name of any of the property objects
* `property` Name of the css property this option represents

#### `Buttonset`

* `values` Hash list of `<value>`:`<label>` of the values the property can take

#### `Colorpicker`

* `buttons` Hash list of `<value>`:`<label>` of the values the property can take. A `solid` value will be considered the trigger to apply the color set by the ColorPicker element

#### `Dropdown`

* `values` Hash list of `<value>`:`<label>` of the values the property can take. It can be a nested hash, it will generate labeled `<optgroup>` tags

#### `Uploader`

No options. Means to be used to set background images

## Context

At all methods, `this` refers to the current object the method is being setup for. The following properties can be accessed:

* `this.defaults` Default object options
* `this.options` Merged options
* `this.parent` Parent object
* `this.element` jQuery element, generated from the `template` option

## Usage

    $(<selector>).styleDialog({
        title: "jQuery UI Dialog",
        width: 400,
        height: 600,
        stylesheet: "#dynamic-css",
        sections: [
            {
                title: "Body background color",
                selector: "body%context%",
                properties: [
                    {
                        property: "background-color",
                        type: "colorpicker",
                        values: {
                            transparent: "transparent",
                            solid: "solid"
                        }
                    }
                ]
            },
            {
                title: "span color and background",
                selector: "%context% span",
                properties: [
                    {
                        property: "color",
                        type: "buttonset",
                        values: {
                            "#000": "black",
                            "#ff5a00": "orange",
                            "#ffa500": "gold"
                        }
                    },
                    {
                        property: "background-color",
                        type: "colorpicker",
                        buttons: {
                            inherit: "inherit",
                            auto: "automatic",
                            transparent: "transparent",
                            solid: "solid"
                        }
                    }
                ]
            }
        ]
    });

## To Do

A lot needs to be done:

* Decouple child objects to allow dependency injection
* Allow definition of different child objects, by using dependency injection mentioned earlier
* Handle file uploads via options
* Modify handling stylesheet object
* A better way to append and handle `save` and `remove` buttons
    