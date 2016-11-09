interface ESPDecorators {
  define(nameOrTarget: string | Function): any;
  template(tpl: string): any;
  prop(proto: any, key: string): void;
  string(proto: any, key: string): void;
  number(proto: any, key: string): void;
  boolean(proto: any, key: string): void;
  date(proto: any, key: string): void;
  object(proto: any, key: string): void;
  array(proto: any, key: string): void;
  attr(proto: any, key: string): void;
  readOnly(value: any): (proto: any, key: string) => void;
  notify(proto: any, key: string): void;
  computed(props: string): any;
  computed(proto: any, key: string): any;
  observe(props: string): any;
  observe(proto: any, key: string): any;
}

declare module "easy-polymer" {
  export = ESP;
}

declare var ESP: ESPDecorators;
