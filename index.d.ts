declare module "easy-polymer" {
    function define(nameOrTarget: string | Function): any;
    function prop(proto: any, key: string): void;
    function string(proto: any, key: string): void;
    function number(proto: any, key: string): void;
    function boolean(proto: any, key: string): void;
    function date(proto: any, key: string): void;
    function object(proto: any, key: string): void;
    function array(proto: any, key: string): void;
    function attr(proto: any, key: string): void;
    function readOnly(value: any): (proto: any, key: string) => void;
    function notify(proto: any, key: string): void;
    function computed(props: string): any;
    function computed(proto: any, key: string): any;
    function observe(props: string): any;
    function observe(proto: any, key: string): any;
}
