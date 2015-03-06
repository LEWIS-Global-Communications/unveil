/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida (modified by Yair Even-Or)
 * https://github.com/luis-almeida
 */
;
(function($){
    "use strict";

    var $DOC = $(document),
        //$WIN = $(window),
        retina = window.devicePixelRatio > 1,
        timer,
        attrib = "data-src"; // retina ? "data-src-retina" : "data-src"


    function Unveil(opts, images){
        var that = this;

        this.opts = {};

        this.wrapper     = opts.wrapper;
        this.threshold   = opts.threshold || 0;
        this.callback    = opts.callback;

        this.opts.base   = opts.base || $DOC;

        this.images = images;

        // do not call 'unveil' until user had stopped scrolling
        this.wrapper
            .on('scroll.unveil', _.throttle(that.check.bind(this), 200))
            .on('resize.unveil', this.check.bind(this)); // because there is no resize event on an element

        // immediately check of current images are on-screen
        this.check();
    }

    Unveil.prototype = {
        showImage : function(img){
            var that = this,
                source = img.getAttribute(attrib);

            // replace to lower-res images for small screen sizes
          //  if( window.screen.availWidth < 500 )
          //      source = source.replace('/3_', '/2_');  // change the "src" according to the screen's size

            //source = source || img.getAttribute("data-src");
            if( source ){
                img.setAttribute("src", source);
                img.removeAttribute("data-src");

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
            //console.log(images.eq(0).closest('.photos') );
            var inview,
                that = this,
                relativeOffset = that.wrapper[0] == window ? 0 : that.wrapper.offset().top,
                wt = that.wrapper.scrollTop(),
                wb = wt + that.wrapper.height();


            inview = this.images.filter(function(){
                if( this.src || !$.contains(document.documentElement, this) )
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
        }
    }


    ////////////////////////////////
    // jQuery Plugin (per instance)

    $.fn.unveil = function(opts, callback){  // {wrapper, threshold, callback, base}
        opts = opts || {};
        opts.wrapper = opts.wrapper ? $(opts.wrapper) : $(window);
        opts.callback = callback;

        var unveil = opts.wrapper.data('_unveil'),
            images = this;

         // if the image doesn't have a 'data-src' attribute, remove it from the set
        images.filter(function(){
            return this.getAttribute(attrib);
        })

/* sometimes will fail if some unveil happens with different settings, then they won't take place since the first once is cached
        if( unveil ){
            unveil.images = unveil.images.add(images);
            unveil.check();
            return;
        }
*/
        unveil = new Unveil(opts, images);

        opts.wrapper.data('_unveil', unveil);

        return this;
    };
})(jQuery);
