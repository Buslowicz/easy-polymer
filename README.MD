# EaSy Polymer
This project aims at providing a unified decorators for Polymer v1 and v2. Lets get to examples.

## Examples

### @define
Core decorator, registers a component withing the browser. Has to be the first decorator if any other class level
decorator is used. By default it takes the name for the class name (changes UpperCamelCase to dash-case), but a custom
name can be provided.
```JavaScript
// Create an empty component with the name `my-class`
@define class MyClass {} // Polymer v1
@define class MyClass extends Polymer.Element {} // Polymer v2

// Create an empty component with the name `custom-name`
@define("custom-name") class MyClass {} // Polymer v1
@define("custom-name") class MyClass extends Polymer.Element {} // Polymer v2
```

### @template
Depending on the workflow, templates will either be placed in `dom-module`, or in TypeScript/JavaScript using
`@template`
```JavaScript
// Polymer v1
@define
@template(`<div>Hello [[name]]</div>`)
class MyClass {}

// Polymer v2
@define
@template(`<div>Hello [[name]]</div>`)
class MyClass extends Polymer.Element {}
```

### @prop, @string, @number, @boolean, @date, @object, @array
To define a property, by prepending a `@prop` decorator to it, or specifying specific type decorator (like `@number` or
`string`).

For `@prop` to be used, three dependencies have to be met:
* `reflect-metadata` has to be installed
* `emitDecoratorMetadata` has to be set to `true`
* class properties have to have implicit types defined
```JavaScript
// Polymer v1 does not need to extend Polymer.Element, while v2 does, in this case as well
@define class MyClass {
  @prop myProp: string;
  @string myString;
  @number myNumber;
  @boolean myBoolean;
  @date myDate;
  @object myObject;
  @array myArray;
  @array myArrayBetterWay: Array<string> // providing full typing for arrays
}
```

### @set, @readOnly
One of few things that are rather hard to make it work with both Polymer versions, are default values. With Polymer v2,
it's very easy, as it is just assigning the value to property (`@prop name: string = "Bob";`). With Polymer v1 it's
a bit more complicated, as the value needs to end up in the property config object. Because of that, to set the default
value in Polymer v1, you need to use the `@set` decorator.

If the value has to be read only and not be changed, use `@readOnly` decorator. In Polymer v1 it can replace the `@set`.
```JavaScript
// Polymer v1
@define class MyClass {
  @prop @set("Bob") name: string;
  @prop @readOnly("1.0.0") version: string;
}

// Polymer v2
@define class MyClass extends Polymer.Element {
  @prop name: string = "Bob";
  @prop @readOnly("1.0.0") version: string;
}
```

### @notify
Decorator to set polymer `notify` modifier
```JavaScript
// Polymer v1
@define class MyClass {
  @prop @notify name: string;
}

// Polymer v2
@define class MyClass extends Polymer.Element {
  @prop @notify name: string;
}
```

### @computed, @observe
Finally, some Polymer magic stuff. Both `@computed` and `@observe` decorators have the same API and the only difference
is that `@computed` method will save a return value into a property (name taken from the method name), while `@observe`
will not.

You can provide properties/paths to listen, but it's not necessary. If you use the plain decorator API, it will use
parameters names.

```JavaScript
@define class MyClass {
  @prop name: string;
  @prop age: number;
  
  @prop profile: {avatar: string};

  @observe // listen to properties as defined in parameters (name)
  nameChanged(name: string): void { /* ... */ }

  @observe("name, age") // listen to properties `name` and `age`
  nameAgeChanged(name: string, age: number): void { /* ... */ }
  
  @observe("profile.avatar") // listen to path `profile.avatar`
  profileAvatarChanged(avatar: string): void { /* ... */ }

  @computed // listen to properties as defined in parameters (name) - type fetched from Reflect metadata
  nameComputed(name: string): string { return `Hello ${name}`; }

  @computed("name, age") // listen to properties `name` and `age` - type fetched from Reflect metadata
  nameAgeComputed(name: string, age: number): string { return `${name} is ${age} years old`; }
  
  @computed("profile.avatar") // listen to path `profile.avatar` - type fetched from Reflect metadata
  profileAvatarComputed(avatar: string): string { return `My avatar: ${avatar}`; }

  @computed(String) // listen to properties as defined in parameters (name) - type provided in decorator
  nameComputedTypeType(name: string): string { return `Hello ${name}`; }

  @computed(String, "name, age") // listen to properties `name` and `age` - type provided in decorator
  nameAgeComputedType(name: string, age: number): string { return `${name} is ${age} years old`; }
  
  @computed(String, "profile.avatar") // listen to path `profile.avatar` - type provided in decorator
  profileAvatarComputedType(avatar: string): string { return `My avatar: ${avatar}`; }
}
