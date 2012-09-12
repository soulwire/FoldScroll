
(function($) {

    $.fn.foldscroll = function( options ) {

        // Constants
        var PI = Math.PI;
        var HALF_PI = PI / 2;

        // Merge options & defaults
        var opts = $.extend( {}, $.fn.foldscroll.defaults, options );

        // Transformation template
        var rot = 'perspective(' + opts.perspective + ') rotateX(θrad)';

        // Main plugin loop
        return this.each( function () {

            var $this = $( this );
            var $kids = $this.children();
            var $item;
            var $shading;

            if ( opts.shading ) {

                // Create an overlay for shading
                $shading = $( '<span class="shading"/>' ).css({
                    background: opts.shading,
                    position: 'absolute',
                    opacity: 0.0,
                    height: '100%',
                    width: '100%',
                    left: 0,
                    top: 0
                });

                // Add shading to each child
                $kids.each( function() {

                    $item = $(this);
                    $item.css( prefix({
                        'backface-visibility': 'hidden'
                    }));

                    // Make sure shading isn't already applied
                    if ( !$item.data( '_shading' ) ) {

                        $shading = $shading.clone();

                        // Prepare element
                        $item.css( 'position', 'relative' );
                        $item.data( '_shading', $shading );
                        $item.append( $shading );
                    }
                });
            }

            // Prepare container
            $this.css( prefix({ 'backface-visibility': 'hidden' }));
            $this.css({ overflow: 'scroll' });

            $this.on( 'scroll', function() {

                // Store scroll amount
                var st = $this.scrollTop();

                // Store viewport properties
                var vt = $this.offset().top - st;
                var vh = $this.outerHeight();
                var vb = vt + vh;

                // Compute margin
                var m = parseFloat( opts.margin );
                m = m <= 1.0 ? Math.min( m, 0.5 ) : m / vh;

                // Update children
                $kids.each( function( index, el ) {

                    $item = $(this);

                    // Remove current transform
                    $item.css( prefix({ transform: 'none' }) );

                    // Cache shading element if it exists
                    $shading = $item.find( '.shading' ).hide();

                    // Store element properties
                    var et = $item.offset().top - st;
                    var eh = Math.max( m * vh, $item.outerHeight() );
                    var eb = et + eh;

                    // Highest start value
                    var a = Math.max( vt, et );

                    // Lowest end value
                    var b = Math.min( vb, eb );

                    // Do line segments overlap?
                    var show = a < b;

                    // If there's overlap
                    if ( show ) {

                        // compute overlap
                        var o = b - a;
                        var p = o / vh;

                        if ( p < m ) {

                            // normalise
                            p = p / m;

                            // direction
                            var d = et < vt ? 1 : -1;

                            // rotation
                            var t = ( 1 - p ) * HALF_PI * d;

                            // Contrain rotation
                            if ( Math.abs(t) <= HALF_PI ) {

                                // Apply rotation
                                $item.css( prefix({
                                    'transform-origin': '50%' + ( et < vt ? '100%' : '0%' ),
                                    'transform': rot.replace( 'θ', t )
                                }));

                                // Update shading overlay
                                if ( opts.shading )
                                    $shading.css( 'opacity', 1.0 - p ).show();

                            } else {

                                show = false;
                            }
                        }
                    }

                    // Hide items outside of the viewport
                    $item.css( 'visibility', show ? 'visible' : 'hidden' );
                });
            });

            // Set initial state
            $this.trigger( 'scroll' );
        });
    };

    // CSS3 vendor prefix helper
    function prefix( obj ) {

        var key, val;

        for ( key in obj ) {

            val = obj[ key ];

            obj[ '-webkit-' + key ] = val;
            obj[ '-moz-' + key ] = val;
            obj[ '-ms-' + key ] = val;
            obj[ '-o-' + key ] = val;
        }

        return obj;
    }

    // Default options
    $.fn.foldscroll.defaults = {

        // Perspective to apply to rotating elements
        perspective: 600,

        // Default shading to apply (null => no shading)
        shading: 'rgba(0,0,0,0.2)',

        // Area of rotation (fraction or pixel value)
        margin: 0.2
    };

})( jQuery );