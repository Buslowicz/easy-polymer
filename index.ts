declare const customElements: { define: { (name: string, proto: any): void }};

function getPropertyDescriptor(proto, key) {
  let config: any = proto.config = proto.config || {};
  let properties = config.properties = config.properties || {};
  return properties[ key ] = properties[ key ] || {};
}

function defineComponent(target) {
  let opts = this || {};
  let prototype = target.prototype;
  let config = prototype.config;
  let name = opts.name || target.name.replace(/[A-Z]/g, (c, i) => `${i === 0 ? "" : "-"}${c.toLowerCase()}`);

  if (parseFloat(Polymer[ "version" ]) < 2) {
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

export function define(nameOrTarget: string|Function) {
  if (nameOrTarget instanceof Function) {
    defineComponent(nameOrTarget);
  }
  else if (typeof nameOrTarget === "string") {
    return defineComponent.bind({ name: nameOrTarget });
  }
}

export function template(tpl: string) {
  return target => {
    let module = document.createElement("dom-module");
    let templateElement = document.createElement("template");
    module.appendChild(templateElement);
    templateElement.innerHTML = tpl;
    module.id = target.name.replace(/[A-Z]/g, (c, i) => `${i === 0 ? "" : "-"}${c.toLowerCase()}`);
    module[ "register" ]();
  };
}

export function prop(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Reflect[ "getMetadata" ]("design:type", proto, key);
}

export function string(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = String;
}

export function number(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Number;
}

export function boolean(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Boolean;
}

export function date(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Date;
}

export function object(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Object;
}

export function array(proto: any, key: string) {
  getPropertyDescriptor(proto, key).type = Array;
}

export function attr(proto: any, key: string) {
  getPropertyDescriptor(proto, key).reflectToAttribute = true;
}

export function readOnly(value: any) {
  return (proto: any, key: string) => {
    let descriptor = getPropertyDescriptor(proto, key);
    descriptor.readOnly = true;
    descriptor.value = value;
  };
}

export function notify(proto: any, key: string) {
  getPropertyDescriptor(proto, key).notify = true;
}

function computedProperty(proto: any, key: string) {
  let options = this;
  let handler: Function = proto[ key ];
  if (!handler) {
    throw new TypeError(`@computed can only be applied to a method (\`${key}\` is not a method)`);
  }

  let args = options.args || handler.toString().match(/.*?\(([^\)]+?)\)/)[ 1 ];
  let descriptor = getPropertyDescriptor(proto, key);
  descriptor.type = Reflect[ "getMetadata" ]("design:returntype", proto, key);
  descriptor.computed = `__${key}(${args})`;

  proto[ `__${key}` ] = handler;
}

function observeProperty(proto: {config: any}, key: string) {
  let options = this;
  let handler: Function = proto[ key ];
  if (!handler) {
    throw new TypeError(`@observe can only be applied to a method (\`${key}\` is not a method)`);
  }

  let args = options.args || handler.toString().match(/.*?\(([^\)]+?)\)/)[ 1 ];
  let dependencies: string[] = args.split(/, ?/g);
  if (dependencies.length === 0) {
    throw new SyntaxError(`Observable method should contain observed properties,` +
      ` or @observe decorator should be provided a list of properties`);
  }
  if (dependencies.length === 1 && dependencies[ 0 ].indexOf(".") === -1) {
    let descriptor = getPropertyDescriptor(proto, dependencies[ 0 ]);
    descriptor.observer = key;
  }
  else {
    let config = proto.config = proto.config || {};
    let observers = config.observers = config.observers || [];
    observers.push(`${key}(${args})`);
  }
}

export function computed(props: string);
export function computed(proto: any, key: string);
export function computed(...args) {
  let arg0 = args[ 0 ];
  if (typeof arg0 === "string") {
    return computedProperty.bind({ args: arg0 });
  }
  computedProperty(arg0, args[ 1 ]);
}

export function observe(props: string);
export function observe(proto: any, key: string);
export function observe(...args) {
  let arg0 = args[ 0 ];
  if (typeof arg0 === "string") {
    return observeProperty.bind({ args: arg0 });
  }
  observeProperty(arg0, args[ 1 ]);
}
