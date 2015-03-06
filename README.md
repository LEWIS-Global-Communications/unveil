#unveil.js
###A lightweight jQuery plugin to lazy load images



###What is this
Lazy-load images to save on bandwidth or just to quicken a web page load time. You can pass a callback which returns the image that was loaded (if it was loaded sucessfully), or you can subscribe to a published jquery event on a certain DOM scope which I call "base". 

###Usage example

    var scrollable_element = $('.scrollable'); // this would be the scope of the "scroll" event
    scrollable_element.find('img').unveil({ wrapper:scrollable_element, threshold:200, base:scrollable_element });
    
    scrollable_element.on('imageLoaded', function(e, img){
       // might want to show the image with an effect, so a "loaded" class could be added, and your
       // css might looks like this - `img{ opacity:0; transition:.2s; } img.loaded{ opacity:1; }
    }
    
    scrollable_element.on('deadImage', function(e, img){
       // might want to remove the photo from the DOM
    }



Visit unveil's [project page](http://luis-almeida.github.com/unveil/) to read the documentation and see the demo.


###Browser support
Compatible with All Browsers and IE7+.


###License
Unveil is licensed under the [MIT license](http://opensource.org/licenses/MIT).
