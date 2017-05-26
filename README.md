# url-parametrized
## General
This object provides a easy and simple way to handle parametrized urls. For example this can be 
- https://www.example.com/:paramA/:paramB(/:paramC)

In this case
- :paramA is not optional
- :paramB is not optional
- :paramC is optional

Not optional parameters must be defined if the url should be parsed otherwise an error will be thrown.

## Install
```
bower install url-parametrized --save
```

## Usage
```js
let url = new UrlParametrized('https://www.example.com/:paramA/:paramB(/:paramC)');
console.log(url.parse({paramA: 'nuff', paramB: 'narf', paramC: 'rofl'})); // https://www.example.com/nuff/narf/rofl
console.log(url.parse({paramA: 'nuff', paramB: 'narf'})); // https://www.example.com/nuff/narf
```
