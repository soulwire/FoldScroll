
/**
 * Copyright (C) 2012 by Justin Windle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($) {

    $.fn.foldscroll = function( options ) {

        // Constants
        var PI = Math.PI;
        var HALF_PI = PI / 2;

        // Merge options & defaults
        var opts = $.extend( {}, $.fn.foldscroll.defaults, options );

        // Transformation template
        var rot = 'perspective(' + opts.perspective + 'px) rotateX(θrad)';

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
                        'backface-visibility': 'hidden',
                        'transform-style': 'preserve-3d' // Fixes perspective in FF 10+
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
            $this.css({ overflowY: 'scroll' });

            // Scroll handler
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

                        // Compute overlap
                        var o = b - a;

                        // Fraction of viewport covered by overlap
                        var p = o / vh;

                        // If overlap is within margin
                        if ( p < m ) {

                            // Normalise
                            p = p / m;

                            // Direction
                            var d = et < vt ? 1 : -1;

                            // Rotation
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