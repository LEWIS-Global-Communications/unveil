# unveil.js
### A lightweight jQuery plugin to lazy load images


### What is this
Lazy-load images to save on bandwidth or just to quicken a web page load time. You can pass a callback which returns the image that was loaded (if it was loaded sucessfully), or you can subscribe to a published jquery event on a certain DOM scope which I call "base".

### Usage example

**JS:**

    $.fn.unveil({ threshold:200, delegation:$('.gallery'), delayCheck:200 });

**CSS:**

    img[data-src]{ opacity:0; transition:opacity .2s;
        &.loaded{ opacity:1; }
    }

### Browser support
Compatible with All Browsers and IE7+.


### License
Unveil is licensed under the [MIT license](http://opensource.org/licenses/MIT).
