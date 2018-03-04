/**
 * Base functionality
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { List, ListTemplate } from "./utils/List";
import { Dictionary, DictionaryTemplate } from "./utils/Dictionary";
import { Disposer } from "./utils/Disposer";
import { EventDispatcher } from "./utils/EventDispatcher";
import { Adapter } from "./utils/Adapter";
import { Color, color } from "./utils/Color";
import { Percent, percent } from "./utils/Percent";
import { system } from "./System";
import { cache } from "./utils/Cache";
import * as $array from "./utils/Array";
import * as $object from "./utils/Object";
import * as $type from "./utils/Type";
/**
 * Provides base functionality for all derivative objects, like generating ids,
 * handling cache, etc.
 */
var BaseObject = /** @class */ (function () {
    //protected _classes: { [index: string]: any } = {};
    /**
     * Constructor
     * * Sets class name
     */
    function BaseObject() {
        /**
         * Indicates if this object has already been deleted. Any
         * destruction/disposal code should take this into account when deciding
         * wheter to run potentially costly disposal operations if they already have
         * been run.
         *
         * @type {boolean}
         * @ignore Exclude from docs
         */
        this._disposed = false;
        /**
         * List of IDisposer which will be disposed when the BaseObject is disposed.
         *
         * @ignore Exclude from docs
         */
        this._disposers = [];
        this.className = "BaseObject";
    }
    Object.defineProperty(BaseObject.prototype, "uid", {
        /**
         * Returns object's internal unique ID.
         *
         * @return {string} Unique ID
         */
        get: function () {
            if (!this._uid) {
                this._uid = system.getUniqueId();
                system.map.setKey(this._uid, this);
            }
            return this._uid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseObject.prototype, "id", {
        /**
         * @return {string} Id
         */
        get: function () {
            return this._id;
        },
        /**
         * Sets the user-defined id of the element.
         *
         * @param {string} value Id
         */
        set: function (value) {
            system.map.setKey(value, this);
            this._id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseObject.prototype, "map", {
        /**
         * Returns a universal collection for mapping ids with objects.
         *
         * @ignore Exclude from docs
         * @return {Dictionary<string, any>} Map collection
         */
        get: function () {
            if (!this._map) {
                this._map = new Dictionary();
            }
            return this._map;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Applies properties from all assigned themes.
     *
     * @ignore Exclude from docs
     */
    BaseObject.prototype.applyTheme = function () {
        var _this = this;
        // TODO is this needed ?
        if (system) {
            var themes = this.getCurrentThemes();
            // TODO is this needed ?
            if (themes) {
                $array.each(themes, function (theme, index) {
                    theme(_this);
                });
            }
        }
    };
    Object.defineProperty(BaseObject.prototype, "themes", {
        /**
         * @ignore Exclude from docs
         * @return {ITheme[]} An array of themes
         */
        get: function () {
            return this._themes;
        },
        /**
         * A list of themes to be used for this element.
         *
         * @ignore Exclude from docs
         * @param {ITheme[]} value An array of themes
         */
        set: function (value) {
            this._themes = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a list of themes that should be applied to this element. It could
     * either be a list of themes set explicitly on this element, or system-wide.
     *
     * @return {ITheme[]} List of themes
     */
    BaseObject.prototype.getCurrentThemes = function () {
        return this.themes || system.themes;
    };
    /**
     * Returns if this object has been already been disposed.
     *
     * @return {boolean} Is disposed?
     */
    BaseObject.prototype.isDisposed = function () {
        return this._disposed;
    };
    /**
     * Destroys this object and all related data.
     */
    BaseObject.prototype.dispose = function () {
        if (!this._disposed) {
            this._disposed = true;
            var a = this._disposers;
            this._disposers = null;
            $array.each(a, function (x) {
                x.dispose();
            });
            // Clear cache
            this.clearCache();
            // remove from clones list
            if (this.clonedFrom) {
                this.clonedFrom.clones.removeValue(this);
            }
            system.map.removeKey(this._uid);
        }
    };
    /**
     * Disposes disposable object and removes it from `_disposers`.
     *
     * @param {IDisposer} target Object to dispose
     * @ignore Exclude from docs
     */
    BaseObject.prototype.removeDispose = function (target) {
        //if(target){
        if (!this._disposed) {
            var index = $array.indexOf(this._disposers, target);
            if (index > -1) {
                this._disposers.splice(index, 1);
            }
        }
        target.dispose();
        //}
    };
    /**
     * Makes a copy of this object and returns the clone.
     *
     * @param   {string}  cloneId  An id to use for clone (if not set a unique id will be generated)
     * @returns {Object}           Clone
     */
    BaseObject.prototype.clone = function (cloneId) {
        if (!cloneId) {
            cloneId = "clone-" + system.getUniqueId();
        }
        var newObject = new this.constructor();
        newObject.cloneId = cloneId;
        newObject.clonedFrom = this;
        newObject.copyFrom(this);
        // add to clones list
        this.clones.push(newObject);
        return newObject;
    };
    Object.defineProperty(BaseObject.prototype, "clones", {
        /**
         * Returns a collection of object's clones.
         *
         * @ignore Exclude from docs
         * @return {Dictionary<string, BaseObject>} Clones
         */
        get: function () {
            if (!this._clones) {
                this._clones = new List();
            }
            return this._clones;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Copies all properties and related data from different element.
     *
     * @param {this} object Source element
     */
    BaseObject.prototype.copyFrom = function (object) {
    };
    Object.defineProperty(BaseObject.prototype, "className", {
        /**
         * @ignore Exclude from docs
         * @return {string} Class name
         */
        get: function () {
            return this._className;
        },
        /**
         * Element's class name. (a class that was used to instantiate the element)
         *
         * @ignore Exclude from docs
         * @param {string}  value  Class name
         */
        set: function (value) {
            this._className = value;
            /*if (system) {
                system.registeredClasses[value] = typeof this;
            }*/
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Caches value in object's cache.
     *
     * @ignore Exclude from docs
     * @param {string}  key    Key
     * @param {any}     value  Value
     */
    BaseObject.prototype.setCache = function (key, value) {
        cache.set(this.uid, key, value);
    };
    /**
     * Retrieves cached value.
     *
     * @ignore Exclude from docs
     * @param  {string}  key  Key
     * @return {any}          Value
     */
    BaseObject.prototype.getCache = function (key) {
        return cache.get(this.uid, key);
    };
    /**
     * Clears object's local cache.
     *
     * @ignore Exclude from docs
     */
    BaseObject.prototype.clearCache = function () {
        cache.clear(this.uid);
    };
    /**
     * Creates [[Disposer]] for `setTimeout` function call. This ensures that all
     * timeouts created by the object will be cleared when object itself is
     * disposed.
     *
     * @ignore Exclude from docs
     * @param  {() => void}  fn     Callback function
     * @param  {number}      delay  Timeout (ms)
     * @return {IDisposer}          Disposer for timeout
     */
    BaseObject.prototype.setTimeout = function (fn, delay) {
        var _this = this;
        var id = setTimeout(function () {
            _this.removeDispose(disposer);
            fn();
        }, delay);
        var disposer = new Disposer(function () {
            clearTimeout(id);
        });
        this._disposers.push(disposer);
        return disposer;
    };
    Object.defineProperty(BaseObject.prototype, "config", {
        /**
         * ==========================================================================
         * JSON-BASED CONFIG PROCESSING
         * ==========================================================================
         * @hidden
         */
        /**
         * Use this property to set JSON-based config. When set, triggers processing
         * routine, which will go thorugh all properties, and try to apply values,
         * create instances, etc.
         *
         * Use this with caution, as it is a time-consuming process. It's used for
         * initialchart setup only, not routine operations.
         *
         * @param {object} json JSON config
         */
        set: function (config) {
            try {
                this.processConfig(config);
            }
            catch (e) {
                /*if (this instanceof Sprite) {
                    this.raiseCriticalError(e);
                }*/
                this.raiseCriticalError(e);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Processes the JSON config.
     *
     * @param {object}  json  JSON config
     * @ignore Exclude from docs
     */
    BaseObject.prototype.processConfig = function (config) {
        var _this = this;
        if (!config) {
            return;
        }
        // Get target
        var target = this;
        // Iterate through all of the items
        $object.eachOrdered(config, function (configKey, configValue) {
            // Check if there's a property in target
            if (_this.hasProperty(configKey)) {
                var item_1;
                // Do we have instructions to create an object?
                if ($type.isObject(configValue) && $type.hasValue(configValue["type"])) {
                    // Create new instance
                    if (item_1 = _this.createClassInstance(configValue["type"])) {
                        target[configKey] = item_1;
                    }
                    else {
                        item_1 = target[configKey];
                    }
                }
                else {
                    // Get item from the object
                    item_1 = target[configKey];
                }
                /**
                 * It is...
                 * --------------------------------------------------------------------
                 */
                if (item_1 instanceof Adapter) {
                    // ... an Adapter, try to add handlers to it
                    // ------------------------------------------------------------------
                    _this.processAdapters(item_1, configValue);
                }
                else if (item_1 instanceof EventDispatcher) {
                    // ... an EventDispatcher, try to add handlers to it
                    // ------------------------------------------------------------------
                    _this.processEvents(item_1, configValue);
                }
                else if (_this.asIs(configKey)) {
                    // ... a special field, just set it to new value
                    // ------------------------------------------------------------------
                    // (no need to add each indvidual item)
                    target[configKey] = configValue;
                }
                else if (configValue instanceof BaseObject) {
                    // ... a BaseObject object, we just going to use it as it is
                    // ------------------------------------------------------------------
                    target[configKey] = configValue;
                }
                else if (item_1 instanceof BaseObject) {
                    // ... another child BaseObject
                    // ------------------------------------------------------------------
                    // Let's just pass in config part in and let itself deal with it
                    item_1.config = configValue;
                }
                else if (item_1 instanceof ListTemplate) {
                    // ... a list with template
                    // ------------------------------------------------------------------
                    // Let's see what we can do with it
                    if ($type.isArray(configValue)) {
                        // It's an array.
                        // Create a list item for entry, or try to apply properties to an
                        // existing entry if possible and it is present.
                        $array.each(configValue, function (entry, index) {
                            var type = _this.getConfigEntryType(entry);
                            var listItem;
                            if (item_1.hasIndex(index)) {
                                listItem = item_1.getIndex(index);
                            }
                            else if (type) {
                                listItem = item_1.create(type);
                            }
                            else {
                                listItem = item_1.create();
                            }
                            if ($type.isObject(entry)) {
                                // If the list item is BaseObject, we just need to let it
                                // deal if its own config
                                if (listItem instanceof BaseObject) {
                                    listItem.config = entry;
                                }
                                else if ($type.isObject(listItem) && $type.isObject(entry)) {
                                    $object.copyAllProperties(entry, listItem);
                                }
                                else {
                                    item_1.setIndex(item_1.indexOf(listItem), entry);
                                }
                            }
                        });
                    }
                    else if ($type.isObject(configValue)) {
                        // It's a single oject.
                        // Treat it as a template.
                        $object.each(configValue, function (entryKey, entryValue) {
                            var listItem = item_1.template[entryKey];
                            if (listItem instanceof Adapter) {
                                _this.processAdapters(listItem, entryValue);
                            }
                            else if (listItem instanceof EventDispatcher) {
                                _this.processEvents(listItem, entryValue);
                            }
                            else if (listItem instanceof DictionaryTemplate) {
                                _this.processDictionaryTemplate(listItem, entryValue);
                            }
                            else if (item_1.template[entryKey] instanceof BaseObject) {
                                // Template is a BaseObject. Let it deal with its own config.
                                item_1.template[entryKey].config = entryValue;
                            }
                            else {
                                // Aything else. Just assing and be done with it.
                                item_1.template[entryKey] = entryValue;
                            }
                        });
                    }
                    else {
                        // Something else?
                        // Not sure what to do with it on a list - ignore
                    }
                }
                else if (item_1 instanceof List) {
                    // ... a list
                    // ------------------------------------------------------------------
                    // Convert to array if necessary
                    if (!$type.isArray(configValue)) {
                        configValue = [configValue];
                    }
                    // It's an array
                    // Create a list item for entry
                    $array.each(configValue, function (entry, index) {
                        if ($type.isObject(entry)) {
                            // An object.
                            //
                            // Let's see if we can instantiate a class out of it, or we need
                            // to push it into list as it is.
                            //
                            // If there are items already at the specified index in the list,
                            // apply properties rather than create a new one.
                            var listItem = void 0;
                            if (item_1.hasIndex(index)) {
                                listItem = item_1.getIndex(index);
                            }
                            else {
                                var listItem_1 = _this.createEntryInstance(entry);
                                item_1.push(listItem_1);
                            }
                            // If the list item is BaseObject, we just need to let it
                            // deal if its own config
                            if (listItem instanceof BaseObject) {
                                listItem.config = entry;
                            }
                        }
                        else {
                            // Basic value.
                            // Just push it into list, or override existing value
                            if (item_1.hasIndex(index)) {
                                item_1.setIndex(index, entry);
                            }
                            else {
                                item_1.push(entry);
                            }
                        }
                    });
                }
                else if (item_1 instanceof DictionaryTemplate) {
                    // ... a dictionary with template
                    // ------------------------------------------------------------------
                    _this.processDictionaryTemplate(item_1, configValue);
                }
                else if (item_1 instanceof Dictionary) {
                    // ... a dictionary
                    // ------------------------------------------------------------------
                    // @todo
                }
                else if (item_1 instanceof Color || item_1 instanceof Percent) {
                    // ... it's a Color or Percent
                    // ------------------------------------------------------------------
                    target[configKey] = configValue;
                }
                else if ($type.isObject(item_1) && $type.isObject(configValue)) {
                    // ... a regular object
                    // ------------------------------------------------------------------
                    $object.copyAllProperties(configValue, item_1);
                }
                else {
                    // ... something else - probably a simple property or object
                    // ------------------------------------------------------------------
                    // Maybe convert to `Percent` or `Color`?
                    if ($type.isString(configValue)) {
                        if (configValue.match(/^[0-9.\-]+\%$/)) {
                            configValue = percent($type.toNumber(configValue));
                        }
                        else if (configValue.match(/^\#[0-9abcdef]{3,}$/i)) {
                            configValue = color(configValue);
                        }
                    }
                    // Assign
                    target[configKey] = configValue;
                }
            }
        }, this.configOrder);
    };
    BaseObject.prototype.processAdapters = function (item, config) {
        if ($type.isObject(config)) {
            $object.each(config, function (key, entry) {
                item.add(key, entry);
            });
        }
    };
    BaseObject.prototype.processEvents = function (item, config) {
        if ($type.isObject(config)) {
            $object.each(config, function (key, entry) {
                item.on(key, entry);
            });
        }
    };
    /**
     * Processes JSON config for a [[DictionaryTemplate]] item.
     *
     * @todo Description
     * @param {DictionaryTemplate<any, any>}  item    Item
     * @param {any}                           config  Config
     */
    BaseObject.prototype.processDictionaryTemplate = function (item, config) {
        // We can only process object
        // Not sure what to do with other types - ignore
        if ($type.isObject(config)) {
            // Create an entry for each item, or override properties for
            // existing one.
            $object.each(config, function (entryKey, entryValue) {
                var listItem;
                // Get existing one, or create a new one
                if (item.hasKey(entryKey)) {
                    listItem = item.getKey(entryKey);
                }
                else {
                    listItem = item.create(entryKey);
                }
                // Set data
                if (listItem instanceof BaseObject) {
                    listItem.config = entryValue;
                }
                else if ($type.isObject(listItem) && $type.isObject(entryValue)) {
                    $object.copyAllProperties(entryValue, listItem);
                }
                else {
                    listItem.setKey(entryKey, entryValue);
                }
            });
        }
    };
    /**
     * This function is used to sort element's JSON config properties, so that
     * some properties that absolutely need to be processed last, can be put at
     * the end.
     *
     * @ignore Exclude from docs
     * @param  {string}  a  Element 1
     * @param  {string}  b  Element 2
     * @return {Ordering}   Sorting number
     */
    BaseObject.prototype.configOrder = function (a, b) {
        if (a == b) {
            return 0;
        }
        else if (a == "language") {
            return -1;
        }
        else if (b == "language") {
            return 1;
        }
        else {
            return 0;
        }
    };
    /**
     * Checks if field should be just assigned as is, without any checking when
     * processing JSON config.
     *
     * Extending functions can override this function to do their own checks.
     *
     * @param  {string}   field  Field name
     * @return {boolean}         Assign as is?
     */
    BaseObject.prototype.asIs = function (field) {
        return $array.indexOf(["locale"], field) != -1;
    };
    /**
     * Creates a relevant class instance if such class definition exists.
     *
     * @ignore Exclude from docs
     * @param  {string}  className  Class name
     * @return {Object}             Instance
     */
    BaseObject.prototype.createClassInstance = function (className) {
        if ($type.hasValue(system.registeredClasses[className])) {
            return new system.registeredClasses[className]();
        }
        return;
    };
    /**
     * Creates a class instance for a config entry using it's type. (as set in
     * `type` property)
     *
     * @ignore Exclude from docs
     * @param  {any}  config  Config part
     * @return {any}          Instance
     */
    BaseObject.prototype.createEntryInstance = function (config) {
        var res;
        if ($type.hasValue(config["type"])) {
            res = this.createClassInstance(config["type"]);
        }
        if (!res) {
            return config;
        }
        return res;
    };
    /**
     * Determines config object type.
     *
     * @ignore Exclude from docs
     * @param  {any}  config  Config part
     * @return {any}          Type
     */
    BaseObject.prototype.getConfigEntryType = function (config) {
        if ($type.hasValue(config["type"])) {
            if ($type.hasValue(system.registeredClasses[config["type"]])) {
                return system.registeredClasses[config["type"]];
            }
            else {
                throw Error("Invalid type: \"" + config["type"] + "\".");
            }
        }
        return;
    };
    /**
     * Checks if this element has a property.
     *
     * @ignore Exclude from docs
     * @param  {string}   prop  Property name
     * @return {boolean}        Has property?
     */
    BaseObject.prototype.hasProperty = function (prop) {
        return prop in this ? true : false;
    };
    return BaseObject;
}());
export { BaseObject };
;
/**
 * A version of [[BaseObject]] with events properties and methods.
 * Classes that use [[EventDispatcher]] should extend this instead of
 * [[BaseObject]] directly.
 */
var BaseObjectEvents = /** @class */ (function (_super) {
    __extends(BaseObjectEvents, _super);
    /**
     * Constructor
     */
    function BaseObjectEvents() {
        var _this = _super.call(this) || this;
        /**
         * An [[EventDispatcher]] instance
         */
        _this.events = new EventDispatcher();
        _this.className = "BaseObjectEvents";
        _this._disposers.push(_this.events);
        return _this;
    }
    /**
     * Dispatches an event using own event dispatcher. Will automatically
     * populate event data object with event type and target (this element).
     * It also checks if there are any handlers registered for this sepecific
     * event.
     *
     * @param {string} eventType Event type (name)
     * @param {any}    data      Data to pass into event handler(s)
     */
    BaseObjectEvents.prototype.dispatch = function (eventType, data) {
        // @todo Implement proper type check
        if (this.events.isEnabled(eventType)) {
            if (data) {
                data.type = eventType;
                data.target = data.target || this;
                this.events.dispatch(eventType, {
                    type: eventType,
                    target: this
                });
            }
            else {
                this.events.dispatch(eventType, {
                    type: eventType,
                    target: this
                });
            }
        }
    };
    /**
     * Works like `dispatch`, except event is triggered immediately, without
     * waiting for the next frame cycle.
     *
     * @param {string} eventType Event type (name)
     * @param {any}    data      Data to pass into event handler(s)
     */
    BaseObjectEvents.prototype.dispatchImmediately = function (eventType, data) {
        // @todo Implement proper type check
        if (this.events.isEnabled(eventType)) {
            if (data) {
                data.type = eventType;
                data.target = data.target || this;
                this.events.dispatchImmediately(eventType, data);
            }
            else {
                this.events.dispatchImmediately(eventType, {
                    type: eventType,
                    target: this
                });
            }
        }
    };
    return BaseObjectEvents;
}(BaseObject));
export { BaseObjectEvents };
//# sourceMappingURL=Base.js.map