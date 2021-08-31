(function() {
  var svg;

  //save off default references
  var d3 = window.d3, topojson = window.topojson;

  var defaultOptions = {
    scope: 'world',
    responsive: false,
    aspectRatio: 0.5625,
    setProjection: setProjection,
    projection: 'equirectangular',
    dataType: 'json',
    data: {},
    done: function() {},
    fills: {
      defaultFill: '#ABDDA4'
    },
    filters: {},
    geographyConfig: {
        dataUrl: null,
        hideAntarctica: true,
        hideHawaiiAndAlaska : false,
        borderWidth: 1,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
        },
        popupOnHover: true,
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2
    },
    projectionConfig: {
      rotation: [97, 0]
    },
    bubblesConfig: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        popupOnHover: true,
        radius: null,
        popupTemplate: function(geography, data) {
          return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
        },
        fillOpacity: 0.75,
        animate: true,
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightFillOpacity: 0.85,
        exitDelay: 100,
        key: JSON.stringify
    },
    arcConfig: {
      strokeColor: '#DD1C77',
      strokeWidth: 1,
      arcSharpness: 1,
      animationSpeed: 600
    }
  };

  /*
    Getter for value. If not declared on datumValue, look up the chain into optionsValue
  */
  function val( datumValue, optionsValue, context ) {
    if ( typeof context === 'undefined' ) {
      context = optionsValue;
      optionsValues = undefined;
    }
    var value = typeof datumValue !== 'undefined' ? datumValue : optionsValue;

    if (typeof value === 'undefined') {
      return  null;
    }

    if ( typeof value === 'function' ) {
      var fnContext = [context];
      if ( context.geography ) {
        fnContext = [context.geography, context.data];
      }
      return value.apply(null, fnContext);
    }
    else {
      return value;
    }
  }

  function addContainer( element, height, width ) {
    this.svg = d3.select( element ).append('svg')
      .attr('width', width || element.offsetWidth)
      .attr('data-width', width || element.offsetWidth)
      .attr('class', 'datamap')
      .attr('height', height || element.offsetHeight)
      .style('overflow', 'hidden'); // IE10+ doesn't respect height/width when map is zoomed in

    if (this.options.responsive) {
      d3.select(this.options.element).style({'position': 'relative', 'padding-bottom': (this.options.aspectRatio*100) + '%'});
      d3.select(this.options.element).select('svg').style({'position': 'absolute', 'width': '100%', 'height': '100%'});
      d3.select(this.options.element).select('svg').select('g').selectAll('path').style('vector-effect', 'non-scaling-stroke');

    }

    return this.svg;
  }

  // setProjection takes the svg element and options
  function setProjection( element, options ) {
    var width = options.width || element.offsetWidth;
    var height = options.height || element.offsetHeight;
    var projection, path;
    var svg = this.svg;

    if ( options && typeof options.scope === 'undefined') {
      options.scope = 'world';
    }

    if ( options.scope === 'usa' ) {
      projection = d3.geo.albersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);
    }
    else if ( options.scope === 'world' ) {
      projection = d3.geo[options.projection]()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / (options.projection === "mercator" ? 1.45 : 1.8)]);
    }

    if ( options.projection === 'orthographic' ) {

      svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

      svg.append("use")
          .attr("class", "stroke")
          .attr("xlink:href", "#sphere");

      svg.append("use")
          .attr("class", "fill")
          .attr("xlink:href", "#sphere");
      projection.scale(250).clipAngle(90).rotate(options.projectionConfig.rotation)
    }

    path = d3.geo.path()
      .projection( projection );

    return {path: path, projection: projection};
  }

  function addStyleBlock() {
    if ( d3.select('.datamaps-style-block').empty() ) {
      d3.select('head').append('style').attr('class', 'datamaps-style-block')
      .html('.datamap path.datamaps-graticule { fill: none; stroke: #777; stroke-width: 0.5px; stroke-opacity: .5; pointer-events: none; } .datamap .labels {pointer-events: none;} .datamap path {stroke: #FFFFFF; stroke-width: 1px;} .datamaps-legend dt, .datamaps-legend dd { float: left; margin: 0 3px 0 0;} .datamaps-legend dd {width: 20px; margin-right: 6px; border-radius: 3px;} .datamaps-legend {padding-bottom: 20px; z-index: 1001; position: absolute; left: 4px; font-size: 12px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;} .datamaps-hoverover {display: none; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } .hoverinfo {padding: 4px; border-radius: 1px; background-color: #FFF; box-shadow: 1px 1px 5px #CCC; font-size: 12px; border: 1px solid #CCC; } .hoverinfo hr {border:1px dotted #CCC; }');
    }
  }

  function drawSubunits( data ) {
    var fillData = this.options.fills,
        colorCodeData = this.options.data || {},
        geoConfig = this.options.geographyConfig;


    var subunits = this.svg.select('g.datamaps-subunits');
    if ( subunits.empty() ) {
      subunits = this.addLayer('datamaps-subunits', null, true);
    }

    var geoData = topojson.feature( data, data.objects[ this.options.scope ] ).features;
    if ( geoConfig.hideAntarctica ) {
      geoData = geoData.filter(function(feature) {
        return feature.id !== "ATA";
      });
    }

    if ( geoConfig.hideHawaiiAndAlaska ) {
      geoData = geoData.filter(function(feature) {
        return feature.id !== "HI" && feature.id !== 'AK';
      });
    }

    var geo = subunits.selectAll('path.datamaps-subunit').data( geoData );

    geo.enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', function(d) {
        return 'datamaps-subunit ' + d.id;
      })
      .attr('data-info', function(d) {
        return JSON.stringify( colorCodeData[d.id]);
      })
      .style('fill', function(d) {
        //if fillKey - use that
        //otherwise check 'fill'
        //otherwise check 'defaultFill'
        var fillColor;

        var datum = colorCodeData[d.id];
        if ( datum && datum.fillKey ) {
          fillColor = fillData[ val(datum.fillKey, {data: colorCodeData[d.id], geography: d}) ];
        }

        if ( typeof fillColor === 'undefined' ) {
          fillColor = val(datum && datum.fillColor, fillData.defaultFill, {data: colorCodeData[d.id], geography: d});
        }

        return fillColor;
      })
      .style('stroke-width', geoConfig.borderWidth)
      .style('stroke', geoConfig.borderColor);
  }

  function handleGeographyConfig () {
    var hoverover;
    var svg = this.svg;
    var self = this;
    var options = this.options.geographyConfig;

    if ( options.highlightOnHover || options.popupOnHover ) {
      svg.selectAll('.datamaps-subunit')
        .on('mouseover', function(d) {
          var $this = d3.select(this);
          var datum = self.options.data[d.id] || {};
          if ( options.highlightOnHover ) {
            var previousAttributes = {
              'fill':  $this.style('fill'),
              'stroke': $this.style('stroke'),
              'stroke-width': $this.style('stroke-width'),
              'fill-opacity': $this.style('fill-opacity')
            };

            $this
              .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
              .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
              .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
              .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));

            //as per discussion on https://github.com/markmarkoh/datamaps/issues/19
            if ( ! /((MSIE)|(Trident))/.test(navigator.userAgent) ) {
             moveToFront.call(this);
            }
          }

          if ( options.popupOnHover ) {
            self.updatePopup($this, d, options, svg);
          }
        })
        .on('mouseout', function() {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }
          $this.on('mousemove', null);
          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        });
    }

    function moveToFront() {
      this.parentNode.appendChild(this);
    }
  }

  //plugin to add a simple map legend
  function addLegend(layer, data, options) {
    data = data || {};
    if ( !this.options.fills ) {
      return;
    }

    var html = '<dl>';
    var label = '';
    if ( data.legendTitle ) {
      html = '<h2>' + data.legendTitle + '</h2>' + html;
    }
    for ( var fillKey in this.options.fills ) {

      if ( fillKey === 'defaultFill') {
        if (! data.defaultFillName ) {
          continue;
        }
        label = data.defaultFillName;
      } else {
        if (data.labels && data.labels[fillKey]) {
          label = data.labels[fillKey];
        } else {
          label= fillKey + ': ';
        }
      }
      html += '<dt>' + label + '</dt>';
      html += '<dd style="background-color:' +  this.options.fills[fillKey] + '">&nbsp;</dd>';
    }
    html += '</dl>';

    var hoverover = d3.select( this.options.element ).append('div')
      .attr('class', 'datamaps-legend')
      .html(html);
  }

    function addGraticule ( layer, options ) {
      var graticule = d3.geo.graticule();
      this.svg.insert("path", '.datamaps-subunits')
        .datum(graticule)
        .attr("class", "datamaps-graticule")
        .attr("d", this.path);
  }

  function handleArcs (layer, data, options) {
    var self = this,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - arcs must be an array";
    }

    // For some reason arc options were put in an `options` object instead of the parent arc
    // I don't like this, so to match bubbles and other plugins I'm moving it
    // This is to keep backwards compatability
    for ( var i = 0; i < data.length; i++ ) {
      data[i] = defaults(data[i], data[i].options);
      delete data[i].options;
    }

    if ( typeof options === "undefined" ) {
      options = defaultOptions.arcConfig;
    }

    var arcs = layer.selectAll('path.datamaps-arc').data( data, JSON.stringify );

    var path = d3.geo.path()
        .projection(self.projection);

    arcs
      .enter()
        .append('svg:path')
        .attr('class', 'datamaps-arc')
        .style('stroke-linecap', 'round')
        .style('stroke', function(datum) {
          return val(datum.strokeColor, options.strokeColor, datum);
        })
        .style('fill', 'none')
        .style('stroke-width', function(datum) {
            return val(datum.strokeWidth, options.strokeWidth, datum);
        })
        .attr('d', function(datum) {
            var originXY = self.latLngToXY(val(datum.origin.latitude, datum), val(datum.origin.longitude, datum))
            var destXY = self.latLngToXY(val(datum.destination.latitude, datum), val(datum.destination.longitude, datum));
            var midXY = [ (originXY[0] + destXY[0]) / 2, (originXY[1] + destXY[1]) / 2];
            if (options.greatArc) {
                  // TODO: Move this to inside `if` clause when setting attr `d`
              var greatArc = d3.geo.greatArc()
                  .source(function(d) { return [val(d.origin.longitude, d), val(d.origin.latitude, d)]; })
                  .target(function(d) { return [val(d.destination.longitude, d), val(d.destination.latitude, d)]; });

              return path(greatArc(datum))
            }
            var sharpness = val(datum.arcSharpness, options.arcSharpness, datum);
            return "M" + originXY[0] + ',' + originXY[1] + "S" + (midXY[0] + (50 * sharpness)) + "," + (midXY[1] - (75 * sharpness)) + "," + destXY[0] + "," + destXY[1];
        })
        .transition()
          .delay(100)
          .style('fill', function(datum) {
            /*
              Thank you Jake Archibald, this is awesome.
              Source: http://jakearchibald.com/2013/animated-line-drawing-svg/
            */
            var length = this.getTotalLength();
            this.style.transition = this.style.WebkitTransition = 'none';
            this.style.strokeDasharray = length + ' ' + length;
            this.style.strokeDashoffset = length;
            this.getBoundingClientRect();
            this.style.transition = this.style.WebkitTransition = 'stroke-dashoffset ' + val(datum.animationSpeed, options.animationSpeed, datum) + 'ms ease-out';
            this.style.strokeDashoffset = '0';
            return 'none';
          })

    arcs.exit()
      .transition()
      .style('opacity', 0)
      .remove();
  }

  function handleLabels ( layer, options ) {
    var self = this;
    options = options || {};
    var labelStartCoodinates = this.projection([-67.707617, 42.722131]);
    this.svg.selectAll(".datamaps-subunit")
      .attr("data-foo", function(d) {
        var center = self.path.centroid(d);
        var xOffset = 7.5, yOffset = 5;

        if ( ["FL", "KY", "MI"].indexOf(d.id) > -1 ) xOffset = -2.5;
        if ( d.id === "NY" ) xOffset = -1;
        if ( d.id === "MI" ) yOffset = 18;
        if ( d.id === "LA" ) xOffset = 13;

        var x,y;

        x = center[0] - xOffset;
        y = center[1] + yOffset;

        var smallStateIndex = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"].indexOf(d.id);
        if ( smallStateIndex > -1) {
          var yStart = labelStartCoodinates[1];
          x = labelStartCoodinates[0];
          y = yStart + (smallStateIndex * (2+ (options.fontSize || 12)));
          layer.append("line")
            .attr("x1", x - 3)
            .attr("y1", y - 5)
            .attr("x2", center[0])
            .attr("y2", center[1])
            .style("stroke", options.labelColor || "#000")
            .style("stroke-width", options.lineWidth || 1)
        }

        layer.append("text")
          .attr("x", x)
          .attr("y", y)
          .style("font-size", (options.fontSize || 10) + 'px')
          .style("font-family", options.fontFamily || "Verdana")
          .style("fill", options.labelColor || "#000")
          .text( d.id );
        return "bar";
      });
  }


  function handleBubbles (layer, data, options ) {
    var self = this,
        fillData = this.options.fills,
        filterData = this.options.filters,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubbles = layer.selectAll('circle.datamaps-bubble').data( data, options.key );

    bubbles
      .enter()
        .append('svg:circle')
        .attr('class', 'datamaps-bubble')
        .attr('cx', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[0];
        })
        .attr('cy', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[1];
        })
        .attr('r', function(datum) {
          // if animation enabled start with radius 0, otherwise use full size.
          return options.animate ? 0 : val(datum.radius, options.radius, datum);
        })
        .attr('data-info', function(d) {
          return JSON.stringify(d);
        })
        .attr('filter', function (datum) {
          var filterKey = filterData[ val(datum.filterKey, options.filterKey, datum) ];

          if (filterKey) {
            return filterKey;
          }
        })
        .style('stroke', function ( datum ) {
          return val(datum.borderColor, options.borderColor, datum);
        })
        .style('stroke-width', function ( datum ) {
          return val(datum.borderWidth, options.borderWidth, datum);
        })
        .style('fill-opacity', function ( datum ) {
          return val(datum.fillOpacity, options.fillOpacity, datum);
        })
        .style('fill', function ( datum ) {
          var fillColor = fillData[ val(datum.fillKey, options.fillKey, datum) ];
          return fillColor || fillData.defaultFill;
        })
        .on('mouseover', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //save all previous attributes for mouseout
            var previousAttributes = {
              'fill':  $this.style('fill'),
              'stroke': $this.style('stroke'),
              'stroke-width': $this.style('stroke-width'),
              'fill-opacity': $this.style('fill-opacity')
            };

            $this
              .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
              .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
              .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
              .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
              .attr('data-previousAttributes', JSON.stringify(previousAttributes));
          }

          if (options.popupOnHover) {
            self.updatePopup($this, datum, options, svg);
          }
        })
        .on('mouseout', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }

          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })

    bubbles.transition()
      .duration(400)
      .attr('r', function ( datum ) {
        return val(datum.radius, options.radius, datum);
      });

    bubbles.exit()
      .transition()
        .delay(options.exitDelay)
        .attr("r", 0)
        .remove();

    function datumHasCoords (datum) {
      return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    }
  }

  //stolen from underscore.js
  function defaults(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  /**************************************
             Public Functions
  ***************************************/

  function Datamap( options ) {

    if ( typeof d3 === 'undefined' || typeof topojson === 'undefined' ) {
      throw new Error('Include d3.js (v3.0.3 or greater) and topojson on this page before creating a new map');
   }
    //set options for global use
    this.options = defaults(options, defaultOptions);
    this.options.geographyConfig = defaults(options.geographyConfig, defaultOptions.geographyConfig);
    this.options.projectionConfig = defaults(options.projectionConfig, defaultOptions.projectionConfig);
    this.options.bubblesConfig = defaults(options.bubblesConfig, defaultOptions.bubblesConfig);
    this.options.arcConfig = defaults(options.arcConfig, defaultOptions.arcConfig);

    //add the SVG container
    if ( d3.select( this.options.element ).select('svg').length > 0 ) {
      addContainer.call(this, this.options.element, this.options.height, this.options.width );
    }

    /* Add core plugins to this instance */
    this.addPlugin('bubbles', handleBubbles);
    this.addPlugin('legend', addLegend);
    this.addPlugin('arc', handleArcs);
    this.addPlugin('labels', handleLabels);
    this.addPlugin('graticule', addGraticule);

    //append style block with basic hoverover styles
    if ( ! this.options.disableDefaultStyles ) {
      addStyleBlock();
    }

    return this.draw();
  }

  // resize map
  Datamap.prototype.resize = function () {

    var self = this;
    var options = self.options;

    if (options.responsive) {
      var newsize = options.element.clientWidth,
          oldsize = d3.select( options.element).select('svg').attr('data-width');

      d3.select(options.element).select('svg').selectAll('g').attr('transform', 'scale(' + (newsize / oldsize) + ')');
    }
  }

  // actually draw the features(states & countries)
  Datamap.prototype.draw = function() {
    //save off in a closure
    var self = this;
    var options = self.options;

    //set projections and paths based on scope
    var pathAndProjection = options.setProjection.apply(self, [options.element, options] );

    this.path = pathAndProjection.path;
    this.projection = pathAndProjection.projection;

    //if custom URL for topojson data, retrieve it and render
    if ( options.geographyConfig.dataUrl ) {
      d3.json( options.geographyConfig.dataUrl, function(error, results) {
        if ( error ) throw new Error(error);
        self.customTopo = results;
        draw( results );
      });
    }
    else {
      draw( this[options.scope + 'Topo'] || options.geographyConfig.dataJson);
    }

    return this;

      function draw (data) {
        // if fetching remote data, draw the map first then call `updateChoropleth`
        if ( self.options.dataUrl ) {
          //allow for csv or json data types
          d3[self.options.dataType](self.options.dataUrl, function(data) {
            //in the case of csv, transform data to object
            if ( self.options.dataType === 'csv' && (data && data.slice) ) {
              var tmpData = {};
              for(var i = 0; i < data.length; i++) {
                tmpData[data[i].id] = data[i];
              }
              data = tmpData;
            }
            Datamaps.prototype.updateChoropleth.call(self, data);
          });
        }
        drawSubunits.call(self, data);
        handleGeographyConfig.call(self);

        if ( self.options.geographyConfig.popupOnHover || self.options.bubblesConfig.popupOnHover) {
          hoverover = d3.select( self.options.element ).append('div')
            .attr('class', 'datamaps-hoverover')
            .style('z-index', 10001)
            .style('position', 'absolute');
        }

        //fire off finished callback
        self.options.done(self);
      }
  };
  /**************************************
                TopoJSON
  ***************************************/
  Datamap.prototype.worldTopo = '__WORLD__';
  Datamap.prototype.abwTopo = '__ABW__';
  Datamap.prototype.afgTopo = '__AFG__';
  Datamap.prototype.agoTopo = '__AGO__';
  Datamap.prototype.aiaTopo = '__AIA__';
  Datamap.prototype.albTopo = '__ALB__';
  Datamap.prototype.aldTopo = '__ALD__';
  Datamap.prototype.andTopo = '__AND__';
  Datamap.prototype.areTopo = '__ARE__';
  Datamap.prototype.argTopo = '__ARG__';
  Datamap.prototype.armTopo = '__ARM__';
  Datamap.prototype.asmTopo = '__ASM__';
  Datamap.prototype.ataTopo = '__ATA__';
  Datamap.prototype.atcTopo = '__ATC__';
  Datamap.prototype.atfTopo = '__ATF__';
  Datamap.prototype.atgTopo = '__ATG__';
  Datamap.prototype.ausTopo = '__AUS__';
  Datamap.prototype.autTopo = '__AUT__';
  Datamap.prototype.azeTopo = '__AZE__';
  Datamap.prototype.bdiTopo = '__BDI__';
  Datamap.prototype.belTopo = '__BEL__';
  Datamap.prototype.benTopo = '__BEN__';
  Datamap.prototype.bfaTopo = '__BFA__';
  Datamap.prototype.bgdTopo = '__BGD__';
  Datamap.prototype.bgrTopo = '__BGR__';
  Datamap.prototype.bhrTopo = '__BHR__';
  Datamap.prototype.bhsTopo = '__BHS__';
  Datamap.prototype.bihTopo = '__BIH__';
  Datamap.prototype.bjnTopo = '__BJN__';
  Datamap.prototype.blmTopo = '__BLM__';
  Datamap.prototype.blrTopo = '__BLR__';
  Datamap.prototype.blzTopo = '__BLZ__';
  Datamap.prototype.bmuTopo = '__BMU__';
  Datamap.prototype.bolTopo = '__BOL__';
  Datamap.prototype.braTopo = '__BRA__';
  Datamap.prototype.brbTopo = '__BRB__';
  Datamap.prototype.brnTopo = '__BRN__';
  Datamap.prototype.btnTopo = '__BTN__';
  Datamap.prototype.norTopo = '__NOR__';
  Datamap.prototype.bwaTopo = '__BWA__';
  Datamap.prototype.cafTopo = '__CAF__';
  Datamap.prototype.canTopo = '__CAN__';
  Datamap.prototype.cheTopo = '__CHE__';
  Datamap.prototype.chlTopo = '__CHL__';
  Datamap.prototype.chnTopo = '__CHN__';
  Datamap.prototype.civTopo = '__CIV__';
  Datamap.prototype.clpTopo = '__CLP__';
  Datamap.prototype.cmrTopo = '__CMR__';
  Datamap.prototype.codTopo = '__COD__';
  Datamap.prototype.cogTopo = '__COG__';
  Datamap.prototype.cokTopo = '__COK__';
  Datamap.prototype.colTopo = '__COL__';
  Datamap.prototype.comTopo = '__COM__';
  Datamap.prototype.cpvTopo = '__CPV__';
  Datamap.prototype.criTopo = '__CRI__';
  Datamap.prototype.csiTopo = '__CSI__';
  Datamap.prototype.cubTopo = '__CUB__';
  Datamap.prototype.cuwTopo = '__CUW__';
  Datamap.prototype.cymTopo = '__CYM__';
  Datamap.prototype.cynTopo = '__CYN__';
  Datamap.prototype.cypTopo = '__CYP__';
  Datamap.prototype.czeTopo = '__CZE__';
  Datamap.prototype.deuTopo = {"type":"Topology","objects":{"deu":{"type":"GeometryCollection","geometries":[{"type":"Polygon","properties":{"name":"Nordrhein-Westfalen"},"id":"DE.NW","arcs":[[0,1,2,3]]},{"type":"Polygon","properties":{"name":"Baden-Württemberg"},"id":"DE.BW","arcs":[[4,5,6,7]]},{"type":"Polygon","properties":{"name":"Hessen"},"id":"DE.HE","arcs":[[8,9,-7,10,-1,11]]},{"type":"MultiPolygon","properties":{"name":"Bremen"},"id":"DE.HB","arcs":[[[12]],[[13,14]]]},{"type":"MultiPolygon","properties":{"name":"Niedersachsen"},"id":"DE.NI","arcs":[[[15]],[[16]],[[17]],[[18]],[[19]],[[20]],[[21]],[[22]],[[23]],[[24,25,26,27,28,29,-12,-4,30,-15,31],[-13]]]},{"type":"Polygon","properties":{"name":"Thüringen"},"id":"DE.TH","arcs":[[32,33,-9,-30,34]]},{"type":"Polygon","properties":{"name":"Hamburg"},"id":"DE.HH","arcs":[[-25,35,36]]},{"type":"MultiPolygon","properties":{"name":"Schleswig-Holstein"},"id":"DE.SH","arcs":[[[37]],[[38]],[[39]],[[40]],[[41]],[[42]],[[43]],[[44]],[[45,-26,-37,46]],[[47]]]},{"type":"Polygon","properties":{"name":"Rheinland-Pfalz"},"id":"DE.RP","arcs":[[-11,-6,48,49,50,-2]]},{"type":"Polygon","properties":{"name":"Saarland"},"id":"DE.SL","arcs":[[51,-50]]},{"type":"Polygon","properties":{"name":"Bayern"},"id":"DE.BY","arcs":[[52,53,-8,-10,-34]]},{"type":"Polygon","properties":{"name":"Berlin"},"id":"DE.BE","arcs":[[54]]},{"type":"Polygon","properties":{"name":"Sachsen-Anhalt"},"id":"DE.ST","arcs":[[55,-35,-29,56]]},{"type":"Polygon","properties":{"name":"Sachsen"},"id":"DE.SN","arcs":[[57,58,-53,-33,-56]]},{"type":"Polygon","properties":{"name":"Brandenburg"},"id":"DE.","arcs":[[59,-58,-57,-28,60],[-55]]},{"type":"MultiPolygon","properties":{"name":"Mecklenburg-Vorpommern"},"id":"DE.MV","arcs":[[[61]],[[62]],[[63]],[[-61,-27,-46,64]],[[65]],[[66]]]}]}},"arcs":[[[3912,5616],[-17,-22],[-7,-6],[-79,-19],[-9,-4],[-5,-3],[1,-2],[4,-3],[2,-1],[14,-7],[2,-1],[1,-2],[0,-2],[0,-2],[0,-2],[-5,-8],[-2,-4],[-2,-5],[-3,-7],[0,-2],[-1,-2],[-3,-8],[-4,-10],[-5,-5],[-6,-5],[-11,-8],[-6,-5],[-4,-6],[-5,-10],[-3,-4],[-4,-3],[-14,-6],[-14,-10],[-8,-4],[-12,-3],[-21,-10],[-5,-3],[-4,-4],[-3,-4],[-2,-4],[-1,-5],[0,-2],[0,-3],[0,-4],[0,-1],[-1,-3],[-1,-4],[-3,-6],[-2,-2],[-3,-1],[-12,2],[-6,-2],[-39,-22],[-4,-1],[-9,0],[-40,6],[-21,13],[-5,5],[-1,2],[0,2],[1,13],[1,1],[1,3],[-3,12],[-6,7],[-4,4],[-4,1],[-5,-1],[-3,0],[-16,6],[-21,12],[-10,3],[-6,2],[-17,-7],[-45,-8],[-57,-21],[-4,-4],[-2,-2],[-1,-4],[-2,-5],[0,-4],[1,-2],[1,-2],[10,-10],[1,-2],[3,-5],[2,-5],[2,-12],[0,-3],[0,-12],[0,-3],[1,-2],[1,-1],[2,-1],[23,-2],[3,-1],[3,-2],[3,-4],[0,-5],[-2,-5],[-5,-11],[-5,-4],[-3,-2],[-46,-2],[-11,-3],[-28,-16],[-2,0],[-3,-1],[-3,0],[-23,6],[-5,2],[-5,1],[-6,0],[-6,0],[-14,-1],[-26,-7],[-22,-2],[-19,1],[-8,-2],[-25,-8],[-21,-4],[-4,-2],[-2,-2],[0,-2],[-7,-9],[-12,-5],[-9,-5],[-1,-2],[0,-2],[-1,-1],[-1,-4],[-3,-3],[-36,-27],[-24,-23],[-6,-7],[-11,-18],[-2,-5],[-1,-3],[1,-1],[1,-2],[1,-2],[2,-1],[5,-4],[7,-3],[4,-3],[1,-2],[1,-1],[1,-5],[1,-5],[1,-1],[1,-2],[2,-2],[2,-1],[5,-2],[10,-1],[5,0],[3,1],[3,1],[3,3],[5,8],[1,1],[2,1],[3,1],[5,2],[22,1],[22,5],[24,13],[6,2],[4,1],[3,-1],[2,-1],[2,-2],[1,-1],[0,-2],[0,-2],[-4,-9],[0,-2],[0,-1],[2,-1],[8,-3],[2,-2],[1,-1],[5,-16],[1,-4],[1,-3],[6,-22],[1,-5],[4,-16],[1,-1],[0,-2],[2,-7],[1,-3],[0,-5],[0,-8],[-1,-4],[-1,-3],[-35,-29],[-22,-22],[-3,-3],[0,-2],[0,-1],[1,-2],[1,-2],[9,-11],[2,-4],[0,-6],[-1,-3],[-2,-2],[-28,-11],[-14,-9],[-3,-1],[-3,0],[-2,0],[-34,7],[-112,-1],[-5,-10],[4,-6],[5,-5],[7,-12],[3,-5],[1,-4],[-3,-5],[-1,-8],[2,-8],[6,-17],[2,-8],[1,-5],[-7,-9],[-12,-10],[-2,-2],[-3,-6],[-4,-8],[-5,-7],[-3,-6],[-1,-2],[-2,-2],[-2,-1],[-3,0],[-8,-2],[-7,-6],[-14,-23],[-9,-14],[-1,-3],[0,-7],[-1,-20],[-2,-5],[-3,-3],[-2,0],[-13,2],[-6,0],[-18,-9],[-29,-21],[-4,-5],[0,-6],[1,-6],[-2,-3],[-2,-3],[-22,-13],[-6,-2],[-5,-2],[-14,0],[-16,-2],[-18,2],[-6,4],[-9,16],[-4,3],[-4,2],[-13,-1],[-4,-1],[-3,-2],[-14,-12],[-47,-32],[-2,-2],[-5,-6],[-2,-2],[-21,-11],[-2,-2],[-1,-2],[-8,-16],[-52,-34],[-6,-5],[-1,-2],[0,-2],[0,-2],[0,-1],[2,-2],[2,-1],[2,-1],[2,-1],[2,-2],[0,-1],[-1,-4],[1,-2],[1,-1],[2,-2],[24,-14],[5,-4],[2,-2],[1,-2],[1,-2],[0,-2],[-6,-34],[-3,-10],[-3,-3],[-3,-2],[-12,-2],[-4,-3],[-3,-3],[-11,-18]],[[2488,4378],[-30,14],[-12,3],[-7,0],[-27,-10],[-6,0],[-3,2],[-2,10],[-2,7],[-2,4],[-18,24],[-47,45],[-11,16],[0,6],[0,9],[3,12],[0,11],[-2,10],[-6,21],[-3,8],[-4,5],[-2,0],[-4,0],[-3,-1],[-14,-5],[-2,-1],[-5,0],[-9,4],[-11,8],[-33,27],[-9,6],[-29,7],[-10,5],[-4,3],[-2,4],[1,4],[2,7],[2,6],[3,5],[5,12],[4,18],[-64,13],[-14,-3],[-34,-24],[-2,-6],[-1,-9],[4,-31],[1,-6],[2,-5],[2,-3],[4,-2],[2,-5],[2,-5],[1,-14],[-1,-6],[-3,-4],[-2,0],[-2,0],[-25,7],[-3,-1],[-4,-2],[-17,-15],[-6,-5],[-41,-18],[20,-15],[5,-8],[1,-6],[0,-4],[-1,-3],[-1,-4],[-2,-2],[-2,-2],[-2,-1],[-3,0],[-3,0],[-2,1],[-2,1],[-2,3],[-1,1],[-3,-1],[-4,-2],[-9,-13],[-4,-3],[-3,-2],[-35,-10],[-10,-4],[-5,-4],[-3,-4],[-5,-10],[-3,-4],[-4,-2],[-20,3],[-4,0],[-6,-1],[-9,-3],[-34,-15],[-91,-19],[-41,2],[-27,-5],[-7,-7],[1,-2],[2,-2],[1,-2],[1,-3],[-2,-10],[0,-4],[1,-5],[0,-5],[-1,-6],[-7,-8],[-2,-6],[-2,-5],[1,-8],[-1,-3],[-2,-3],[-29,-16],[-4,-1],[-51,-12],[-13,-1],[-61,3],[-2,1],[-2,3],[-1,4],[-1,3],[-2,2],[-1,1],[-2,2],[-8,3],[-7,2],[-4,0],[-2,-2],[-2,-3],[-1,-4],[-9,-15],[-8,-2],[-26,-21],[-12,-3],[-24,7],[-4,0],[-3,-2],[-2,-6],[-4,-5],[-5,-6],[-7,-3],[-6,-1],[-3,0],[-18,7],[-13,1],[-11,-3],[-58,-30],[-30,-9],[-19,-2],[-10,-2],[-6,-2],[-2,-3],[-1,-2],[-2,-3],[-7,-10],[-16,-15],[-26,-6],[-2,-1],[-3,-3],[1,-6],[2,-5],[2,-9],[1,-12],[-3,-26],[-8,-11],[-8,-7],[-10,-2],[-5,0],[-7,1],[-7,2],[-7,3],[-4,3],[-3,2],[-6,7],[-7,10],[-1,4],[-7,1],[-41,-12],[-18,-8],[-1,-2],[1,-3],[1,-3],[1,-6],[-1,-7],[-6,-12],[-3,-6],[-1,-5],[2,-2],[3,-2],[15,-5],[3,-2],[3,-2],[2,-3],[1,-4],[-1,-14],[2,-12],[2,-10],[2,-5],[3,-5],[10,-11],[3,-5],[2,-4],[2,-8],[-2,-5],[-2,-4],[-3,-1],[-27,-4],[-57,-14],[-18,3],[-14,13],[-8,5],[-11,6],[-9,-1],[-7,-3],[-8,-6],[-15,-6],[-11,0],[-7,1],[-1,3],[1,3],[4,5],[2,4],[-2,5],[-7,4],[-19,7],[-9,2],[-6,1],[-7,-3],[-7,-2],[-44,-5],[-4,-1],[-3,-2],[-49,-27],[-18,-6],[-7,-1],[-4,2],[-4,14],[-3,4],[-3,4],[-18,7],[-7,4],[-3,3],[-1,4],[-2,2],[-3,4],[-8,5],[-5,2],[-5,-1],[-2,-1],[-3,-3],[-2,-3],[0,-3],[1,-4],[35,-42],[2,-3],[1,-2],[0,-2],[-1,-2],[-6,-3],[-24,-9],[-27,0]],[[568,3915],[-1,8],[-38,50],[-1,15],[7,17],[8,31],[1,21],[-4,4],[-8,2],[-10,11],[-5,13],[-4,12],[3,10],[12,9],[-20,1],[-47,8],[-16,6],[-3,2],[-2,0],[-3,0],[-3,-2],[-36,-9],[-11,1],[-9,5],[-9,15],[-9,6],[9,11],[-13,0],[-9,3],[-1,6],[8,10],[-18,17],[20,24],[35,21],[24,11],[0,5],[12,11],[8,11],[-3,8],[-75,1],[-22,9],[-13,19],[15,7],[-67,75],[-21,16],[-18,1],[-43,-8],[-15,1],[-4,11],[4,13],[0,12],[-18,7],[-2,3],[0,2],[1,2],[1,3],[3,17],[-7,7],[-11,6],[-9,11],[-4,16],[16,-3],[16,11],[6,15],[-3,12],[-1,11],[10,13],[15,6],[25,-1],[12,11],[6,13],[1,10],[-10,26],[2,9],[6,7],[2,5],[-35,9],[-26,12],[-8,7],[-3,10],[-2,19],[4,10],[7,11],[-2,7],[-39,-4],[-29,8],[-15,1],[-15,-3],[-28,-10],[-15,-3],[-1,33],[-17,37],[-6,30],[31,11],[15,-6],[13,-12],[14,-10],[20,1],[14,11],[21,33],[14,13],[101,58],[62,25],[16,16],[-22,16],[24,15],[9,4],[-25,6],[-54,-28],[-26,11],[-8,24],[4,28],[9,26],[11,14],[23,21],[56,76],[11,8],[28,14],[11,12],[6,16],[3,28],[6,11],[-16,15],[1,23],[9,27],[4,26],[-6,23],[-7,42],[-44,37],[-73,74],[-5,15],[6,19],[13,28],[-74,24],[-25,24],[15,36],[-11,8],[-24,14],[-13,4],[-32,-1],[-10,4],[1,13],[6,5],[18,13],[2,26],[-15,25],[-25,14],[4,11],[18,9],[45,6],[21,7],[22,12],[16,6],[44,9],[36,-7],[26,-5],[17,-3],[-15,17],[-40,31],[-14,7],[37,15],[36,-12],[35,-21],[36,-11],[34,6],[9,-1],[8,-6],[12,-15],[5,-5],[42,-4],[18,-8],[3,-20],[41,8],[4,13],[-8,29],[69,-15],[23,0],[18,6],[53,30],[109,27],[96,2],[30,12],[25,22],[25,33],[9,7],[8,1],[6,4],[1,16],[-3,8],[-5,7],[-29,21],[-71,29],[-24,5],[-17,9],[-2,20],[7,13],[10,4],[12,0],[13,5],[8,8],[9,16],[6,8],[19,14],[17,7],[6,0],[65,5],[13,10],[25,35],[21,16],[46,15],[22,14],[26,30],[12,10],[48,21],[3,7],[-3,4]],[[1280,6373],[29,-1],[45,14],[16,8],[8,6],[6,4],[150,4],[45,7],[52,26],[16,11],[6,3],[5,1],[28,5],[11,4],[8,4],[56,42],[50,30],[6,3],[16,2],[7,0],[20,-3],[3,0],[1,1],[4,4],[6,6],[2,3],[2,1],[1,0],[6,9],[6,19],[4,7],[5,5],[8,1],[0,3],[-2,3],[-7,7],[-8,3],[-4,7],[-1,4],[13,41],[5,6],[3,2],[5,2],[3,0],[78,-18],[6,-3],[3,-2],[4,-6],[3,-7],[9,-44],[3,-4],[4,-4],[27,-7],[74,-33],[3,-3],[12,-11],[7,-2],[8,-1],[71,20],[5,0],[7,-1],[6,-8],[10,-8],[9,-7],[15,-16],[20,-26],[11,-12],[2,-4],[1,-3],[-4,-3],[-4,-1],[-33,-3],[-4,-2],[-3,-3],[0,-4],[2,-7],[1,-4],[3,-3],[6,-7],[6,-8],[0,-4],[-2,-3],[-7,-7],[-19,-15],[-5,-5],[0,-2],[1,-3],[2,-5],[6,-8],[2,-4],[-1,-4],[-2,-5],[-6,-8],[-15,-11],[-3,-5],[-1,-4],[4,-5],[4,-3],[8,-2],[10,0],[10,-2],[1,0],[3,-6],[2,-8],[4,-4],[6,-2],[13,1],[20,2],[13,0],[20,-5],[6,-3],[4,-2],[0,-5],[-4,-8],[-11,-17],[-7,-16],[-1,-6],[-2,-7],[-5,-6],[-12,-2],[-14,-1],[-21,-3],[-27,-9],[-19,-11],[-13,-10],[-1,-7],[9,-15],[4,-8],[9,-21],[3,-1],[5,-2],[31,-8],[19,-8],[5,-3],[4,0],[6,2],[48,33],[16,6],[40,5],[39,-10],[77,21],[20,8],[13,10],[7,8],[19,17],[35,22],[138,-29],[8,2],[5,2],[3,2],[2,4],[9,19],[4,5],[4,4],[44,21],[11,6],[5,5],[6,6],[6,8],[6,9],[1,4],[-1,3],[-11,8],[-24,11],[-1,1],[-4,13],[-2,45],[2,47],[0,23],[-5,22],[-7,21],[-9,20],[-7,10],[-8,7],[-31,17],[-71,24],[-8,8],[-6,7],[-22,52],[25,-6],[25,0],[4,-1],[9,-3],[9,-2],[62,6],[19,6],[7,5],[5,4],[2,5],[8,31],[1,3],[2,2],[2,2],[7,4],[9,4],[12,7],[5,4],[23,2],[53,-1],[18,3],[54,19],[5,0],[7,0],[18,-6],[9,-6],[9,-5],[30,-39],[3,-12],[1,-8],[-1,-5],[-2,-12],[0,-6],[0,-6],[2,-4],[3,-6],[2,-3],[-1,-4],[-3,-15],[-1,-7],[0,-6],[1,-5],[1,-3],[3,-3],[2,-2],[12,-2],[112,-9],[36,3],[31,9],[7,3],[73,11],[3,2],[3,4],[3,4],[16,36],[11,18],[5,5],[29,22],[61,23],[5,1],[5,-1],[7,-3],[15,-16],[2,-2],[4,-2],[4,-2],[4,-1],[9,-1],[2,-2],[1,-4],[-5,-9],[-4,-6],[-6,-3],[-4,-2],[-6,-4],[-3,-2],[1,-7],[1,-5],[19,-43],[-36,-42],[-19,-30],[-4,-5],[-12,-3],[-6,-3],[-9,-6],[-9,0],[-25,2],[-6,0],[-5,-2],[-4,-4],[-4,-4],[-6,-14],[-2,-8],[-5,-35],[-2,-12],[-2,-7],[-3,-5],[0,-3],[1,-4],[4,-5],[3,-3],[3,-2],[20,-3],[36,-13],[25,-4],[4,-1],[2,-2],[-2,-3],[-24,-11],[-7,-5],[-4,-7],[1,-3],[2,-4],[2,-4],[3,-7],[2,-11],[-2,-2],[-4,-2],[-25,2],[-34,-8],[7,-13],[11,-17],[2,-5],[1,-6],[1,-5],[-1,-4],[-1,-3],[-3,-3],[-2,-3],[-5,-7],[-1,-3],[3,-2],[5,1],[13,3],[17,1],[14,0],[22,2],[78,-8],[8,-4],[4,-4],[-2,-6],[-3,-7],[-2,-4],[0,-3],[1,-3],[9,-7],[30,-10],[13,-12],[1,-8],[0,-5],[-1,-4],[-12,-15],[-1,-2],[0,-3],[1,-4],[9,-21],[13,-23],[1,-3],[-1,-5],[-1,-2],[-1,-3],[-3,-3],[-3,-3],[-6,-4],[-7,-3],[-1,-1],[-1,-2],[0,-1],[0,-2],[0,-3],[-1,-2],[-1,-2],[-3,-2],[-1,-1],[4,-4],[10,-5],[28,-10],[10,-2],[5,2],[0,3],[0,1],[1,2],[2,3],[2,2],[2,1],[4,2],[5,1],[6,1],[4,0],[42,-14],[1,-3],[-1,-7],[-12,-36],[-2,-2],[-4,-5],[-5,-4],[-8,-6],[-2,-2],[2,-1],[6,-1],[28,4],[15,-1],[26,-9],[5,-6],[3,-4],[1,-3],[2,-7],[2,-9],[-2,-14],[-16,-34],[11,-2],[12,2],[19,6],[6,1],[49,-2],[24,3],[12,3],[7,3],[6,1],[3,-1],[3,-2],[-3,-8],[-2,-4],[-6,-7],[-10,-10],[-2,-3],[1,-3],[4,-4],[5,0],[9,-3],[4,-1],[1,-2],[0,-2],[-8,-6],[-2,-4],[-1,-6],[1,-14],[-1,-10],[-6,-16],[-11,-19],[-3,-4],[-6,-6],[-6,-4],[-14,-6],[-3,-2],[-2,-1],[-1,-3],[-1,-6],[-2,-4],[-2,-3],[-4,-3],[-2,-1],[-2,-2],[-1,-2],[-2,-6],[0,-7],[1,-8],[3,-16],[0,-6],[0,-3],[-4,-4],[-2,-2],[-1,-5],[1,-6],[3,-9],[-2,-4],[-2,-3],[-8,-4],[-3,-2],[-2,-3],[-2,-5],[-1,-6],[0,-7],[1,-5],[2,-4],[1,-3],[3,-2],[17,0],[50,11]],[[4036,336],[-4,1],[-3,1],[-299,148],[-42,8],[-41,0],[-15,18],[-60,0],[-122,11],[-20,-6],[-18,-15],[-39,-10],[-43,-4],[-27,6],[-31,19],[-1,0],[-16,13],[0,9],[20,3],[-28,21],[-36,17],[-29,1],[-10,-25],[9,-8],[-57,-1],[-2,9],[-3,9],[-9,9],[-4,10],[3,9],[15,17],[3,5],[-8,13],[-10,2],[-12,-2],[-12,2],[-8,10],[-8,15],[-11,12],[-14,4],[-10,-8],[-5,-28],[-14,-7],[-11,6],[-3,16],[-1,16],[-2,10],[-20,7],[-28,1],[-17,-8],[10,-20],[-16,-7],[-59,-9],[-12,0],[-9,-4],[-14,-17],[-5,-9],[-9,-26],[-11,-9],[-28,-12],[-11,-9],[-1,-10],[5,-9],[2,-11],[-7,-14],[18,-5],[5,-1],[28,-17],[22,-10],[20,1],[16,6],[15,9],[16,6],[53,8],[16,-2],[12,-4],[5,-2],[10,-1],[-6,-30],[-7,3],[-1,7],[-1,3],[-5,-1],[-5,-1],[-4,-3],[-3,-7],[2,-6],[3,-5],[0,-4],[-1,-9],[0,-9],[-1,-10],[-5,-6],[-2,-4],[-15,-4],[-10,10],[-2,2],[-13,17],[-17,13],[-32,-3],[-34,-17],[-12,-22],[-2,-6],[-30,-4],[-3,-1],[-70,1],[-41,8],[-11,6],[-8,12],[-6,13],[-6,5],[-12,1],[-28,7],[-20,0],[-59,-8],[-6,-3],[-5,-6],[-8,-6],[-19,-5],[-24,-10],[-9,-6],[-9,-8],[-5,-7],[-5,-5],[-10,-6],[-49,-9],[-142,0],[-3,6],[-2,12],[-4,12],[-6,5],[-71,4],[-15,6],[-20,-25],[-17,-16],[-21,-10],[-43,-7],[-47,-8],[-24,3],[-16,7],[-41,17],[3,0],[26,-1],[11,9],[15,33],[-25,-3],[-56,-13],[5,13],[2,5],[-2,12],[-6,7],[-7,5],[-6,6],[-25,39],[-15,17],[-16,6],[-4,6],[-3,14],[-4,28],[4,7],[18,16],[7,8],[0,21],[-13,45],[3,18],[15,41],[6,6],[15,7],[3,14],[-6,24],[0,6],[-1,3],[0,3],[1,6],[3,5],[7,6],[5,6],[7,13],[2,6],[-2,20],[6,18],[29,24],[11,15],[-3,40],[-47,66],[-3,53],[7,25],[3,9],[4,10],[8,12],[7,8],[6,10],[2,18],[7,16],[69,76],[12,19],[7,21],[2,26],[7,27],[18,12],[20,8],[15,19],[1,18],[-5,17],[-7,16],[-4,16],[1,17],[8,34],[6,14],[7,12],[8,9],[5,12],[2,25],[6,11],[13,11],[27,16],[0,9],[-12,28],[0,44],[9,42],[46,56],[13,7],[18,5],[16,11],[30,28],[13,6],[15,11],[11,12],[5,11],[1,24],[6,12],[13,3],[30,0],[9,2],[6,5],[2,7],[3,12],[5,7],[5,3],[2,4],[10,0],[40,17],[6,4],[14,18],[49,105],[34,50],[23,20]],[[2560,2164],[33,10],[35,29],[23,28],[80,127],[5,13],[21,123],[7,22],[12,9],[14,6],[75,68],[4,16],[-26,7],[2,11],[40,68],[-1,13],[-7,21],[-1,10],[2,3],[11,21],[3,2],[-12,15],[-17,5],[-20,1],[-19,6],[0,9],[23,9],[0,8],[-14,24],[-25,55],[-21,27],[9,31]],[[2796,2961],[36,12],[9,0],[5,0],[13,-4],[26,-15],[74,-60],[24,6],[4,3],[4,2],[1,1],[14,4],[4,2],[2,2],[2,3],[1,3],[0,3],[-1,4],[-2,10],[-10,29],[-1,3],[-7,26],[0,4],[1,1],[3,2],[76,15],[5,0],[2,-2],[1,-9],[2,-3],[12,-12],[2,-7],[-1,-4],[-1,-3],[-3,-3],[-2,-4],[0,-1],[0,-2],[5,-13],[13,-26],[3,-3],[3,-4],[2,-3],[8,-5],[30,-15],[21,-8],[18,-2],[23,2],[5,0],[4,-2],[5,-6],[5,-11],[2,-3],[2,-2],[5,-3],[15,-1],[53,5],[3,-6],[0,-1],[0,-2],[0,-3],[-1,-4],[-2,-5],[-3,-5],[-3,-5],[-9,-8],[-3,-1],[-4,0],[-6,3],[-4,3],[-7,7],[-3,0],[-4,-2],[-16,-16],[-3,-3],[-2,-4],[-1,-4],[0,-5],[1,-6],[4,-20],[0,-3],[-1,-4],[-2,-3],[-2,-1],[-12,-5],[-2,-1],[-2,-2],[-1,-1],[-2,-7],[-1,-10],[1,-3],[2,-3],[2,-2],[2,-1],[16,-4],[8,0],[9,-4],[6,2],[10,5],[19,17],[14,13],[2,3],[1,4],[4,15],[1,4],[3,2],[3,1],[3,-3],[2,-7],[2,-2],[4,-1],[6,2],[22,11],[4,6],[2,4],[-3,9],[-2,4],[-2,4],[-5,6],[-7,7],[-1,2],[0,2],[3,3],[25,21],[0,2],[1,1],[4,1],[59,1],[8,-1],[3,-1],[14,-2],[6,2],[5,1],[26,19],[9,1],[11,-2],[13,2],[3,-1],[2,0],[2,-2],[8,-8],[3,-3],[3,-1],[3,0],[4,0],[3,1],[0,4],[-2,6],[-10,15],[-11,12],[-2,3],[-5,9],[-5,6],[-18,15],[-4,5],[-1,4],[1,3],[6,2],[14,-11],[6,0],[3,0],[10,13]],[[3553,2956],[8,-5],[4,-1],[62,11],[16,-3],[66,1],[6,2],[5,3],[5,7],[2,4],[4,11],[2,3],[3,3],[10,7],[2,2],[0,2],[-1,3],[-3,16],[3,4],[6,4],[15,7],[8,3],[9,1],[16,-1],[11,2],[31,10],[3,0],[3,-1],[14,-11],[5,-1],[5,0],[20,14],[-4,9],[-3,5],[0,1],[-1,1],[1,6],[12,51],[-1,2],[-2,2],[-3,2],[-21,8],[-3,0],[-3,-1],[-2,-1],[-2,-1],[-2,-2],[-1,-2],[-3,-10],[-2,-4],[-3,-3],[-4,-2],[-4,-1],[-3,0],[-5,1],[-2,3],[1,5],[3,9],[1,5],[-1,5],[-4,2],[-6,3],[-37,4],[-9,2],[-4,3],[-2,2],[0,4],[0,5],[5,7],[1,4],[1,3],[0,1],[-1,2],[-7,17],[6,7],[11,9],[13,7],[13,3],[53,-3],[40,11],[38,5],[21,-1],[58,-21],[14,-1],[13,3],[6,3],[30,-15],[11,2],[19,5],[9,5],[5,3],[4,1],[3,0],[4,-3],[2,-5],[0,-3],[-2,-3],[-3,-4],[-2,-2],[-1,-2],[0,-2],[1,-7],[2,-7],[1,-3],[0,-2],[-1,-1],[-2,-3],[-1,-3],[-2,-2],[-1,-4],[1,-4],[2,-8],[0,-2],[-2,-2],[-5,-2],[-2,-2],[-1,-2],[2,-7],[0,-3],[-1,-2],[-8,-13],[-1,-3],[0,-2],[0,-2],[1,-1],[5,-4],[8,-4],[10,-3],[15,-1],[7,1],[5,3],[1,2],[1,4],[1,8],[1,5],[1,2],[3,2],[12,4],[3,3],[4,8],[2,1],[1,0],[3,0],[2,-2],[1,-5],[1,-7],[0,-5],[1,-3],[11,-18],[2,-2],[4,-1],[4,2],[3,2],[7,8],[21,16],[1,1],[3,3],[5,2],[18,6],[8,4],[3,-1],[2,-2],[7,-9],[31,-28],[2,-3],[0,-3],[0,-5],[-1,-26],[2,-11],[0,-3],[1,-2],[6,-5],[37,-32],[6,-6],[2,-3],[0,-3],[0,-2],[0,-2],[-1,-3],[-1,-2],[-2,-3],[-8,-7],[-10,-11],[-2,-3],[-1,-5],[0,-4],[2,-7],[0,-2],[-1,-4],[-2,-3],[-2,-3],[-16,-12],[-3,-4],[0,-4],[3,-3],[8,-4],[7,-1],[9,4],[4,5],[2,4],[3,9],[2,3],[3,2],[5,1],[6,2],[2,1],[2,2],[3,4],[6,7],[3,2],[5,2],[4,1],[4,-1],[4,-5],[2,-2],[0,-2],[0,-3],[-3,-4],[-2,-2],[-2,-2],[0,-2],[1,-1],[14,-9],[3,-3],[1,-2],[2,-17],[3,-11],[0,-6],[-1,-6],[-1,-6],[-1,-6],[1,-5],[5,-25],[0,-2],[-1,-2],[0,-2],[3,-2],[10,-1],[78,1],[9,4],[10,6],[31,27],[2,4],[0,6],[-1,4],[-3,2],[-1,1],[-3,3],[-1,1],[-1,1],[-1,1],[4,6],[27,16],[8,-3],[4,-2],[6,-3],[1,-2],[0,-3],[-4,-7],[-1,-2],[-1,-2],[-2,-2],[1,-3],[2,-3],[8,-4],[3,-1],[4,-1],[3,0],[3,0],[2,0],[4,-1],[5,-3],[1,-3],[0,-4],[-3,-8],[-5,-8],[-1,-2],[2,-6],[11,-19],[-9,-21],[-3,-6],[-7,-6],[-2,-3],[-1,-3],[3,-2],[21,-6],[4,-2],[3,-2],[2,-2],[31,-60],[1,-3],[-2,-2],[-9,1],[-5,2],[-7,2],[-7,0],[-5,-1],[-20,-18],[0,-23],[-2,-5],[0,-8],[2,-8],[11,-12],[8,-4],[5,-2],[4,0],[3,-1],[1,0],[2,-2],[2,-3],[0,-4],[-8,-18],[1,-5],[2,-6],[8,-13],[3,-7],[-1,-8],[-2,-3],[-3,-1],[-5,0],[-11,3],[-3,2],[-5,3],[-2,1],[-2,-1],[-1,-3],[-1,-3],[1,-5],[2,-4],[15,-13],[1,0],[1,-5],[0,-12],[0,-4],[0,-6],[2,-5],[3,-5],[8,-5],[3,-4],[2,-3],[-3,-4],[-2,-2],[-2,0],[-5,-1],[-2,0],[-2,-2],[1,-2],[3,-3],[9,-7],[19,-10],[5,-3],[4,-3],[22,-25],[15,-11],[3,-1],[2,1],[12,6],[3,1],[3,0],[2,0],[3,-1],[2,-1],[17,-13],[2,-2],[1,-5],[1,-7],[-1,-14],[-3,-6],[-2,-5],[-1,-1],[-2,-2],[-1,-2],[-2,-5],[-2,-2],[-1,-2],[-3,-1],[-2,-1],[-3,0],[-4,0],[-5,0],[-2,0],[-2,-1],[-2,-1],[-1,-2],[2,-3],[4,-2],[12,-6],[10,-2],[5,-1],[2,-1],[1,-3],[-1,-4],[-3,-5],[0,-2],[0,-2],[5,-5],[16,-11],[0,-7],[-1,-4],[-1,-2],[-2,-4],[0,-2],[0,-2],[3,-2],[5,-2],[20,-6],[6,-1],[8,1],[3,0],[5,-1],[18,-9],[3,-1],[3,0],[13,0],[3,-3],[3,-4],[4,-9],[4,-13],[7,-7],[45,-29],[9,-13],[14,-13],[2,-1],[1,-2],[1,-1],[2,-3],[5,-11],[3,-3],[6,-3],[3,-3],[2,-3],[2,-3],[2,-8],[5,-12],[1,-4],[-1,-4],[-5,-3],[-3,-2],[-13,-3],[-2,-2],[-1,-1],[1,-2],[9,-6],[1,-2],[1,-5],[0,-9],[-3,-35],[-1,-2],[-1,-2],[-3,-9],[-1,-1],[1,-2],[1,-3],[8,-12],[1,-2],[1,-2],[0,-3],[-1,-6],[-3,-11],[-1,-5],[-2,-3],[-2,-2],[-7,-4],[-3,-3],[-2,-6],[-1,-8],[2,-17],[-1,-7],[-1,-4],[-3,-1],[-1,-2],[-1,-2],[-2,-3],[0,-3],[-1,-3],[0,-6],[2,-7],[0,-1],[1,-2],[8,-8],[21,-9],[7,1],[2,0],[2,-3],[4,-6],[3,-9],[20,-29],[-48,-34],[-14,-7],[-2,1],[-2,1],[-1,3],[-2,2],[0,3],[0,3],[0,2],[2,3],[4,8],[0,3],[-1,4],[1,3],[4,1],[2,2],[1,2],[-3,4],[-2,2],[-5,2],[-4,0],[-8,-4],[-49,-45],[-5,-3],[-3,0],[-2,0],[-2,2],[-7,10],[-8,15],[-3,4],[-6,1],[-23,-1],[-5,1],[-4,2],[-5,3],[-10,9],[-5,4],[-5,-1],[-4,-4],[-8,-11],[-10,-10],[-2,-1],[-1,-2],[-1,-15],[4,-9],[4,-5],[3,-3],[2,-2],[2,-3],[2,-4],[2,-3],[2,-2],[5,-2],[6,-2],[6,-3],[6,-4],[5,-5],[6,-4],[9,-4],[3,-2],[2,-2],[0,-3],[0,-5],[-4,-5],[-3,-2],[-9,-2],[-6,-3],[-1,-2],[-1,-2],[1,-6],[0,-3],[1,-2],[3,-5],[5,-7],[2,-4],[2,-6],[0,-8],[0,-6],[-1,-8],[-12,-24],[-1,-4],[0,-4],[2,-1],[1,-2],[4,-2],[2,-1],[-2,-1],[-3,-1],[-42,-1],[-9,-2],[-3,-2],[-3,-2],[-6,-6],[-3,-3],[-1,-3],[-3,-14],[-106,-50],[-6,0],[-2,1],[-2,2],[-2,1],[-1,2],[-1,2],[-1,9],[-1,2],[-1,3],[-1,1],[-4,4],[-2,0],[-2,1],[-5,0],[-4,-1],[-14,-7],[-8,-6],[-3,-1],[-20,-4],[-13,-1],[-4,-1],[-6,-4],[-9,-8],[-5,-5],[-6,-11],[0,-4],[0,-5],[4,-8],[-8,-4],[-62,-67],[10,-14],[8,0],[2,0],[2,0],[1,0],[1,-1],[1,-1],[1,-1],[20,-35],[15,-21],[15,-17],[5,-8],[17,-46],[43,-155],[29,-52],[4,-17],[0,-14],[-2,-34],[-8,-28],[-33,-71],[-8,-4],[-2,-2],[-4,-2],[-2,-4],[0,-6],[2,-7],[9,-15],[2,-3],[13,-11],[1,-5],[-1,-30],[-2,-10],[-1,-6],[-5,-6],[-1,-4],[-3,-16],[-1,-3],[-2,-2],[-3,-3],[-2,-1],[-1,-1],[-4,-3],[0,-2],[0,-2],[2,-2],[5,-2],[2,0],[2,0],[3,1],[1,0],[1,0],[1,0],[2,-3],[4,-7],[4,-12],[20,-36],[-6,-3],[-2,0],[-2,-1],[-3,-2],[-1,-3],[-3,-5],[-2,-3],[-3,-1],[-19,-1],[-3,0],[-2,-2],[-3,-2],[-5,-7],[-1,-4],[1,-4],[7,-6],[7,-5],[4,-5],[3,-6],[2,-2],[3,-1],[9,1],[2,-1],[2,-3],[1,-3],[1,-6],[2,-37],[3,-24],[5,-13],[4,-9],[1,-3],[0,-4],[-1,-6],[-2,-5],[-2,-3],[-2,-3],[-4,-1],[-10,1],[-21,6],[-1,0],[-2,0],[-2,-3],[-2,-6],[-1,-19],[-11,-10],[-7,10],[-4,8],[-6,15],[-2,3],[-6,2],[-7,1],[-13,0],[-27,-6],[-24,-11],[-19,-6],[-18,-4],[-27,0],[-26,5],[-36,13],[-8,2],[-13,-4],[-20,-9],[-81,-57],[-49,-20],[-31,8],[-7,1],[-17,-7],[-4,-6],[-2,-3],[0,-2],[-5,-2],[-8,-3],[-30,-4],[-6,-2],[-2,-2],[-12,-13],[-51,-57],[-1,0]],[[4467,5273],[-20,-12],[-4,-6],[-4,-9],[1,-5],[1,-4],[2,-3],[1,-3],[1,-8],[1,-4],[2,-2],[6,-5],[4,-3],[2,-6],[4,-12],[-1,-12],[2,-5],[3,-2],[4,1],[5,-1],[7,-4],[9,-10],[7,-5],[5,-3],[5,0],[12,1],[3,0],[25,-8],[17,-1],[9,-4],[4,-3],[1,-4],[-5,-10],[0,-7],[2,-4],[3,-3],[17,-11],[3,-5],[2,-15],[4,-4],[4,-2],[5,0],[4,-2],[8,-3],[4,-1],[5,-1],[8,-3],[6,-1],[11,-1],[6,-1],[10,-6],[7,-2],[5,-1],[11,1],[10,-1],[15,-7],[12,-8],[22,-9],[14,-4],[2,-2],[1,-4],[-1,-1],[-3,-8],[-17,-14],[-6,-13],[-1,-6],[0,-8],[-5,-26],[-5,-5],[-2,-1],[-2,3],[-1,6],[-3,2],[-6,4],[0,1],[-1,2],[1,2],[1,2],[-1,3],[-9,9],[-4,3],[-8,1],[-11,0],[-24,-5],[-7,-4],[-2,-3],[4,-2],[3,-2],[2,-2],[2,-3],[1,-4],[2,-3],[2,-2],[3,-2],[4,-1],[20,-3],[4,-2],[0,-6],[-4,-11],[-15,-17],[-5,-10],[-3,-9],[-3,-13],[-1,-7],[2,-4],[4,-2],[11,0],[4,-1],[4,-2],[6,-4],[3,-2],[5,-1],[14,0],[4,-2],[3,-2],[3,-6],[8,-9],[2,-3],[2,-6],[-1,-5],[-16,-27],[-3,-4],[-3,-1],[-25,1],[-24,-3],[-6,0],[-5,1],[-4,1],[-6,3],[-2,2],[0,1],[0,1],[2,6],[-1,3],[-2,1],[-4,0],[-11,-4],[-4,0],[-12,4],[-32,0],[-14,-2],[-27,-15],[-3,-17],[3,-8],[4,-2],[4,-2],[4,-6],[7,-9],[3,-16],[-2,-6],[-3,-4],[-18,-4],[-13,-1],[-38,3],[-4,1],[-2,1],[-2,2],[-4,1],[-5,0],[-7,-2],[-3,-4],[-2,-4],[0,-7],[1,-5],[3,-2],[4,1],[3,1],[6,5],[3,-1],[2,-5],[-2,-14],[2,-7],[3,-4],[3,1],[4,1],[3,2],[2,3],[2,3],[3,3],[2,2],[3,2],[3,1],[3,1],[3,0],[3,0],[3,0],[3,-1],[11,-6],[12,-8],[4,-4],[4,-6],[5,-11],[4,-5],[9,-8],[-30,-26],[-3,-5],[-3,-5],[4,-10],[-1,-12],[-3,-5],[-5,-2],[-6,0],[-7,-2],[-9,-4],[-7,-2],[-21,-2],[-16,-5],[-7,-3],[-3,-3],[1,-4],[0,-3],[-6,-9],[-2,-4],[0,-4],[-1,-5],[1,-3],[3,-7],[1,-5],[0,-6],[-1,-3],[-3,0],[-2,2],[-2,1],[-4,-1],[-5,-2],[-5,-1],[-6,-12],[13,-11],[3,-6],[1,-3],[0,-8],[-1,-7],[-2,-5],[-4,-7],[-14,-21],[-5,-8],[0,-6],[2,-6],[-1,-4],[-7,-7],[-3,-2],[-3,-2],[-4,-2],[-5,-3],[-5,-5],[-8,-11],[-2,-7],[-1,-6],[0,-7],[-1,-11],[2,-8],[4,-4],[4,-1],[9,3],[3,1],[4,1],[5,1],[4,-1],[18,-9],[9,-2],[10,-2],[5,1],[4,1],[3,2],[3,7],[4,5],[-1,3],[-3,3],[-8,8],[-3,3],[0,4],[0,3],[2,3],[2,3],[4,1],[18,4],[8,3],[13,7],[8,2],[7,1],[5,-1],[18,-4],[19,-2],[10,-2],[6,-3],[3,-2],[3,-4],[12,-23],[3,-29],[-2,-3],[-2,-3],[-3,2],[-5,0],[-7,-3],[-12,-9],[-2,-5],[0,-5],[2,-2],[1,-3],[0,-5],[-1,-23],[0,-4],[0,-4],[1,-3],[1,-3],[8,-14],[-1,-6],[-10,-22],[-2,-8],[-1,-6],[1,-3],[2,-3],[9,-1]],[[4583,4163],[-7,-14],[-1,-3],[-2,-5],[-2,-3],[-23,-29],[-11,-17],[-13,-16],[-22,-14],[-68,-30],[-65,-19],[-13,-2],[-9,1],[-4,0],[-7,3],[-10,6],[-6,5],[-8,9],[-3,2],[-2,2],[-3,0],[-4,-1],[-12,-4],[-6,-2],[-14,-15],[-26,-71],[4,-18],[1,-6],[1,-6],[1,-11],[0,-12],[-5,-6],[-7,-4],[-18,-10],[-19,-6],[-11,-2],[-15,-6],[-7,-5],[-9,-9],[-8,-18],[0,-9],[2,-6],[5,-5],[-1,-3],[-3,-3],[-33,-7],[-20,-6],[-16,0],[-5,1],[-3,1],[-3,3],[-2,1],[-2,1],[-4,0],[-5,-1],[-17,-4],[-3,0],[-2,2],[-2,1],[-5,7],[-4,2],[-2,2],[-3,0],[-2,0],[-10,-4],[-4,0],[-7,1],[-10,3],[-3,-1],[-2,-3],[-1,-8],[4,-26],[-2,-5],[-7,-18],[-2,-6],[-1,-4],[1,-3],[0,-2],[2,-2],[1,-1],[3,-1],[19,-2],[4,-1],[2,-2],[2,-2],[0,-2],[-2,-4],[-13,-20],[-4,-7],[-1,-6],[0,-5],[7,-23],[-3,-4],[-8,-7],[-67,-21],[-16,-2],[-26,3],[-8,7],[-7,8],[-2,3],[-4,11],[-2,3],[-2,2],[-7,6],[-11,5],[-42,16],[-6,0],[-14,-1],[-5,0],[-8,2],[-3,1],[-49,1],[-11,3],[-6,0],[-7,-1],[-34,-7],[-5,-2],[-2,-2],[-1,-6],[0,-6],[0,-3],[-3,-4],[-19,-17],[-16,-9],[-7,-3],[-3,0],[0,2],[2,3],[6,8],[2,3],[-1,1],[-2,2],[-15,3],[-6,3],[-14,9],[-4,2],[-4,0],[-3,0],[-3,0],[-55,-20],[-36,-6],[-6,-2],[-5,-4],[-3,-2],[-2,-3],[-1,-4],[-1,-6],[0,-19],[-1,-5],[-1,-5],[-4,-3],[-3,-1],[-5,0],[-5,0],[-3,-1],[-10,-10],[-2,-2],[7,-4],[10,-6],[5,-1],[5,5],[11,1],[11,-1],[5,-5],[1,-2],[5,-28],[11,-12],[-2,-15],[1,-2],[4,-8],[8,-11],[1,-3],[-2,0],[-2,-2],[-23,7],[-2,-95],[0,-5],[15,-32],[10,-21],[14,-34],[3,-4],[3,-5],[1,-1],[2,-2],[2,0],[1,0],[2,2],[2,3],[7,9],[3,3],[2,1],[2,0],[2,-1],[1,-2],[1,-3],[-1,-5],[-2,-10],[-1,-8],[1,-9],[6,-12],[3,-6],[5,-5],[6,-3],[4,-1],[6,1],[4,1],[5,1],[4,0],[3,-1],[3,-2],[4,-3],[2,-5],[-1,-5],[-5,-7],[-15,-16],[-2,-5],[0,-5],[3,-5],[9,-4],[17,-6],[3,-3],[-1,-5],[-14,-23],[-3,-6],[-1,-5],[0,-6],[2,-7],[1,-3],[0,-4],[-1,-2],[-7,-5],[-5,-3],[-4,-2],[-4,0],[-8,0],[-5,-1],[-4,-1],[-1,-7],[2,-11],[10,-35],[2,-7],[-4,-6],[-2,-3],[-3,-2],[-4,-2],[-9,-6],[-11,-9],[-3,-3],[-2,-2],[-5,-4],[1,-5],[4,-5],[21,-16],[16,-20]],[[2796,2961],[-18,40],[-27,39],[-16,30],[2,34],[18,25],[30,16],[36,5],[23,22],[14,18],[3,13],[-15,4],[-22,-4],[-20,-1],[-9,14],[-2,9],[-6,10],[-20,29],[-4,11],[-2,11],[-4,13],[-11,18],[-25,28],[-8,16],[16,44],[-21,44],[-117,101],[-17,8],[-13,2],[-30,0],[-136,-36],[-43,-24],[-52,-21],[-47,-12],[-44,-1],[-20,22],[-3,16],[-8,11],[-71,48],[-10,3],[-5,3],[43,26],[20,7],[11,7],[4,5],[1,11],[1,6],[3,7],[8,11],[5,4],[5,1],[4,-1],[6,-1],[6,0],[9,3],[7,1],[4,0],[4,-3],[5,-6],[5,-3],[4,-2],[7,-3],[2,1],[1,4],[1,5],[0,3],[2,6],[5,12],[1,3],[0,3],[-2,2],[-3,2],[-20,9],[-4,3],[-4,3],[-4,5],[-1,9],[3,12],[13,22],[7,9],[6,6],[19,6],[14,8],[30,10],[7,7],[5,3],[2,2],[3,-1],[3,-1],[6,-5],[4,-4],[4,-3],[5,-2],[8,0],[4,2],[4,7],[13,14],[1,3],[-1,3],[-10,9],[0,3],[1,5],[4,9],[4,4],[5,2],[55,-2],[17,3],[6,4],[3,2],[2,3],[1,4],[0,4],[-1,4],[-4,6],[-12,33],[-7,11],[-3,1],[-10,4],[-10,9],[-7,10],[-21,35],[-5,7],[-19,7],[-2,3],[-2,4],[0,5],[-3,3],[-4,1],[-46,9],[-5,3],[-2,2],[2,7],[13,8],[6,12],[4,14],[4,11],[17,12],[3,4],[1,2],[-2,2],[-10,4],[-4,2],[-3,2],[-2,2],[-1,3],[-1,8],[0,2],[0,2],[2,43],[3,9],[2,6],[5,2],[6,3],[7,5],[11,12],[5,5],[6,3],[12,2],[11,1],[5,-1],[4,-2],[18,-18],[3,-2],[4,-1],[11,-2],[4,0],[3,1],[5,2],[17,10],[5,3],[2,4],[2,2],[17,33],[10,21],[-3,4],[-1,3],[-10,4],[-3,4],[-4,7],[-4,19],[-6,12],[-15,24],[-1,6],[0,3],[2,4],[5,7],[4,8],[4,21]],[[3912,5616],[9,-6],[20,14],[18,0],[4,-2],[4,-5],[0,-5],[0,-4],[0,-4],[0,-3],[2,-4],[2,-2],[6,-3],[9,-2],[14,-1],[8,1],[5,2],[3,3],[2,2],[6,5],[3,2],[4,1],[4,0],[4,-3],[4,-5],[5,-5],[14,-4],[9,-1],[7,-1],[14,3],[12,4],[5,0],[3,-2],[2,-7],[2,-5],[4,-4],[22,-7],[4,-4],[3,-6],[3,-11],[7,-13],[21,-17],[-9,-14],[-7,-2],[-3,2],[-27,14],[-2,1],[-2,0],[-2,0],[-3,-2],[-2,-2],[0,-4],[2,-5],[11,-14],[-1,-2],[-4,-2],[-5,0],[-4,1],[-3,1],[-7,3],[-4,0],[-3,-3],[-1,-7],[0,-14],[-2,-8],[-2,-4],[-3,-3],[-4,-1],[-10,0],[-2,-4],[2,-8],[21,-36],[8,-8],[5,-4],[8,-3],[3,-2],[1,-3],[-3,-4],[-6,-5],[-1,-3],[1,-4],[5,-5],[2,-5],[-1,-8],[-1,-5],[-1,-5],[5,-32],[-3,-6],[-4,-4],[-31,-3],[-8,-2],[-4,0],[-8,2],[-4,0],[-3,-1],[-3,-3],[-2,-4],[-3,-3],[-9,-7],[-1,-4],[2,-6],[7,-11],[1,-5],[-1,-4],[-4,-1],[-5,0],[-10,2],[-17,6],[-4,0],[1,-4],[6,-7],[31,-20],[19,-4],[75,-25],[7,-1],[8,1],[15,-6],[31,-30],[12,-2],[3,1],[9,3],[31,21],[8,7],[4,5],[0,3],[0,3],[0,2],[1,2],[1,1],[2,2],[1,1],[1,1],[2,1],[3,3],[1,3],[1,2],[0,1],[-2,2],[-1,1],[-3,1],[-4,0],[-6,-1],[-12,-8],[-2,-3],[-3,-2],[-4,1],[-9,4],[-26,21],[-4,4],[-3,6],[0,3],[0,2],[1,1],[46,20],[14,8],[26,6],[7,6],[3,3],[-3,5],[-1,2],[-1,2],[-1,3],[1,3],[4,0],[8,-2],[20,-8],[7,-4],[5,-5],[2,-4],[6,-12],[5,-6],[4,-3],[4,-3],[5,0],[6,2],[7,7],[3,3],[0,4],[-9,15],[-2,2],[-2,2],[-1,3],[-1,3],[0,3],[1,3],[3,2],[5,1],[13,0],[3,0],[7,7],[3,2],[4,1],[4,0],[3,-2],[1,-8],[1,-8],[0,-1],[10,-8],[37,-21]],[[2953,7622],[4,-1],[2,0],[21,5],[5,0],[31,-14],[64,-18],[15,-3],[11,1],[3,1],[1,0],[2,2],[4,0],[25,2],[14,-2],[2,-1],[1,-1],[1,-2],[1,-2],[-1,-2],[0,-2],[2,-3],[6,-3],[24,-11],[5,-2],[31,1],[13,-2],[2,-1],[16,-12],[22,-11],[38,-13],[10,-2],[5,1],[4,1],[2,2],[1,2],[1,2],[2,4],[1,4],[5,8],[3,4],[2,2],[5,3],[4,-1],[3,-1],[11,-7],[26,-22],[2,-3],[0,-3],[-3,-3],[-13,-8],[-2,-3],[-1,-2],[4,-8],[27,-20],[2,-4],[2,-4],[-2,-3],[-7,-7],[-3,-6],[-2,-8],[-2,-17],[-1,-7],[-2,-5],[-16,-13],[-38,-19],[-9,-4],[-53,29],[0,-2],[0,-4],[0,-4],[-3,-3],[-6,-2],[-15,-3],[-10,0],[-11,2],[-52,24],[-6,2],[-3,0],[-11,-4],[-43,-5],[-16,2],[-1,1],[-1,1],[0,1],[0,1],[0,2],[0,33],[-1,4],[-2,4],[-8,2],[-42,36],[-18,19],[-2,4],[-2,7],[-1,3],[-2,23],[-15,22],[-7,4],[-24,-1],[-12,1],[-26,13],[-45,13],[-9,14],[-4,8],[-5,9],[24,3],[12,-2],[34,-16]],[[2949,8016],[10,35],[-6,6],[-28,50],[-8,8],[-11,17],[-5,9]],[[2901,8141],[1,0],[53,-14],[24,-3],[45,2],[6,-2],[1,-2],[-4,-4],[-3,-3],[-3,-4],[-1,-3],[-2,-5],[1,-7],[3,-6],[8,-12],[4,-10],[8,-27],[1,-9],[-1,-9],[-2,-7],[-1,-4],[-17,-18],[-23,-15],[-2,-1],[-1,0],[-3,1],[-2,2],[-8,10],[-1,0],[-2,0],[-8,-1],[-5,3],[-14,18],[-4,5]],[[970,8091],[8,-7],[8,-12],[-10,4],[-14,11],[-9,3],[-11,-2],[-17,-5],[-6,-2],[-20,7],[-15,15],[-4,15],[13,7],[83,18],[41,2],[14,-20],[-24,-3],[-38,-11],[-20,-4],[0,-8],[12,-3],[9,-5]],[[1166,8173],[-31,-24],[-17,5],[-13,8],[-1,14],[2,4],[5,1],[6,4],[20,0],[24,-7],[5,-5]],[[1345,8231],[-231,-18],[40,13],[149,14],[42,-9]],[[1629,8277],[-1,-1],[-3,0],[-51,-14],[-133,-13],[-44,9],[49,20],[59,7],[124,-2],[0,-6]],[[1712,8291],[14,-8],[-3,-5],[-4,-2],[-8,-1],[-44,9],[-16,-1],[18,9],[22,3],[21,-4]],[[2529,8280],[-17,-12],[-6,-2],[-9,2],[-6,2],[-7,1],[-11,-5],[0,9],[13,16],[22,7],[24,-3],[23,-12],[-15,0],[-11,-3]],[[1935,8313],[-1,-1],[-3,0],[-3,-2],[-79,2],[-37,-6],[-3,-23],[-32,-1],[-10,6],[-4,18],[6,14],[13,6],[34,1],[97,1],[22,-10],[0,-5]],[[2122,8345],[-24,-10],[-31,-9],[-31,-2],[-27,13],[-10,-10],[-9,-5],[-10,0],[-8,5],[28,24],[45,8],[93,-5],[0,-9],[-16,0]],[[2264,8366],[29,-12],[-10,1],[-12,-1],[-46,8],[-19,-1],[-2,-16],[-21,11],[5,8],[19,5],[23,2],[18,-1],[16,-4]],[[4265,8052],[1,-5],[4,-46],[10,-7],[2,-3],[2,-5],[1,-2],[3,-3],[7,-3],[3,-3],[2,-4],[5,-12],[5,-8],[6,-8],[7,-7],[8,-7],[36,-24],[4,-1],[5,1],[13,15],[6,3],[9,2],[5,0],[5,-3],[6,-7],[2,-13],[1,-12],[1,-4],[4,-3],[6,0],[22,8],[7,1],[5,-1],[20,-10],[8,0],[11,1],[28,8],[18,8],[3,2],[0,3],[0,2],[-1,2],[0,3],[0,2],[3,3],[7,3],[41,9],[7,1],[18,-15],[13,-7],[22,-4],[13,-10],[11,-12],[18,-9],[18,-3],[60,3],[2,4],[25,22],[11,5],[10,2],[46,0]],[[4880,7904],[25,0],[39,-11],[155,-66],[45,-11],[34,10]],[[5178,7826],[81,3],[38,-7],[23,-21],[3,-18],[1,-21],[5,-17],[18,-7],[21,-3],[13,-9],[22,-23],[35,-20],[99,-40],[120,-80],[30,-14],[11,-8],[13,-7],[11,6],[10,9],[17,8],[9,7],[12,7],[13,1],[10,-3],[6,-7],[6,-9],[9,-8],[11,-15],[8,0],[14,11],[11,5],[8,-6],[9,-8],[17,-8],[7,-7],[13,-17]],[[5912,7500],[18,-24],[40,-34],[18,-7],[24,-3],[20,4],[36,17],[23,4],[25,-6],[32,-24],[21,-5],[25,-2],[53,-16]],[[6247,7404],[-21,-42],[-11,-5],[-14,0],[-9,2],[-6,1],[-11,-2],[-6,-4],[-3,-3],[-6,-12],[-1,-3],[-5,-26],[0,-8],[1,-4],[1,-7],[3,-6],[2,-7],[-2,-2],[-2,-1],[-21,-1],[-10,-1],[-63,-44],[-4,-1],[-38,-7],[-67,-21],[-22,0],[-9,2],[-6,-1],[-6,-3],[-10,-6],[-6,-1],[-6,0],[-3,1],[-2,1],[-2,2],[-2,3],[-2,3],[-2,2],[-3,3],[-14,4],[-4,2],[-2,2],[-3,2],[-4,2],[-53,7],[-64,-3],[-8,1],[-20,8],[-32,6],[-18,1],[-22,-2],[-13,-4],[-2,-1],[-1,-1],[-1,-1],[-2,-3],[-1,-3],[-2,-4],[0,-4],[-1,-3],[0,-7],[0,-2],[-2,-2],[-2,-3],[-21,-11],[-11,-11],[-20,-7],[-31,-7],[-16,-6],[-15,-3],[-47,2],[-51,-3],[-36,-10],[-4,-4],[2,-7],[0,-4],[-3,-6],[-1,-5],[0,-4],[3,-6],[0,-4],[1,-4],[0,-3],[-3,-12],[-1,-4],[0,-3],[1,-4],[2,-3],[4,-5],[12,-20],[5,-5],[14,-10],[2,-3],[1,-10],[2,-8],[5,-15],[6,-5],[5,-3],[12,0],[7,-3],[9,-4],[11,-17],[42,-59],[38,-41],[9,-6],[6,-2],[4,1],[12,9],[4,1],[5,1],[7,0],[11,-4],[4,-4],[1,-4],[-2,-3],[-2,-3],[-5,-5],[-18,-14],[-3,-3],[-2,-3],[-2,-3],[0,-4],[-1,-20],[1,-6],[3,-12],[2,-6],[3,-5],[2,-2],[5,-5],[4,-2],[2,-3],[31,-34],[6,-9],[2,-5],[-3,-2],[-5,0],[-20,3],[-5,0],[-5,0],[-5,-1],[-7,-3],[-4,-2],[-2,-3],[-2,-3],[-1,-3],[-1,-4],[-1,-2],[-1,-2],[-2,-2],[-2,-4],[-1,-5],[-1,-14],[78,-75],[5,-3],[6,-3],[4,-2],[14,-3],[32,-19],[4,-4],[3,-6],[-1,-5],[-2,-5],[-1,-8],[-3,-3],[-3,-3],[-19,-3],[-30,-3],[-12,-3],[-7,-3],[-3,-2],[0,-3],[1,-3],[1,-6],[1,-4],[1,-2],[4,-1],[8,-2],[8,-4],[2,-2],[1,-1],[1,-3],[1,-3],[1,-3],[1,-2],[3,-2],[4,-5],[0,-4],[-2,-3],[-12,-7],[-6,-5],[-1,-3],[0,-3],[14,-15],[7,-6],[4,-2],[5,-7],[3,-3],[3,0],[9,1],[5,-1],[2,-4],[0,-10],[1,-6],[1,-3],[2,0],[3,2],[2,2],[2,4],[1,1],[3,1],[3,0],[5,-5],[1,-5],[1,-4],[0,-12],[-1,-4],[-1,-4],[-3,-3],[-3,-2],[-6,-3],[-16,-2],[-22,-7],[-4,-3],[-5,-4],[-9,-15],[-2,-6],[0,-4],[4,-6],[2,-3],[3,-3],[3,-2],[3,-2],[5,-1],[5,-1],[4,1],[5,-2],[4,-4],[4,-14],[0,-6],[-1,-5],[-9,-12],[-6,-6],[-5,-4],[-27,-17],[-23,-9],[-38,-9],[-7,-3],[-3,-3],[-1,-4],[1,-3],[1,-1],[3,-2],[16,-9],[3,-2],[1,-3],[0,-6],[-1,-10],[-1,-6],[-3,-4],[-3,-2],[-5,-1],[-3,-1],[-11,0],[-54,1],[-22,-3],[-28,-8],[-145,0],[-62,-7],[-9,-3],[-1,-3],[0,-3],[1,-4],[0,-3],[-1,-3],[-9,-7],[-9,-9],[-14,-9],[-8,-2],[-6,-1],[-32,3],[-7,-2],[-4,-3],[0,-3],[0,-3],[1,-1],[1,-1],[1,-2],[15,-15],[2,-2],[0,-2],[2,-10],[28,-10],[3,-3],[7,-7],[5,-3],[6,-1],[8,2],[3,0],[1,-2],[-2,-3],[-3,-3],[-16,-5],[-3,-2],[-6,-5],[-4,-12],[-2,-12],[1,-2],[1,-3],[19,-9],[3,-3],[4,-6],[3,-20],[0,-6],[-2,-4],[-1,-1],[-2,-3],[-3,-2],[-3,-7],[-3,-2],[-3,-2],[-8,-3],[-4,-2],[-4,-3],[-4,-7],[-3,-3],[-4,-2],[-15,-5],[-5,-4],[-3,-3],[0,-19],[-2,-32],[0,-6],[1,-1],[1,-4],[3,-16],[1,-5],[2,-3],[5,-4],[6,-5],[2,-2],[6,-5],[7,-4],[8,-3],[3,-2],[3,-4],[3,-5],[4,-13],[2,-4],[9,-9],[6,-13],[3,-2],[12,-8],[4,-3],[3,-5],[4,-11],[1,-7],[0,-30],[31,-42]],[[5283,5601],[-53,-22],[-19,-17],[-2,-4],[0,-3],[1,-3],[5,-5],[6,-8],[11,-9],[2,-1],[2,-3],[1,-5],[-2,-11],[-4,-5],[-5,-1],[-4,1],[-3,2],[-15,12],[-7,0],[-9,-1],[-53,-19],[-4,-1],[-34,-2],[-14,1],[-38,24],[-52,20],[-10,2],[-9,-3],[-15,-2],[-16,0],[-8,-2],[-4,-1],[0,-2],[0,-2],[0,-1],[0,-1],[4,-4],[0,-1],[1,-3],[1,-4],[-2,-7],[-3,-7],[-12,-23],[-7,-8],[-18,-10],[-4,-4],[-1,-3],[-2,-3],[-3,-1],[-9,-4],[-19,-8],[-5,-5],[-4,-4],[-1,-5],[-3,-8],[-4,-3],[-4,-2],[-5,0],[-47,-23],[-8,-2],[-10,0],[-5,1],[-3,2],[-2,2],[0,1],[-1,3],[0,1],[-4,2],[-5,1],[-11,-1],[-6,-2],[-4,-3],[-2,-2],[-3,-3],[-1,-3],[0,-3],[0,-1],[1,-2],[1,-3],[0,-1],[-2,-5],[-9,-11],[-4,-3],[-5,-3],[-15,-2],[-3,-3],[-1,-3],[1,-1],[3,-7],[-55,1],[-16,-2],[-6,-8],[-6,-5],[-5,-1],[-3,1],[-22,14],[-5,0],[-2,-2],[-3,-4],[-5,-4],[-16,-6],[-7,-4],[-12,-11],[-56,-34]],[[1280,6373],[-6,8],[-10,28],[1,23],[8,19],[22,37],[9,47],[-15,33],[-67,78],[-7,-3],[-6,-8],[-11,-7],[-27,-6],[-28,-1],[-31,3],[-57,16],[-86,9],[-29,10],[-21,18],[-7,19],[-1,22],[-4,23],[-14,20],[18,2],[61,22],[-36,21],[-8,9],[0,10],[5,11],[2,11],[-9,14],[19,10],[20,10],[36,8],[104,1],[57,-12],[54,5],[17,-5],[38,-8],[20,27],[8,45],[10,139],[10,43],[11,22],[8,17],[90,100],[24,43],[10,41],[1,46],[-10,92],[-4,11],[-5,7],[-4,8],[-1,15],[3,10],[15,29],[7,22],[4,20],[-1,20],[-3,37],[10,4],[13,9],[9,10],[10,13],[4,16],[-8,14],[27,29],[15,6],[25,0],[24,-4],[37,-17],[21,-6],[-26,27],[-43,11],[-249,7],[-40,14],[-16,35],[0,95],[4,22],[22,39],[4,19],[9,12],[22,0],[44,-7],[6,10],[10,4],[8,13],[-2,16],[-10,9],[-32,11],[-14,10],[-2,17],[15,14],[36,18],[39,31],[21,10],[41,29],[86,24],[168,13],[11,-5],[12,-12],[26,-4],[161,24],[327,32],[87,-18],[0,-10],[-7,-36],[30,-46],[45,-41],[37,-18],[0,-8],[-9,-16],[17,-6],[24,-4],[12,-14],[-3,-23],[-11,-12],[-23,-12],[-20,-7],[-43,-3],[-19,-9],[20,-42],[10,-16],[15,-12],[13,5],[13,4],[18,-1],[13,-5],[21,-16],[7,-4],[9,-6],[9,-12],[12,-12],[15,-5],[19,0],[13,2],[12,5],[13,10],[23,27],[24,44],[6,44],[-31,26],[-43,-8],[-23,2],[2,19],[9,21],[8,44],[9,18],[15,11],[18,5],[46,1],[21,-6],[16,-16],[13,-18],[14,-12],[44,-16],[93,-13],[42,-14],[0,-10],[-26,-15],[-24,-21],[-18,-28],[-7,-37],[2,-72],[6,-32],[15,-23],[3,32],[-12,80],[1,37],[17,28],[25,13],[23,15],[0,2]],[[2901,8141],[-5,10],[-8,25],[-15,29],[-4,21],[3,22],[6,19],[41,71],[29,77],[19,35],[15,16],[22,14],[24,10],[25,4],[22,-1],[13,-4],[27,-21],[39,-23],[41,-15],[85,-14],[47,0],[79,14],[44,-2],[20,16],[87,15],[86,0],[19,9],[15,-8],[18,-2],[37,1],[9,-4],[24,-22],[106,-131],[44,-36],[31,-18],[15,-13],[15,-39],[75,-77],[16,-11],[21,-6],[26,-3],[13,-4],[65,-31],[73,-12]],[[6992,4891],[70,5],[169,-37],[8,-39],[4,-5],[30,-38],[11,-19],[15,-11],[15,-6],[15,-5],[31,-13],[26,-31],[23,-37],[1,-4],[-1,-5],[-12,-4],[-6,-4],[-3,-2],[-10,-12],[-8,-7],[-3,0],[-3,2],[-4,6],[-5,2],[-4,0],[-8,-2],[-5,-1],[-35,4],[-24,-3],[-5,1],[-17,6],[-2,-11],[-2,-2],[-3,-2],[-42,-17],[-22,-20],[-20,-22],[-4,-1],[-3,1],[0,3],[-4,1],[-8,2],[-32,-2],[-7,-2],[-7,-3],[-28,-18],[-9,-4],[-79,-17],[-1,-14],[13,-11],[18,-5],[3,-5],[1,-3],[-2,-3],[-9,-7],[-7,-7],[-1,-1],[-3,-1],[-4,-1],[-6,1],[-5,-3],[-7,-5],[-8,-14],[-2,-7],[2,-5],[4,0],[4,0],[6,1],[4,1],[5,-2],[7,-5],[2,-4],[-1,-5],[-3,-4],[-2,-9],[2,-7],[5,-11],[4,-5],[4,-4],[3,-2],[4,-2],[4,-1],[11,0],[14,1],[11,-4],[-23,-28],[-4,-4],[-8,-7],[-34,-19],[-7,-3],[-27,-1],[-21,3],[-18,0],[-6,-2],[-4,-3],[-7,-7],[-19,-19],[1,-25],[-2,-8],[-5,-12],[-4,-5],[-5,-3],[-11,-1],[-13,-5],[-5,-1],[-5,1],[-4,1],[-3,2],[-3,2],[-9,2],[-17,-2],[-24,-31],[-11,-7],[-5,-1],[-6,1],[-4,0],[-4,2],[-4,1],[-2,2],[-2,2],[-7,9],[-3,1],[-5,2],[-10,2],[-8,-1],[-5,-2],[-2,-2],[-1,-2],[-3,-3],[-2,-4],[-15,-13],[-26,-14],[-11,-13],[-7,-11],[-2,-7],[0,-5],[2,-3],[2,-2],[14,-8],[3,-4],[2,-5],[0,-11],[-2,-5],[-9,-7],[-1,-4],[0,-6],[-2,-4],[-4,-2],[-17,-5],[-5,-2],[-5,-2],[-7,-5],[-2,-4],[0,-4],[8,-11]],[[6600,4033],[-26,-10],[-10,-6],[-5,-1],[-19,-4],[-12,-4],[-3,-2],[-4,-2],[-4,-2],[-6,1],[-1,4],[0,3],[2,3],[-1,2],[-4,2],[-12,3],[-5,3],[-4,2],[0,1],[-2,3],[-1,1],[-1,1],[-5,1],[-8,0],[-18,-1],[-8,-2],[-2,-3],[-1,-2],[-1,-2],[-19,-4],[-129,-21],[-33,10],[-14,1],[-10,-1],[-3,-1],[-3,-3],[-3,-7],[-2,-3],[-4,-2],[-4,-1],[-14,-2],[-8,-2],[-7,1],[-8,4],[-17,11],[-10,4],[-7,4],[-2,3],[-1,19],[-2,11],[-2,3],[-3,3],[-7,3],[-6,0],[-4,-1],[-4,-2],[-5,1],[-6,2],[-8,7],[-11,7],[-11,3],[-2,7],[-1,5],[3,43],[6,4],[10,5],[3,3],[1,3],[-1,2],[0,1],[-2,4],[-10,13],[-18,4],[-70,3],[-10,-9],[-8,-2],[-6,-3],[-3,-5],[-1,-3],[-1,-2],[1,-2],[-1,-2],[0,-2],[-4,-3],[-22,-11],[-21,-4],[-31,-11],[6,-14],[3,-6],[0,-3],[0,-3],[-2,-4],[1,-6],[2,-4],[2,-3],[1,-4],[2,-7],[0,-3],[0,-5],[-3,-22],[0,-5],[1,-3],[4,-6],[1,-3],[0,-6],[1,-3],[1,-4],[8,-7],[2,-3],[1,-3],[1,-4],[0,-3],[0,-3],[1,-3],[2,-6],[-1,-2],[-1,-2],[-8,-2],[-3,-1],[0,-2],[1,-6],[1,-4],[0,-3],[-1,-4],[-10,-16],[-1,-6],[0,-5],[6,-8],[1,-4],[0,-4],[-2,-5],[-6,-8],[-2,-5],[-2,-3],[2,-10],[0,-3],[0,-2],[-1,-3],[-5,-1],[-8,-1],[-24,6],[-6,2],[-10,8],[-5,-3],[-11,-15],[-54,38],[-8,11],[21,18],[2,2],[0,2],[0,3],[-2,3],[-1,3],[-5,5],[-4,5],[-9,11],[-3,2],[-4,2],[-7,-1],[-4,1],[-3,6],[-3,8],[-3,1],[-5,0],[-11,-2],[-5,-3],[-3,-3],[-3,-3],[-3,-2],[-4,-2],[-14,-1],[-5,-1],[-16,-5],[-4,0],[-4,2],[-6,7],[-5,5],[-8,3],[-30,3],[-2,0],[-2,-1],[-1,-10],[-1,-2],[-2,-2],[-2,-2],[-7,3],[-4,4],[-38,41],[-8,1],[-9,0],[-27,-8],[-4,0],[-4,0],[-2,1],[-3,2],[-2,2],[-2,3],[-2,3],[-3,2],[-3,2],[-3,1],[-3,0],[-3,-1],[-5,-3],[-8,-3],[-21,3],[-4,0],[-4,-1],[-14,-8],[-3,-1],[-8,-2],[-4,0],[-3,1],[-10,4],[-2,0],[-4,0],[-5,-2],[-5,-4],[-16,-20],[-2,-3],[-3,-4],[-3,-3],[-4,-2],[-3,1],[-3,0],[-15,5],[-5,0],[-4,0],[-5,-5],[-4,-7],[-5,-30],[1,-8],[5,-5],[4,-3],[4,-2],[12,-5],[13,-6],[2,-1],[13,-12],[3,-2],[3,-2],[5,-1],[5,0],[19,1],[4,-1],[3,-2],[3,-2],[2,-7],[2,-3],[2,-3],[3,-2],[4,-1],[4,-2],[19,-4],[4,-2],[2,-2],[2,-3],[2,-7],[1,-4],[0,-4],[0,-4],[-2,-6],[-3,-3],[-3,-3],[-5,-1],[-7,0],[-14,2],[-15,6],[-5,1],[-34,-6],[-9,0],[-6,0],[-4,3],[-3,2],[-4,1],[-5,0],[-8,-7],[-5,-27],[0,-10],[0,-4],[-2,-3],[-5,-1],[-7,1],[-15,7],[-14,8],[-27,6],[-49,0],[-9,8],[-5,6],[-1,3],[0,3],[3,4],[1,4],[0,5],[-10,14],[-4,8],[-1,5],[2,6],[2,4],[1,7],[2,4],[0,6],[-1,8],[-5,16],[-2,9],[0,6],[-2,4],[-3,4],[-15,6],[-10,8],[-14,24],[-18,-2],[-7,-5],[-4,-1],[-5,-1],[-9,2],[-14,0],[-3,2],[-2,2],[1,4],[-1,4],[-3,4],[-29,19],[-6,5],[-3,4],[-4,6],[-1,3],[-1,4],[-3,2],[-8,-2],[-9,-3],[-10,-1],[-21,2],[-5,2],[-4,2],[-5,8],[-1,4],[2,4],[5,5],[3,2],[1,3],[-3,4],[-29,18],[-4,4],[-5,5],[-5,5],[-5,5],[-15,9],[-3,3],[-2,4],[0,4],[1,7],[0,4],[-1,3],[-4,7],[-1,3],[-5,4],[-10,4],[-88,23],[-7,3],[-4,4],[-2,7],[-4,9],[-2,8],[-2,3],[-4,3],[-7,4],[-4,3],[-2,3],[-6,2],[-10,1],[-53,-4],[-6,1],[-5,2],[-1,3],[-1,3],[0,4],[0,3],[0,4],[-2,2],[-18,-10],[-59,-50]],[[5283,5601],[18,-8],[98,2],[7,-1],[10,-3],[23,-12],[9,-3],[5,-1],[28,1],[13,-10],[36,-11],[15,-1],[5,-2],[4,-5],[5,-11],[2,-7],[0,-5],[-5,-4],[-5,-2],[-5,0],[-4,1],[-8,3],[-4,1],[-5,0],[-4,-2],[-3,-2],[-1,-3],[0,-7],[4,-10],[12,-23],[7,-9],[6,-6],[3,-1],[4,-2],[2,-4],[1,-5],[-3,-21],[1,-3],[1,-4],[2,-5],[13,-20],[11,-10],[1,-4],[0,-5],[-6,-24],[-2,-10],[0,-10],[9,-13],[29,-12],[169,-15],[46,1],[101,-11],[29,-8],[57,-33],[29,-41],[63,-69],[-9,-16],[-10,-11],[-13,-9],[-28,-11],[-49,-6],[-6,-2],[-7,-5],[-3,-4],[-5,-7],[4,-6],[9,-9],[24,-12],[24,-7],[11,-9],[23,-29],[6,-17],[1,-4],[1,-6],[1,-7],[-1,-6],[-1,-2],[-4,-2],[-4,0],[-2,-2],[-1,-3],[4,-14],[4,-9],[2,-3],[2,-4],[3,-2],[4,-2],[12,-4],[6,-2],[59,-2],[5,1],[4,1],[3,2],[10,6],[7,3],[5,1],[50,-5],[29,1],[21,-2],[8,1],[9,3],[22,4],[5,-1],[7,-2],[17,-9],[5,-5],[2,-6],[0,-12],[2,-13],[9,-12],[3,-10],[6,-6],[7,-8],[1,-3],[3,-11],[2,-3],[2,-3],[5,-4],[7,-3],[8,-3],[14,8],[88,5],[10,2],[13,-2],[23,-14],[54,-18],[9,-6],[7,-5],[5,-9],[1,-6],[6,-5],[4,-4],[35,-14],[2,-8],[1,-3],[3,-2],[7,-1],[37,4],[19,4],[4,2],[9,-1],[57,-14],[6,-1],[6,1],[10,5],[9,6],[5,0],[7,-2],[19,-15],[9,-4],[8,-11],[9,-1],[19,12],[-4,11],[2,11],[31,29],[7,7],[26,35],[1,4],[-1,5],[-5,8],[-5,4],[-4,3],[-18,6],[-2,4],[0,8],[5,18],[18,23],[1,2],[-2,10]],[[4265,8052],[60,-9],[15,4],[-14,17],[-41,16],[-45,4]],[[4240,8084],[9,25],[2,8],[1,8],[1,4],[1,3],[3,2],[4,3],[4,3],[1,3],[2,10],[2,4],[4,0],[5,0],[13,-2],[9,-4],[2,-2],[9,-4],[4,-3],[0,-3],[-3,-12],[-1,-5],[-1,-4],[1,-3],[1,-1],[2,-1],[1,-1],[2,-1],[4,-1],[14,6],[107,62],[28,6],[30,-5],[5,0],[6,2],[4,4],[11,20],[5,5],[6,3],[13,3],[8,1],[6,0],[15,-2],[8,4],[6,4],[14,41],[4,4],[5,4],[2,1],[2,0],[3,0],[54,-8],[6,0],[6,3],[19,12],[7,2],[5,1],[6,0],[5,-1],[2,-2],[1,-4],[-2,-6],[-2,-3],[-12,-12],[-11,-16],[-5,-8],[-1,-3],[2,-4],[3,-4],[39,-20],[1,-1],[1,-7],[0,-8],[3,-7],[6,-4],[4,-2],[3,-3],[2,-6],[-2,-9],[-1,-4],[-4,-7],[-2,-5],[-2,-16],[-1,-17],[-1,-3],[-1,-2],[-2,-2],[-3,-1],[-11,-4],[-19,-3],[-3,-1],[-3,-2],[0,-5],[2,-5],[7,-21],[1,-12],[0,-8],[1,-7],[4,-5],[12,-4],[18,-4],[10,-7],[27,-32],[24,-9],[9,-5],[38,-29],[2,1],[4,0],[2,0],[3,-7],[5,-23]],[[3093,8694],[-3,-8],[-14,4],[-11,11],[-4,8],[-1,6],[4,11],[4,4],[9,5],[8,0],[1,-6],[-1,-6],[1,-6],[5,-5],[6,-3],[0,-4],[-3,-6],[-1,-5]],[[2237,8864],[-5,-3],[-2,5],[-4,1],[-4,6],[-5,4],[-6,4],[16,1],[6,-5],[4,-13]],[[2269,8876],[-17,-4],[-6,7],[19,4],[4,-7]],[[3310,9233],[-47,-2],[-23,5],[-12,15],[12,4],[2,7],[-5,8],[-9,6],[35,23],[38,12],[43,2],[48,-9],[-5,-1],[-2,-4],[-1,-6],[1,-7],[-20,-13],[-14,-16],[-15,-15],[-26,-9]],[[5892,9246],[64,-83],[-137,16],[-20,-8],[5,-5],[4,-2],[-43,-2],[-29,3],[-12,11],[2,26],[-5,10],[-16,4],[-28,0],[-12,-2],[-8,-8],[-8,0],[-4,10],[-4,5],[-6,0],[-13,-5],[-3,17],[31,52],[43,29],[52,6],[93,-28],[28,-16],[9,-8],[17,-22]],[[3072,9276],[-31,-12],[-24,0],[-14,9],[-11,18],[6,21],[20,10],[8,3],[8,3],[70,21],[2,-14],[-9,-31],[-25,-28]],[[2735,9543],[-2,-1],[-3,0],[-3,-1],[-12,-9],[-11,-10],[55,-70],[20,-8],[-14,-8],[-38,-10],[-25,16],[-21,26],[-21,20],[31,41],[20,14],[24,6],[0,-6]],[[2968,9523],[-9,-9],[-15,-3],[-19,2],[-16,4],[-10,5],[-28,-7],[-35,7],[-64,27],[21,27],[25,17],[30,8],[36,2],[61,-3],[25,-10],[19,-23],[0,-9],[-9,-10],[-12,-25]],[[5511,8583],[-2,-5],[0,-34],[3,-4],[4,-4],[5,-3],[3,-2],[2,-1],[44,-9],[1,-2],[-1,0],[-2,-1],[-2,0],[-2,-2],[-5,-2],[-6,-3],[-30,-4],[-5,0],[-1,0],[-1,1],[-2,1],[-3,2],[-1,2],[1,2],[1,3],[1,2],[0,2],[-1,2],[-13,3],[-4,1],[-3,1],[-4,0],[-26,-12],[-54,-35],[-21,-10],[-22,-7],[-6,-3],[-4,-3],[-8,-14],[-2,-3],[-3,-11],[0,-3],[0,-2],[0,-3],[2,-3],[9,-15],[1,-4],[3,-11],[3,-8],[3,-15],[-1,-14],[-2,-10],[-10,-29],[-1,-3],[1,-2],[2,-2],[10,-1],[9,0],[31,-6],[4,-2],[8,-8],[8,-10],[24,-22],[12,-7],[8,-4],[15,3],[8,0],[10,-1],[21,-6],[12,-5],[14,-10],[5,-6],[3,-4],[0,-4],[-1,-3],[1,-4],[1,-5],[9,-12],[1,-3],[1,-3],[-1,-4],[0,-4],[0,-3],[0,-4],[-1,-3],[-2,-3],[-6,-4],[-8,-3],[0,-22],[14,-35],[1,-8],[-1,-6],[-4,-2],[-8,-3],[1,-1],[9,-1],[3,-2],[-1,-2],[-4,-3],[-6,-3],[-6,-10],[-5,-3],[-5,-2],[-4,2],[-2,2],[-1,4],[-1,7],[-1,4],[-2,3],[-2,3],[-3,2],[-3,2],[-4,2],[-5,0],[-50,-6],[-5,1],[-4,1],[-9,3],[-9,0],[-4,-2],[-1,-4],[0,-3],[3,-11],[2,-7],[0,-4],[-1,-5],[-7,-12],[-2,-4],[0,-4],[-2,-7],[-1,-4],[2,-4],[-3,-2],[-17,-7],[-48,-27],[-6,-2],[-11,-1],[-21,-6],[-19,-2],[-4,-3],[-3,-2],[-4,-8],[-1,-5],[-3,-7],[-4,-3],[-5,-1],[-13,3],[-6,0],[-8,-2],[-16,-5],[-7,-4],[-4,-4],[-1,-3],[-9,-41],[-1,-8],[0,-4],[1,-3],[-2,-6],[-4,-8],[-11,-13],[-12,-12]],[[4240,8084],[-53,4],[-40,11],[-78,36],[-36,29],[-13,40],[-3,35],[-4,23],[-11,7],[-52,20],[-16,4],[-27,17],[-25,38],[-17,42],[-2,26],[-40,10],[-68,42],[-42,18],[-40,6],[-139,2],[-41,14],[-28,5],[-13,-5],[-11,-14],[-26,6],[-38,21],[-36,31],[-91,127],[42,14],[21,1],[26,-5],[43,-20],[23,-6],[24,8],[9,14],[8,26],[6,27],[0,20],[-12,13],[-21,13],[-15,13],[3,14],[0,8],[-26,6],[-38,-5],[-36,-12],[-19,-15],[-8,0],[-30,36],[-19,29],[-3,6],[9,26],[17,22],[11,20],[-8,19],[0,9],[14,7],[46,9],[19,2],[11,6],[17,16],[17,20],[11,20],[-25,-4],[-41,-24],[-23,-7],[2,4],[3,9],[2,4],[-33,-2],[-57,-13],[-33,-2],[-39,4],[-17,-4],[-37,-24],[-12,-3],[-29,7],[-31,19],[-23,29],[-3,33],[15,13],[30,10],[34,4],[25,-1],[0,9],[-19,3],[-15,10],[-15,3],[-17,-16],[-9,14],[3,15],[10,13],[11,11],[23,-7],[89,16],[119,0],[28,5],[23,10],[46,28],[42,14],[18,10],[8,21],[0,31],[-28,29],[-89,66],[-13,14],[-5,13],[-10,6],[-22,0],[-23,-5],[-13,-5],[-7,9],[37,18],[-38,70],[-14,17],[-31,14],[-59,35],[-37,13],[0,8],[6,24],[-14,26],[-21,25],[-15,23],[-6,33],[5,30],[14,37],[39,-8],[40,-1],[74,19],[26,2],[87,-10],[85,-24],[232,-37],[18,-11],[5,-13],[3,-18],[8,-15],[19,-5],[80,0],[16,2],[11,7],[15,3],[12,7],[20,3],[22,-14],[19,-1],[16,4],[15,0],[65,22],[21,18],[27,7],[13,17],[15,8],[3,-47],[53,-13],[67,-2],[45,-14],[19,-10],[29,-8],[26,-13],[11,-22],[12,-12],[29,3],[50,13],[-5,27],[26,1],[35,-15],[25,-21],[15,-44],[7,-10],[10,-10],[21,-15],[-14,-7],[-15,1],[-13,4],[-11,2],[1,-3],[-27,-15],[-3,0],[-7,-3],[-5,0],[-3,-2],[0,-12],[16,-1],[28,6],[29,1],[16,-15],[12,7],[12,1],[6,-8],[-8,-18],[6,-18],[1,-25],[-7,-54],[-5,-22],[-7,-18],[-11,-15],[-14,-14],[-35,-22],[-44,-17],[-47,-11],[-46,-3],[0,-9],[47,-17],[264,43],[20,-5],[66,-39],[-22,-15],[0,-14],[9,-16],[6,-21],[-7,-17],[-15,-16],[-20,-11],[-19,-4],[3,-3],[4,-2],[0,-4],[-7,-9],[12,-8],[3,-11],[-4,-12],[-11,-13],[24,7],[18,15],[26,40],[14,42],[8,11],[11,5],[41,3],[15,6],[8,7],[5,7],[10,7],[13,3],[46,-3],[24,-8],[66,-36],[172,-53],[97,-63],[45,-8],[50,7],[37,15],[62,40],[36,16],[38,11],[91,8],[0,-8],[-20,-1],[-27,0],[19,-6],[19,4],[25,-12],[77,32],[34,-9],[-41,-31],[-11,-12],[-7,3],[-16,5],[12,-21],[10,-51],[8,-24],[-8,-16],[1,-22],[7,-37],[-5,-22],[-10,-12],[-10,-8],[-5,-11],[-127,-57],[-44,-39],[-19,-8],[-44,-11],[-8,1],[-10,-6],[-7,3],[-8,6],[-9,1],[-9,-4],[-4,-3],[-42,-46],[-12,-8],[0,-8],[15,-25],[16,-19],[21,-12],[29,-7],[43,3],[10,-3],[8,-13],[1,-15],[4,-12],[16,-3],[5,0]],[[2765,9780],[53,-9],[237,8],[-27,-15],[-136,5],[-17,-6],[-30,-16],[-17,-3],[-75,0],[-7,2],[-9,11],[-10,3],[-10,0],[-7,-2],[-33,-16],[-6,-3],[-3,-9],[-1,-26],[-4,-5],[4,-70],[-3,-23],[-5,-18],[-7,-3],[-7,18],[-1,34],[12,139],[11,27],[82,157],[46,39],[52,-19],[-66,-2],[-9,-7],[30,-2],[9,-15],[-10,-18],[-44,-17],[-20,-21],[-12,-25],[10,-24],[-7,-46],[37,-23]],[[2560,2164],[0,1],[-12,9],[-108,17],[-172,72],[-20,1],[-62,-5],[-91,21],[-12,-3],[-26,-11],[-13,-2],[-10,1],[-24,6],[-12,2],[-13,-2],[-13,-5],[-13,-2],[-4,1],[-11,1],[-10,7],[-11,17],[-8,7],[-24,10],[-48,7],[-24,11],[-14,14],[-25,31],[-15,13],[2,4],[3,3],[8,4],[-8,18],[-19,6],[-47,2],[-5,15],[-21,1],[-21,-5]],[[1657,2431],[-1,1],[-2,3],[-22,-1],[-21,14],[-38,33],[-1,3],[-2,12],[-2,8],[-4,10],[0,6],[2,6],[6,11],[2,2],[1,0],[4,1],[2,0],[2,-1],[1,0],[1,0],[2,0],[4,0],[3,1],[3,1],[2,1],[2,2],[3,3],[7,10],[4,10],[1,9],[1,5],[2,4],[3,3],[3,3],[8,5],[3,4],[2,5],[2,14],[2,4],[5,4],[13,7],[4,4],[4,4],[6,8],[0,5],[-1,4],[-4,6],[1,4],[1,3],[6,9],[-6,11],[-10,5],[-27,8],[-54,7],[-11,5],[2,3],[1,2],[1,1],[1,1],[-3,5],[-18,18],[-27,24],[-6,19],[5,7],[4,0],[6,4],[21,21],[9,6],[8,4],[11,4],[4,5],[0,6],[-1,9],[-1,4],[-1,3],[-2,1],[-5,0],[-4,1],[-3,3],[-1,7],[0,17],[-1,11],[-13,19],[-7,17],[0,19],[-3,1],[-3,1],[-6,-3],[-7,-5],[-9,-5],[-10,-3],[-21,-3],[-11,1],[-7,1],[-3,3],[-3,3],[-41,22],[-23,18],[-6,1],[-66,2],[-8,2],[-5,3],[-67,28],[-22,-12],[-8,-1],[-10,6],[-15,5],[-7,0],[-6,-1],[-84,-41],[-160,-57],[-17,-3],[-4,0],[-26,2],[-70,-25],[-126,5],[-145,-10],[-9,-1]],[[541,2892],[2,12],[0,41],[7,14],[16,20],[28,26],[11,18],[9,9],[3,6],[-1,8],[-7,5],[-7,4],[-2,4],[17,18],[80,40],[-2,3],[-8,6],[4,7],[5,1],[10,-2],[-8,8],[-5,9],[-3,10],[1,12],[11,7],[0,5],[-3,6],[0,9],[6,27],[1,1],[0,11],[3,2],[-6,5],[-4,0],[-34,7],[-52,0],[-19,4],[-19,9],[-31,23],[-18,9],[-10,0],[-16,-8],[-9,1],[-1,4],[-7,14],[-4,9],[-5,7],[-16,7],[-37,13],[-17,13],[-36,66],[-19,23],[-12,-18],[-8,11],[-17,36],[-19,22],[-4,10],[3,15],[-7,26],[-7,11],[-12,5],[10,15],[4,4],[-2,1],[-7,-1],[-2,1],[7,36],[5,18],[8,18],[10,9],[3,9],[-4,8],[-11,6],[3,7],[3,14],[2,4],[10,5],[21,1],[8,4],[7,12],[1,15],[-6,14],[-15,12],[11,12],[25,13],[11,12],[22,8],[47,10],[20,14],[-5,11],[3,13],[7,13],[11,10],[14,6],[13,-1],[12,-3],[15,-2],[29,4],[13,11],[-1,9]],[[1657,2431],[-5,-1],[-18,-8],[-5,-6],[-8,-19],[-5,-7],[-9,-3],[-22,-2],[-10,-3],[-7,-6],[-11,-18],[-7,-5],[-6,0],[-30,11],[-94,1],[-17,4],[-17,7],[-42,24],[-6,0],[-10,-7],[1,-8],[4,-6],[-2,-7],[-33,-16],[-24,15],[-13,35],[1,45],[-24,1],[-68,30],[-12,1],[-32,-2],[-45,8],[-11,-2],[-7,-18],[9,-21],[4,-21],[-19,-20],[-14,-2],[-42,12],[-49,0],[-13,5],[-14,18],[3,15],[6,17],[-7,20],[-4,0],[-15,-7],[-5,-1],[-3,5],[-2,10],[-1,3],[-4,5],[-8,24],[-5,4],[-15,4],[-6,3],[-1,5],[2,13],[-2,6],[-72,54],[-18,17],[-7,15],[6,11],[19,1],[5,10],[-4,8],[-53,43],[-7,9],[2,0],[0,8],[-3,10],[-7,11],[-19,14],[-100,38],[-12,2],[-9,-3],[-21,-11],[-11,-2],[-10,1],[0,10],[-3,38],[7,42]],[[6600,4033],[29,3],[10,-3],[3,-6],[2,-2],[3,-2],[2,-2],[11,-15],[23,-11],[4,-6],[-2,-2],[-1,-5],[0,-5],[4,-25],[4,-3],[10,-4],[45,-22],[4,-2],[5,-1],[4,0],[15,1],[31,-6],[8,-11]],[[6814,3904],[-27,1],[25,-20],[9,-11],[4,-18],[-2,-17],[-8,-6],[-11,-5],[-14,-16],[12,-15],[53,-25],[27,-23],[12,-14],[9,-15],[3,-19],[-8,-30],[1,-19],[9,-19],[16,-11],[17,-8],[16,-10],[10,-13],[2,-13],[0,-11],[4,-9],[165,-66],[1,0],[17,-13],[40,-3],[18,-13],[3,-19],[-8,-17],[-1,-14],[45,-20],[15,-5],[7,-9],[-3,-25],[-9,-20],[-25,-35],[-8,-20],[-22,5],[-7,-18],[0,-27],[-4,-21],[-17,-13],[-45,-15],[-13,-19],[5,-14],[12,-16],[22,-25],[16,-11],[16,-8],[37,-14],[15,-6],[9,-13],[1,-17],[-10,-16],[3,-2],[9,-3],[-5,-10],[-1,-3],[11,-10],[26,-11],[12,-10],[7,-14],[5,-28],[5,-15],[7,-16],[7,-11],[8,-10],[12,-9],[12,-3],[12,1],[8,-5],[1,-22],[4,-42],[5,-21],[12,-18],[22,-14],[50,-18],[22,-17],[36,-62],[17,-13],[21,-6],[65,-8],[20,2],[-5,17],[15,4],[42,-9],[18,-8],[16,-10],[31,-25],[19,-6],[6,-10],[1,-13],[5,-12],[35,-31],[0,-1],[14,-5],[102,-107],[14,-26],[18,-21],[31,-14],[66,-3],[21,-6],[14,-9],[33,-34],[46,-37],[12,-22],[1,-36],[16,-20],[31,-22],[34,-20],[26,-9],[11,22],[11,14],[15,6],[7,-1],[18,-3],[19,-9],[18,-12],[19,-8],[20,2],[2,-24],[12,-24],[17,-20],[19,-14],[20,-8],[41,-5],[15,-6],[26,-31],[52,-82],[22,-17],[-33,-53],[-2,-12],[5,1],[12,-18],[5,-3],[14,-6],[-15,-10],[-3,-16],[6,-41],[-1,-22],[-3,-18],[-7,-17],[-18,-32],[-6,-6],[-9,-7],[-8,-3],[-23,-2],[-4,0],[-9,-14],[-10,-35],[-2,2],[-45,16],[-16,20],[-18,10],[-19,8],[-113,25],[-37,-4],[-35,-10],[-10,-7],[-6,-9],[1,-5],[3,-6],[4,-23],[10,-12],[3,-11],[-3,-13],[-15,-24],[-5,-12],[-2,-12],[2,-36],[-2,-14],[-5,-8],[-5,-7],[-2,-7],[-6,-27],[-16,-20],[-106,-73],[-37,-16],[-150,-21],[-113,-35],[-18,-10],[-40,-30],[-36,-16],[-16,-10],[1,-3],[-60,-10],[-17,-7],[-10,-8],[-20,-25],[-14,-13],[-43,-24],[-5,-4],[-15,-19],[-7,-3],[-7,1],[-7,-2],[-7,-9],[-2,-18],[6,-17],[9,-15],[11,-13],[76,-63],[17,-29],[3,-14],[0,-1],[6,-14],[9,-10],[26,-12],[22,-18],[9,-4],[18,-14],[37,-68],[23,-28],[5,-4],[-70,-90],[-6,-10],[-2,-8],[0,-8],[-2,-8],[-7,-10],[-21,-25],[18,-14],[61,-9],[16,2],[28,10],[17,-2],[13,-8],[14,-13],[21,-29],[9,-19],[3,-16],[-1,-16],[-2,-15],[-3,-3],[-13,-26],[-1,-3],[-17,-18],[-3,0],[1,-29],[2,1],[-1,-2],[-11,-21],[-2,-3],[0,-22],[1,-8],[2,-7],[4,-7],[2,-8],[1,-10],[-31,-30],[-8,-5],[-12,0],[-6,3],[-6,5],[-11,4],[-11,0],[-9,-4],[-10,-2],[-12,4],[-53,32],[-50,44],[-9,5],[-10,3],[-17,3],[-27,17],[-6,32],[14,29],[29,12],[-21,17],[-29,15],[-17,16],[12,23],[-19,-2],[-61,12],[-39,0],[-39,-7],[-21,-8],[-38,-28],[-10,-7],[-17,-6],[-23,-3],[-23,0],[-15,6],[-33,21],[-8,8],[-6,11],[-12,27],[-5,7],[-18,3],[-43,-13],[-18,-2],[-63,10],[-24,-2],[-24,-10],[-12,-2],[-11,8],[-6,14],[4,9],[7,8],[4,10],[2,13],[4,6],[-3,0],[-16,-6],[-9,-4],[-27,-18],[-17,-5],[2,-11],[4,-7],[8,-8],[9,-7],[5,-3],[3,-7],[2,-35],[-1,-12],[-4,-8],[-31,-32],[-9,-1],[-250,9],[-92,-15],[-12,-6],[-11,-22],[-11,-3],[-62,10],[-89,1],[-47,7],[-20,1],[-4,-4],[-30,-21],[-8,-14],[-8,-29],[-6,-12],[-20,-18],[-23,-7],[-52,-7],[-24,6],[-27,3],[-25,-5],[-51,-47],[13,-3],[12,-6],[4,-9],[-9,-13],[-18,-6],[-47,-1],[-21,-5],[-21,-16],[-14,-15],[-16,-14],[-23,-8],[-27,2],[3,35],[-24,7],[-27,-6],[-71,-39],[-22,-5],[-113,1],[-15,7],[-12,18],[3,0],[3,6],[3,9],[0,8],[-4,6],[-54,47],[-56,21],[-8,10],[35,19],[10,9],[-25,15],[-12,5],[-15,1],[-16,-4],[-44,-16],[-32,-3],[-9,2],[-6,6],[-3,7],[-5,4],[-143,44],[-27,0],[-15,-9],[-22,-24],[-14,-9],[-13,-2],[-46,6],[-17,6],[-9,5],[-6,6],[-2,11],[4,8],[6,6],[1,5],[-5,12],[-4,3],[-8,-3],[-18,-3],[-17,-5],[2,-11],[9,-14],[8,-14],[-2,-12],[-11,-51],[16,-7],[9,-8],[6,-12],[4,-15],[1,-28],[-10,-29],[-16,-26],[-18,-19],[-10,-5],[-23,-6],[-11,-6],[-7,-9],[-24,-38],[-19,-22],[-22,-15],[-49,-24],[-23,-8],[-71,-6],[-16,-2],[-5,2],[5,8],[10,15],[4,2],[14,4],[6,4],[2,8],[0,8],[-3,8],[20,48],[1,23],[-20,9],[-48,-7],[-13,-12],[-5,-3],[-5,0],[-12,6],[-5,1],[-14,-6],[-9,-5],[-7,0],[-11,8],[-5,12],[-1,14],[-3,13],[-12,12],[25,15],[5,13],[-10,16],[-54,62],[-12,-4],[-10,-7],[-9,-3],[-12,5],[-2,8],[0,4],[0,4],[-10,17],[-14,11],[-11,12],[-3,21],[-13,-8],[-17,-3],[-32,2],[-33,10],[-6,-2],[-13,-6],[-9,-1],[-22,9],[-4,14],[2,15],[-4,16],[-12,11],[-16,4],[-16,-1],[-16,-7],[-24,-22],[-13,-23],[-16,-20],[-30,-11],[-70,-1],[-64,14]],[[8477,6691],[42,4],[14,-6],[20,-18],[44,-15],[7,-4],[9,-8],[0,-4],[-2,-3],[-7,-4],[-3,-3],[-2,-4],[0,-4],[0,-8],[-2,-5],[-2,-4],[-20,-12],[-4,-3],[-4,-4],[-5,-9],[0,-8],[3,-11],[0,-6],[-2,-5],[-2,-3],[-2,-3],[-2,-1],[-2,-1],[-2,-1],[-25,-6],[-2,-1],[-5,-3],[-14,-22],[-10,-1],[-1,2],[-1,2],[0,3],[-2,17],[-4,20],[-5,7],[-7,4],[-12,-1],[-6,0],[-27,6],[-21,9],[-41,12],[-9,0],[-6,-2],[-3,-2],[-3,-2],[-3,-2],[-3,-1],[-9,0],[-12,1],[-5,2],[-4,4],[-3,5],[-6,8],[-5,3],[-5,1],[-10,-1],[-17,-4],[-4,-2],[-3,-2],[-3,-3],[-1,-4],[1,-3],[0,-4],[3,-6],[0,-4],[0,-4],[-2,-9],[-34,1],[-20,6],[-5,4],[-6,8],[-12,8],[-6,5],[-4,2],[-10,-2],[-26,-7],[-4,1],[-5,2],[-6,10],[-3,5],[-2,1],[-2,0],[-1,-1],[-6,-3],[-30,-8],[-7,-1],[-4,0],[-10,8],[-14,6],[-7,2],[-7,0],[-45,-16],[-3,-2],[-3,-2],[-4,-5],[-4,-1],[-3,0],[-38,5],[-4,1],[-7,3],[-18,10],[-3,2],[-1,0],[0,1],[0,1],[0,2],[2,3],[10,9],[2,1],[1,2],[0,2],[0,3],[2,3],[3,3],[3,2],[4,3],[1,1],[-6,7],[-1,4],[-2,7],[0,4],[2,8],[2,8],[2,3],[2,3],[3,2],[8,3],[3,2],[30,25],[0,4],[0,4],[-17,22],[2,36],[5,18],[1,12],[-1,7],[-3,5],[1,4],[1,3],[2,3],[4,7],[3,2],[3,1],[8,-3],[46,-15],[11,1],[0,3],[-1,2],[-2,2],[-3,4],[-2,3],[-1,3],[0,4],[1,4],[1,4],[11,21],[3,1],[32,4],[9,4],[12,8],[5,6],[3,5],[3,8],[4,2],[3,2],[13,-1],[2,-1],[-1,-1],[-1,-2],[-1,-3],[3,-5],[1,-4],[0,-11],[1,-3],[3,-3],[3,-2],[18,-5],[41,-2],[11,1],[6,2],[3,3],[1,3],[6,8],[25,15],[21,-10],[3,0],[5,1],[2,3],[3,4],[2,3],[26,18],[6,0],[3,-3],[3,-5],[4,-4],[18,-12],[2,-2],[1,-3],[0,-3],[-2,-12],[-2,-7],[0,-6],[1,-7],[1,-1],[3,-4],[72,-60],[23,-13],[14,-3],[9,-7],[16,-5],[23,-3],[1,-9],[-25,-43],[-2,-10],[3,-5]],[[7861,5573],[-19,3],[-23,18],[-8,4],[-7,2],[-8,-2],[-5,-2],[-7,-5],[-14,-2],[-15,13],[-24,9],[-14,2],[-16,4],[-14,7],[-12,19],[-31,-2],[-10,-11],[-57,-35],[-21,-7],[-32,10],[-40,4],[-16,-6],[-11,-14],[-9,-12],[-8,-7],[-14,-8],[-8,-1],[-5,1],[-2,3],[-3,2],[-5,2],[-105,-14],[-14,8],[-80,3],[-7,-1],[-10,-3],[-4,-24],[-2,-5],[-3,-6],[-5,-2],[-81,-6],[-55,-20],[-9,-1],[-33,3],[-16,4],[-11,5],[-8,2],[-3,-2],[-2,-3],[-1,-5],[-2,-7],[-2,-3],[-1,-3],[-3,-2],[-29,-18],[0,-60],[-5,-15],[-4,-2],[-4,-2],[-2,-2],[-7,-8],[-3,-3],[-12,-6],[-5,-4],[-1,-4],[1,-4],[1,-3],[0,-16],[1,-3],[1,-3],[3,-3],[5,-9],[4,-29],[-1,-21],[1,-4],[3,-6],[5,-7],[7,-14],[2,-10],[-1,-9],[-1,-7],[-2,-4],[-1,-4],[-3,-2],[-3,-2],[-4,-1],[-16,-1],[-6,-3],[-7,-5],[-10,-14],[-4,-8],[-1,-6],[0,-4],[1,-2],[0,-2],[2,-3],[2,-3],[4,-9],[1,-27],[21,-21],[4,-13],[4,-37],[-1,-4],[-1,-3],[-2,-4],[-1,-3],[-5,-5],[-7,-6],[1,-10],[10,-3],[23,-5],[-5,-35],[11,-15],[19,-13],[5,-4],[1,-6],[0,-5],[3,-11],[4,-4],[4,-3],[46,-7]],[[6247,7404],[48,10],[11,-5],[1,-9],[0,-3],[-6,-12],[-9,-7],[15,-5],[36,-1],[12,-7],[8,-16],[2,-12],[5,-8],[19,-3],[11,3],[28,12],[17,2],[33,-36],[15,-8],[35,-2],[13,-5],[-6,-15],[-13,-14],[-2,-6],[71,-34],[11,-2],[20,-2],[14,-4],[30,-13],[19,-3],[16,5],[27,0],[77,6],[4,0],[4,-2],[7,-6],[4,-5],[2,-4],[-1,-15],[16,-1],[11,0],[38,8],[4,1],[5,-1],[14,-5],[12,-3],[6,-5],[6,-9],[21,-49],[1,-9],[-5,-14],[-36,-21],[-2,-4],[-1,-5],[3,-9],[3,-5],[4,-4],[4,-4],[2,-4],[0,-4],[-4,-4],[-10,-7],[-5,-5],[-1,-4],[0,-4],[3,-6],[4,-4],[5,-6],[3,-4],[2,-6],[2,-9],[3,-4],[3,-3],[11,-6],[3,-3],[2,-4],[0,-11],[-2,-12],[-11,-24],[-7,-10],[-5,-6],[-11,-5],[-10,-2],[-21,1],[-5,0],[-3,-8],[-2,-13],[-2,-30],[-3,-13],[-2,-8],[-29,-32],[-1,-3],[1,-3],[6,-1],[6,0],[10,1],[11,1],[5,-1],[3,-2],[1,-3],[-4,-5],[-4,-3],[-3,-2],[-6,-5],[-1,-4],[0,-5],[2,-6],[2,-4],[3,-4],[4,-2],[13,-2],[16,2],[8,3],[3,1],[3,3],[3,2],[2,3],[2,3],[3,12],[1,3],[3,3],[4,1],[5,0],[6,-2],[8,-5],[6,-5],[16,-20],[7,-4],[5,-1],[4,2],[4,0],[4,0],[5,0],[4,0],[4,1],[8,3],[3,0],[1,-2],[-4,-8],[-3,-5],[-1,-9],[2,-10],[-1,-5],[-2,-4],[-12,-16],[-10,-20],[-7,-7],[-12,-6],[-1,-2],[-1,-3],[2,-4],[2,-3],[5,-5],[2,-3],[0,-5],[-1,-7],[-8,-17],[-4,-7],[-13,-18],[-1,-3],[-1,-3],[2,-6],[0,-4],[-3,-5],[-1,-5],[2,-10],[2,-5],[2,-4],[0,-4],[-1,-5],[-14,-17],[-3,-7],[-1,-3],[-3,-8],[-8,-12],[-1,-4],[-1,-6],[0,-10],[3,-20],[6,-7],[6,-3],[11,-1],[4,-3],[3,-4],[4,-7],[6,-7],[3,-2],[-2,-4],[-1,-2],[-25,-19],[-15,-33],[-8,-9],[-2,-4],[0,-4],[9,-20],[10,-15],[3,-3],[29,-21],[7,-17],[4,-5],[5,-3],[21,-8],[21,-16],[68,-66],[2,-9],[1,-3],[0,-5],[1,-6],[6,-5],[9,-7],[33,-16],[12,-9],[6,-1],[6,-1],[13,0],[7,1],[4,3],[4,6],[3,3],[3,2],[4,0],[6,-2],[6,-4],[22,-21],[51,-29],[19,-8],[50,-8],[15,11],[14,7],[14,4],[4,4],[3,5],[0,3],[2,3],[6,1],[7,-1],[42,-18],[97,-43],[12,-3],[42,-3],[16,-9],[6,-8],[8,-20],[6,-3],[8,-1],[50,-1],[23,-3],[12,-4],[13,-9],[6,-6],[5,-7],[8,-6],[61,-32],[20,-5],[72,6],[8,-1],[10,-10],[5,-3],[8,-3],[5,5],[9,13],[6,4],[6,1],[37,-2],[20,-7],[-9,-16],[-38,-31],[-33,-38],[-6,-9],[-1,-9],[1,-34],[1,-10],[7,-14],[10,-13],[8,-14],[-3,-16],[-31,-30],[-65,-38],[-9,-6],[-23,-30]],[[7861,5573],[13,-4],[30,-27],[15,-8],[9,-2],[5,1],[3,2],[4,1],[4,0],[4,-1],[14,-9],[13,-7],[4,-3],[2,-6],[-2,-9],[-2,-6],[-3,-4],[0,-8],[11,-11],[23,-10],[4,-6],[3,-8],[6,-18],[2,-9],[1,-8],[-4,-5],[-4,-3],[-8,-4],[-4,-2],[-2,-2],[-2,-2],[3,-9],[7,-4],[2,-11],[-3,-14],[1,-18],[-5,-13],[-3,-4],[-2,-2],[-13,-9],[-2,-2],[-1,-3],[0,-4],[0,-5],[2,-5],[2,-4],[4,-7],[3,-1],[4,-2],[6,7],[6,4],[5,5],[12,-2],[5,9],[15,-2],[7,-4],[14,-17],[20,4],[101,26],[16,6],[10,8],[12,3],[14,-1],[51,-18],[16,-10],[8,-8],[13,-5],[15,-9],[18,-20],[13,-4],[13,3],[10,1],[15,-2],[50,-12],[127,-7],[39,-3],[116,11],[71,6],[8,-2],[12,-1],[5,-2],[6,1],[4,1],[19,24],[61,65],[17,29],[2,10],[0,10],[7,10],[42,41],[14,9],[44,18],[67,12],[53,-5],[39,-11],[37,-18],[42,7],[144,53],[47,10],[23,1],[24,-4],[27,-12],[47,-14],[47,-1]],[[9655,5478],[4,-14],[24,-19],[71,-17],[23,-12],[25,-11],[51,-11],[25,-9],[17,-9],[20,-16],[11,-18],[-9,-16],[4,-34],[7,-54],[0,-1],[4,-23],[3,-9],[21,-26],[24,-22],[16,-25],[-5,-37],[3,-4],[5,-4],[-19,-27],[-14,-34],[-9,-36],[-2,-32],[-2,-17],[-7,-8],[-9,-6],[-5,-9],[-2,-13],[-1,-24],[-3,-15],[-48,-92],[-55,-97],[-39,-32],[-16,-19],[0,-24],[-17,-34],[-10,-15],[-11,-9],[-18,-4],[-23,1],[-41,7],[-41,23],[-16,7],[-38,8],[-5,9],[4,23],[18,32],[6,17],[-5,15],[-14,0],[-60,-18],[-12,7],[6,16],[13,18],[8,15],[2,20],[-3,12],[-9,10],[-13,12],[-13,8],[-30,6],[-13,7],[-10,10],[-4,8],[-2,8],[-7,10],[-9,-17],[-13,-5],[-39,2],[-31,-10],[-12,0],[-12,4],[-7,7],[-5,8],[-9,5],[-40,10],[-35,-4],[-26,-20],[-15,-37],[-13,-13],[13,-6],[37,-4],[22,-6],[-2,-3],[-9,-5],[-1,-13],[28,-20],[40,-9],[29,-13],[-7,-32],[-32,-20],[-85,5],[-39,-6],[-12,-9],[-20,-22],[-13,-9],[-170,-59],[-21,-1],[-40,4],[-22,-3],[-11,-6],[-17,-16],[-11,-7],[-14,-1],[-10,2],[-10,0],[-10,-9],[-4,-13],[1,-11],[3,-9],[-1,-6],[-7,-8],[-7,-2],[-6,0],[-32,-15],[-20,-3],[-50,4],[-23,-1],[-42,-12],[-21,-3],[-98,0],[-49,-7],[-45,-20],[13,-19],[-4,-18],[-15,-14],[-18,-10],[6,-10],[-1,-8],[-6,-6],[-11,-5],[-19,-17],[-18,-13],[-21,-4],[-24,9],[-7,7],[-16,19],[-6,5],[-13,4],[-3,-2],[-1,-4],[-6,-6],[-41,-21],[-6,-9],[-12,-26],[-23,-8],[-18,6],[-17,9],[-22,1],[-36,-72],[-16,-22],[-26,-15],[-58,3],[-31,-8],[-10,-2],[-10,-1],[-10,1],[-10,2],[-8,5],[-9,1],[-9,-1],[-9,-5],[-8,-52],[-7,-24],[-15,-14],[-24,-17],[-9,-7],[-37,2],[-101,46],[-9,2],[-10,-1],[-15,-8],[-7,-2],[-19,2],[-18,-1],[-18,-5],[-14,-10],[-24,-28],[-12,-9],[-14,-1],[-58,8],[-82,-5],[-44,-9],[-30,-20],[-8,-5],[-4,-7],[-2,-6],[-3,-6],[0,-3],[1,-4],[1,-5],[-2,-5],[-5,-1],[-10,0],[-4,-2],[-12,-9],[-32,-13],[-12,-9],[-34,-46],[-12,-10],[-13,-6],[-8,-10],[-3,-21],[-22,-21],[-6,-12],[-3,-22],[3,-16],[6,-14],[0,-12],[-15,-8],[-18,2],[-11,13],[-14,35],[-1,7],[-2,7],[-4,9],[-5,5],[-19,14],[-3,3],[-1,3],[1,2],[3,3],[1,1],[2,1],[1,0],[2,0],[5,7],[1,6],[-4,5],[-8,3],[-31,1],[-16,4],[-12,8],[-5,10],[1,22],[-7,11],[-21,12],[-52,3]],[[9311,7778],[8,-24],[1,-11],[1,-23],[3,-13],[7,-8],[17,-10],[4,-7],[14,-9],[-28,-40],[-8,-9],[-12,-4],[-11,-11],[-7,-16],[-3,-17],[3,-21],[7,-18],[2,-19],[-32,-72],[-3,-11],[-15,-23],[-34,-25],[-64,-36],[-66,-25],[-53,-28],[0,-8],[7,-13],[13,-45],[2,-16],[-4,-25],[-11,-15],[-29,-18],[12,-18],[19,-11],[23,-5],[24,-1],[22,-7],[36,-30],[29,-11],[116,-61],[17,-15],[37,-52],[12,-8],[21,-7],[31,-31],[65,-18],[63,-51],[7,-5],[34,-20],[-31,-46],[-8,-30],[20,-13],[5,-14],[-18,-30],[-26,-30],[-57,-36],[6,-51],[26,-56],[23,-37],[-7,-24],[25,-20],[37,-13],[31,-6],[30,-9],[17,-23],[0,-26],[-21,-20],[0,-8],[15,-18],[-4,-19],[-11,-23],[-7,-33],[11,-19],[71,-38],[-20,-18],[-9,-11],[-3,-12],[-2,-11],[-5,-13],[-23,-31],[-6,-12],[-4,-78],[-9,-25],[-17,-24],[-20,-19],[-63,-47],[-14,-22],[3,-27],[18,-20],[20,-10],[15,-15],[4,-34],[12,-32],[24,-21],[53,-33],[14,-22],[11,-32],[2,-34],[-13,-26],[-21,-24],[-9,-25],[2,-9]],[[5912,7500],[24,2],[26,-4],[35,0],[26,-8],[20,-2],[2,18],[3,14],[17,6],[36,0],[30,-12],[29,-12],[29,2],[22,12],[8,21],[-5,9],[-3,22],[-3,9],[-6,7],[-9,6],[-2,10],[6,12],[49,32],[21,10],[59,16],[38,1],[13,-3],[34,-20],[14,-22],[22,10],[24,6],[23,0],[34,-2],[-3,18],[-22,12],[10,5],[9,2],[30,-5],[25,22],[43,15],[18,3],[21,-6],[22,16],[19,10],[17,2],[10,20],[1,18],[29,14],[16,20],[6,0],[10,3],[19,7],[16,2],[9,2],[5,0],[6,-1],[17,-14],[4,-1],[8,2],[4,2],[22,12],[8,3],[6,0],[6,-1],[7,-3],[7,-7],[10,-14],[7,-9],[8,-2],[69,-12],[40,-17],[6,-3],[33,-18],[4,-4],[6,-4],[3,-3],[6,-4],[31,-12],[4,-3],[9,-11],[4,-2],[7,-2],[10,-1],[39,2],[16,5],[17,1],[116,-21],[6,0],[15,-5],[29,-21],[46,-9],[27,-1],[9,-4],[3,-18],[-1,-9],[1,-3],[1,-4],[3,-2],[3,-2],[5,-2],[6,-1],[7,0],[48,7],[16,0],[7,-2],[8,-2],[15,-10],[8,-2],[8,-1],[18,1],[8,2],[10,3],[8,1],[29,0],[8,2],[6,2],[4,2],[4,0],[4,-2],[3,-6],[-2,-4],[-3,-2],[-7,-4],[-3,-2],[-2,-3],[2,-4],[6,-4],[26,-8],[28,4],[28,19],[5,6],[11,9],[6,4],[32,15],[15,10],[10,5],[3,2],[3,3],[2,3],[1,2],[1,2],[1,3],[2,7],[2,3],[4,3],[5,3],[10,4],[6,3],[3,4],[3,2],[5,3],[9,2],[8,-1],[7,-2],[14,-13],[7,-10],[3,-3],[14,-4],[30,0],[4,13],[2,8],[1,4],[3,7],[11,16],[6,7],[12,8],[18,7],[28,2],[23,-4],[25,-8],[19,-8],[20,-4],[20,5],[57,33],[11,2],[13,8],[14,14],[15,30],[21,31],[5,24],[9,14],[15,10],[20,8],[39,1],[25,16],[20,26],[66,40],[39,4],[38,-2],[32,10],[-5,16],[-28,36],[2,24],[19,-2],[27,-30],[51,-14],[2,-28],[31,-40],[6,-18],[17,-18],[76,4],[65,-3],[23,-7],[28,-4],[22,22],[27,4],[39,-14],[46,2],[25,-4],[2,-34],[-5,-23],[-17,-28],[-39,-44],[-92,-44],[-1,-9],[0,-16],[46,-5],[41,-7],[72,-5],[15,8],[7,18],[29,10],[30,28],[74,32]],[[6156,8662],[-32,-67],[-12,-12],[-13,-1],[-1,9],[7,23],[-4,15],[-9,0],[-6,-11],[4,-18],[-15,-9],[-18,1],[-18,7],[-16,10],[16,29],[39,24],[45,10],[33,-10]],[[6201,8705],[-6,0],[-6,24],[1,3],[5,9],[74,25],[16,10],[-19,-18],[-50,-32],[-15,-21]],[[8869,8724],[34,-15],[191,-146],[19,-9],[1,-1],[-19,-34],[-9,-5],[-10,-2],[19,-16],[8,-20],[-123,-10],[-24,3],[-19,9],[-25,-20],[-32,-13],[-63,-12],[-69,-1],[-38,8],[-20,19],[14,4],[23,12],[35,5],[38,16],[10,7],[8,37],[-41,54],[3,32],[55,-2],[20,-5],[-8,-10],[3,-7],[-9,-25],[-1,-21],[17,22],[14,5],[44,0],[-6,-3],[-4,-4],[-3,-4],[-2,-8],[37,-8],[-9,17],[14,32],[-2,34],[-15,21],[-25,-7],[-9,21],[-12,17],[-14,14],[-18,9],[-21,4],[-22,-4],[-11,-9],[10,-16],[0,-10],[-10,-4],[-10,-7],[-8,-10],[-3,-10],[-6,-3],[-39,-10],[3,18],[8,10],[9,8],[3,8],[-6,16],[-8,1],[-10,-4],[-35,-11],[-16,-15],[-15,-10],[-22,6],[9,24],[29,43],[7,33],[-10,20],[-44,32],[-14,15],[10,14],[17,13],[20,5],[21,-6],[9,-12],[22,-42],[13,-17],[29,-20],[72,-29],[41,-11]],[[5511,8583],[12,-1],[6,1],[14,7],[32,24],[18,5],[20,3],[58,21],[133,12],[10,-2],[7,-7],[7,-19],[8,-8],[39,-8],[6,-6],[-5,-30],[2,-13],[14,-6],[32,-1],[9,1],[45,27],[8,-4],[11,-18],[7,-5],[45,0],[1,-4],[42,-36],[8,-4],[12,0],[2,13],[11,21],[8,26],[-5,20],[8,10],[11,5],[9,2],[-2,6],[-3,14],[-2,6],[38,27],[0,9],[-8,0],[0,8],[28,-8],[9,0],[23,11],[19,34],[15,8],[8,2],[8,5],[5,9],[5,9],[1,6],[-9,5],[0,7],[4,6],[4,5],[5,3],[27,34],[34,16],[43,5],[91,-12],[260,39],[41,18],[5,-36],[-4,-36],[3,-30],[25,-21],[-11,15],[-5,34],[-6,12],[12,15],[31,13],[9,17],[-12,1],[-12,-2],[-11,-3],[-10,-5],[8,12],[37,34],[22,13],[26,31],[16,6],[14,3],[82,31],[42,24],[16,13],[39,53],[66,65],[7,12],[45,54],[17,34],[12,11],[23,8],[0,-8],[-8,0],[24,-26],[47,-13],[248,0],[41,-14],[25,10],[31,-5],[14,-15],[-27,-17],[-28,-4],[-117,7],[-46,12],[-29,3],[-9,-3],[-11,-12],[-6,-3],[-23,0],[-28,4],[-10,-4],[-7,-17],[-7,9],[-5,-2],[-10,-6],[-7,-1],[2,-11],[4,-5],[7,-2],[9,-1],[-4,0],[-3,0],[-1,-2],[0,-6],[-21,8],[-23,-1],[-20,-9],[-10,-15],[-17,15],[-22,8],[-40,2],[-17,-6],[-15,-14],[-7,-20],[6,-20],[-16,2],[-6,2],[-8,5],[-7,-9],[7,-16],[-5,-15],[-14,-11],[-18,-3],[8,-17],[9,-14],[2,-11],[-12,-10],[47,-23],[27,-5],[23,10],[-17,0],[-13,4],[-22,14],[7,15],[10,11],[28,18],[6,3],[12,3],[5,2],[3,7],[1,16],[3,5],[18,11],[71,23],[-15,8],[-7,1],[0,9],[21,5],[7,0],[9,-5],[0,9],[20,-13],[33,6],[59,23],[-2,5],[-3,9],[-2,5],[11,5],[13,4],[13,1],[14,-1],[0,-9],[-16,-3],[-11,-10],[-7,-15],[-2,-16],[13,16],[5,9],[4,10],[10,-12],[11,-12],[12,-4],[12,10],[13,-7],[12,0],[10,6],[10,9],[3,-10],[5,-9],[7,-8],[19,-16],[4,-3],[4,2],[11,1],[21,-1],[11,3],[12,7],[9,10],[11,21],[10,13],[28,19],[43,19],[44,11],[27,-5],[-14,-10],[0,-15],[8,-16],[13,-13],[47,-17],[13,-8],[-20,-25],[4,-20],[31,-35],[3,-14],[0,-14],[3,-10],[12,-5],[49,0],[0,-9],[-10,-1],[-7,-2],[-13,-5],[36,2],[57,-22],[38,-7],[28,-10],[36,-51],[29,-18],[-16,-8],[-13,-10],[27,0],[41,15],[21,-6],[-8,-15],[-6,-6],[-8,-5],[13,-6],[8,3],[7,5],[10,-2],[6,-7],[15,-29],[14,-19],[16,-15],[20,-10],[26,0],[0,9],[-9,6],[-12,14],[-9,6],[0,9],[134,18],[33,11],[55,26],[31,7],[5,-7],[-2,-5],[-7,-4],[-11,-2],[0,-8],[34,-12],[86,-50],[0,-9],[-15,-19],[-9,-25],[-14,-22],[-29,-13],[13,-7],[31,-28],[12,-13],[6,-3],[31,-9],[8,-4],[4,-9],[4,-9],[3,-6],[1,-5],[-1,-6],[-1,-5],[5,-2],[15,1],[4,-1],[6,-3],[6,-3],[7,-2],[6,-1],[14,-5],[2,-12],[-7,-14],[-12,-12],[-78,-45],[-12,-17],[10,-15],[20,-7],[21,-4],[9,-4],[7,-14],[16,-17],[17,-11],[12,2],[80,-47],[36,-5],[18,-16],[4,-3],[27,2],[8,-2],[27,-11],[13,-4],[88,-4],[31,6],[13,18],[8,4],[17,-3],[16,-10],[3,-21],[-8,-10],[-52,-25],[14,-6],[16,-4],[18,-1],[8,0],[2,-36],[-5,-20],[17,-25],[22,-50],[2,-12],[-2,-47],[0,-29],[8,-26],[27,-29],[11,-27],[23,-27],[11,-66],[23,-75]],[[7966,9401],[-1,-14],[0,1],[-3,3],[-5,0],[0,-18],[-7,0],[0,27],[-26,-15],[-7,-21],[-1,-25],[-10,-27],[-8,-7],[-16,-9],[-6,-10],[-4,-13],[-2,-13],[-2,-27],[-7,0],[0,18],[3,29],[34,85],[8,32],[8,9],[17,3],[16,1],[12,-2],[7,-7]],[[8220,9467],[-8,-18],[3,-23],[9,-18],[15,-14],[18,-11],[46,-11],[141,19],[48,-7],[33,-25],[8,-33],[-29,-31],[-48,-23],[-24,-16],[-10,-18],[4,-22],[9,-22],[12,-19],[12,-12],[22,-8],[52,-8],[22,-12],[29,-36],[19,-17],[27,-7],[-15,-7],[-14,-13],[-11,-16],[-4,-21],[0,-21],[-3,-8],[-12,1],[-24,6],[13,0],[10,4],[5,9],[-5,13],[-7,0],[-11,-8],[-17,-5],[-18,0],[-13,5],[0,8],[41,12],[16,9],[9,15],[-56,-3],[-26,-5],[-21,-10],[60,29],[20,6],[0,9],[-29,1],[-15,-1],[-11,-5],[-14,-12],[-10,3],[-8,9],[-12,5],[-109,-9],[-20,-9],[-57,-35],[-12,-13],[-13,-20],[-27,-4],[-24,-8],[-4,-35],[15,9],[0,7],[-2,1],[-3,0],[-2,2],[52,6],[8,-2],[8,-30],[-3,-13],[-17,-6],[-31,3],[-35,9],[-38,17],[8,7],[6,15],[12,20],[-16,-7],[-8,-5],[-6,-6],[4,-4],[3,-4],[-22,1],[-11,-1],[-8,-5],[-10,-4],[-11,5],[-10,8],[-7,4],[-16,2],[-19,6],[-12,11],[6,17],[-15,3],[-34,-11],[-11,-1],[-7,10],[6,8],[15,4],[17,-5],[0,8],[-68,36],[15,28],[21,22],[28,9],[33,-15],[8,9],[13,-9],[15,2],[32,15],[-17,2],[-13,8],[-5,13],[5,13],[0,8],[-15,1],[-8,6],[-7,7],[-11,4],[-49,-9],[19,27],[8,6],[30,6],[33,11],[22,3],[0,9],[1,0],[7,3],[7,6],[-30,8],[-14,6],[-8,11],[4,3],[3,2],[2,5],[-1,9],[-32,-9],[-20,-2],[-8,6],[-3,4],[-5,1],[-5,3],[-2,10],[-2,11],[-4,7],[-7,3],[-10,0],[25,8],[84,9],[18,-3],[6,-8],[13,-3],[12,-7],[6,-17],[5,-9],[8,5],[4,14],[-9,20],[16,15],[20,14],[20,11],[19,5],[-12,-26],[-8,-11],[-10,-8],[7,1],[6,-1],[5,-3],[5,-6],[-5,-6],[-11,-19],[16,-1],[13,4],[10,8],[6,14],[-9,2],[-10,5],[-10,2],[0,9],[15,10],[12,-17],[19,-17],[13,-18],[-7,-19],[22,-22],[27,-6],[56,1],[-8,9],[10,17],[6,6],[7,4],[0,9],[-9,18],[-6,9],[-8,7],[0,9],[6,3],[4,3],[4,2],[9,2],[0,8],[-14,-1],[-8,-5],[-7,-7],[-8,-5],[-12,-1],[-38,1],[-5,4],[-6,9],[-8,9],[-10,4],[-17,3],[-6,6],[-4,9],[-7,9],[-13,12],[-2,6],[-15,-9],[-9,-6],[-17,-17],[-26,-10],[-18,-14],[-20,-10],[-22,5],[-4,15],[8,24],[14,21],[16,10],[3,5],[5,12],[2,12],[-3,6],[-49,-9],[-16,-8],[-7,2],[1,15],[6,8],[11,9],[14,6],[149,30],[31,0],[28,-10],[0,-8],[-16,-9],[-23,-9],[-20,-12]]],"transform":{"scale":[0.0009170486547654715,0.0007794992965296462],"translate":[5.852489868000106,47.27112091100008]}};
  Datamap.prototype.djiTopo = '__DJI__';
  Datamap.prototype.dmaTopo = '__DMA__';
  Datamap.prototype.dnkTopo = '__DNK__';
  Datamap.prototype.domTopo = '__DOM__';
  Datamap.prototype.dzaTopo = '__DZA__';
  Datamap.prototype.ecuTopo = '__ECU__';
  Datamap.prototype.egyTopo = '__EGY__';
  Datamap.prototype.eriTopo = '__ERI__';
  Datamap.prototype.esbTopo = '__ESB__';
  Datamap.prototype.espTopo = '__ESP__';
  Datamap.prototype.estTopo = '__EST__';
  Datamap.prototype.ethTopo = '__ETH__';
  Datamap.prototype.finTopo = '__FIN__';
  Datamap.prototype.fjiTopo = '__FJI__';
  Datamap.prototype.flkTopo = '__FLK__';
  Datamap.prototype.fraTopo = '__FRA__';
  Datamap.prototype.froTopo = '__FRO__';
  Datamap.prototype.fsmTopo = '__FSM__';
  Datamap.prototype.gabTopo = '__GAB__';
  Datamap.prototype.psxTopo = '__PSX__';
  Datamap.prototype.gbrTopo = '__GBR__';
  Datamap.prototype.geoTopo = '__GEO__';
  Datamap.prototype.ggyTopo = '__GGY__';
  Datamap.prototype.ghaTopo = '__GHA__';
  Datamap.prototype.gibTopo = '__GIB__';
  Datamap.prototype.ginTopo = '__GIN__';
  Datamap.prototype.gmbTopo = '__GMB__';
  Datamap.prototype.gnbTopo = '__GNB__';
  Datamap.prototype.gnqTopo = '__GNQ__';
  Datamap.prototype.grcTopo = '__GRC__';
  Datamap.prototype.grdTopo = '__GRD__';
  Datamap.prototype.grlTopo = '__GRL__';
  Datamap.prototype.gtmTopo = '__GTM__';
  Datamap.prototype.gumTopo = '__GUM__';
  Datamap.prototype.guyTopo = '__GUY__';
  Datamap.prototype.hkgTopo = '__HKG__';
  Datamap.prototype.hmdTopo = '__HMD__';
  Datamap.prototype.hndTopo = '__HND__';
  Datamap.prototype.hrvTopo = '__HRV__';
  Datamap.prototype.htiTopo = '__HTI__';
  Datamap.prototype.hunTopo = '__HUN__';
  Datamap.prototype.idnTopo = '__IDN__';
  Datamap.prototype.imnTopo = '__IMN__';
  Datamap.prototype.indTopo = '__IND__';
  Datamap.prototype.ioaTopo = '__IOA__';
  Datamap.prototype.iotTopo = '__IOT__';
  Datamap.prototype.irlTopo = '__IRL__';
  Datamap.prototype.irnTopo = '__IRN__';
  Datamap.prototype.irqTopo = '__IRQ__';
  Datamap.prototype.islTopo = '__ISL__';
  Datamap.prototype.isrTopo = '__ISR__';
  Datamap.prototype.itaTopo = '__ITA__';
  Datamap.prototype.jamTopo = '__JAM__';
  Datamap.prototype.jeyTopo = '__JEY__';
  Datamap.prototype.jorTopo = '__JOR__';
  Datamap.prototype.jpnTopo = '__JPN__';
  Datamap.prototype.kabTopo = '__KAB__';
  Datamap.prototype.kasTopo = '__KAS__';
  Datamap.prototype.kazTopo = '__KAZ__';
  Datamap.prototype.kenTopo = '__KEN__';
  Datamap.prototype.kgzTopo = '__KGZ__';
  Datamap.prototype.khmTopo = '__KHM__';
  Datamap.prototype.kirTopo = '__KIR__';
  Datamap.prototype.knaTopo = '__KNA__';
  Datamap.prototype.korTopo = '__KOR__';
  Datamap.prototype.kosTopo = '__KOS__';
  Datamap.prototype.kwtTopo = '__KWT__';
  Datamap.prototype.laoTopo = '__LAO__';
  Datamap.prototype.lbnTopo = '__LBN__';
  Datamap.prototype.lbrTopo = '__LBR__';
  Datamap.prototype.lbyTopo = '__LBY__';
  Datamap.prototype.lcaTopo = '__LCA__';
  Datamap.prototype.lieTopo = '__LIE__';
  Datamap.prototype.lkaTopo = '__LKA__';
  Datamap.prototype.lsoTopo = '__LSO__';
  Datamap.prototype.ltuTopo = '__LTU__';
  Datamap.prototype.luxTopo = '__LUX__';
  Datamap.prototype.lvaTopo = '__LVA__';
  Datamap.prototype.macTopo = '__MAC__';
  Datamap.prototype.mafTopo = '__MAF__';
  Datamap.prototype.marTopo = '__MAR__';
  Datamap.prototype.mcoTopo = '__MCO__';
  Datamap.prototype.mdaTopo = '__MDA__';
  Datamap.prototype.mdgTopo = '__MDG__';
  Datamap.prototype.mdvTopo = '__MDV__';
  Datamap.prototype.mexTopo = '__MEX__';
  Datamap.prototype.mhlTopo = '__MHL__';
  Datamap.prototype.mkdTopo = '__MKD__';
  Datamap.prototype.mliTopo = '__MLI__';
  Datamap.prototype.mltTopo = '__MLT__';
  Datamap.prototype.mmrTopo = '__MMR__';
  Datamap.prototype.mneTopo = '__MNE__';
  Datamap.prototype.mngTopo = '__MNG__';
  Datamap.prototype.mnpTopo = '__MNP__';
  Datamap.prototype.mozTopo = '__MOZ__';
  Datamap.prototype.mrtTopo = '__MRT__';
  Datamap.prototype.msrTopo = '__MSR__';
  Datamap.prototype.musTopo = '__MUS__';
  Datamap.prototype.mwiTopo = '__MWI__';
  Datamap.prototype.mysTopo = '__MYS__';
  Datamap.prototype.namTopo = '__NAM__';
  Datamap.prototype.nclTopo = '__NCL__';
  Datamap.prototype.nerTopo = '__NER__';
  Datamap.prototype.nfkTopo = '__NFK__';
  Datamap.prototype.ngaTopo = '__NGA__';
  Datamap.prototype.nicTopo = '__NIC__';
  Datamap.prototype.niuTopo = '__NIU__';
  Datamap.prototype.nldTopo = '__NLD__';
  Datamap.prototype.nplTopo = '__NPL__';
  Datamap.prototype.nruTopo = '__NRU__';
  Datamap.prototype.nulTopo = '__NUL__';
  Datamap.prototype.nzlTopo = '__NZL__';
  Datamap.prototype.omnTopo = '__OMN__';
  Datamap.prototype.pakTopo = '__PAK__';
  Datamap.prototype.panTopo = '__PAN__';
  Datamap.prototype.pcnTopo = '__PCN__';
  Datamap.prototype.perTopo = '__PER__';
  Datamap.prototype.pgaTopo = '__PGA__';
  Datamap.prototype.phlTopo = '__PHL__';
  Datamap.prototype.plwTopo = '__PLW__';
  Datamap.prototype.pngTopo = '__PNG__';
  Datamap.prototype.polTopo = '__POL__';
  Datamap.prototype.priTopo = '__PRI__';
  Datamap.prototype.prkTopo = '__PRK__';
  Datamap.prototype.prtTopo = '__PRT__';
  Datamap.prototype.pryTopo = '__PRY__';
  Datamap.prototype.pyfTopo = '__PYF__';
  Datamap.prototype.qatTopo = '__QAT__';
  Datamap.prototype.rouTopo = '__ROU__';
  Datamap.prototype.rusTopo = '__RUS__';
  Datamap.prototype.rwaTopo = '__RWA__';
  Datamap.prototype.sahTopo = '__SAH__';
  Datamap.prototype.sauTopo = '__SAU__';
  Datamap.prototype.scrTopo = '__SCR__';
  Datamap.prototype.sdnTopo = '__SDN__';
  Datamap.prototype.sdsTopo = '__SDS__';
  Datamap.prototype.senTopo = '__SEN__';
  Datamap.prototype.serTopo = '__SER__';
  Datamap.prototype.sgpTopo = '__SGP__';
  Datamap.prototype.sgsTopo = '__SGS__';
  Datamap.prototype.shnTopo = '__SHN__';
  Datamap.prototype.slbTopo = '__SLB__';
  Datamap.prototype.sleTopo = '__SLE__';
  Datamap.prototype.slvTopo = '__SLV__';
  Datamap.prototype.smrTopo = '__SMR__';
  Datamap.prototype.solTopo = '__SOL__';
  Datamap.prototype.somTopo = '__SOM__';
  Datamap.prototype.spmTopo = '__SPM__';
  Datamap.prototype.srbTopo = '__SRB__';
  Datamap.prototype.stpTopo = '__STP__';
  Datamap.prototype.surTopo = '__SUR__';
  Datamap.prototype.svkTopo = '__SVK__';
  Datamap.prototype.svnTopo = '__SVN__';
  Datamap.prototype.sweTopo = '__SWE__';
  Datamap.prototype.swzTopo = '__SWZ__';
  Datamap.prototype.sxmTopo = '__SXM__';
  Datamap.prototype.sycTopo = '__SYC__';
  Datamap.prototype.syrTopo = '__SYR__';
  Datamap.prototype.tcaTopo = '__TCA__';
  Datamap.prototype.tcdTopo = '__TCD__';
  Datamap.prototype.tgoTopo = '__TGO__';
  Datamap.prototype.thaTopo = '__THA__';
  Datamap.prototype.tjkTopo = '__TJK__';
  Datamap.prototype.tkmTopo = '__TKM__';
  Datamap.prototype.tlsTopo = '__TLS__';
  Datamap.prototype.tonTopo = '__TON__';
  Datamap.prototype.ttoTopo = '__TTO__';
  Datamap.prototype.tunTopo = '__TUN__';
  Datamap.prototype.turTopo = '__TUR__';
  Datamap.prototype.tuvTopo = '__TUV__';
  Datamap.prototype.twnTopo = '__TWN__';
  Datamap.prototype.tzaTopo = '__TZA__';
  Datamap.prototype.ugaTopo = '__UGA__';
  Datamap.prototype.ukrTopo = '__UKR__';
  Datamap.prototype.umiTopo = '__UMI__';
  Datamap.prototype.uryTopo = '__URY__';
  Datamap.prototype.usaTopo = '__USA__';
  Datamap.prototype.usgTopo = '__USG__';
  Datamap.prototype.uzbTopo = '__UZB__';
  Datamap.prototype.vatTopo = '__VAT__';
  Datamap.prototype.vctTopo = '__VCT__';
  Datamap.prototype.venTopo = '__VEN__';
  Datamap.prototype.vgbTopo = '__VGB__';
  Datamap.prototype.virTopo = '__VIR__';
  Datamap.prototype.vnmTopo = '__VNM__';
  Datamap.prototype.vutTopo = '__VUT__';
  Datamap.prototype.wlfTopo = '__WLF__';
  Datamap.prototype.wsbTopo = '__WSB__';
  Datamap.prototype.wsmTopo = '__WSM__';
  Datamap.prototype.yemTopo = '__YEM__';
  Datamap.prototype.zafTopo = '__ZAF__';
  Datamap.prototype.zmbTopo = '__ZMB__';
  Datamap.prototype.zweTopo = '__ZWE__';

  /**************************************
                Utilities
  ***************************************/

  //convert lat/lng coords to X / Y coords
  Datamap.prototype.latLngToXY = function(lat, lng) {
     return this.projection([lng, lat]);
  };

  //add <g> layer to root SVG
  Datamap.prototype.addLayer = function( className, id, first ) {
    var layer;
    if ( first ) {
      layer = this.svg.insert('g', ':first-child')
    }
    else {
      layer = this.svg.append('g')
    }
    return layer.attr('id', id || '')
      .attr('class', className || '');
  };

  Datamap.prototype.updateChoropleth = function(data) {
    var svg = this.svg;
    for ( var subunit in data ) {
      if ( data.hasOwnProperty(subunit) ) {
        var color;
        var subunitData = data[subunit]
        if ( ! subunit ) {
          continue;
        }
        else if ( typeof subunitData === "string" ) {
          color = subunitData;
        }
        else if ( typeof subunitData.color === "string" ) {
          color = subunitData.color;
        }
        else {
          color = this.options.fills[ subunitData.fillKey ];
        }
        //if it's an object, overriding the previous data
        if ( subunitData === Object(subunitData) ) {
          this.options.data[subunit] = defaults(subunitData, this.options.data[subunit] || {});
          var geo = this.svg.select('.' + subunit).attr('data-info', JSON.stringify(this.options.data[subunit]));
        }
        svg
          .selectAll('.' + subunit)
          .transition()
            .style('fill', color);
      }
    }
  };

  Datamap.prototype.updatePopup = function (element, d, options) {
    var self = this;
    element.on('mousemove', null);
    element.on('mousemove', function() {
      var position = d3.mouse(self.options.element);
      d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover')
        .style('top', ( (position[1] + 30)) + "px")
        .html(function() {
          var data = JSON.parse(element.attr('data-info'));
          try {
            return options.popupTemplate(d, data);
          } catch (e) {
            return "";
          }
        })
        .style('left', ( position[0]) + "px");
    });

    d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover').style('display', 'block');
  };

  Datamap.prototype.addPlugin = function( name, pluginFn ) {
    var self = this;
    if ( typeof Datamap.prototype[name] === "undefined" ) {
      Datamap.prototype[name] = function(data, options, callback, createNewLayer) {
        var layer;
        if ( typeof createNewLayer === "undefined" ) {
          createNewLayer = false;
        }

        if ( typeof options === 'function' ) {
          callback = options;
          options = undefined;
        }

        options = defaults(options || {}, self.options[name + 'Config']);

        //add a single layer, reuse the old layer
        if ( !createNewLayer && this.options[name + 'Layer'] ) {
          layer = this.options[name + 'Layer'];
          options = options || this.options[name + 'Options'];
        }
        else {
          layer = this.addLayer(name);
          this.options[name + 'Layer'] = layer;
          this.options[name + 'Options'] = options;
        }
        pluginFn.apply(this, [layer, data, options]);
        if ( callback ) {
          callback(layer);
        }
      };
    }
  };

  // expose library
  if (typeof exports === 'object') {
    d3 = require('d3');
    topojson = require('topojson');
    module.exports = Datamap;
  }
  else if ( typeof define === "function" && define.amd ) {
    define( "datamaps", ["require", "d3", "topojson"], function(require) {
      d3 = require('d3');
      topojson = require('topojson');

      return Datamap;
    });
  }
  else {
    window.Datamap = window.Datamaps = Datamap;
  }

  if ( window.jQuery ) {
    window.jQuery.fn.datamaps = function(options, callback) {
      options = options || {};
      options.element = this[0];
      var datamap = new Datamap(options);
      if ( typeof callback === "function" ) {
        callback(datamap, options);
      }
      return this;
    };
  }
})();
