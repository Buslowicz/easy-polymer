interface ESPDecorators {
  define(name: string): (target: Function) => void;
  define(target: Function): void;
  template(tpl: string): (target: Function) => void;
  prop(proto: any, key: string): void;
  string(proto: any, key: string): void;
  number(proto: any, key: string): void;
  boolean(proto: any, key: string): void;
  date(proto: any, key: string): void;
  object(proto: any, key: string): void;
  array(proto: any, key: string): void;
  attr(proto: any, key: string): void;
  set(value: any): (proto: any, key: string) => void;
  readOnly(value: any): (proto: any, key: string) => void;
  notify(proto: any, key: string): void;
  computed(type: FunctionConstructor): (proto: any, key: string) => void;
  computed(type: FunctionConstructor, props: string): (proto: any, key: string) => void;
  computed(props: string): (proto: any, key: string) => void;
  computed(proto: any, key: string): void;
  observe(props: string): (proto: any, key: string) => void;
  observe(proto: any, key: string): void;
}

declare module "easy-polymer" {
  export = ESP;
}

declare var ESP: ESPDecorators;
