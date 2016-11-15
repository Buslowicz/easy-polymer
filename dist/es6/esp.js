const PRIMITIVES = [String, Number, Boolean, Date, Object, Array];
function getPropertyDescriptor(proto, key) {
    let config = proto.config = proto.config || {};
    let properties = config.properties = config.properties || {};
    return properties[key] = properties[key] || {};
}
function defineComponent(target) {
    let opts = this || {};
    let prototype = target.prototype;
    let config = prototype.config;
    let name = opts.name || target.name.replace(/[A-Z]/g, (c, i) => `${i === 0 ? "" : "-"}${c.toLowerCase()}`);
    if (parseFloat(Polymer["version"]) < 2) {
        prototype.is = name;
        Object.keys(config).forEach(key => prototype[key] = config[key]);
        Polymer(prototype);
    }
    else {
        Object.defineProperties(target, {
            is: { get: () => name },
            config: { get: () => config }
        });
        customElements.define(target.is, target);
    }
}
export function define(arg) {
    if (arg instanceof Function) {
        defineComponent(arg);
    }
    else if (typeof arg === "string") {
        return defineComponent.bind({ name: arg });
    }
}
export function template(tpl) {
    return target => {
        let module = document.createElement("dom-module");
        let templateElement = document.createElement("template");
        module.appendChild(templateElement);
        templateElement.innerHTML = tpl;
        module.id = target.name.replace(/[A-Z]/g, (c, i) => `${i === 0 ? "" : "-"}${c.toLowerCase()}`);
        module["register"]();
    };
}
export function prop(proto, key) {
    getPropertyDescriptor(proto, key).type = Reflect["getMetadata"]("design:type", proto, key);
}
export function string(proto, key) {
    getPropertyDescriptor(proto, key).type = String;
}
export function number(proto, key) {
    getPropertyDescriptor(proto, key).type = Number;
}
export function boolean(proto, key) {
    getPropertyDescriptor(proto, key).type = Boolean;
}
export function date(proto, key) {
    getPropertyDescriptor(proto, key).type = Date;
}
export function object(proto, key) {
    getPropertyDescriptor(proto, key).type = Object;
}
export function array(proto, key) {
    getPropertyDescriptor(proto, key).type = Array;
}
export function attr(proto, key) {
    getPropertyDescriptor(proto, key).reflectToAttribute = true;
}
export function set(value) {
    return (proto, key) => {
        getPropertyDescriptor(proto, key).value = value;
    };
}
export function readOnly(value) {
    return (proto, key) => {
        let descriptor = getPropertyDescriptor(proto, key);
        descriptor.readOnly = true;
        descriptor.value = value;
    };
}
export function notify(proto, key) {
    getPropertyDescriptor(proto, key).notify = true;
}
function computedProperty(proto, key) {
    let options = this || {};
    let handler = proto[key];
    if (!handler) {
        throw new TypeError(`@computed can only be applied to a method (\`${key}\` is not a method)`);
    }
    let props = options.props || handler.toString().match(/.*?\(([^\)]+?)\)/)[1];
    let type = options.type || Reflect["getMetadata"]("design:returntype", proto, key);
    let descriptor = getPropertyDescriptor(proto, key);
    descriptor.type = type;
    descriptor.computed = `__${key}(${props})`;
    proto[`__${key}`] = handler;
}
function observeProperty(proto, key) {
    let options = this || {};
    let handler = proto[key];
    if (!handler) {
        throw new TypeError(`@observe can only be applied to a method (\`${key}\` is not a method)`);
    }
    let args = options.args || handler.toString().match(/.*?\(([^\)]+?)\)/)[1];
    let dependencies = args.split(/, ?/g);
    if (dependencies.length === 0) {
        throw new SyntaxError(`Observable method should contain observed properties,` +
            ` or @observe decorator should be provided a list of properties`);
    }
    if (dependencies.length === 1 && dependencies[0].indexOf(".") === -1) {
        let descriptor = getPropertyDescriptor(proto, dependencies[0]);
        descriptor.observer = key;
    }
    else {
        let config = proto.config = proto.config || {};
        let observers = config.observers = config.observers || [];
        observers.push(`${key}(${args})`);
    }
}
export function computed(...args) {
    let arg0 = args[0];
    if (PRIMITIVES.indexOf(arg0) !== -1) {
        return computedProperty.bind({ type: arg0, props: typeof arg0 === "string" ? args[1] : undefined });
    }
    else if (typeof arg0 === "string") {
        return computedProperty.bind({ props: arg0 });
    }
    computedProperty(arg0, args[1]);
}
export function observe(...args) {
    let arg0 = args[0];
    if (typeof arg0 === "string") {
        return observeProperty.bind({ args: arg0 });
    }
    observeProperty(arg0, args[1]);
}
