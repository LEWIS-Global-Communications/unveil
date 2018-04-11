/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida (modified by Yair Even-Or)
 * https://github.com/luis-almeida
 */
;(function($){
    "use strict";

    var $DOC = $(document),
        retina = window.devicePixelRatio > 1,
        timer;

    function throttle(callback, limit) {
        var wait = false;                  // Initially, we're not waiting
        return function () {               // We return a throttled function
            if (!wait) {                   // If we're not waiting
                callback.call();           // Execute users function
                wait = true;               // Prevent future invocations
                setTimeout(function () {   // After a period of time
                    wait = false;          // And allow future invocations
                }, limit);
            }
        }
    }


    function Unveil(opts, images){
        var that = this;

        this.opts = $.extend({
            base       : $DOC,
            delayCheck : 0,
            attrib     : "src"
        }, opts);

        this.wrapper     = opts.wrapper;
        this.threshold   = opts.threshold || 0;
        this.callback    = opts.callback;

        this.images = images;

        // Static - means unveil will not act as a real lazy loader and will not check which images are visible, and will not run any function automatically
        if( !this.opts.static ){
            this.wrapper
                .on('scroll.unveil', throttle(that.check.bind(this), 200)) // do NOT call 'unveil' until user had stopped scrolling
                .on('resize.unveil', this.check.bind(this)); // because there is no resize event on an element

            // immediately check of current images are on-screen
            setTimeout(this.check.bind(this), this.opts.delayCheck);
        }
    }

    Unveil.prototype = {
        showImage : function(img){
            var that = this,
                source = img.getAttribute("data-" + this.opts.attrib);

            //source = source || img.getAttribute("data-src");
            if( source ){
                img.setAttribute(this.opts.attrib, source);
                img.src = source;
                img.removeAttribute( "data-" + this.opts.attrib );

                img.onerror = function(){
                    img.onerror = null;
                    img.style.display = "none";
                    // trigger a custom event for this dead image to be picked up somewhere else
                    that.opts.base.trigger('deadImage', img);
                }

                img.onload = function(){
                    img.onload = null;
                    that.afterShowImage.call(that, img);
                }
                /*
                setTimeout(function(){
                    imagesLoaded(img, afterShowImage.bind(img));
                },10);
                */
                // just in case imagesLoaded didn't work
                // setTimeout(afterShowImage.bind(this), 10000);
            }
        },

        afterShowImage : function(img){
            $(img).addClass('loaded');
            this.opts.base.trigger('imageLoaded', img); // global custom event

            if( typeof this.callback === "function" ){
                this.callback.call(img);
            }
        },

        check : function(){
            var inview,
                that = this,
                relativeOffset = that.wrapper[0] == window ? 0 : that.wrapper.offset().top,
                wt = that.wrapper.scrollTop(),
                wb = wt + that.wrapper.height();

            // for dynamicly-generated image, a slightly slower appriach
            if( this.opts.delegation )
                this.images = this.opts.delegation.find('img[data-src]');

            inview = this.images.filter(function(){
                if( !this.dataset.src || !$.contains(document.documentElement, this) || getComputedStyle(this, null).display == 'none' || getComputedStyle(this, null).width == '0px' )
                    return false;

                //if( el.hasClass('hidden') )
                //    return false;

                var $el = $(this),
                    et = $el.offset().top - relativeOffset, // elm top distance from WRAPPER top
                    eb = et + $el.height();                 // elm bottom distance from WRAPPER top

                //console.log(this, eb >= wt - relativeOffset , et <= wb + relativeOffset);
                return eb >= 0 - that.threshold && et <= wb + that.threshold;
            });

            //inview.trigger('unveil');
            inview.each(function(){
                that.showImage.call(that, this);
            });
            //console.log('inview: ', inview);
            this.images = this.images.not(inview);
        },

        /**
         * Convert an imageURL to a
         * base64 dataURL via canvas
         *
         * @param   {String}  url
         * @param   {Object}  options
         * @param   {String}  options.outputFormat [outputFormat='image/png']
         * @param   {Float}   options.quality [quality=1.0]
         * @return  {Promise}
         * @docs    https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement#Methods
         * @author  HaNdTriX
         */
        imgURLToDataURL : function(url, options) {
            options = options || {};
            return new Promise(function(resolve, reject){
                img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function(){
                    var canvas = document.createElement('CANVAS'),
                        ctx = canvas.getContext('2d'),
                        dataURL;
                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img, 0, 0);
                    dataURL = canvas.toDataURL(options.outputFormat, options.quality);
                    resolve(dataURL);
                    canvas = null;
                };
                img.src = url;
            });
        }
    }


    ////////////////////////////////
    // jQuery Plugin (per instance)

    window.Unveil = Unveil;

    $.fn.unveil = function(opts, callback){  // {wrapper, threshold, callback, base}
        opts = opts || {};
        opts.wrapper = opts.wrapper ? $(opts.wrapper) : $(window);
        opts.callback = callback;

        var unveil = opts.wrapper.data('_unveil');


         // if the image doesn't have a 'data-src' attribute, remove it from the set
        // images.filter(function(){
        //     return this.getAttribute(attrib);
        // })

/* sometimes will fail if some unveil happens with different settings, then they won't take place since the first once is cached
        if( unveil ){
            unveil.images = unveil.images.add(images);
            unveil.check();
            return;
        }
*/

        unveil = new Unveil(opts, this);

        (opts.delegation || opts.wrapper).data('_unveil', unveil);

        return this;
    };
})(jQuery);