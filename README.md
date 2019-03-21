# Inori-Translator

A simple and easy to use Chrome extension for translating text to Chinese

## features

- double click to auto select and translate
- select words to translate

## Usage

1. `git clone` this project
2. Apply for an `appid` in [Baidu Translate API](http://api.fanyi.baidu.com/api/trans/product/index)
3. Fill in your `appid` and `key` in `srcipt/background.js`
```js
function doQuery(query, sendResponse) {
    const appid = 'your appid here'
    const key = 'your key here'    
    //...
}
```
4. Go to `chrome://extensions/` and check the checkbox for Developer mode in the top right
5. Click the Load unpacked extension button and select the `inori-translator` folder to install the extension

## TODO

- setting page for filling in appid and key

## License

[MIT](LICENSE)