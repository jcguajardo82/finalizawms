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
  Datamap.prototype.cafTopo = {"type":"Topology","objects":{"caf":{"type":"GeometryCollection","geometries":[{"type":"Polygon","properties":{"name":"Bangui"},"id":"CF.BG","arcs":[[0,1]]},{"type":"Polygon","properties":{"name":"Ombella-M'Poko"},"id":"CF.MP","arcs":[[2,3,-2,4,5,6,7,8,9]]},{"type":"Polygon","properties":{"name":"Basse-Kotto"},"id":"CF.BK","arcs":[[10,11,12,13]]},{"type":"Polygon","properties":{"name":"Lobaye"},"id":"CF.LB","arcs":[[14,15,16,-6]]},{"type":"Polygon","properties":{"name":"Mamb??r??-Kad????"},"id":"CF.HS","arcs":[[-17,17,18,19,-7]]},{"type":"Polygon","properties":{"name":"Sangha-Mba??r??"},"id":"CF.SE","arcs":[[-16,20,-18]]},{"type":"Polygon","properties":{"name":"Nana-Mamb??r??"},"id":"CF.NM","arcs":[[-8,-20,21,22]]},{"type":"Polygon","properties":{"name":"Ouham-Pend??"},"id":"CF.OP","arcs":[[23,-9,-23,24]]},{"type":"Polygon","properties":{"name":"Bamingui-Bangoran"},"id":"CF.BB","arcs":[[25,26,27,28,29,30]]},{"type":"Polygon","properties":{"name":"Nana-Gr??bizi"},"id":"CF.KB","arcs":[[31,32,33,-28]]},{"type":"Polygon","properties":{"name":"K??mo"},"id":"CF.KG","arcs":[[34,35,-3,36,-33]]},{"type":"Polygon","properties":{"name":"Ouaka"},"id":"CF.UK","arcs":[[-14,37,-35,-32,-27,38]]},{"type":"Polygon","properties":{"name":"Ouham"},"id":"CF.AC","arcs":[[-34,-37,-10,-24,39,-29]]},{"type":"Polygon","properties":{"name":"Vakaga"},"id":"CF.VK","arcs":[[40,-31,41]]},{"type":"Polygon","properties":{"name":"Haute-Kotto"},"id":"CF.HK","arcs":[[42,43,44,-11,-39,-26,-41]]},{"type":"Polygon","properties":{"name":"Haut-Mbomou"},"id":"CF.HM","arcs":[[45,-44,46]]},{"type":"Polygon","properties":{"name":"Mbomou"},"id":"CF.MB","arcs":[[47,-12,-45,-46]]}]}},"arcs":[[[3224,2436],[-15,1],[-15,-21],[-12,-30],[-3,-25]],[[3179,2361],[-19,22],[-5,14],[9,23],[-14,18],[-5,17],[3,12],[6,20],[12,19],[12,6],[19,0],[9,-10],[7,-19],[6,-23],[5,-24]],[[3253,3986],[40,-71],[28,-16],[14,-1],[86,-20],[9,-10],[5,-19],[11,-112],[9,-22],[12,-20],[26,-29],[17,-14],[8,-10],[9,-19],[17,-43],[6,-26],[2,-21],[-3,-27],[-20,-86],[-4,-28],[1,-27],[6,-27],[71,-144],[12,-42],[1,-5],[-4,-38],[3,-33],[0,-1]],[[3615,3075],[-18,-26],[-11,-20],[-9,-27],[-6,-36],[-4,-11],[-6,-10],[-7,-7],[-6,-10],[-6,-43],[-10,-17],[-14,-12],[-14,-18],[-26,-66],[-3,-4],[-15,-8],[-3,-4],[-2,-2],[-9,-33],[-26,-31],[-18,-39],[-40,-145],[-18,-37],[-24,-27],[-36,-18],[-16,-4],[-15,-2],[-15,4],[-14,14]],[[3179,2361],[6,-19],[21,-27],[4,-12],[5,-22],[27,-76],[10,-44],[10,-97],[0,-72],[-3,-28],[-6,-25],[-16,-39],[-1,-26],[0,-14]],[[3236,1860],[-1,0],[-59,39],[-19,6],[-8,6],[-6,10],[-12,23],[-5,14],[-6,11],[-7,7],[-11,7],[-12,10],[-8,13],[-4,7],[-2,8],[-6,17],[-33,53],[-8,20],[-3,15],[6,30],[1,14],[0,15],[-5,35],[0,16],[2,22],[-1,9],[-28,89],[-8,14],[-10,9],[-17,5],[-22,5],[-9,5],[-11,10],[-11,19],[-23,67],[-10,20],[-12,13],[-16,6],[-12,-4],[-12,-7],[-12,-2],[-9,4],[-8,12],[-9,6],[-10,2],[-8,1],[-6,2],[-20,9],[-17,5],[-10,0],[-4,-2],[-5,-2],[-4,-5],[-4,-6],[-4,-7],[-6,-4],[-8,1],[-17,10],[-8,2],[-10,0],[-5,4],[-5,10],[-3,10],[-3,17],[-3,7],[-6,6],[-37,24],[-8,0],[-8,-3],[-7,-4],[-10,-3],[-35,-1],[-6,-2],[-4,-4],[-3,-6],[-4,-4],[-8,0],[-10,3],[-23,13],[-11,10],[-22,33],[-7,15],[-5,17],[-25,155],[-7,25],[-27,52],[-7,9],[-11,9],[-61,42],[-31,31],[-33,48],[-19,22],[-17,27],[-8,11],[-36,29],[-10,11],[-9,17],[-3,11],[-11,6],[-8,3],[-63,-14]],[[2030,3180],[-32,68],[-1,4],[0,3],[1,3],[2,2],[2,2],[2,1],[11,2],[5,2],[5,5],[11,14],[8,8],[10,7],[28,13],[6,7],[4,9],[0,11],[-50,114],[-15,26],[-78,85],[-10,7],[-13,1],[-18,-4],[-30,-11],[-30,-3],[-21,4],[-14,11],[-18,20],[-17,-5],[-27,-19],[-113,-101]],[[1638,3466],[-11,75],[-9,34],[-2,20],[0,28],[15,122],[-1,56]],[[1630,3801],[27,17],[39,42],[43,63],[12,20],[13,37],[14,27],[31,35],[94,49],[43,8],[7,5],[7,7],[7,10],[18,12]],[[1985,4133],[-1,-56],[3,-19],[16,-32],[14,-45],[18,-7],[43,-8],[370,9],[30,16],[147,122],[7,8],[6,10],[6,12],[9,13],[12,12],[22,9],[13,-2],[11,-6],[15,-16],[40,-27],[4,-8],[3,-12],[0,-19],[1,-7],[5,-6],[9,-7],[9,-1],[8,2],[17,9],[10,2],[7,-2],[8,-6],[13,-15],[4,-2],[4,1],[3,2],[7,3],[61,8],[15,-2],[9,-4],[5,-6],[2,-7],[1,-9],[0,-10],[1,-10],[2,-7],[4,-6],[3,0],[9,5],[12,3],[24,1],[17,-4],[14,-5],[8,-6],[6,-6],[4,-6],[1,-6],[0,-6],[-1,-6],[-2,-6],[-2,-4],[-3,-3],[-7,-5],[-4,-4],[-3,-5],[-1,-8],[1,-10],[3,-13],[11,-26],[3,-13],[2,-15],[-1,-40],[1,-11],[5,-11],[5,-2],[8,3],[27,19],[36,19],[66,52],[8,9],[5,12],[3,12],[2,16],[1,15],[0,27],[1,8],[4,5],[9,-6]],[[5573,3779],[65,-11],[50,-26],[67,-48]],[[5755,3694],[-1,-56],[2,-30],[0,-11],[1,-5],[2,-3],[2,-3],[0,-5],[-2,-14],[-7,-17],[-2,-12],[-1,-123],[-9,-64],[-4,-19],[-11,-14],[-22,-18],[-26,-35],[-5,-12],[2,-18],[22,-33],[7,-19],[0,-24],[-6,-20],[-28,-51],[-5,-16],[-8,-120],[-2,-18],[-11,-19],[-4,-27],[-3,-10],[-2,-10],[6,-18],[-3,-7],[-5,-7],[-3,-9],[5,-19],[11,-10],[13,-1],[9,11],[5,0],[1,-7],[3,-6],[4,-3],[12,9],[3,-7],[3,-18],[16,-14],[9,-2],[12,9],[3,-12],[4,-8],[8,-12],[2,3],[5,4],[6,3],[4,-2],[1,-7],[-2,-5],[-3,-5],[-2,-3],[5,-24],[11,-13],[12,-11],[9,-19],[-2,-12],[-10,-16],[1,-10],[6,-5],[21,-3],[7,-4],[11,-3],[44,22],[31,3],[25,-8],[12,-25],[-10,-47],[-21,-40],[-7,-19],[-3,-24],[-3,-6],[-16,-25],[-3,-10],[-1,-14],[3,-57],[-1,-10],[-6,-15],[-6,-13],[-6,-9],[-4,-11],[0,-21],[-1,-2]],[[5859,2274],[-21,15],[-6,2],[-9,0],[-4,-2],[-3,-3],[-7,-3],[-16,-5],[-45,5],[-18,5],[-12,11],[-11,13],[-14,10],[-7,2],[-22,-2],[-8,2],[-4,4],[-2,5],[-4,5],[-16,9],[-11,2],[-26,-3],[-29,3],[-13,-1],[-74,-57],[-8,5],[-15,1],[-8,2],[-6,5],[-5,8],[-7,7],[-10,3],[-33,-2],[-15,2],[-18,7],[-12,9],[-37,35],[-4,8],[-5,8],[-8,3],[-10,-1],[-7,-2],[-6,-5],[-6,-7],[-4,-7],[-5,-9],[-5,-9],[-7,-6],[-9,-1],[-6,5],[-6,8],[-8,3],[-15,1],[-6,4],[-6,19],[-9,7],[-19,9],[-8,14],[-14,40],[-7,8],[-12,4],[-74,40],[-70,22],[-30,-3],[-11,-8],[-9,-11],[-11,-9],[-19,-4],[-61,0],[-65,-15],[-17,6],[-16,16],[-79,110]],[[4649,2611],[70,55],[17,19],[43,63],[56,103],[10,14],[32,23],[30,28],[11,6],[10,1],[16,-5],[9,-2],[11,2],[11,8],[10,13],[6,22],[2,20],[0,19],[-7,65],[0,18],[2,17],[5,17],[17,38],[5,15],[2,9],[0,11],[-3,14],[-19,59],[-4,16],[0,14],[1,15],[4,16],[7,15],[19,37],[6,20],[4,20],[4,96],[-4,70],[4,16],[5,12],[13,17],[2,5],[0,6],[-4,24],[-1,10],[1,23],[-1,6],[-3,7],[-3,4],[-5,4],[-12,7],[-2,2],[-3,3],[-2,4],[-2,6],[0,6],[0,5],[5,5],[8,4],[39,12],[6,4],[5,5],[3,5],[1,8],[0,8],[-4,29],[0,7],[1,5],[3,6],[16,23],[3,7],[3,9],[1,8],[-1,8],[-1,6],[-4,6],[-7,14],[-4,9],[-3,9],[0,10],[2,8],[3,5],[5,3],[5,0],[7,-2],[7,-4],[11,-9],[8,-9],[6,-10],[10,-30],[6,-7],[6,-3],[12,0],[8,2],[5,2],[3,4],[4,6],[2,3],[5,2],[6,-2],[24,-18],[9,-3],[12,2],[8,5],[28,21],[5,7],[15,27],[5,7],[5,4],[3,0],[5,-3],[9,-16],[5,-3],[6,3],[5,7],[3,7],[5,16],[3,4],[3,2],[3,-4],[11,-21],[6,-9],[11,-8],[7,-7],[8,-16],[8,-24],[12,-23],[3,-9],[2,-12],[0,-12],[-1,-8],[-2,-7],[0,-7],[1,-8],[16,-40],[2,-12],[7,-22],[19,-11],[2,-4],[13,-29],[6,-6],[6,-3],[8,2],[11,4],[24,25],[22,66]],[[3236,1860],[1,-38],[-16,-141],[26,-266],[-34,1],[-9,14],[-12,42],[-31,75],[-13,22],[-19,23],[-10,-1],[-9,-15],[-14,-20],[-7,-5],[-13,2],[-8,-2],[-4,-5],[-3,-15],[-3,-5],[-5,1],[-9,6],[-4,1],[-61,-8],[-9,1],[-7,3],[-5,-3],[-5,-16],[-5,-34],[-3,-11],[-9,-20],[-14,-19],[-16,-11],[-16,3],[-10,17],[-10,45],[-14,20],[-26,13],[-27,0],[-26,-11],[-24,-17],[-9,-2],[-7,4],[-28,26],[-4,2],[-4,-4],[-29,-22],[-15,-6],[-11,3],[-5,18],[-4,23],[-7,21],[-10,16],[-11,11],[-7,0],[-15,-4],[-7,0],[-5,4],[-7,13],[-5,3],[-6,0],[-8,-5],[-5,-1],[-62,0],[-31,6],[-28,19],[-28,35],[-4,3],[-11,2],[-3,4],[-3,15],[-4,5],[-17,4],[-13,-8],[-11,-13],[-10,-7]],[[2319,1651],[-59,135],[-5,5],[-7,7],[-40,28],[-29,27],[-10,7],[-24,11],[-18,13],[-4,2],[-4,1],[-24,4],[-25,10],[-3,3],[-40,39],[-5,3],[-8,2],[-30,2],[-6,3],[-27,32],[-3,6],[-4,8],[-21,63],[-48,106],[-1,6],[-2,5],[-53,93],[-19,19]],[[1800,2291],[35,108],[21,38],[10,13],[19,33],[9,12],[7,4],[7,1],[9,-3],[8,-5],[46,-43],[6,-8],[5,-10],[11,-18],[6,-5],[4,-2],[36,-7],[8,2],[6,5],[2,21],[-17,8],[-4,1],[-2,5],[-14,22],[-3,12],[-8,35],[-7,25],[-11,25],[-14,20],[-17,8],[-7,10],[-61,170],[-7,20],[-9,43],[-3,23],[0,148],[6,8],[5,3],[15,5],[30,20],[58,57],[9,7],[7,4],[6,2],[8,4],[7,6],[6,9],[3,12],[1,9],[-2,32]],[[1800,2291],[-6,4],[-22,5],[-17,7],[-7,-5],[-9,-14],[-30,-71],[-9,-25],[-4,-18],[-2,-17],[-2,-36],[3,-48],[-1,-14],[-2,-15],[-3,-14],[-5,-19],[-30,-55],[-29,-43],[-18,-19],[-4,-7],[-4,-7],[-7,-39],[-3,-9],[-4,-8],[-6,-4],[-5,-1],[-8,6],[-27,44],[-9,10],[-9,7],[-10,2],[-28,-2],[-10,2],[-8,4],[-5,7],[-5,9],[-8,9],[-33,24],[-18,10],[-65,24],[-7,5],[-6,5],[-6,7],[-5,6],[-6,4],[-11,1],[-16,-1],[-125,-25],[-31,-14],[-88,-57],[-87,-77],[-12,-16],[-18,-67],[-5,-8],[-8,-8],[-11,-6],[-22,-7],[-10,1],[-6,4],[-5,27],[-3,5],[-3,4],[-5,4],[-7,2],[-7,0],[-11,-5],[-15,-12],[-121,-115],[-4,-5]],[[670,1627],[-7,12],[-62,98],[-67,145],[-45,160],[13,0],[25,-10],[13,-2],[15,5],[30,21],[16,6],[15,10],[-1,12],[-10,10],[-11,2],[-11,0],[-4,8],[-3,16],[-5,16],[-11,6],[-12,-2],[-9,11],[-5,31],[-1,64],[-8,69],[-7,32],[-11,32],[-27,49],[-5,15],[-5,29],[-5,11],[-9,9],[-34,17],[-121,125],[-28,40],[-20,48],[-10,54],[-5,86],[-6,19],[1,8],[4,13],[3,28],[1,11],[-11,108],[-5,14],[-4,11],[-3,11],[2,31],[-4,11],[-4,10],[-3,12],[0,17]],[[209,3166],[11,1],[62,-4],[68,-17],[17,0],[15,3],[27,12],[9,1],[9,-2],[9,-6],[2,-1],[27,-48],[9,-13],[5,-3],[5,-2],[7,3],[12,12],[32,40],[22,8],[18,3],[126,3],[11,6],[5,5],[5,2],[9,-1],[18,-14],[3,-1],[6,-2],[22,2],[5,2],[6,4],[47,48],[9,5],[4,1],[4,-3],[10,-9],[30,-21],[2,-1],[15,2],[6,-1],[4,-2],[8,-4],[6,-1],[59,1],[4,2],[-9,127],[-2,12],[-4,9],[-2,6],[-2,7],[1,8],[3,7],[22,40],[3,10],[0,8],[0,6],[4,3],[9,2],[23,0],[9,-2],[5,-5],[-2,-22],[0,-9],[2,-10],[9,-25],[3,-11],[1,-8],[0,-8],[-1,-6],[-1,-8],[0,-6],[0,-10],[2,-8],[15,-36],[8,-6],[13,-2],[43,23],[22,17],[8,4],[7,-3],[5,-6],[10,-19],[7,-11],[11,-10],[15,-3],[20,4],[25,11],[357,220]],[[2319,1651],[-30,-23],[-15,-29],[-17,-22],[-27,-3],[-20,10],[-10,1],[-11,-6],[-11,-13],[-6,-12],[-7,-11],[-13,-8],[-11,-3],[-30,2],[-11,-5],[-20,-11],[-11,-3],[-21,2],[-7,-2],[-12,-9],[-6,-6],[-8,-11],[-7,-4],[-4,0],[-11,2],[-6,-2],[-10,-5],[-6,5],[-6,10],[-8,7],[-7,1],[-22,-4],[-7,2],[-14,8],[-7,3],[-11,-2],[-1,-9],[2,-12],[-2,-10],[-15,-11],[-16,-2],[-63,24],[-15,1],[-18,-1],[-36,-16],[-31,-31],[-24,-42],[-12,-51],[-7,-95],[-19,-72],[-1,-28],[-4,-25],[-26,-54],[-9,-26],[-1,-29],[6,-24],[8,-23],[6,-26],[-5,-40],[-29,-85],[2,-51],[9,-21],[11,-19],[7,-20],[-4,-28],[-22,-69],[-17,-56],[-11,-33],[-32,-103],[-35,-110],[-25,-78],[-35,-110],[-39,-125],[-3,3],[-10,9],[1,11],[5,15],[-1,9],[-3,4],[-10,10],[-3,6],[-1,22],[-1,11],[-3,10],[-5,12],[-14,24],[-10,29],[-6,24],[-1,9],[0,42],[-4,21],[-9,27],[-4,15],[1,25],[12,39],[4,22],[-3,23],[-11,40],[-3,23],[3,13],[6,17],[7,15],[-9,3],[-10,2],[-10,-3],[-8,0],[-2,10],[0,16],[-3,39],[3,30],[21,31],[6,27],[-2,30],[-8,26],[-9,24],[-11,37],[-16,36],[-7,9],[-8,5],[-7,1],[-8,-3],[-10,-5],[-4,4],[-2,6],[-2,6],[-11,57],[-6,23],[-13,23],[-15,19],[-12,6],[-33,-5],[-3,2],[-8,8],[-5,1],[-4,-2],[-8,-8],[-4,-1],[-9,2],[-6,3],[-6,5],[-57,91],[-72,113],[-76,120],[-80,126],[-64,101],[-52,82]],[[209,3166],[0,5],[6,42],[-4,44],[0,58],[-3,26],[-6,26],[-8,23],[-12,18],[-16,12],[-33,16],[-16,16],[-12,20],[-3,12],[6,3],[9,12],[6,20],[5,20],[1,15],[4,4],[8,18],[6,19],[0,9],[10,5],[4,13],[-1,33],[3,19],[11,32],[2,12],[1,34],[-1,14],[-5,19],[-11,26],[-4,16],[-1,20],[2,18],[14,51],[11,62],[5,17],[-6,23],[-5,122],[-11,21],[-4,23],[-10,22],[-9,1],[-21,-19],[-11,-2],[-24,5],[-13,0],[-13,12],[-6,18],[-3,20],[-5,19],[-11,17],[-12,14],[-9,15],[-6,10],[-6,13],[-2,9],[2,8],[6,9],[4,1],[8,-9],[4,0],[3,5],[3,10],[2,5],[3,11],[0,6],[-1,6],[-1,4],[10,14],[18,26],[12,5],[22,32],[11,21],[7,19],[32,-1],[109,78],[12,14],[29,55],[8,21],[1,13],[0,12],[-3,27],[1,13],[20,39],[87,295]],[[409,5077],[13,0],[17,-3],[22,1],[8,2],[7,4],[55,41],[73,33],[5,0],[4,-6],[2,-14],[0,-12],[-2,-28],[1,-9],[7,-12],[45,-55],[20,-36],[14,-29],[5,-21],[4,-17],[6,-54],[0,-28],[2,-13],[0,-10],[4,-17],[1,-13],[1,-6],[4,-6],[8,-11],[2,-6],[0,-7],[-1,-8],[2,-7],[19,-43],[20,-31],[17,-18],[13,6],[13,14],[17,10],[23,-13],[8,-3],[16,-3],[9,15],[12,14],[47,37],[55,21],[9,7],[15,15],[4,3],[3,4],[3,5],[3,2],[7,-3],[12,-14],[8,-22],[-1,-19],[-9,-20],[-41,-58],[-7,-14],[-3,-11],[3,-15],[10,-22],[26,-44],[14,-32],[11,-30],[2,-25],[3,-102],[3,-21],[9,-27],[2,-9],[-2,-46],[3,-17],[7,-13],[32,-42],[9,-8],[17,-9],[18,-13],[21,-22],[24,-37],[9,-9],[5,-3],[18,-1],[12,-2],[18,-6],[15,1],[17,6],[14,11],[14,13],[11,15],[8,17],[16,57],[6,11],[8,5],[11,0],[12,-5],[10,-12],[6,-23],[2,-19],[6,-21],[13,-25],[24,-40],[56,-56],[37,-49],[11,-21],[18,-53],[16,-31],[15,-36]],[[1860,6062],[2,-4],[3,-26],[0,-7],[-6,-39],[0,-10],[1,-8],[9,-17],[3,-12],[1,-9],[-1,-8],[-1,-6],[-2,-5],[-2,-4],[-3,-4],[-11,-7],[-3,-4],[-3,-7],[-3,-12],[0,-12],[-3,-9],[-4,-11],[-2,-11],[-1,-14],[-4,-82],[-1,-10],[-13,-52],[-3,-14],[0,-11],[6,-22],[3,-13],[3,-25],[-1,-11],[-1,-12],[-5,-24],[-3,-6],[-2,-4],[-10,-10],[-2,-5],[-2,-5],[-4,-16],[-2,-5],[-3,-3],[-4,-1],[-5,-1],[-4,-1],[-5,-4],[-2,-6],[-1,-8],[2,-20],[-1,-6],[-3,-3],[-4,-1],[-2,-1],[-2,-3],[-3,-6],[0,-6],[1,-8],[2,-9],[1,-16],[2,-9],[2,-6],[3,-4],[3,-3],[4,-3],[3,-6],[2,-8],[3,-26],[2,-7],[4,-9],[2,-6],[1,-6],[-1,-81],[2,-30],[3,-15],[11,-41],[6,-43],[2,-40],[3,-34],[3,-14],[4,-5],[4,0],[4,-5],[4,-10],[5,-35],[2,-9],[2,-5],[3,-3],[4,-2],[14,-4],[4,-3],[2,-4],[3,-4],[3,-12],[7,-31],[1,-3],[2,-4],[2,-3],[3,-4],[4,-2],[8,-2],[4,-3],[2,-3],[4,-10],[3,-4],[3,-3],[3,-3],[7,-5],[4,-2],[4,-1],[4,2],[7,4],[4,1],[7,0],[3,2],[1,4],[1,11],[1,6],[3,4],[3,2],[4,0],[3,-2],[4,-2],[4,0],[7,2],[4,1],[3,-1],[3,-1],[3,-3],[4,-2],[4,-1],[4,1],[3,3],[6,6],[4,2],[3,-1],[3,-2],[3,-4],[4,-3],[3,-3],[4,-8],[3,-3],[3,-1],[6,-2],[4,-3],[5,-5],[3,-8],[1,-8],[-2,-36],[-1,-6],[-1,-6],[-3,-4],[-3,-2],[-3,0],[-3,3],[-3,2],[-3,0],[-4,-2],[-6,-6],[-6,-8],[-5,-16],[-2,-2],[-3,-1],[-4,2],[-3,-1],[-4,-3],[-2,-6],[-1,-12],[2,-8],[3,-10],[0,-6],[-2,-6],[-3,-5],[-3,-14],[-3,-3],[-3,-1],[-4,1],[-2,0],[-3,-1],[-5,-5],[-2,-2],[-2,2],[-3,3],[-3,3],[-4,1],[-4,0],[-3,-3],[-3,-4],[-2,-5],[-3,-10],[-3,-13],[-1,-12],[-1,-21],[-2,-17],[-2,-41],[2,-36],[1,-9],[2,-7],[5,-13],[0,-5],[-1,-5],[-8,-12],[-3,-3],[-4,-1],[-4,0],[-3,3],[-4,0],[-4,-3],[-3,-12],[-1,-8],[1,-9],[5,-36],[5,-12],[3,-10],[0,-10],[-1,-12],[0,-8],[7,-65],[2,-12],[2,-8],[3,-4],[2,-4],[5,-9],[2,-5],[2,-8],[3,-10],[3,-23],[4,-19],[7,-10]],[[409,5077],[9,27],[10,18],[12,12],[46,34],[10,12],[6,16],[13,52],[16,47],[25,99],[12,71],[6,21],[8,19],[7,7],[17,12],[7,12],[2,11],[-4,67],[1,10],[4,13],[10,26],[15,54],[17,22],[12,14],[58,49],[37,41],[2,7],[7,19],[4,6],[5,2],[15,1],[3,1],[2,15],[-15,21],[3,18],[41,82],[6,17],[26,-13],[28,-3],[56,12],[33,-4],[40,-55],[29,-15],[27,3],[101,35],[14,8],[25,22],[11,17],[17,35],[10,16],[13,11],[17,8],[49,10],[26,13],[17,-1],[17,4],[15,13],[27,30],[16,10],[67,14],[10,9],[3,16],[0,78],[4,24],[11,14],[9,0],[7,-5],[7,-4],[11,4],[5,9],[9,30],[5,11],[12,15],[13,11],[31,13],[1,-9],[0,-11],[0,-10],[-4,-35],[3,-21],[8,-17],[13,-13],[8,-5],[7,-3],[7,-5],[6,-10],[4,-16],[-2,-12],[-3,-11],[-2,-14],[4,-25],[8,-13],[29,-12],[18,-14],[18,-20],[28,-47],[17,-42],[11,-10],[17,3],[6,4],[2,3]],[[6131,7251],[-15,-24],[-6,-3],[-11,-2],[-150,23],[-14,5],[-29,24],[-17,6],[-17,-1],[-16,-4],[-21,-9],[-6,-6],[-7,-9],[-9,-18],[-7,-17],[-5,-21],[-2,-21],[1,-28],[1,-9],[3,-13],[24,-64],[3,-12],[1,-12],[-1,-15],[-2,-10],[-26,-87],[-2,-16],[0,-13],[3,-12],[5,-10],[11,-13],[3,-8],[0,-11],[-6,-13],[-16,-11],[-23,-9],[-21,-5],[-17,0],[-13,6],[-7,13],[-6,16],[-4,19],[-6,16],[-7,11],[-18,18],[-9,10],[-5,11],[-4,10],[-3,15],[-4,5],[-7,2],[-14,-4],[-51,-40],[-14,-8],[-22,-5],[-6,-4],[-4,-8],[-8,-27],[-5,-11],[-7,-1],[-8,3],[-20,12],[-9,4],[-11,2],[-12,-3],[-15,-6],[-10,-24],[-8,-14],[-14,-16],[-29,-27],[-14,-16],[-7,-20],[4,-24],[23,-82],[0,-40],[-33,-15],[-123,-11],[-47,-11],[-16,-31],[-4,-26],[1,-20],[-1,-16],[-3,-13],[-14,-36],[-1,-14],[1,-12],[14,-51],[5,-103]],[[5165,6237],[-15,-20],[-3,-10],[-4,-17],[-6,-35],[-3,-10],[-6,-9],[-7,-8],[-9,-15],[-4,-14],[0,-17],[2,-10],[12,-30],[2,-9],[1,-12],[-2,-8],[-3,-6],[-2,-3],[-29,-33],[-9,-13],[-52,-113],[-13,-19],[-31,-62],[-5,-6],[-9,-14],[-54,-37],[-6,-5],[-2,-3],[-4,0],[-9,1],[-9,3],[-17,11],[-8,2],[-27,0],[-9,-6],[-9,-18],[-21,-82],[-3,-18],[-8,-15],[-47,-57],[-17,-11],[-17,7],[-4,-1],[-8,-6],[-19,-22],[-18,-22],[-14,-7],[-5,-1],[-6,3],[-2,5],[-1,5],[-4,3],[-25,-2],[-4,-2],[-9,7],[-7,-5],[-6,-9],[-4,-5],[-11,5],[-17,16],[-7,-5],[-12,2],[-19,-3],[-18,1],[-8,12],[-5,14],[-13,8],[-15,5],[-14,8],[-4,6],[-1,7],[0,7],[-1,4],[-4,2]],[[4418,5546],[-6,1],[-5,0],[0,-3],[-14,27],[-5,4],[-15,5],[-16,13],[-24,29],[-7,11],[-8,18],[-6,10],[-9,8],[-17,12],[-17,16],[-20,7],[-10,12],[-13,36],[-15,86],[-14,26],[-4,0],[-3,-4],[-4,-12],[-9,10],[-18,28],[-5,10],[-3,11],[-1,6],[0,10],[-2,11],[-5,0],[-6,-5],[-6,-3],[-13,19],[-4,71],[-17,-3],[-4,11],[2,24],[-3,11],[-9,0],[-10,8],[-9,5],[-3,-9],[-5,-1],[-25,12],[-8,1],[-10,16],[-9,-6],[-12,5],[-5,-7],[-12,20],[4,24],[10,26],[3,24],[-4,7],[-8,2],[-7,0],[-5,2],[-1,11],[6,12],[14,21],[-21,-6],[-9,1],[-7,12],[-9,3],[-15,29],[-10,8],[-7,-3],[-6,-7],[-7,-6],[-9,0],[-4,5],[-17,34],[-1,-26],[-11,4],[-25,38],[-9,-23],[-1,-8],[-12,10],[-28,55],[0,11],[19,22],[5,11],[-7,6],[-11,19],[-6,20],[23,18],[-1,19],[-7,21],[-7,13],[11,11],[5,12],[0,29],[-5,14],[-2,10],[1,12],[6,9],[16,10],[5,12],[-15,3],[-4,14],[3,30],[-2,36],[2,10],[-10,10],[-2,10],[0,12],[-3,15],[-41,51],[-15,24],[-12,25],[-1,17],[-11,5],[2,7],[6,8],[3,11],[-3,7],[-10,5],[-2,8],[0,9],[-1,6],[-1,6],[-3,7],[-12,21],[-29,32],[-12,17],[-37,94],[-4,27],[-2,30],[-6,28],[-19,24]],[[3583,7240],[-1,19],[8,31],[-1,6]],[[3589,7296],[7,6],[7,18],[25,26],[-15,26],[-23,25],[-13,11],[-6,18],[-92,58],[-9,10],[-4,15],[-2,19],[-5,11],[-13,-10],[-13,16],[0,16],[18,39],[7,-5],[7,1],[5,5],[3,10],[1,12],[5,4],[6,2],[11,10],[16,7],[3,4],[2,9],[5,8],[11,15],[17,17],[30,22],[30,13],[20,-9],[6,0],[6,1],[21,-7],[4,2],[4,13],[9,5],[32,3],[15,6],[8,1],[9,-8],[8,-10],[8,-4],[7,13],[8,-9],[14,-7],[14,-5],[13,-2],[10,3],[30,16],[7,-5],[58,1],[4,-2],[3,-3],[5,-1],[7,6],[17,0],[23,13],[23,7],[20,-20],[13,9],[33,-1],[7,4],[4,6],[19,11],[6,2],[9,1],[20,8],[16,3],[65,-6],[9,6],[10,20],[11,-7],[2,1],[9,2],[19,20],[6,1],[7,-1],[6,2],[2,9],[1,7],[2,6],[2,5],[3,2],[6,-4],[3,-18],[5,-1],[4,4],[0,6],[-1,7],[2,6],[23,28],[6,4],[6,-2],[11,-6],[6,-1],[1,4],[-1,8],[2,8],[6,4],[6,-6],[6,-14],[10,-14],[13,-6],[11,5],[22,23],[11,5],[8,-4],[9,-8],[17,-21],[15,5],[63,-5],[15,4],[5,4],[14,16],[7,5],[8,2],[10,-6],[15,24],[9,28],[11,24],[20,10],[4,12],[-8,27],[-5,26],[14,12],[9,3],[6,7],[3,11],[0,14],[3,11],[7,-1],[17,-14],[1,1],[14,-1],[13,-6],[6,-1],[39,0],[-10,47],[31,23],[35,16],[7,8],[6,-8],[6,10],[4,13],[4,12],[9,4],[3,3],[5,10],[2,3],[4,-3],[5,-5],[1,0]],[[4923,8194],[2,-3],[20,-32],[17,-7],[13,-3],[6,1],[5,3],[2,5],[9,20],[5,8],[2,4],[4,10],[3,4],[2,4],[5,5],[19,10],[13,2],[7,3],[4,3],[9,11],[3,4],[2,4],[2,6],[4,18],[1,6],[3,6],[4,7],[18,21],[26,23],[13,8],[12,5],[10,2],[19,8],[9,2],[16,0],[12,3],[35,16],[7,6],[2,5],[9,10],[5,8],[6,7],[3,4],[2,5],[3,11],[3,13],[3,7],[5,7],[16,18],[15,23],[17,17],[10,8],[10,6],[6,4],[5,4],[6,7],[3,5],[3,5],[2,5],[4,13],[3,7],[4,9],[4,3],[4,1],[19,-6],[6,-4],[4,-9],[4,-14],[2,-9],[1,-9],[-3,-23],[1,-12],[1,-16],[7,-39],[2,-14],[0,-22],[1,-10],[2,-8],[4,-7],[7,-5],[11,-1],[20,2],[20,0],[10,-5],[7,-11],[5,-14],[8,-15],[45,-61],[3,-7],[4,-23],[3,-13],[6,-14],[7,-12],[28,-33],[6,-13],[4,-21],[8,-75],[2,-14],[5,-12],[6,-9],[7,-13],[5,-16],[17,-72],[4,-13],[6,-9],[21,-14],[9,-9],[8,-11],[19,-37],[11,-13],[27,-25],[9,-10],[4,-8],[4,-12],[3,-16],[6,-18],[10,-18],[35,-36],[8,-10],[0,-11],[-1,-32],[21,-147],[8,-27],[10,-22],[58,-62],[12,-7],[43,-18],[57,-11],[13,-8],[8,-9],[4,-9],[1,-13],[1,-14],[-2,-40]],[[4418,5546],[-5,-43],[0,-62],[-6,-38],[-21,-82],[-9,-23],[-9,-19],[-21,-26],[-10,-18],[-7,-22],[-7,-15],[-7,-10],[-8,-10],[-37,-54],[-24,-28],[-8,-13],[-38,-75],[-7,-23],[-2,-28],[14,-127],[0,-15],[-1,-7],[-2,-3],[-4,0],[-7,3],[-20,20],[-15,9],[-31,5],[-24,-5]],[[4102,4837],[-160,30],[-50,-5],[-125,-47],[-52,-9],[-32,-12],[-15,-2],[-19,4],[-28,14],[-19,15],[-13,15],[-11,25],[-9,26],[-7,15],[-18,8],[-29,-1],[-172,-33]],[[3343,4880],[13,63],[6,15],[11,20],[13,13],[39,29],[7,8],[3,10],[0,11],[-3,17],[-4,9],[-5,7],[-36,20],[-16,14],[-15,16],[-13,18],[-5,16],[-2,17],[4,19],[6,17],[-3,4],[-3,1],[-9,1],[-4,1],[-2,3],[-3,8],[-13,63],[-7,17],[-10,16],[-19,22],[-4,13],[0,13],[7,17],[7,8],[13,12],[4,7],[2,8],[9,51],[6,18],[6,10],[11,8],[3,5],[0,8],[-4,10],[-20,12],[-1,6],[1,7],[6,11],[6,6],[21,17],[5,7],[3,6],[2,7],[1,9],[0,17],[1,10],[2,9],[5,9],[6,5],[31,19],[6,5],[3,7],[-1,24],[-82,349],[10,39],[37,48],[161,121],[8,12],[-2,4],[-3,-1],[-3,-1],[-3,-1],[-3,0],[-4,1],[-3,3],[-3,4],[-1,5],[-3,19],[0,7],[1,7],[3,7],[5,10],[1,6],[0,7],[-2,7],[-5,11],[-2,5],[1,6],[3,9],[4,4],[7,5],[2,2],[2,3],[1,5],[0,6],[-1,7],[-2,3],[-7,7],[-2,4],[-1,5],[3,4],[3,3],[12,8],[3,2],[6,8],[2,4],[2,5],[1,6],[0,6],[-3,6],[-2,6],[-1,8],[4,19],[1,9],[0,14],[1,10],[4,12],[4,6],[3,7],[8,30],[1,8],[-3,9],[-3,5],[-2,6],[0,5],[4,7],[3,4],[2,6],[1,8],[-2,11],[-3,14],[-1,6],[1,6],[4,7],[3,5],[3,5],[0,6],[-1,8],[-2,10],[-3,56],[-3,9],[-3,2],[-4,0],[-3,2],[-4,2],[-9,11],[-2,5],[-2,5],[0,9],[2,11],[6,20],[9,16],[2,8],[1,12],[-2,25],[1,7],[4,4],[3,2],[3,5],[1,7],[-2,23],[1,7],[4,5],[4,2],[3,3],[2,5],[-8,33],[-1,8],[0,9],[6,21],[2,7],[-2,10],[-6,10],[-1,3],[0,3],[2,4],[5,9],[3,10],[2,9],[-1,47],[-7,14]],[[4102,4837],[-3,-28],[1,-7],[2,-10],[3,-9],[6,-10],[7,-10],[7,-9],[8,-7],[25,-13],[11,-10],[16,-18],[12,-24],[3,-20],[-3,-24],[-14,-55],[-2,-23],[1,-14],[10,-22],[0,-10],[-5,-11],[-15,-20],[-4,-14],[1,-10],[7,-21],[0,-7],[-3,-6],[-4,-5],[-4,-7],[-6,-17],[-11,-21],[-10,-28],[-4,-6],[-5,-4],[-7,0],[-13,4],[-5,1],[-5,0],[-5,-2],[-4,-2],[-4,-3],[-4,-3],[-2,-3],[-2,-4],[-4,-12],[-9,-17],[-64,-75],[-12,-21],[1,-15],[18,-104],[2,-14],[-1,-7],[-1,-4],[-9,-14],[-1,-7],[0,-5],[2,-4],[4,-2],[31,-14],[6,-9],[3,-16],[1,-36],[-4,-24],[-9,-22],[-71,-86],[-10,-8],[-35,-7],[-8,-4],[-8,-6],[-6,-13],[0,-9],[3,-7],[5,-6],[5,-8],[4,-8],[8,-24],[14,-5],[325,-4],[39,-9],[14,-15],[-1,-18],[-2,-15],[-3,-10],[-4,-8],[-7,-12],[-4,-9],[-9,-35],[-7,-16],[-4,-13],[-2,-21],[-1,-73],[-4,-20],[-1,-16],[-1,-34],[-13,-80],[-13,-34],[-10,-18],[-10,-9],[-8,-4],[-16,-17]],[[4191,3222],[-7,15],[-8,16],[-11,10],[-35,25],[-23,7],[-16,11],[-7,2],[-87,3],[-28,19],[-16,-4],[-24,-18],[-15,-3],[-50,3],[-18,-6],[-11,-16],[-16,-33],[-68,-63],[-36,-25],[-6,-10],[-11,-29],[-15,-30],[-13,-4],[-35,0],[-13,-7],[-7,-10]],[[3253,3986],[-7,60],[0,53],[-2,20],[-7,29],[0,21],[3,21],[8,33],[2,19],[-1,18],[-3,20],[0,9],[1,6],[41,25],[15,15],[24,20],[14,13],[41,60],[27,30],[15,21],[5,6],[24,14],[9,13],[3,10],[-2,8],[-6,5],[-16,10],[-7,9],[-4,14],[-2,22],[-1,30],[2,64],[-3,17],[-8,17],[-70,102],[-9,23],[-3,13],[1,7],[1,4],[5,13]],[[4649,2611],[-3,4],[-8,25],[4,22],[7,19],[5,17],[-5,23],[-13,26],[-15,21],[-13,8],[-6,8],[-17,54],[-15,36],[-11,19],[-13,8],[-16,3],[-36,17],[-14,11],[-14,18],[-35,64],[-15,14],[-51,29],[-24,25],[-18,23],[-21,19],[-68,21],[-18,10],[-8,16],[-4,17],[-13,34]],[[5165,6237],[33,-40],[22,-37],[18,-19],[15,-12],[54,-17],[17,-13],[19,-19],[18,-25],[11,-19],[8,-17],[5,-17],[2,-9],[2,-16],[1,-20],[-9,-121],[1,-16],[6,-20],[8,-11],[12,-6],[41,-3],[7,2],[7,2],[9,1],[11,-2],[16,-10],[8,-12],[4,-15],[-2,-110],[20,-199],[5,-11],[14,-15],[4,-11],[1,-44],[12,-57],[0,-9],[-2,-7],[-2,-6],[-3,-5],[-2,-6],[0,-7],[2,-14],[1,-10],[0,-9],[-2,-6],[-3,-7],[-16,-14],[-4,-6],[-2,-7],[0,-11],[4,-9],[5,-9],[7,-13],[21,-94],[7,-19],[7,-14],[5,-8],[7,-13],[6,-18],[4,-8],[4,-5],[5,-1],[25,-1],[9,-3],[10,-6],[10,-16],[4,-10],[2,-12],[-1,-11],[-9,-38],[-1,-10],[5,-59],[16,-91],[1,-25],[-6,-21],[-8,-22],[-31,-68],[-5,-15],[0,-17],[5,-10],[20,-23],[11,-20],[5,-18],[6,-37],[7,-19],[3,-17],[3,-37],[6,-10],[9,-5],[13,0],[12,-4],[8,-8],[6,-14],[13,-68],[5,-17],[18,-40],[2,-19],[-4,-91],[-9,-63],[-14,-46],[-4,-42],[-3,-12],[-6,-12],[-16,-24],[-9,-22],[-5,0],[-9,8],[-30,37],[-13,13],[-8,5],[-8,-1],[-8,-6],[-28,-32],[-33,-50],[-7,-56]],[[1860,6062],[16,20],[2,0],[9,-2],[2,2],[2,9],[-3,6],[-3,5],[-1,7],[6,23],[8,15],[12,10],[30,12],[33,8],[14,-2],[6,13],[6,7],[9,1],[23,-6],[3,6],[-1,9],[3,11],[11,13],[15,-7],[8,-7],[4,-7],[5,0],[11,10],[15,21],[27,48],[14,19],[6,2],[6,-2],[5,5],[3,21],[4,13],[10,15],[1,1],[12,12],[104,55],[15,14],[10,17],[36,-16],[10,9],[6,26],[13,13],[16,6],[27,4],[16,7],[15,11],[16,32],[14,7],[17,2],[14,-1],[105,-27],[32,-2],[30,8],[61,34],[71,25],[81,3],[255,10],[62,20],[22,48],[0,56],[15,44],[26,34],[33,24],[45,23],[13,10],[17,22],[32,72],[25,36],[11,20],[7,28],[7,21],[77,130],[31,91],[9,7]],[[6952,7892],[-1,0],[-7,24],[-1,29],[6,24],[3,11],[-2,6],[-5,4],[-9,1],[-9,0],[-10,-3],[-10,-5],[-9,-6],[-8,-7],[-7,-10],[-7,-12],[-6,-18],[-6,-22],[-16,-123],[-5,-22],[-5,-14],[-12,-20],[-11,-14],[-5,-4],[-7,-3],[-7,-3],[-29,-5],[-14,-6],[-16,-14],[-53,-59],[-15,-24],[-9,-28],[-4,-72],[-3,-25],[-10,-25],[-8,-9],[-8,-3],[-23,8],[-8,0],[-142,-53],[-97,-20],[-30,-13],[-38,-33],[-12,-13],[-42,-59],[-8,-8],[-7,-3],[-6,-1],[-6,0],[-7,2],[-26,15],[-10,1],[-9,-2],[-8,-3],[-17,-2]],[[4923,8194],[4,-3],[5,2],[5,22],[1,29],[6,25],[17,11],[8,10],[29,47],[7,17],[3,12],[7,9],[16,14],[4,10],[1,10],[4,4],[12,-8],[-1,15],[-1,4],[-3,4],[0,8],[10,5],[5,15],[1,39],[2,17],[11,31],[2,22],[2,5],[5,6],[5,5],[4,3],[1,2],[1,3],[2,2],[4,2],[4,-3],[7,-11],[3,-2],[5,4],[6,5],[9,14],[3,1],[4,-1],[3,-1],[1,5],[-1,16],[1,4],[11,41],[8,20],[43,41],[6,3],[2,18],[6,15],[39,68],[11,13],[11,-10],[31,-18],[10,-4],[27,16],[25,37],[20,46],[40,135],[21,41],[25,22],[7,-1],[9,-5],[10,-3],[8,5],[3,-2],[24,11],[4,4],[20,7],[10,17],[6,23],[9,23],[6,4],[9,1],[8,4],[3,10],[-1,10],[-3,17],[-1,12],[3,24],[23,58],[-5,8],[-1,8],[1,8],[0,7],[-5,10],[-13,23],[-3,11],[-1,18],[-7,44],[-2,23],[2,23],[7,33],[1,23],[5,18],[10,10],[13,6],[12,1],[4,4],[4,8],[4,8],[8,3],[7,2],[14,6],[8,1],[15,-11],[9,-3],[3,10],[3,1],[18,25],[23,24],[14,9],[46,17],[8,13],[-7,24],[5,16],[5,23],[9,22],[14,9],[65,-10],[12,3],[21,-17],[11,24],[8,36],[22,27],[8,16],[10,10],[12,-7],[6,0],[8,8],[14,19],[10,8],[16,9],[17,7],[2,1],[21,5],[12,5],[9,9],[14,23],[8,8],[10,3],[12,-3],[11,-6],[9,-1],[7,10],[18,-23],[16,-2],[16,7],[18,3],[7,-3],[14,-10],[8,-2],[27,1],[7,-1],[29,-11],[19,-24],[46,-22],[43,-6],[1,-31],[109,-234],[80,-83],[139,-199],[128,-304],[127,-303],[16,-51],[22,-197],[-3,-44],[-11,-34],[-28,-64],[-10,-33],[1,-12],[7,-29],[2,-15],[-1,-35],[2,-11],[6,-14],[5,0],[5,-3],[4,-9],[1,-7],[-20,-89],[-1,-20],[8,-35],[1,-17],[-6,-14],[-11,-11],[-29,-55],[-17,-25],[-9,-8],[-12,-4],[-25,2],[-12,-7],[-8,-19]],[[6952,7892],[-4,-9],[-17,-145],[2,-28],[10,-23],[20,-18],[21,3],[29,41],[13,-1],[6,-24],[-1,-40],[-10,-65],[-13,-31],[-31,-53],[-10,-30],[-1,-27],[6,-31],[12,-25],[16,-10],[11,4],[18,20],[11,9],[14,4],[13,-2],[12,-8],[11,-12],[10,-6],[25,1],[25,-10],[12,6],[24,16],[27,1],[48,-16],[43,6],[30,-18],[15,-4],[21,6],[80,-20],[44,9],[7,1],[29,1],[14,-10],[-2,-17],[-14,-30],[-3,-16],[5,-16],[21,-24],[4,-14],[-5,-11],[-31,-31],[-8,-12],[-43,-107],[-9,-39],[-3,-37],[8,-33],[16,-29],[21,-23],[20,-16],[12,-7],[27,-9],[5,-1]],[[7565,6882],[28,-43],[42,-51],[13,-11],[8,-5],[13,-4],[6,-4],[5,-9],[3,-14],[3,-25],[4,-12],[4,-7],[4,-4],[5,-6],[8,-13],[4,-5],[10,-9],[3,-17],[-1,-30],[-17,-114],[2,-12],[3,-10],[2,-12],[2,-46],[4,-27],[5,-22],[6,-20],[2,-14],[1,-14],[-1,-27],[1,-13],[2,-9],[2,-4],[2,-4],[3,-9],[1,-4],[-3,-94],[6,-30],[1,-5],[4,-9],[10,-14],[4,-11],[10,-45],[3,-4],[4,-3],[4,-2],[2,-3],[2,-5],[-2,-7],[1,-7],[2,-4],[2,-3],[5,-3],[6,-6],[8,-4],[2,-3],[0,-3],[-4,-8],[-5,-13],[-13,-47],[-10,-17],[-5,-20],[-8,-18],[-13,-43],[-4,-23],[-1,-12],[0,-9],[1,-6],[2,-6],[2,-5],[1,-5],[0,-8],[-1,-8],[-2,-14],[1,-6],[2,-3],[4,1],[7,4],[3,-1],[2,-4],[1,-6],[-1,-6],[-1,-9],[-1,-6],[2,-5],[2,-3],[8,-4],[3,-4],[2,-4],[1,-8],[-2,-10],[-3,-19],[-1,-11],[-1,-9],[1,-6],[1,-7],[0,-7],[-1,-7],[-1,-6],[-8,-34],[0,-8],[1,-7],[6,-15],[1,-6],[2,-20],[0,-8],[-1,-9],[-7,-24],[-3,-5],[-5,0],[-7,5],[-4,-1],[-4,-6],[-13,-27],[-3,-3],[-17,-9],[-13,-1],[-4,1],[-4,2],[-3,2],[-4,2],[-8,-1],[-9,1],[-4,0],[-22,-14],[-5,0],[-8,2],[-6,-3],[-6,-6],[-15,-23],[-3,-6],[3,-27],[3,-11],[2,-5],[3,-3],[4,-2],[3,-2],[1,-4],[-1,-4],[-4,-3],[-5,-3],[-3,-5],[-2,-13],[1,-14],[-1,-6],[-8,-11],[-4,-4],[-4,-2],[-9,-3],[-4,-2],[-2,-5],[0,-9],[3,-6],[3,-4],[1,-5],[3,-10],[3,-3],[3,-2],[-1,-5],[-3,-4],[-11,-3],[-6,0],[-5,-1],[-4,-1],[-6,-23]],[[7563,5153],[-620,-515],[-10,-13],[-2,-4],[-7,-13],[-6,-14],[-2,-5],[-1,-6],[-1,-14],[-1,-9],[-4,-9],[-8,-12],[-6,-4],[-6,-3],[-5,0],[-9,-2],[-5,-1],[-4,1],[-7,5],[-5,2],[-9,-1],[-4,-4],[-3,-5],[-4,-15],[-7,-11],[-4,-7],[-2,-7],[0,-6],[1,-6],[2,-5],[0,-5],[0,-6],[-2,-5],[0,-6],[-1,-6],[1,-13],[0,-8],[-2,-8],[-16,-8],[-22,-3],[-200,73],[-58,30],[-23,25],[-14,21],[-9,27],[-3,9],[-4,5],[-5,6],[-6,4],[-9,2],[-12,-2],[-32,-9],[-13,0],[-22,6],[-16,2],[-96,-28],[-14,-15],[-12,-18],[-13,-40],[-11,-61],[-10,-25],[-7,-15],[-12,-14],[-43,-38],[-13,-7],[-10,-1],[-8,3],[-10,2],[-9,0],[-28,-7],[-7,1],[-6,6],[-4,8],[-5,8],[-6,5],[-11,0],[-10,-5],[-73,-61],[-11,-14],[-9,-8],[-5,-7],[2,-8],[6,-11],[-3,-24],[-26,-44],[-5,-34],[3,-82],[-4,-40],[-5,-19],[-5,-11],[-4,-12],[-1,-24],[3,-8],[15,-28],[2,-5],[6,-34],[-14,-5],[-16,2],[-13,-4],[-4,-24],[14,3],[-7,-20],[-14,-24],[-12,-13],[-14,-8],[-3,-4],[-3,-2],[-13,-26],[-42,-51],[-1,-16]],[[7731,3270],[1,0],[9,12],[4,8],[1,2],[1,1],[2,1],[2,1],[1,0],[2,0],[3,-2],[11,-13],[3,-3],[4,-2],[3,1],[4,3],[5,6],[3,3],[1,3],[1,3],[0,4],[0,3],[-1,2],[-4,3],[-8,2],[-3,3],[-2,5],[0,9],[2,6],[3,4],[1,3],[-1,3],[-2,6],[-2,6],[1,8],[2,5],[2,5],[3,3],[4,0],[3,-3],[2,-3],[3,-5],[1,-4],[3,-3],[1,1],[2,4],[0,28],[1,4],[1,3],[5,6],[2,5],[1,2],[1,3],[0,17],[1,5],[3,4],[3,2],[2,4],[2,5],[1,6],[0,5],[1,3],[1,2],[1,0],[1,0],[3,-3],[5,-6],[2,-3],[4,-1],[4,1],[3,2],[5,1],[9,-1],[8,1],[9,-1],[12,-5],[3,-1],[2,1],[2,1],[4,2],[6,5],[4,5],[2,4],[5,13],[2,2],[2,3],[13,7],[1,0],[2,0],[3,-2],[3,-2],[3,-3],[3,-3],[4,-2],[3,-1],[3,1],[1,3],[1,4],[1,12],[1,5],[1,4],[2,1],[8,2],[4,2],[3,2],[3,3],[1,2],[10,22],[2,4],[3,3],[3,-1],[3,-3],[3,-4],[2,-3],[3,-2],[4,-1],[5,-4],[2,1],[1,1],[1,1],[1,3],[4,30],[-1,30],[2,3],[1,-1],[3,-4],[2,-2],[2,1],[1,3],[0,14],[1,6],[2,2],[2,2],[11,6],[1,6],[1,5],[-1,11],[3,3],[3,0],[10,-7],[3,-1],[2,1],[5,9],[1,1],[2,1],[6,1],[5,2],[3,3],[2,2],[1,2],[0,3],[0,2],[-7,9],[-2,6],[-1,9],[1,5],[3,3],[3,2],[3,1],[2,1],[1,0],[3,-1],[3,1],[2,1],[2,2],[2,4],[1,5],[2,4],[1,1],[9,7],[3,4],[2,4],[2,5],[0,3],[1,5],[0,12],[0,4],[1,6],[2,4],[3,3],[7,6],[5,6],[1,3],[-2,2],[-6,3],[-9,4],[-2,2],[0,3],[3,4],[13,11],[1,3],[-1,2],[-4,5],[-3,6],[-3,11],[-1,9],[1,7],[2,4],[3,4],[2,5],[0,8],[-3,15],[0,10],[0,7],[4,10],[1,7],[1,8],[-1,12],[0,9],[1,7],[4,10],[0,7],[0,10],[-3,15],[1,7],[3,3],[4,2],[6,6],[3,3],[13,1],[4,2],[4,2],[3,3],[2,4],[5,16],[2,4],[3,3],[4,1],[3,-2],[3,-3],[2,-5],[10,-28],[2,0],[2,3],[1,6],[1,14],[2,5],[1,5],[1,6],[0,6],[0,13],[1,21],[6,31],[14,30],[2,17],[-5,17],[-15,30],[-13,8],[-10,3],[-8,-3],[-7,0],[-7,5],[-6,12],[-3,11],[-4,12],[-6,12],[-12,21],[-4,11],[-1,9],[0,6],[-2,8],[-5,6],[-7,3],[-15,0],[-5,3],[-12,28],[-99,129],[-10,20],[1,6],[4,3],[26,-14],[14,-5],[13,-2],[11,3],[16,17],[8,5],[15,7],[5,4],[2,6],[5,29],[5,15],[6,7],[9,3],[14,0],[10,5],[6,9],[2,16],[-1,20],[-2,14],[-7,16],[-9,15],[-35,44],[-27,28],[-20,13],[-13,14],[-20,25],[-10,8],[-15,3],[-43,-5],[-12,-5],[-17,-15],[-46,-68],[-14,-14],[-11,-4],[-23,5],[-12,0],[-10,-5],[-7,-6],[-53,64],[-216,349]],[[7565,6882],[13,-2],[11,0],[6,-2],[6,-4],[12,-15],[4,-3],[50,25],[26,4],[18,-26],[4,-10],[4,-8],[5,-4],[8,-3],[24,-22],[24,-1],[54,12],[43,-12],[15,0],[15,-2],[25,-20],[44,-8],[24,-16],[66,-90],[8,-19],[1,-40],[16,-24],[2,-20],[4,-9],[5,-7],[6,-7],[7,-5],[36,-61],[23,-26],[24,-13],[10,1],[24,8],[11,0],[19,-5],[5,-5],[4,-7],[5,-6],[19,-10],[10,-14],[7,-18],[8,-36],[12,-30],[4,-19],[0,-17],[-3,-49],[3,-17],[5,-16],[2,-17],[-3,-20],[-18,-22],[-50,-26],[-16,-23],[-1,-14],[4,-19],[16,-57],[46,-35],[10,-10],[5,-8],[7,-18],[4,-8],[6,-5],[13,-6],[5,-5],[6,-17],[5,-33],[4,-16],[9,-17],[10,-11],[43,-31],[30,-34],[20,-14],[14,8],[13,-3],[11,-11],[35,-47],[12,-9],[47,-19],[14,-8],[19,-22],[6,-3],[15,1],[8,-5],[12,-18],[8,-3],[19,-2],[4,-9],[0,-15],[7,-19],[12,-6],[34,-4],[13,-9],[3,-9],[2,-22],[4,-10],[24,-20],[8,-3],[15,-4],[8,-4],[4,-9],[1,-8],[2,-7],[9,-4],[34,-4],[5,-26],[2,-59],[8,-26],[4,-3],[5,1],[5,1],[4,0],[3,-4],[0,-6],[-1,-7],[0,-7],[3,-15],[1,-13],[3,-12],[8,-14],[17,-16],[14,-5],[12,-8],[24,-44],[31,-33],[13,-20],[26,-20],[46,-25],[37,-31],[0,-25],[1,-13],[-6,-12],[-12,-34],[-25,-48],[-14,-46],[-7,-9],[-8,-6],[-7,-8],[-5,-13],[14,-7],[2,-17],[-5,-21],[-1,-21],[5,-24],[8,-10],[12,-7],[15,-13],[12,-18],[19,-37],[14,-13],[32,-10],[12,-14],[3,-29],[0,-27],[7,-7],[11,0],[13,-4],[10,-18],[0,-22],[-7,-21],[-13,-15],[-14,-12],[-15,-16],[-12,-19],[-6,-22],[2,-25],[13,6],[30,31],[14,-5],[9,-20],[6,-25],[7,-20],[12,-14],[45,-23],[25,-5],[54,4],[55,-32],[13,-13],[9,-15],[4,-51],[6,-20],[18,-12],[18,2],[13,6],[9,-2],[7,-26],[10,-20],[16,-1],[33,12],[9,-13],[9,-32],[14,-17],[6,-17],[5,-5],[7,-1],[14,7],[7,1],[32,-19],[7,-7],[5,-19],[1,-12],[3,-9],[16,-7],[11,-8],[9,-15],[6,-18],[2,-18],[1,-10],[1,-7],[4,-5],[13,-13],[1,-6],[-2,-7],[-1,-20],[-4,-17],[1,-7],[4,-11],[4,-1],[4,2],[3,1],[3,2],[4,3],[6,1],[7,-8],[3,-9],[-2,-20],[2,-11],[-31,-125],[-2,-18],[2,-14],[6,-29],[4,-56],[3,-17],[21,-72],[12,-34],[16,-29],[44,-44],[20,-26],[13,-45],[22,-24],[8,-14],[-20,11],[-8,2],[-10,11],[-9,3],[-14,1],[-8,2],[-6,4],[-11,11],[-10,13],[-11,11],[-13,5],[-17,3],[-17,7],[-63,46],[-32,17],[-33,4],[-35,-15],[-27,-22],[-23,-23],[-22,-28],[-23,-36],[-3,-10],[-8,-27],[-4,-10],[-9,-13],[-4,-5],[-13,1],[-1,3],[-3,6],[-4,5],[-5,3],[-5,-3],[-8,-12],[-6,-2],[-5,7],[-31,49],[-6,5],[-11,3],[-36,0],[-8,-6],[-11,-13],[-7,-6],[-11,6],[-6,-1],[-5,-12],[-4,0],[-7,13],[-13,3],[-14,-7],[-9,-17],[-5,8],[-5,-8],[-10,-8],[-10,-5],[-7,-3],[-13,2],[-21,11],[-10,3],[-1,7],[-15,44],[-9,11],[-12,10],[-11,12],[-7,18],[-16,-10],[-5,-5],[-7,13],[-13,1],[-15,-2],[-19,5],[-15,9],[-14,15],[-6,21],[-4,-3],[-8,-3],[-4,-2],[0,18],[0,6],[-9,-6],[-5,10],[-7,35],[-2,-4],[-9,-11],[-2,5],[-5,4],[-3,6],[-10,-7],[-5,9],[-6,13],[-10,8],[-4,-12],[-4,-8],[-6,-3],[-6,0],[-5,1],[-3,2],[-4,4],[2,-29],[3,-9],[-7,4],[-7,2],[-5,-5],[-2,-13],[-4,-1],[-9,0],[-10,-2],[-8,-9],[-10,10],[-14,23],[-8,7],[-10,3],[-7,-4],[-4,-11],[0,-20],[-11,8],[-14,-3],[-10,-13],[-1,-23],[-14,17],[-7,21],[-9,16],[-17,0],[-3,-7],[-7,-13],[-8,-6],[-6,23],[-3,8],[-2,10],[2,16],[-3,-2],[-9,-3],[-3,-2],[-2,28],[-11,7],[-7,-5],[9,-7],[-7,-15],[-10,-1],[-11,7],[-9,9],[-21,35],[-11,12],[-17,7],[-1,1],[-3,3],[-6,9],[-4,3],[-9,-2],[-6,-7],[-5,-3],[-11,12],[0,7],[4,4],[2,4],[2,5],[2,4],[-17,-1],[-6,10],[-3,15],[-6,15],[-4,0],[-11,-3],[-13,3],[-9,-3],[6,-21],[-9,-3],[-19,-11],[-6,3],[-9,12],[-2,2],[-1,-4],[-35,-28],[-16,-6],[-14,12],[-8,-14],[-11,-6],[-5,-7],[9,-20],[-15,-7],[-10,-17],[-5,-23],[-1,-27],[-5,-14],[-10,-15],[-6,-20],[5,-25],[5,-5],[15,-4],[6,-7],[1,-9],[-5,-22],[-1,-12],[-2,-7],[-11,-20],[-2,-12],[-1,-29],[-3,-11],[-7,-11],[-12,-5],[-34,-5],[-7,-9],[-9,-7],[-49,-5],[-7,4],[-5,6],[-6,4],[-8,1],[-6,-11],[-5,-8],[-7,-4],[-4,-4],[-8,-23],[-4,-23],[-7,-3],[-27,12],[-26,21],[-28,12],[-9,0],[-6,-4],[-14,-15],[-4,-4],[-17,-5],[-28,-26],[-15,-8],[-9,1],[-7,5],[-6,3],[-7,-5],[-8,-13],[-8,-11],[-9,-1],[-9,13],[-13,-13],[-14,-1],[-51,8],[-8,5],[3,12],[10,20],[-11,12],[-22,11],[-9,9],[-5,13],[0,23],[-6,11],[-10,5],[-19,5],[-8,4],[-5,9],[-6,22],[-5,8],[-14,16],[-21,16],[-5,2]],[[7731,3270],[-16,5],[-17,-7],[-3,-13],[0,-16],[-2,-9],[-11,6],[-4,10],[-7,34],[-4,12],[-11,-16],[-11,-27],[-5,-24],[8,-11],[19,-6],[1,-14],[-9,-16],[-14,-11],[-55,-10],[-7,-10],[-2,-3],[-9,-32],[-2,-13],[0,-11],[-2,-8],[-6,-7],[-5,0],[-5,27],[-13,9],[-15,-6],[-15,-14],[-21,-41],[-8,-6],[-10,3],[-15,15],[-9,5],[-14,-3],[-13,-12],[-20,-24],[-39,-27],[-14,-13],[-11,17],[-5,2],[-5,-3],[-3,-7],[-2,-11],[-1,-13],[4,-11],[0,-15],[-18,0],[-32,10],[-6,-2],[-8,-10],[-7,-3],[-5,1],[-15,6],[-9,1],[-14,-7],[-30,-31],[-17,-9],[-34,-7],[-16,-7],[-29,-25],[-35,-13],[-17,-11],[-46,-54],[-14,-8],[-18,-3],[-13,-9],[-8,-14],[-6,-21],[-1,-13],[0,-10],[0,-8],[-4,-8],[-6,-4],[-15,1],[-5,-5],[-14,11],[-13,8],[-14,3],[-15,1],[-2,3],[-9,13],[-1,4],[-4,3],[-17,5],[-6,4],[-10,31],[-21,20],[-3,4],[-9,8],[-19,39],[-12,15],[-34,-26],[-19,-4],[-17,11],[-8,10],[-9,9],[-9,6],[-10,2],[-10,6],[-4,15],[-3,17],[-9,24],[-8,31],[-6,9],[-10,1],[-9,-5],[-9,-7],[-9,-5],[-11,1],[-7,3],[-6,0],[-7,-12],[-5,-14],[0,-14],[3,-14],[7,-13],[-6,-11],[-17,-19],[-9,-32],[-13,4],[-14,12],[-12,7],[-13,-7],[-7,-17],[-9,-39],[-6,-17],[-6,-14],[-9,-12],[-11,-11],[1,-13],[4,-23],[1,-11],[-2,-8],[-7,-20],[-2,-7],[-2,-6],[-11,-12],[-2,-6],[0,-27],[-1,-12],[-5,-11],[-10,-8],[-17,-2],[-33,1],[-14,-12],[-4,-27],[1,-32],[4,-22],[13,-23],[2,-9],[-3,-12],[-7,-13],[-9,-9],[-9,-4],[-6,-11],[-23,-61],[1,-12],[4,-24],[0,-10],[-4,-12],[-14,-18],[-3,-5],[-6,-18],[-13,-19],[-28,-29],[-4,-3],[-15,-9],[-7,-4],[-92,-7],[-73,24],[-17,17],[-18,10],[-8,7],[-14,22],[-4,5],[-15,7],[-39,11],[-16,12]]],"transform":{"scale":[0.0013055340772077277,0.000876525111811184],"translate":[14.387266072000074,2.23645375600006]}};
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
  Datamap.prototype.deuTopo = '__DEU__';
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
