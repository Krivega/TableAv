//The MIT License (MIT)
// v 0.9
//Copyright (c) 2014 Krivega Dmitriy http://krivega.com

var TableAv = (function($, eventDisp) {
	"use strict";
	// constructor
	function TableAv(container, initData) {

		this.$container = $(container);
		this.container = this.$container[0];
		this.initData = initData;
		this.$calendar = null;
		this.calendar = null;
		this.calendarData = null;
		this._dragEl = null;
		this._checkActions = null;
		this._$checkActions = null;
		this.$allChecks = null;
		this.selectedChecks = {
			length: 0
		};
		this.selectedPeriod = null;
		this.selectedRooms = {};
		this.saveData = null;
		this.$btnSave = null;
		this.$btnCancel = null;
		this.$rooms = null;
		this.$GeneralActions = null;
		this.init();
		return this;
	};

	TableAv.prototype.init = function() {
		this.$container.addClass('TableAv');

		this.createCalendar();

		this.$rooms = this.$container.find('.Av-rooms');

		this.createRooms();

		if (this.initData.readonly !== undefined && this.initData.readonly === true) {
			return this;
		}

		this.createCheckActions();
		this.createGeneralActions();
		this.initEvents();
		return this;
	};

	TableAv.prototype.createCalendar = function() {
		var roomsHtml = '<div class="Av-rooms"></div>';
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth();
		var tday = today.getDate();

		var calendarHtml = '<div class="Av-calendar">';
		calendarHtml += this.createYear(year, month, 12, tday, 'first');
		calendarHtml += this.createYear(year + 1, 0, month + 1, tday, 'second');
		calendarHtml += '</div>';

		this.$container.html(roomsHtml + calendarHtml);
		this.$calendar = this.$container.find('.Av-calendar');
		this.calendar = this.$calendar[0];
		var widthMonth = 0;
		this.$calendar.find('.Av-month').each(function() {
			widthMonth += $(this).outerWidth(true);
		});
		this.$calendar.width(widthMonth);

		return (roomsHtml + calendarHtml);
	};

	TableAv.prototype.createYear = function(year, monStart, monEnd, tday, type) {
		var yearHtml = '';
		var self = this;
		//var mon = month - 1; // месяцы в JS идут от 0 до 11, а не от 1 до 12
		for (var i = monStart; i < monEnd; i++) {
			if (type === 'first' && i === monStart) {
				yearHtml += createMonth(year, i, tday);
			} else if (type === 'second' && i === (monEnd - 1)) {
				yearHtml += createMonth(year, i, tday, true);
			} else {
				yearHtml += createMonth(year, i, 1);
			}

		}

		function createMonth(year, mon, tday, isEnd) {
			if (isEnd === true) {
				var d = new Date(year, mon, 1);
			} else {
				d = new Date(year, mon, tday);
			}
			var monthes = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

			var trHtml = '';
			trHtml += '<div class="Av-month" data-month="' + (+d.getMonth() + 1) + '" data-year="' + year + '">';
			trHtml += '<div class="Av-month-value"><span class="Av-month-value-month">' + monthes[d.getMonth()] + '</span><span class="Av-month-value-year">, ' + year + '</span></div>';


			// ячейки календаря с датами
			if (isEnd === true) {
				while (d.getMonth() === mon) {
					if (d.getDate() < tday) {
						trHtml += createDays(d, monthes);
					}

					d.setDate(d.getDate() + 1);
				}

			} else {
				while (d.getMonth() === mon) {
					trHtml += createDays(d, monthes);
					d.setDate(d.getDate() + 1);
				}
			}

			trHtml += '</div>';
			return trHtml;
		}


		function getDay(date) { // получить номер дня недели, от 0(вт) до 6(вс)
			var day = date.getDay();
			if (day === 0) {
				day = 7;
			}
			return day - 1;
		}

		function createDays(d, monthes) {
			var numDay = getDay(d);
			var ceilHtml = '';
			var weekday = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
			var month = (+d.getMonth() + 1);
			var date = d.getDate();
			if (numDay === 5 || numDay === 6) {
				ceilHtml += '<div class="Av-ceil holiday">';
			} else {
				ceilHtml += '<div class="Av-ceil">';
			}

			ceilHtml += '<div class="Av-day" id="' + date + '-' + month + '-' + year + '" data-day="' + date + '" data-month="' + month + '" data-year="' + year + '">' + date + '</div>';
			ceilHtml += '<div class="Av-weekday">' + weekday[numDay] + '</div>';

			ceilHtml += '</div>';

			if (self.calendarData === null) {
				self.calendarData = {};
			}
			if (self.calendarData[year] === undefined) {
				self.calendarData[year] = {};
			}
			if (self.calendarData[year][month] === undefined) {
				self.calendarData[year][month] = {
					title: monthes[month - 1]
				};
			}

			self.calendarData[year][month][date] = {
				title: weekday[numDay],
				date: date
			};
			return ceilHtml;
		}
		return yearHtml;
	};

	TableAv.prototype.createRooms = function() {
		for (var item in this.initData.rooms) {
			this.addRoom(this.initData.rooms[item].name, this.initData.rooms[item].id);
		}
		this.$allChecks = this.$calendar.find('.Av-check');
		var widthRooms = this.$rooms.outerWidth(true);
		var widthCalendar = this.$calendar.width();
		this.$calendar.css('padding-left', widthRooms + 'px').width(widthCalendar);
	};

	TableAv.prototype.addRoom = function(name, id) {
		var self = this;
		var $days = this.$container.find('.Av-day');
		$days.each(function() {
			var $day = $(this);
			var day = $day.data('day');
			var month = $day.data('month');
			var year = $day.data('year');
			var roomAv = '';
			var roomClass = '';
			if (self.initData.rooms[id].av[day + '.' + month + '.' + year] !== undefined && self.initData.rooms[id].av[day + '.' + month + '.' + year] !== 0) {
				roomAv = self.initData.rooms[id].av[day + '.' + month + '.' + year];
				roomClass = 'value';
				if (self.initData.rooms[id].sales[day + '.' + month + '.' + year] !== undefined && self.initData.rooms[id].sales[day + '.' + month + '.' + year] !== 0) {
					roomClass += ' values';
				}
			}
			var check = '<div class="Av-check ' + roomClass + '" data-id="' + id + '" id="' + id + '-' + day + '-' + month + '-' + year + '" data-day="' + day + '" data-month="' + month + '" data-year="' + year + '">';
			check += '<span class="Av-check-value">' + roomAv + '</span>';
			if (self.initData.rooms[id].sales[day + '.' + month + '.' + year] !== undefined && self.initData.rooms[id].sales[day + '.' + month + '.' + year] !== 0) {
				check += '<span class="Av-check-sale">' + self.initData.rooms[id].sales[day + '.' + month + '.' + year] + '</span>';
				if (roomClass === 'value values') {
					check += '<span class="Av-check-rest">' + (roomAv - self.initData.rooms[id].sales[day + '.' + month + '.' + year]) + '</span>';
				}
			}
			check += '</div>';
			$day.parents('.Av-ceil:first').append(check);
		});
		self.$rooms.append('<a class="Av-room">' + name + '</a>');
	};

	TableAv.prototype.toogleCheck = function($check) {
		this.selectedChecks.push($check);
		$check.addClass('selected');
	};

	TableAv.prototype.selectRangeChecks = function(left, right, top, bottom) {
		var self = this;

		var count = false;
		self.selectedPeriod = {
			start: null,
			end: null
		};
		self.selectedRooms = null;
		self.selectedRooms = {};
		for (var i = 0; i < this.$allChecks.length; i++) {
			var $el = this.$allChecks.eq(i);
			var el = this.$allChecks[i];
			var elId = this.$allChecks[i].id;

			var elPos = getOffset(el);
			var elLeft = elPos.left;
			var elRight = elLeft + el.offsetWidth;
			var elTop = elPos.top;
			var elBottom = elTop + el.offsetHeight;
			if (
				(elLeft < left && elTop < top && elRight > right && elBottom > bottom) || //центр
				(elLeft >= left && elTop >= top && elRight <= right && elBottom <= bottom) || //вокруг
				(elRight <= right && elRight >= left && elTop >= top && elBottom <= bottom) || //правый край с углами
				(elRight <= right && elRight >= left && elTop < top && elBottom > bottom) || //правый край без углов
				(elLeft >= left && elLeft <= right && elTop >= top && elBottom <= bottom) || //левый край с углами
				(elLeft >= left && elLeft <= right && elTop < top && elBottom > bottom) || //левый край без углов
				(elTop >= top && elTop <= bottom && elLeft >= left && elRight <= right) || //верхний край с углами
				(elTop >= top && elTop <= bottom && elLeft < left && elRight > right) || //верхний край без углов
				(elBottom <= bottom && elBottom >= top && elLeft >= left && elRight <= right) || //нижний край с углами
				(elBottom <= bottom && elBottom >= top && elLeft < left && elRight > right) || //нижний край без углов
				(elLeft <= right && elTop <= bottom && elLeft >= left && elTop >= top) || //левый верхний угол
				(elRight <= right && elTop <= bottom && elRight >= left && elTop >= top) || //правый верхний угол
				(elLeft <= right && elBottom <= bottom && elLeft >= left && elBottom >= top) || //левый нижний угол
				(elRight <= right && elBottom <= bottom && elRight >= left && elBottom >= top) //правый нижний угол
			) {
				self.addCheck(elId, $el);

				self.selectedRooms[$el.data('id')] = true;


				if (count === false) {
					self.selectedPeriod.start = elId;
				} else {
					self.selectedPeriod.end = elId;
				}

				count = true;
			} else if ($el.hasClass('selected')) {
				self.removeCheck(elId, $el);

				delete self.selectedRooms[$el.data('id')];
			}
		}
	};

	TableAv.prototype.addCheck = function(id, $el) {
		if (this.selectedChecks[id] === undefined) {
			this.selectedChecks[id] = $el;
			this.selectedChecks.length++;
			$el.addClass('selected');
		}
	};

	TableAv.prototype.removeCheck = function(id, $el) {
		if (this.selectedChecks[id]) {
			delete this.selectedChecks[id];
			$el.removeClass('selected');
			this.selectedChecks.length--;
		}
	};

	TableAv.prototype._makeDraggable = function() {
		var self = this;
		this.calendar.onmousedown = _mouseDown;

		function _mouseDown(e) {
			if (e.which !== 1) {
				return;
			}
			e.stopPropagation();
			var el = this;
			var elPos = getOffset(el);


			var mouseOffsetX = e.pageX - elPos.left;
			var mouseOffsetY = e.pageY - elPos.top;

			self.resetSelectChecks();

			var rect = document.createElement('div');
			rect.id = 'Av-mouse_rect';
			rect.style.left = e.pageX + 'px';
			rect.style.top = e.pageY + 'px';
			document.body.appendChild(rect);

			self._dragEl = {
				x: e.pageX,
				y: e.pageY,
				el: el,
				rect: rect,
				mouseOffset: {}
			};
			self._dragEl.mouseOffset.x = mouseOffsetX;
			self._dragEl.mouseOffset.y = mouseOffsetY;
			document.onmousemove = _mouseMove;
			document.onmouseup = _mouseUp;
			document.ondragstart = document.body.onselectstart = preventDefault;
			$('html').css('overflow-x', 'hidden');
			return false;
		}

		function _mouseMove(e) {
			var height = e.pageY - self._dragEl.y;
			var width = e.pageX - self._dragEl.x;
			if (width < 0) {
				width = self._dragEl.x - e.pageX;
				self._dragEl.rect.style.left = e.pageX + 'px';
			}
			if (height < 0) {
				height = self._dragEl.y - e.pageY;
				self._dragEl.rect.style.top = e.pageY + 'px';
			}
			self._dragEl.rect.style.height = height + 'px';
			self._dragEl.rect.style.width = width + 'px';

			var rectPos = getOffset(self._dragEl.rect);

			var top = rectPos.top;
			var left = rectPos.left;
			var bottom = top + height;
			var right = left + width;

			self.selectRangeChecks(left, right, top, bottom);
			return false;
		}

		function _mouseUp(e) {
			var rectPos = getOffset(self._dragEl.rect);
			var height = self._dragEl.rect.offsetHeight;
			var width = self._dragEl.rect.offsetWidth;
			var top = rectPos.top;
			var left = rectPos.left;
			var bottom = top + height;
			var right = left + width;

			if (height < 4 && width < 4) {
				self.selectRangeChecks(left, right, top, bottom); // для клика
			}
			document.body.removeChild(self._dragEl.rect);
			if (self.selectedChecks.length > 0) {
				showCheckActions(e.pageX, e.pageY);
			}

			document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null;
			document.onmousemove = null;
			$('html').css('overflow-x', '');
			return false;
		}

		function showCheckActions(left, top) {
			self._checkActions.style.display = 'block';
			var width = self._checkActions.offsetWidth;
			var height = self._checkActions.offsetHeight;

			if (width + left > window.innerWidth) {
				self._checkActions.style.right = 0 + 'px';
				self._checkActions.style.left = 'auto';
			} else {
				self._checkActions.style.left = left + 'px';
				self._checkActions.style.right = 'auto';
			}

			if (height + top > window.innerHeight) {
				self._checkActions.style.bottom = 0 + 'px';
				self._checkActions.style.top = 'auto';
			} else {
				self._checkActions.style.top = top + 'px';
				self._checkActions.style.bottom = 'auto';
			}

			var start = self.selectedPeriod.start.split('-');
			var $start = self._$checkActions.find('.Av-periodStart');
			var startDay = +start[1];
			var startMon = +start[2];
			var startYear = +start[3];

			if (self.selectedPeriod.end === null) {
				self.selectedPeriod.end = self.selectedPeriod.start;
			}
			var end = self.selectedPeriod.end.split('-');
			var $end = self._$checkActions.find('.Av-periodEnd');
			var endDay = +end[1];
			var endMon = +end[2];
			var endYear = +end[3];

			var gigletDay, gigletMon, gigletYear;
			if (endYear < startYear ||
				(endYear === startYear && endMon < startMon) ||
				(endYear === startYear && endMon === startMon && endDay < startDay)
			) {
				gigletDay = startDay;
				startDay = endDay;
				endDay = gigletDay;

				gigletMon = startMon;
				startMon = endMon;
				endMon = gigletMon;

				gigletYear = startYear;
				startYear = endYear;
				endYear = gigletYear;
			}
			var $startSelect = $start.find('select[data-month=' + startMon + '][data-year=' + startYear + ']').show();
			$startSelect.find('option[value=' + startDay + ']').prop('selected', true);
			$start.find('select.Av-periodMonth option[data-month=' + startMon + '][data-year=' + startYear + ']').prop('selected', true);

			var $endSelect = $end.find('select[data-month=' + endMon + '][data-year=' + endYear + ']').show();
			$endSelect.find('option[value=' + endDay + ']').prop('selected', true);
			$end.find('select.Av-periodMonth option[data-month=' + endMon + '][data-year=' + endYear + ']').prop('selected', true);
		};
	};

	TableAv.prototype.createCheckActions = function() {
		var selectDaysHtml = '',
			selectMonsHtml = '',
			date, title;
		selectMonsHtml += '<select class="Av-periodMonth">';
		for (var year in this.calendarData) {

			for (var mon in this.calendarData[year]) {
				selectDaysHtml += '<select class="Av-periodDays" style="display:none;" data-month="' + mon + '" data-year="' + year + '">';
				for (var day in this.calendarData[year][mon]) {
					if (day !== 'title') {
						date = this.calendarData[year][mon][day].date;
						title = this.calendarData[year][mon][day].title;
						selectDaysHtml += '<option value="' + date + '">' + date + ', ' + title + '</option>';
					}
				}
				selectDaysHtml += '</select>';

				selectMonsHtml += '<option data-month="' + mon + '" data-year="' + year + '">' + this.calendarData[year][mon].title + ', ' + year + '</option>';
			}
		}
		selectMonsHtml += '</select>';

		var innerHTML = '';
		innerHTML += '<div class="modal-dialog"><div class="modal-content"><button type="button" class="close" >&times;</button>';
		innerHTML += '<div class="modal-body">';
		innerHTML += '<div class="Av-periodStart">' + selectDaysHtml + selectMonsHtml + '</div>';
		innerHTML += '<div class="Av-periodEnd">' + selectDaysHtml + selectMonsHtml + '</div>';
		innerHTML += '<div class="radio"><label><input type="radio" name="Av-changeChecksType" value="-"> уменьшить на</label></div>';
		innerHTML += '<div class="radio"><label><input type="radio" name="Av-changeChecksType" value="+"> увеличить на</label></div>';
		innerHTML += '<div class="radio"><label><input type="radio" name="Av-changeChecksType" value="set" checked> установить значение</label></div>';
		innerHTML += '<input class="Av-changeChecksValue" type="number" value="0"></div>';
		innerHTML += '<div class="modal-footer"><button type="button" class="btn btn-primary save">Ok</button><button type="button" class="btn btn-default cancel">Отмена</button></div>';
		innerHTML += '</div></div>';
		var checkActions = document.createElement('div');
		checkActions.id = 'Av-check_actions';
		checkActions.innerHTML = innerHTML;
		document.body.appendChild(checkActions);
		this._$checkActions = $(checkActions);
		this._checkActions = checkActions;
	};

	TableAv.prototype.createGeneralActions = function() {
		var actionsHtml = '';
		actionsHtml += '<div class="Av-GeneralActions">';
		actionsHtml += '	<a class="Av-GeneralSave btn btn-success disabled">Сохранить</a>';
		actionsHtml += '	<a class="Av-GeneralCancel btn btn-danger disabled">Отмена</a>';
		actionsHtml += '	<a class="Av-GeneralHelp btn btn-default" data-toggle="modal" data-target="#Av-GeneralHelp">Помощь</a>';
		actionsHtml += '</div>';

		actionsHtml += '<div class="modal fade" id="Av-GeneralHelp" tabindex="-1" role="dialog" aria-hidden="true">';
		actionsHtml += '	<div class="modal-dialog">';
		actionsHtml += '  <div class="modal-content">';
		actionsHtml += '    <div class="modal-header">';
		actionsHtml += '      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		actionsHtml += '      <h4 class="modal-title">Наличие мест. Помощь.</h4>';
		actionsHtml += '    </div>';
		actionsHtml += '    <div class="modal-body">';
		actionsHtml += '      <img src="img/yacheika2.png" style="margin:0; float:none; border:none; box-shadow:none;">';
		actionsHtml += '    </div>';
		actionsHtml += '    <div class="modal-footer">';
		actionsHtml += '      <button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>';
		actionsHtml += '    </div>';
		actionsHtml += '  	</div>';
		actionsHtml += '  </div>';
		actionsHtml += '</div>';
		this.$container.append(actionsHtml);
		this.$GeneralActions = this.$container.find('.Av-GeneralActions');
		this.$btnSave = this.$GeneralActions.find('.Av-GeneralSave');
		this.$btnCancel = this.$GeneralActions.find('.Av-GeneralCancel');
	};

	TableAv.prototype.resetSelectChecks = function() {
		this.$allChecks.removeClass('selected');
		this.selectedChecks = null;
		this.selectedChecks = {
			length: 0
		};
		if (this._checkActions !== null) {
			this._checkActions.style.display = 'none';
			this._$checkActions.find('.Av-periodStart select.Av-periodDays').hide();
			this._$checkActions.find('.Av-periodEnd select.Av-periodDays').hide();
		}
	};

	TableAv.prototype.changeValueChecks = function() {
		var val = +this._$checkActions.find('.Av-changeChecksValue').val();
		var type = this._$checkActions.find('input[name=Av-changeChecksType]:checked').val();
		var initVal, newVal, id, day, month, year, date;
		for (var i in this.selectedChecks) {
			if (i === 'length') {
				continue;
			}
			day = this.selectedChecks[i].data('day');
			month = this.selectedChecks[i].data('month');
			year = this.selectedChecks[i].data('year');
			id = this.selectedChecks[i].data('id');
			date = day + '.' + month + '.' + year;
			if (this.saveData === null) {
				this.saveData = {};
			}
			if (this.saveData[id] === undefined) {
				this.saveData[id] = {};
			}

			initVal = +this.selectedChecks[i].find('.Av-check-value').text();
			if (type === '+') {
				newVal = initVal + val;
			} else if (type === '-') {
				newVal = initVal - val;
			} else if (type === 'set') {
				newVal = val;
			}

			if (newVal <= 0) {
				newVal = '';
				this.saveData[id][date] = 0;
				this.selectedChecks[i].removeClass('value');
			} else {
				this.saveData[id][date] = newVal;
				this.selectedChecks[i].addClass('value');
			}
			this.$btnSave.removeClass('disabled');
			this.$btnCancel.removeClass('disabled');

			this.selectedChecks[i].find('.Av-check-value').html(newVal);
			this.selectedChecks[i].find('.Av-check-rest').html(newVal - (+this.selectedChecks[i].find('.Av-check-sale').html()));
		}

		this.resetSelectChecks();
	};

	TableAv.prototype.changeSelectChecks = function($select) {
		var $mon, $selectParent;
		if ($select.hasClass('Av-periodMonth')) {
			$mon = $select.find('option:selected');
			$selectParent = $select.parent();
			$selectParent.find('select.Av-periodDays').hide();
			$selectParent.find('select.Av-periodDays[data-month=' + $mon.data('month') + '][data-year=' + $mon.data('year') + ']').show();
		}
		var $start = this._$checkActions.find('.Av-periodStart');
		var $startDays = $start.find('.Av-periodDays:visible');
		var startDay = +$startDays.val();
		var startMon = +$startDays.data('month');
		var startYear = +$startDays.data('year');

		var $end = this._$checkActions.find('.Av-periodEnd');
		var $endDays = $end.find('.Av-periodDays:visible');
		var endDay = +$endDays.val();
		var endMon = +$endDays.data('month');
		var endYear = +$endDays.data('year');

		for (var i = 0; i < this.$allChecks.length; i++) {
			var $el = this.$allChecks.eq(i);
			var el = this.$allChecks[i];
			var elId = this.$allChecks[i].id;
			var day = +$el.data('day');
			var mon = +$el.data('month');
			var year = +$el.data('year');
			var idRoom = $el.data('id');
			this.removeCheck(elId, $el);

			if (endYear < startYear ||
				(endYear === startYear && endMon < startMon) ||
				(endYear === startYear && endMon === startMon && endDay < startDay)) {
				continue;
			}

			if ((endYear === year && year === startYear && endMon === mon && mon === startMon && endDay >= day && day >= startDay) ||
				(endYear === year && year === startYear && endMon > mon && mon === startMon && day >= startDay) ||
				(endYear === year && year === startYear && endMon === mon && mon > startMon && endDay >= day) ||
				(endYear === year && year === startYear && endMon > mon && mon > startMon) ||

				(endYear === year && year > startYear && endMon === mon && endDay >= day) ||
				(endYear >= year && year >= startYear && endMon < mon && mon === startMon && day >= startDay) ||
				(endYear > year && year === startYear && mon > startMon) ||
				(endYear > year && year === startYear && mon <= startMon && day >= startDay) ||
				(endYear === year && year > startYear && endMon > mon)
			) {
				if (this.selectedRooms[idRoom]) {
					this.addCheck(elId, $el);
				}
			}
		}
	};

	TableAv.prototype.save = function($el) {
		eventDisp.trigger('TableAvSave', JSON.stringify(this.saveData));

		this.$btnSave.addClass('disabled');
		this.$btnCancel.addClass('disabled');
	};

	TableAv.prototype.cancel = function($el) {
		this.$calendar = null;
		this.calendar = null;
		this.calendarData = null;
		this._dragEl = null;
		this._checkActions = null;
		this._$checkActions = null;
		this.$allChecks = null;
		this.selectedChecks = {
			length: 0
		};
		this.selectedPeriod = null;
		this.saveData = null;
		this.$btnSave = null;
		this.$btnCancel = null;
		this.init(this.initData);
	};

	TableAv.prototype.initEvents = function() {
		var self = this;
		self._makeDraggable();
		self._$checkActions.on('click', '.close, .cancel', function() {
			self.resetSelectChecks();
		});

		self._$checkActions.on('click', '.save', function() {
			self.changeValueChecks();
		});

		self._$checkActions.on('change', 'select', function() {
			self.changeSelectChecks($(this));
		});

		self.$btnSave.on('click', function() {
			var $el = $(this);
			if ($el.hasClass('disabled')) {
				return false;
			}
			self.save($el);
		});

		self.$btnCancel.on('click', function() {
			var $el = $(this);
			if ($el.hasClass('disabled')) {
				return false;
			}
			self.cancel($el);
		});

		var $window = $(window);
		var calendarHeight = self.$calendar.height();
		self.$container.on('scroll', function() {

			var scrollLeft = self.$container.scrollLeft();
			var scrollTop = $window.scrollTop();
			var pos;
			if (scrollLeft > 1) {
				self.$rooms.css('position', 'absolute').css('top', '');
				pos = getOffsetRect(self.$rooms[0]);
				self.$rooms.css('position', 'fixed').css('top', pos.top - 1 - scrollTop);
				self.$GeneralActions.css('position', 'fixed').css('bottom', 'auto').css('top', pos.top + 76 + calendarHeight - scrollTop);
			} else {
				self.$rooms.css('position', 'absolute').css('top', '');
				self.$GeneralActions.css('position', 'absolute').css('bottom', '0px').css('top', '');
			}

		});
		$window.on('scroll', function() {

			var scrollLeft = self.$container.scrollLeft();
			var scrollTop = $window.scrollTop();
			var pos;
			if (scrollLeft > 1) {
				self.$rooms.css('position', 'absolute').css('top', '');
				pos = getOffsetRect(self.$rooms[0]);
				self.$rooms.css('position', 'fixed').css('top', pos.top - 1 - scrollTop);
				self.$GeneralActions.css('position', 'fixed').css('bottom', 'auto').css('top', pos.top + 76 + calendarHeight - scrollTop);
			} else {
				self.$rooms.css('position', 'absolute').css('top', '');
				self.$GeneralActions.css('position', 'absolute').css('bottom', '0px').css('top', '');
			}

		});

	};

	function preventDefault(e) {
		e.preventDefault();
		return false;
	}

	function getOffset(elem) {
		if (elem.getBoundingClientRect) {
			return getOffsetRect(elem);
		} else {
			return getOffsetSum(elem);
		}
	}

	function getOffsetRect(elem) {
		var box = elem.getBoundingClientRect();

		var body = document.body;
		var docElem = document.documentElement;

		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		var top = box.top + scrollTop;
		var left = box.left + scrollLeft;

		return {
			top: Math.round(top),
			left: Math.round(left)
		};
	}

	function getOffsetSum(elem) {
		var top = 0,
			left = 0;
		while (elem) {
			top = top + parseInt(elem.offsetTop);
			left = left + parseInt(elem.offsetLeft);
			elem = elem.offsetParent;
		}

		return {
			top: top,
			left: left
		};
	}

	return TableAv;
})(window.jQuery, window.EVENT_DISP);