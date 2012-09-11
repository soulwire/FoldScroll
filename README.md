## FoldScroll

An experimental CSS 3D scroll behavior [jQuery](http://jquery.com/) plugin.

[See the demo](http://soulwire.github.com/FoldScroll/)
  
Example:

    $( '.container' ).foldscroll({
        
        // Perspective to apply to rotating elements
        perspective: 600,
    
        // Default shading to apply (null => no shading)
        shading: 'rgba(0,0,0,0.2)',
        
        // Area of rotation (fraction or pixel value)
        margin: 0.2
    });