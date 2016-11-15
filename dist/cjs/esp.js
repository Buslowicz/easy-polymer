var PRIMITIVES = [String, Number, Boolean, Date, Object, Array];
function getPropertyDescriptor(proto, key) {
    var config = proto.config = proto.config || {};
    var properties = config.properties = config.properties || {};
    return properties[key] = properties[key] || {};
}
function defineComponent(target) {
    var opts = this || {};
    var prototype = target.prototype;
    var config = prototype.config;
    var name = opts.name || target.name.replace(/[A-Z]/g, function (c, i) { return ("" + (i === 0 ? "" : "-") + c.toLowerCase()); });
    if (parseFloat(Polymer["version"]) < 2) {
        prototype.is = name;
        Object.keys(config).forEach(function (key) { return prototype[key] = config[key]; });
        Polymer(prototype);
    }
    else {
        Object.defineProperties(target, {
            is: { get: function () { return name; } },
            config: { get: function () { return config; } }
        });
        customElements.define(target.is, target);
    }
}
function define(arg) {
    if (arg instanceof Function) {
        defineComponent(arg);
    }
    else if (typeof arg === "string") {
        return defineComponent.bind({ name: arg });
    }
}
exports.define = define;
function template(tpl) {
    return function (target) {
        var module = document.createElement("dom-module");
        var templateElement = document.createElement("template");
        module.appendChild(templateElement);
        templateElement.innerHTML = tpl;
        module.id = target.name.replace(/[A-Z]/g, function (c, i) { return ("" + (i === 0 ? "" : "-") + c.toLowerCase()); });
        module["register"]();
    };
}
exports.template = template;
function prop(proto, key) {
    getPropertyDescriptor(proto, key).type = Reflect["getMetadata"]("design:type", proto, key);
}
exports.prop = prop;
function string(proto, key) {
    getPropertyDescriptor(proto, key).type = String;
}
exports.string = string;
function number(proto, key) {
    getPropertyDescriptor(proto, key).type = Number;
}
exports.number = number;
function boolean(proto, key) {
    getPropertyDescriptor(proto, key).type = Boolean;
}
exports.boolean = boolean;
function date(proto, key) {
    getPropertyDescriptor(proto, key).type = Date;
}
exports.date = date;
function object(proto, key) {
    getPropertyDescriptor(proto, key).type = Object;
}
exports.object = object;
function array(proto, key) {
    getPropertyDescriptor(proto, key).type = Array;
}
exports.array = array;
function attr(proto, key) {
    getPropertyDescriptor(proto, key).reflectToAttribute = true;
}
exports.attr = attr;
function set(value) {
    return function (proto, key) {
        getPropertyDescriptor(proto, key).value = value;
    };
}
exports.set = set;
function readOnly(value) {
    return function (proto, key) {
        var descriptor = getPropertyDescriptor(proto, key);
        descriptor.readOnly = true;
        descriptor.value = value;
    };
}
exports.readOnly = readOnly;
function notify(proto, key) {
    getPropertyDescriptor(proto, key).notify = true;
}
exports.notify = notify;
function computedProperty(proto, key) {
    var options = this || {};
    var handler = proto[key];
    if (!handler) {
        throw new TypeError("@computed can only be applied to a method (`" + key + "` is not a method)");
    }
    var props = options.props || handler.toString().match(/.*?\(([^\)]+?)\)/)[1];
    var type = options.type || Reflect["getMetadata"]("design:returntype", proto, key);
    var descriptor = getPropertyDescriptor(proto, key);
    descriptor.type = type;
    descriptor.computed = "__" + key + "(" + props + ")";
    proto[("__" + key)] = handler;
}
function observeProperty(proto, key) {
    var options = this || {};
    var handler = proto[key];
    if (!handler) {
        throw new TypeError("@observe can only be applied to a method (`" + key + "` is not a method)");
    }
    var args = options.args || handler.toString().match(/.*?\(([^\)]+?)\)/)[1];
    var dependencies = args.split(/, ?/g);
    if (dependencies.length === 0) {
        throw new SyntaxError("Observable method should contain observed properties," +
            " or @observe decorator should be provided a list of properties");
    }
    if (dependencies.length === 1 && dependencies[0].indexOf(".") === -1) {
        var descriptor = getPropertyDescriptor(proto, dependencies[0]);
        descriptor.observer = key;
    }
    else {
        var config = proto.config = proto.config || {};
        var observers = config.observers = config.observers || [];
        observers.push(key + "(" + args + ")");
    }
}
function computed() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var arg0 = args[0];
    if (PRIMITIVES.indexOf(arg0) !== -1) {
        return computedProperty.bind({ type: arg0, props: typeof arg0 === "string" ? args[1] : undefined });
    }
    else if (typeof arg0 === "string") {
        return computedProperty.bind({ props: arg0 });
    }
    computedProperty(arg0, args[1]);
}
exports.computed = computed;
function observe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var arg0 = args[0];
    if (typeof arg0 === "string") {
        return observeProperty.bind({ args: arg0 });
    }
    observeProperty(arg0, args[1]);
}
exports.observe = observe;
