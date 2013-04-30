/**
 * kSimpleSlides
 *
 * Rotating simple slideshow
 *
 * requires jQuery JavaScript Library > v1.4.4
 *
 * copyright (c) 2011-2012 Kopolo
 * http://kopolo.ru/en/for_webmasters/
 * https://github.com/andruhon/kSimpleSlides
 *
 * Live demo: http://kopolo.ru/en/for_webmasters/ksimpleslides/demo/
 *
 *
 * @author: Andrey Kondratev andr@kopolo.ru
 *
 * Dual licensed under MIT and GPL 2+ licenses
 */
(function(jQuery){

    kSimpleSlidesVersion = '0.8.2';

    /*Class*/
    kSimpleSlides = function(user_options) {
        var defaults = {
            /**
             * CSS selector or jQuery element of the slideshow wrapper
             * var string|object
             */
            wrapper: '#slideshow',

            /**
             * CSS selector or jQuery element for slideshow controls (ul>li>a)
             * if FALSE doesn't init controls
             * var string|object
             */
            controls: false,

            /**
             * Start slideshow avtomatically
             * var boolean
             */
            autoPlay: true,

            /**
             * Enables init by hash
             * var boolean
             */
            hashInit: false,

            /**
             * Interval in milliseconds
             * var integer
             */
            playInterval: 4000,

            /**
             * CSS class for slideshow item
             * var string
             */
            itemClass: 'item',

            /**
             * CSS class for selected control links
             * var string
             */
            controlSelectedClass: 'selected',

            /**
             * prefix for CSS class, that added for every control link
             * controlSelectedPrefix+slideId
             * var string
             */
            controlSelectedPrefix: 'slideshow-selected-',

            /**
             * fadeOut/fadeIn options
             * see http://api.jquery.com/fadeOut/ and http://jqueryui.com/show/
             * var integer|object
             */
            fadeOptions: 800,

            /**
             * function to execute before hiding current slide
             * currentSlide is false if it is the first iteration and nothing displayed yet
             * var function
             */
            beforeFade: function(currentSlide,nextSlide){}
        };

        /**
         * Link to kSimpleSlides itself ( like "this" operator)
         * available anywhere in the jQuery wrapper
         * returned by kSearchHint
         */
        var instance = {};

        /**
         * Options after megring defaults and user options
         * var object
         */
        var options;

        /**
         * The slideshow wrapper
         */
        instance.wrapper;

        /**
         * Current slide jQuery element
         */
        instance.currentSlide = false;

        /**
         * slideshowInterval
         */
        instance.slideshowInterval = false;


        /**
         * Wrapper for control links
         */
        instance.controlsWrapper = false;


        /**
         * Merging of defaults and user options
         * @param object user_options
         */
        function setOptions(user_options) {
            if (jQuery.type(user_options)==='string') {
                /*if options is string then assume it's wrapper's CSS selector*/
                options = jQuery.extend({}, defaults, options);
                options.wrapper = user_options;
            } else {
                options = jQuery.extend({}, defaults, options, user_options);
            }
        };

        /**
         * Initialization of the main elements
         */
        instance.init = function()
        {
            instance.wrapper = jQuery(options.wrapper);
            instance.wrapper.find('.'+options.itemClass).hide();

            if (options.controls!=false) {
                instance.controlsWrapper = jQuery(options.controls);
                instance.initControls(instance.controlsWrapper);
            };

            /*show slide if hash passed*/
            if (options.hashInit==true && location.hash) {
                instance.showSlide(location.hash);
            } else {
                instance.showSlide(instance.wrapper.find('.'+options.itemClass).eq(0));
            }

            if (options.autoPlay==true) {
                instance.play();
            }
        };

        /**
         * Displays slide
         * @param string|object slide - CSS selector of slide or jQuery element
         */
        instance.showSlide = function(slide)
        {
            var slide = jQuery(slide);
            var href = slide.attr('data-href');
            if (href!=undefined && href!='') {
                jQuery.ajax({
                    url: href,
                    success: function(data) {
                        slide.html(data);
                        slide.removeAttr('data-href');
                    }
                });
            }
            var slideId = slide.attr('id');
            if (slideId && instance.currentSlide && slide.attr('id') == instance.currentSlide.attr('id')) {
                return false;
            }

            options.beforeFade(instance.currentSlide,slide);
            if (instance.currentSlide!=false) {                
                instance.currentSlide.fadeOut(options.fadeOptions);
            }

            slide.fadeIn(options.fadeOptions);
            instance.currentSlide = slide;

            if (options.controls!=false) {
                instance.controlsWrapper.find('.'+options.controlSelectedClass).removeClass(options.controlSelectedClass);
                instance.controlsWrapper.find('.'+options.controlSelectedPrefix+slideId).addClass(options.controlSelectedClass);
            }
        };

        /**
         * Displays next slide
         */
        instance.nextSlide = function()
        {
            var nextSlide = instance.currentSlide.next('.'+options.itemClass);
            if (nextSlide.length==0) {
                nextSlide = instance.wrapper.find('.'+options.itemClass).first();
            }
            instance.showSlide(nextSlide);
        };

        /**
         * Displays previous slide
         */
        instance.prevSlide = function()
        {
            var prevSlide = instance.currentSlide.prev('.'+options.itemClass);
            if (prevSlide.length==0) {
                prevSlide = instance.wrapper.find('.'+options.itemClass).last();
            }
            instance.showSlide(prevSlide);
        };

        /**
         * Statrs slideshow
         * @param integer interval - interval in milliseconds
         */
        instance.play = function(interval)
        {
            if (interval==undefined) {
                interval = options.playInterval;
            }
            if (instance.slideshowInterval!=false) {
                clearInterval(instance.slideshowInterval);
            }
            instance.slideshowInterval = setInterval(function(){
                instance.nextSlide();
            },interval);
        };

        /**
         * Stop slideshow
         */
        instance.stop = function()
        {
            if (instance.slideshowInterval!=false) {
                clearInterval(instance.slideshowInterval);
                instance.slideshowInterval=false;
            }
        };

        /**
         * Toggle slideshow playback
         * return string status - 'playing'||'stopped'
         */
        instance.playToggle = function()
        {
            if (instance.slideshowInterval!=false) {
                instance.stop();
                return 'stopped';
            } else {
                instance.play();
                return 'playing';
            }
        };

        /**
         * Initialization of the control elements
         * @param controls
         */
        instance.initControls = function(controls)
        {
            var controlsItems = instance.controlsWrapper.find('a');
            controlsItems.each(function(index){
                var controlItem = $(this);
                var fullHref = controlItem.attr('href');
                var hrefSplitted = fullHref.split( "#" );
                var href = hrefSplitted[0];
                var slideId = hrefSplitted[1];
                controlItem.addClass(options.controlSelectedPrefix+slideId);
                if (href!=undefined && href!='') {
                    $('#'+slideId).attr('data-href',href);
                }
                controlItem.click(function(){
                    instance.showSlide('#'+slideId);
                    if (options.autoPlay==true) {
                        instance.play();
                    }
                    return false;
                });
            });
        };

        /**
         * Constructor
         */
        {
            setOptions(user_options);
            instance.init();
            return instance;
        };
    };
})(jQuery);