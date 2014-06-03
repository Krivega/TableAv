var EventDispatcher = (function() {
	function EventDispatcher() {
		var self = this;
		self._callbackObj = {};

		self.on = function(eventName, callback) {
			var id = self._guid();
			if (!self._callbackObj[eventName]) {
				self._callbackObj[eventName] = {};
			}
			self._callbackObj[eventName][id] = function(data) {
				callback(data);
			};

		};

		self.trigger = function(eventName, data) {
			for (var item in self._callbackObj[eventName]) {
				self._callbackObj[eventName][item](data);
			}
		};

		self._guid = function() {
			function S4() {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			}

			function guid() {
				return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
			}
			return guid();
		};

		return self;
	}

	return EventDispatcher;

}());

if (window.EVENT_DISP === undefined) {
	window.EVENT_DISP = new EventDispatcher();
}