function CanvasTick(canvas, ctx) {

	var _drawingFunctions = {},
		_ctx = canvas.getContext("2d"),
		_width = canvas.width, _height = canvas.height,
		timer;

	function exports() {

		_ctx.clearRect(0,0, _width, _height);
		
		for (id in _drawingFunctions) {
			var drawingFunction = _drawingFunctions[id];
			drawingFunction(_ctx);
		}
		_ctx.restore();
	}

	exports.addDrawing = function(id, drawingFunction) {
		if (arguments.length != 2){
			console.error("needs 2 arguments");
			return;
		}
		_drawingFunctions[id] = drawingFunction;
	};
	exports.removeDrawing = function(id) {
		if (arguments.length != 1){
			console.error("needs 1 arguments");
			return;
		}
		if (_drawingFunctions[id]) {
			delete _drawingFunctions[id];
		}
	};

	exports.start = function() {
		if (timer) {
			timer.stop(); // to remove the previous timer
		}
		timer = d3.timer(this, 200);
		return this;
	}

	exports.stop = function() {
		if (timer) {
			timer.stop();
		}
	}

	return exports;
}