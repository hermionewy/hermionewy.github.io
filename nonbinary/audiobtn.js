function audioBtn() {
    console.log("testAudio");
    var playObj = document.getElementById("playable");
    var audioObj = document.getElementById("ratAllAudio");
    // audioObj.setAttribute("src", "imgs/ratPoem_body.mp3");

    function exports() {
        var progress = playObj.querySelector(".progress-bar"),
            precache = playObj.querySelector(".precache-bar"),
            pt = playObj.createSVGPoint(),
            pc = 298.1371428256714; // 2 pi r

        function cursorPoint(evt){
            pt.x = evt.clientX; pt.y = evt.clientY;
            return pt.matrixTransform(playObj.getScreenCTM().inverse());
        }
        function angle(ex, ey) {
            var dy = ey - 50; // 100;
            var dx = ex - 50; // 100;
            var theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
            theta = theta + 90; // in our case we are animating from the top, so we offset by the rotation value;
            if (theta < 0) theta = 360 + theta; // range [0, 360)
            return theta;
        }
// nice long audio for precache testing
//audioObj.setAttribute("src", "http://media.blubrry.com/stilluntitledwithadamsavage/files.tested.com/podcast/stilluntitled-20150922.mp3?" + Math.random());

        audioObj.addEventListener('timeupdate', reportPosition);
        precache.addEventListener("mousedown", positionListener, false);
        audioObj.play();
        playObj.setAttribute("class", "playing");
// https://github.com/toddmotto/lunar/
        (function (root, factory) {
            if (typeof define === 'function' && define.amd) {
                define(factory);
            } else if (typeof exports === 'object') {
                module.exports = factory;
            } else {
                root.lunar = factory();
            }
        })(this, function () {
            'use strict';
            var lunar = {};
            lunar.hasClass = function (elem, name) {
                return new RegExp('(\\s|^)' + name + '(\\s|$)').test(elem.getAttribute('class'));
            };
            lunar.addClass = function (elem, name) {
                !lunar.hasClass(elem, name) && elem.setAttribute('class', (!!elem.getAttribute('class') ? elem.getAttribute('class') + ' ' : '') + name);
            };
            lunar.removeClass = function (elem, name) {
                var remove = elem.getAttribute('class').replace(new RegExp('(\\s|^)' + name + '(\\s|$)', 'g'), '$2');
                lunar.hasClass(elem, name) && elem.setAttribute('class', remove);
            };
            lunar.toggleClass = function (elem, name) {
                lunar[lunar.hasClass(elem, name) ? 'removeClass' : 'addClass'](elem, name);
            };
            lunar.className = function (elem, name) {
                elem.setAttribute("class", name);
                console.log("className", elem);
            }
            return lunar;
        });
        function setGraphValue(obj, val) {
            var val = pc - parseFloat(((val / audioObj.duration) * pc), 10);
            obj.style.strokeDashoffset = val;
            if (val === 0) {
                lunar.addClass(obj,"done");
                if (obj===progress) lunar.className(playObj, "ended");
            }
        }
        audioObj.addEventListener('progress', onProgress);

        function onProgress() {
            if(audioObj.onprogress){
                var end = audioObj.buffered.end(audioObj.buffered.length - 1);
            setGraphValue(precache, end);}
        }

        function reportPosition() {
            setGraphValue(progress, audioObj.currentTime);
        }
        function positionListener(event) {
//   console.log("a",Math.sqrt((pc-loc.x)*(pc-loc.x) + (pc-loc.y)*    (pc-loc.y)));
            var loc = cursorPoint(event),
                deg = (angle(loc.x,loc.y) / 360),
                pct = pc * deg;
            console.log(loc, deg);
// doo doo doo don't mind me, this code does nothing yet ...
        }
// idea:
        //var blue ='#0000ff';
// use polar co ordinate conversion and convert the position as a percentage of 360 degrees... and draw it as an arc rather than a circle
// rather than extending the length of the dash
// http://stackoverflow.com/a/24569190/1238884
        $("#nb-audiobtn").unbind().on("click", function(e) {
            console.log('clicked');
            switch (playObj.getAttribute("class")) {
                case "not-started":
                    audioObj.addEventListener('timeupdate', reportPosition);
                    precache.addEventListener("mousedown", positionListener, false);
                    audioObj.play();
                    playObj.setAttribute("class", "playing");
                    break;
                case "playing":
                    playObj.setAttribute("class", "paused");
                    audioObj.pause();
                    break;
                case "paused":
                    playObj.setAttribute("class", "playing");
                    audioObj.play();
                    break;
                case "ended":
                    playObj.setAttribute("class", "not-started");
                    audioObj.removeEventListener('timeupdate', reportPosition);
                    break;
            }
        });
    }
    exports.audioObj=function (_) {
        if(!arguments.length){ return 0; }
        audioObj = document.getElementById(_);
        return this;
    }
    exports.setAudioAttr = function (_) {
        if(!arguments.length){ return 0; }
        audioObj.setAttribute("src", _);
        return this;
    }
    return exports;
}

