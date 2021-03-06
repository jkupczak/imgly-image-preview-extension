(function() { // Begin scoping function

// WAIT FOR BODY TO SHOW UP.
// Then determine based on the body if this is an image page generated by Chrome.
// use arrive.js
//
// document.arrive("svg:root", function() {
//
//   console.log("svg is here");
//
// });
//
// document.arrive("body", function() {
//
//   if ( this.children.length === 1  &&  this.children[0].tagName === "IMG" ) {
//     buildPage();
//   }
//
// });

//////////////////
//////////////////
//
//
//    Global Variables
//
//
//////////////////
//////////////////

// var img;
// var widthInput, heightInput, percentageInput;
// var naturalWidth, naturalHeight;

//////////////////
//////////////////
//
//
//    Use Mutation Observer to detec that this is in fact an image.
//
//
//////////////////
//////////////////

// Select the node that will be observed for mutations
var targetNode = document;

// Options for the observer (which mutations to observe)
var config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = function(mutationsList) {

  console.log(mutationsList);

  for (var mutation of mutationsList) {

      if (mutation.type == 'childList') {
        if ( mutation.target.tagName === "svg" ) {

          pageType = "svg";
          buildPage(pageType);

          // stop observing
          observer.disconnect();
          return false;
        }
        else if ( mutation.target.tagName === "HTML" && mutation.addedNodes[0].tagName === "BODY" && mutation.addedNodes[0].children.length === 1 && mutation.addedNodes[0].children[0].tagName === "IMG" ) {

          pageType = "img";
          buildPage(pageType);

          // stop observing
          observer.disconnect();
          return false;
        }
        else {
          // Do nothing
        }
      }

  }

  // Done looping through all mutations
  console.log("not an image or svg page");
  // stop observing
  observer.disconnect();
  return false;
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);



////////////////////////

// var http = new XMLHttpRequest();
//
// http.open('HEAD', document.URL);
// http.onreadystatechange = function() {
//
//     if (this.readyState == this.DONE) {
//
//       var fileType = this.getResponseHeader('content-type');
//
//       if ( /image/gi.test(fileType) ) {
//         console.log(fileType);
//         buildPage();
//       }
//
//     }
//
// };
// http.send();


////////////////////////
////////////////////////

/**
 * []
 * @param  {[type]} arg1 [description]
 * @return {[type]}      [description]
 */
function buildPage(type) {


  // http://stackoverflow.com/a/1310399/556079
  ///////////////////////
  ///////////////////////
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', document.URL, true);
  xhr.onreadystatechange = function(){
    if ( xhr.readyState == 4 ) {
      if ( xhr.status == 200 ) {

        // console.log( xhr.getAllResponseHeaders() );

        // var size = humanFileSize(xhr.getResponseHeader('Content-Length'), true);
        var extension = "." + xhr.getResponseHeader('Content-Type').replace(/image\//, "").toUpperCase();

        // document.querySelector(".size").innerHTML = size;

        console.log( xhr.getAllResponseHeaders() );
        console.log( xhr.getResponseHeader('Content-Length') );
        console.log( xhr.getResponseHeader('Content-Type') );

        fileTypeText.innerHTML = xhr.getResponseHeader('Content-Type');

        // alert('Size in bytes: ' + humanFileSize(xhr.getResponseHeader('Content-Length'), true) +  humanFileSize(xhr.getResponseHeader('Content-Length'), false));

      } else {
        var size = "N/A";
        document.querySelector(".size").style.display = "none";

        // var extension = "." + cleanUrl.replace(/^.+\./i, "").toUpperCase();
        // alert('ERROR');
      }

      // document.querySelector(".ext").innerHTML = extension;
    }
  };
  xhr.send(null);


  // Create our containing elements.
  // We can make these now regardless of what kind of image this is.
  var container = createEl("div");
  container.id = "main-container";

  var controls = createEl("div");
  controls.id = "controls";
  container.appendChild(controls);

  var canvas = createEl("div");
  canvas.id = "canvas";
  container.appendChild(canvas);


  // Is this an SVG?
  // We need to create a better document tree
  if (type === "svg") {

    // We can only have one node and the svg node is at the root right now
    // We need to remove it, replace it with html/body, and then re-add it.
    originalSvg = document.querySelectorAll("svg")[0];
    originalSvg.parentNode.removeChild(originalSvg);

    // Create the HTML tag and add it to the document.
    // Since the document is an SVG, we have to declare the namespace for all tags.
    // https://stackoverflow.com/a/41495485/556079
    var htmlTag = createEl("html");
    document.appendChild(htmlTag);

    // Create the body tag and append it to the html tag.
    var bodyTag = createEl("body");
    htmlTag.appendChild(bodyTag);

    // Create an img element to hold our svg.
    img = createEl("img");
    img.src = document.URL;

    // Re-add our svg element to the canvas div.
    canvas.appendChild(img);

  }
  // Chrome applies some effects to images.
  // Lets copy the image url, delete the original node, and then add a new one
  else if ( type === "img" ) {

    var oldImg = document.querySelectorAll("img")[0];

    img = createEl("img");
    img.src = oldImg.src;

    // destroy original image
    oldImg.parentNode.removeChild(oldImg);

    // append new image
    canvas.appendChild(img);
  }

  // Now that we've refreshed the image, wait for the image to load.
  ////////////////////
  img.addEventListener("load", function() {

    //
    updateDimsInputs();

    // Get dominant color
    var colorThief = new ColorThief();
    console.log( colorThief.getColor(img) );

    // Get the naturalwidth and height for use later.
    naturalWidth = img.naturalWidth;
    naturalHeight = img.naturalHeight;

    if ( naturalWidth > 999 || naturalHeight > 999 ) {
      document.body.classList.add("thousand");
    }

    // Reset image when its double clicked.
    img.addEventListener("dblclick", function() {
      zoom("0");
    }, false);

  });


  // Add our main-container to the body.
  var finalBodyTag = document.getElementsByTagName("body")[0];
  finalBodyTag.appendChild(container);

  // Activate our styles by adding a class to the html tag.
  document.getElementsByTagName("html")[0].classList.add("mirage-online");



  ///////////////////
  ///////////////////
  ////  NOTES
  ///////////////////
  ///////////////////

  // double click to toggle through modes
  // Copy URL of img to clipboard
  // Add ratio info. eg 1:1, 16:9, 4:3. Reduce to the lowest whole number
  // Scroll wheel changes the input numbers when you are focused on them
  // How do I stop that Chrome zoom on big images?
  // Add buttons for dfferent background colors
  // Fix inputs so that when entering eg. 230 height, it doesnt change to 229 because the width is takeing precedant and rounding the height. If I want 230 i get 230!

  ///////////////////


  // [COMPLETE] highlight dims input on focus
  // [COMPLETE] Add drag to resize functionality
  // [COMPLETE] listen to changes in width/height of the img itself, and change the visual dims. solves the issue of resizing the browser window causing image size to change
  // [COMPLETE] blur and activate scripts when hitting enter instead of only when they click away
  // [COMPLETE] extra div above current dims to show percentage of current size relative to natural size "33% of Natural Size"
  // [COMPLETE] % should also be a field that you can edit


  ///////////////////
  ///////////////////
  ////  VARIABLES & LISTENERS
  ///////////////////
  ///////////////////

  beforeResize();

  window.addEventListener("resize", imgWasResized, false);

  // What was I even doing with this?
  // var cleanUrl =  document.URL.match(/^.+\.(jpg|jpeg|png|apng|gif|webp|svg|bmp)/i)[0];


  ///////////////////
  ///////////////////
  ////  CREATE CONTROLS
  ///////////////////
  ///////////////////

  var controlsContainer = createEl("div");
  controlsContainer.className = "controls-wrapper";
  controls.appendChild(controlsContainer);


  // controlsContainer.innerHTML = '<div class="ext text"></div><div class="size text"></div><div class="sizer-container wrapper"><div class="fit-to-screen text action sizer">Fit to Screen</div><div class="half-size text action sizer">0.5x</div><div class="full-size text action sizer active">1.0x</div></div><div class="percentage"><div class="minus perc-control">&#8211;</div><div class="percentage-number input" >100</div><div class="plus perc-control">+</div></div><div class="dims"><div class="width input" >' + img + '</div> x <div class="height input" >' + img + '</div><div class="reset-to-natural disabled"><svg enable-background="new 0 0 41 34" height="34px" viewBox="0 0 41 34" width="41px"><path d="M33.949,16C33.429,7.08,26.051,0,17,0C7.611,0,0,7.611,0,17s7.611,17,17,17v-6c-6.075,0-11-4.925-11-11  S10.925,6,17,6c5.737,0,10.443,4.394,10.949,10h-6.849L31,25.899L40.899,16H33.949z" fill="#fff"/></svg></div></div>'

  /* Collapse Button */
  var collapseControlsBtn = createEl("div");
  collapseControlsBtn.classList.add("collapse-controls");
  collapseControlsBtn.addEventListener("click", collapseControls, false);
  controlsContainer.appendChild(collapseControlsBtn);

  /* Header */
  var headerWrapper = createEl("div");
  headerWrapper.classList.add("header", "section");
  controlsContainer.appendChild(headerWrapper);

    /* Title */
    fileTypeText = createEl("div");
    fileTypeText.classList.add("filetype");
    headerWrapper.appendChild(fileTypeText);

  /* Sizing Controls */
  var sizingWrapper = createEl("div");
  sizingWrapper.classList.add("sizing", "section");
  controlsContainer.appendChild(sizingWrapper);

    /* Title */
    var dimensionsTitle = createEl("div");
    dimensionsTitle.classList.add("section-title");
    dimensionsTitle.innerText = "Dimensions";
    sizingWrapper.appendChild(dimensionsTitle);

    /* Width and Height Wrapper */
    var widthAndHeightWrapper = createEl("div");
    widthAndHeightWrapper.classList.add("width-and-height");

      /* Inputs */
      widthInput = createEl("input");
      widthInput.classList.add("width");
      widthAndHeightWrapper.appendChild(widthInput);

      heightInput = createEl("input");
      heightInput.classList.add("height");
      widthAndHeightWrapper.appendChild(heightInput);

    sizingWrapper.appendChild(widthAndHeightWrapper);

  /* Canvas Color Controls */
  var canvasColorsWrapper = createEl("div");
  canvasColorsWrapper.classList.add("canvas-colors", "section");
  controlsContainer.appendChild(canvasColorsWrapper);

    /* Title */
    var canvasColorTitle = createEl("div");
    canvasColorTitle.classList.add("section-title");
    canvasColorTitle.innerText = "Canvas Color";
    canvasColorsWrapper.appendChild(canvasColorTitle);

  /* Details */
  var detailsWrapper = createEl("div");
  detailsWrapper.classList.add("details", "section");
  controlsContainer.appendChild(detailsWrapper);

    /* Title */
    var detailsTitle = createEl("div");
    detailsTitle.classList.add("section-title");
    detailsTitle.innerText = "Details";
    detailsWrapper.appendChild(detailsTitle);

  // controlsContainer.innerHTML = '<div class="background action"></div><div class="ext text"></div><div class="size text"></div><div class="sizer-container wrapper"><div class="fit-to-screen text action sizer">Fit to Screen</div><div class="half-size text action sizer">0.5x</div><div class="full-size text action sizer active">1.0x</div></div><div class="percentage"><div class="minus perc-control">&ndash;</div><div class="percentage-number input" contenteditable>100</div><div class="plus perc-control">+</div></div><div class="dims"><div class="width input" contenteditable>' + img.width + '</div> x <div class="height input" contenteditable>' + img.height + '</div><div class="reset-to-natural disabled"><svg enable-background="new 0 0 41 34" height="34px" viewBox="0 0 41 34" width="41px"><path d="M33.949,16C33.429,7.08,26.051,0,17,0C7.611,0,0,7.611,0,17s7.611,17,17,17v-6c-6.075,0-11-4.925-11-11  S10.925,6,17,6c5.737,0,10.443,4.394,10.949,10h-6.849L31,25.899L40.899,16H33.949z" fill="#fff"/></svg></div></div>'

  percentageInput = document.querySelector(".percentage-number");

  ///////////////////
  ///////////////////
  ////
  ///////////////////
  ///////////////////

  // // Check image size on page load
  // if ( naturalWidth > img.width ) {
  //   imgWasResized();
  // }


  ///
          widthInput.addEventListener("focus", inputOnFocus, false);
          heightInput.addEventListener("focus", inputOnFocus, false);
          // percentageInput.addEventListener("focus", inputOnFocus, false);
          //
          widthInput.addEventListener("keydown", inputOnEnter, false);
          heightInput.addEventListener("keydown", inputOnEnter, false);
          // percentageInput.addEventListener("keydown", inputOnEnter, false);
          //
          widthInput.addEventListener("blur", inputOnBlur, false);
          heightInput.addEventListener("blur", inputOnBlur, false);
          // percentageInput.addEventListener("blur", inputOnBlur, false);


          //
          // document.querySelector(".sizer-container").addEventListener('click', presetSizes, false);


          //
          // document.querySelector(".reset-to-natural").addEventListener('click', makeImgNatural, false);


          ///
          // document.querySelector(".background").addEventListener('click', toggleBg, false);



  // http://stackoverflow.com/a/1310399/556079
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', document.URL, true);
  xhr.onreadystatechange = function(){
    if ( xhr.readyState == 4 ) {
      if ( xhr.status == 200 ) {

        // console.log( xhr.getAllResponseHeaders() );

        var size = humanFileSize(xhr.getResponseHeader('Content-Length'), true);
        var extension = "." + xhr.getResponseHeader('Content-Type').replace(/image\//, "").toUpperCase();

                    // document.querySelector(".size").innerHTML = size;

        console.log( xhr.getAllResponseHeaders() );
        console.log( xhr.getResponseHeader('Content-Length') );
        console.log( xhr.getResponseHeader('Content-Type') );

        // alert('Size in bytes: ' + humanFileSize(xhr.getResponseHeader('Content-Length'), true) +  humanFileSize(xhr.getResponseHeader('Content-Length'), false));
      } else {
        var size = "N/A";
        document.querySelector(".size").style.display = "none";

        // var extension = "." + cleanUrl.replace(/^.+\./i, "").toUpperCase();
        // alert('ERROR');
      }

                    // document.querySelector(".ext").innerHTML = extension;
    }
  };
  xhr.send(null);



  makeMediaZoomable(img);


  //////////////////////
  //////////////////////
  //
  //
  //   Shortcuts
  //
  //
  //////////////////////
  //////////////////////

  // Zoom Buttons
          // document.querySelector(".minus.perc-control").addEventListener("click", function(){
          //   zoom("-");
          // }, false);
          // document.querySelector(".plus.perc-control").addEventListener("click", function(){
          //   zoom("+");
          // }, false);

  document.addEventListener('keydown', function(e) {

    if ( (e.ctrlKey || e.metaKey) && (e.keyCode == 48 || e.keyCode == 187 || e.keyCode == 189) ) {
      e.preventDefault();

      // Zoom-out
      if ( (e.ctrlKey || e.metaKey) && e.keyCode == 189 ) {
        zoom("-");
      }
      // Zoom-in
      if ( (e.ctrlKey || e.metaKey) && e.keyCode == 187 ) {
        zoom("+");
      }
      // Reset Zoom
      if ( (e.ctrlKey || e.metaKey) && e.keyCode == 48 ) {
        zoom("0");
      }
    }

  });


////////////////////////
////////////////////////
} // End of page building
////////////////////////
////////////////////////






/**
 * []
 * @return {[type]}      [description]
 */
function collapseControls() {
  controls.classList.add("hidden");
}


/**
 * []
 * @return {[type]}      [description]
 */
function inputOnFocus() {

  if ( this.classList.contains("width") || this.classList.contains("height") ) {
    originalWidth = widthInput.value.trim();
    originalHeight = heightInput.value.trim();
    // document.querySelector(".dims").classList.add("focused");
  } else {
    // document.querySelector(".percentage").classList.add("focused");
  }

  // selectElementContents(this);

}



/**
 * []
 * @return {[type]}      [description]
 */
function inputOnBlur() {

  if ( this.classList.contains("width") || this.classList.contains("height") ) {

    // document.querySelector(".dims").classList.remove("focused");

    if ( this.value.trim() === "" ) {
      this.value = originalWidth;
    }

    if ( this.classList.contains('width') ) {
      var newWidth = this.value.trim();

      if ( /\D/.test(newWidth) || newWidth === "0" ) {
        this.value = originalWidth;
      } else {
        // var sizeDiff = newWidth / originalWidth;
        // img.height = sizeDiff * originalHeight;
        beforeResize();
        img.width = newWidth;
        heightInput.value = img.height;
        imgWasResized();
      }

    } else {
      var newHeight = this.value.trim();

      if ( /\D/.test(newHeight) || newHeight === "0" ) {
        this.value = originalHeight;
      } else {
        beforeResize();
        var sizeDiff = newHeight / originalHeight;
        img.width = sizeDiff * originalWidth;
        widthInput.value = img.width;
        imgWasResized();
      }
    }

  } else {

    beforeResize();

    document.querySelector(".percentage").classList.remove("focused");

    var enteredValue = this.value.trim().replace(/[^0-9\.]/gi, "");
    this.dataset.value = enteredValue;
    this.value = enteredValue;

    img.width = (naturalWidth / 100) * enteredValue;

    imgWasResized();

  }

  toggleReset();
}



/**
 * []
 * @return {[type]}      [description]
 */
function presetSizes() {

  if ( !event.target.classList.contains("active") ) {

    beforeResize();

    if ( event.target.classList.contains("half-size") ) {
      img.width = naturalWidth / 2;
    } else if ( event.target.classList.contains("full-size") ) {
      img.width = naturalWidth;
    } else {
      // Resize to fit viewport

      console.log("document.body.clientWidth:" + document.body.clientWidth);
      console.log("naturalWidth:" + naturalWidth);
      console.log("(document.body.clientWidth - naturalWidth):" + (document.body.clientWidth - naturalWidth));

      console.log("document.body.clientHeight:" + document.body.clientHeight);
      console.log("naturalHeight:" + naturalHeight);
      console.log("(document.body.clientHeight - naturalHeight):" + (document.body.clientHeight - naturalHeight));

      // if ( document.body.clientWidth > document.body.clientHeight ) { // Landscape viewport
      //   if ( naturalWidth > naturalHeight ) { // Landscape picture
      //     img.style.width = "100vw";
      //     img.style.height = "auto";
      //   } else if ( naturalHeight > naturalWidth ) { // Portrait picture
      //     img.style.height = "100vh";
      //     img.style.width = "auto";
      //   } else { // Square picture
      //
      //   }
      // } else if ( document.body.clientHeight > document.body.clientWidth ) { // Portrait viewport
      //   if ( naturalHeight > naturalWidth ) { // Portrait picture
      //     img.style.height = "100vh";
      //     img.style.width = "auto";
      //   } else ( naturalWidth > naturalHeight ) { // Landscape picture
      //     img.style.width = "100vw";
      //     img.style.height = "auto";
      //   } else { // Square picture
      //
      //   }
      // } else { // Square viewport
      //
      // }

      var widthRatio = document.body.clientWidth/naturalWidth;
      console.log("widthRatio: " + widthRatio);

      var heightRatio = document.body.clientHeight/naturalHeight;
      console.log("heightRatio: " + heightRatio);


      var ratio = Math.min(document.body.clientWidth/naturalWidth, document.body.clientHeight/naturalHeight);

      var adjustedWidth = naturalWidth * ratio;
      var adjustedHeight = naturalHeight * ratio;

      console.log("adjustedWidth/clientWidth: " + adjustedWidth + "/" + document.body.clientWidth);
      console.log("adjustedHeight/clientHeight: " + adjustedHeight + "/" + document.body.clientHeight);

      if ( widthRatio < heightRatio ) {
        img.style.width = "100vw";
        img.style.height = "auto";
        console.log("set width to 100vw");
      } else {
        img.style.height = "100vh";
        img.style.width = "auto";
        console.log("set height to 100vh");
      }

      // if ( adjustedWidth > document.body.clientWidth && adjustedHeight < document.body.clientHeight ) {
      //   img.style.width = "100vw";
      //   img.style.height = "auto";
      //   console.log("set width to 100vw");
      // } else {
      //   img.style.height = "100vh";
      //   img.style.width = "auto";
      //   console.log("set height to 100vh");
      // }

      // img.style.width = (naturalWidth * ratio) + "px";
      // img.style.height = "auto";

      // if ( (document.body.clientWidth - naturalWidth) < (document.body.clientHeight - naturalHeight) ) {
      //   img.style.width = "100vw";
      //   img.style.height = "auto";
      // } else {
      //   img.style.height = "100vh";
      //   img.style.width = "auto";
      // }

    }

    imgWasResized();
    event.target.classList.add("active");

  }
}


/**
 * []
 * @return {[type]}      [description]
 */
function makeImgNatural() {

  if ( !this.classList.contains("disabled") ) {

    beforeResize();

    img.width = naturalWidth

    imgWasResized();
  }

}



/**
 * []
 * @return {[type]}      [description]
 */
function toggleBg() {
  document.body.classList.toggle("dark");
}



/**
 * []
 * http://stackoverflow.com/a/14919494/556079
 * @param  {[type]} bytes [description]
 * @param  {[type]} si [description]
 * @return {[type]}      [description]
 */
function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  var units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}




/**
 * []
 * @return {[type]}      [description]
 */
function deactivate() {
  if ( elExists(document.querySelector(".sizer.active")) ) {
    document.querySelector(".sizer.active").classList.remove("active");
  }
}



/**
 * []
 * @param  {[type]} el [description]
 * @return {[type]}      [description]
 */
function elExists(el) {
  if ( typeof(el) != 'undefined' && el != null ) {
    return true;
  } else {
    return false;
  }
}



/**
 * []
 * @return {[type]}      [description]
 */
function toggleReset() {

  deactivate();

  if ( img.width !== naturalWidth && img.height !== naturalHeight ) {
    // document.querySelector(".reset-to-natural").classList.remove("disabled");
    var halfSize = Math.floor(naturalWidth / 2);
    if ( img.width === halfSize ) {
      // document.querySelector(".half-size").classList.add("active");
    }
  } else {
    // document.querySelector(".reset-to-natural").classList.add("disabled");
    // document.querySelector(".full-size").classList.add("active");

  }
}




/**
 * []
 * @return {[type]}      [description]
 */
function imgWasResized() {

  console.log("imgWasResized - img.width: " + img.width);

  updateDimsInputs();

  // Set New Percentage
            // percentageInput.innerHTML = Math.round((img.width / naturalWidth) * 100);

  // Resets
  img.removeAttribute("height");
  toggleReset();
}


/**
 * []
 * @return {[type]}      [description]
 */
function updateDimsInputs() {
  widthInput.value = img.width;
  heightInput.value = img.height;
}


/**
 * []
 * @return {[type]}      [description]
 */
function inputOnEnter() {

  var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
  if (key === 13) {
    event.preventDefault();
    this.blur();
    window.getSelection().removeAllRanges(); //http://stackoverflow.com/a/26890080/556079
  }

}



/**
 * []
 * @param  {[type]} media [description]
 * @param  {[type]} atShiftKey [description]
 * @param  {[type]} onStart [description]
 * @param  {[type]} onMove [description]
 * @return {[type]}      [description]
 */
function addDragListener({ media, atShiftKey, onStart, onMove }) {
  let isActive, hasMoved, lastX, lastY;

  const handleMove = (function (e) {
    const movementX = e.clientX - lastX;
    const movementY = e.clientY - lastY;

    if (!movementX && !movementY) {
      // Mousemove may be triggered even without movement
      return;
    } else if (atShiftKey !== e.shiftKey) {
      isActive = false;
      lastX = e.clientX;
      lastY = e.clientY;

      return;
    }

    if (!isActive) {
      if (onStart) onStart(lastX, lastY);
      isActive = true;
      hasMoved = true;
      document.body.classList.add('res-media-dragging');
    }

    onMove(e.clientX, e.clientY, movementX, movementY);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  function handleClick(e) {
    if (hasMoved) e.preventDefault();
  }

  function stop() {
    document.body.classList.remove('res-media-dragging');

    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', stop);

    // `handleClick` is only invoked if the mouse target is `media`
    // `setTimeout` is necessary since `mouseup` is emitted before `click`
    setTimeout(function () {
      return document.removeEventListener('click', handleClick);
    });
  }

  function initiate(e) {
    if (e.button !== 0) return;

    lastX = e.clientX;
    lastY = e.clientY;


    hasMoved = false;
    isActive = false;

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stop);
    document.addEventListener('click', handleClick);

    e.preventDefault();
  }

  media.addEventListener('mousedown', initiate);
}



/**
 * []
 * @param  {[type]} media [description]
 * @param  {[type]} dragInitiater [description]
 * @param  {[type]} absoluteSizing [description]
 * @return {[type]}      [description]
 */
function makeMediaZoomable(media, dragInitiater = media, absoluteSizing = false) {
	// if (!_module.options.imageZoom.value) return;

	media.classList.add('res-media-zoomable');

	let initialWidth, initialDiagonal, left, top;

	function getDiagonal(x, y) {
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	addDragListener({
		media: dragInitiater,
		atShiftKey: false,
		onStart(x, y) {
			var _media$getBoundingCli2 = media.getBoundingClientRect();

			left = _media$getBoundingCli2.left;
			top = _media$getBoundingCli2.top;
			initialWidth = _media$getBoundingCli2.width;

			initialDiagonal = getDiagonal(x, y);
		},
		onMove(x, y, deltaX, deltaY) {
			if (absoluteSizing) {
				var _media$getBoundingCli3 = media.getBoundingClientRect();

				const width = _media$getBoundingCli3.width,
				      height = _media$getBoundingCli3.height;

				resizeMedia(media, width + deltaX, height + deltaY);
			} else {
				const newWidth = getDiagonal(x, y) / initialDiagonal * initialWidth;
				resizeMedia(media, newWidth);
			}
		}
	});
}



/**
 * []
 * @param  {[type]} ele [description]
 * @param  {[type]} newWidth [description]
 * @param  {[type]} newHeight [description]
 * @return {[type]}      [description]
 */
function resizeMedia(ele, newWidth, newHeight) {
	// ele should always be grippable, so ignore resizes that are too tiny
	if (newWidth < 20) return;

	if (typeof newHeight === 'number') {
		ele.style.height = `${newHeight}px`;
	} else if (ele.style.height) {
		// If height is previously set, keep the ratio
		var _ele$getBoundingClien2 = ele.getBoundingClientRect();

		const width = _ele$getBoundingClien2.width,
		      height = _ele$getBoundingClien2.height;

		ele.style.height = `${(height / width * newWidth).toFixed(2)}px`;
	}

  beforeResize();

	ele.width = `${newWidth}`;
	// ele.height = `${newHeight}`;

  // console.error(`${newWidth}px`);
  // console.error(`${newHeight}px`);

	// ele.style.maxWidth = ele.style.maxHeight = 'none';

	ele.dispatchEvent(new CustomEvent('mediaResize', { bubbles: true }));

  imgWasResized();
}




/**
 * []
 * @return {[type]}      [description]
 */
function beforeResize() {
  img.removeAttribute("style");
}



/**
 * .createElement but with a condition to specify a namespace.
 * SVG documents need this namespace to be declared.
 * @param  {[type]} pageType [description]
 * @return {[type]}      [description]
 */
function createEl(tag) {

  if (pageType === "svg") {
    var newTag = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
  } else {
    var newTag = document.createElement(tag);
  }

  return newTag;
}




/**
 * Change the size of the image via keyboard shortcuts or the UI
 * Modifies size based on a set percentage, up or down
 * @param  {[type]} direction [description]
 * @return {[type]}      [description]
 */
function zoom(direction) {

  console.log("zooming:", direction);

  // Get the current width of the image.
  var currentWidth = img.clientWidth;
  var currentHeight = img.clientHeight;

  var newZoomedSize;

  beforeResize();

  // Reduce image size
  if ( direction === "-" ) {

    // prevent reducing width below 1
    var newWidth = currentWidth * 0.8;
    var newHeight = currentHeight * 0.8;

    if ( newWidth < newHeight && newWidth < 1 ) {
      img.width = 1;
    }
    else {
      if ( newHeight < 1 ) {

      }
    }

    if ( newWidth < 1 || newHeight < 1 ) {
      newWidth = 10;
    }


  }
  // Increase image size
  else if ( direction === "+" ) {

    newZoomedSize = Math.ceil(currentWidth / 0.8);
    if ( newZoomedSize === 0 ) {
      newZoomedSize = 10;
    }
    console.log(newZoomedSize);
    img.width = newZoomedSize;

  }
  else if ( direction === "0" ) {
    img.width = naturalWidth;
  }

  imgWasResized();
}




        /**
         * Access window variable from Content Script
         * http://stackoverflow.com/a/20513730/556079
         * @param  {[type]} arg1 [description]
         * @param  {[type]} arg2 [description]
         * @return {[type]}      [description]
         */
        // function injectCss(file, node) {
        //   var th = document.getElementsByTagName(node)[0];
        //   var s = createEl('link');
        //   s.setAttribute('type', 'text/css');
        //   s.setAttribute('rel', 'stylesheet');
        //   s.setAttribute('href', file);
        //   th.appendChild(s);
        // }


})();         // End scoping function
