// SSI JS
(function (callback) {
	if (jQuery === undefined) return console.log('Please require jQuery');

	var $ = jQuery,
		total = 0,
		index = 0;

	function filterNone() {
		return NodeFilter.FILTER_ACCEPT;
	}

	function getAllComments(rootElem) {
		// Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
		var iterator = document.createNodeIterator(rootElem, NodeFilter.SHOW_COMMENT, filterNone, false);
		var curNode = iterator.nextNode(),
			nodes = [];
		while (curNode) {
			if (curNode.nodeValue.search(/virtual/i) > -1) {
				nodes.push(curNode);
			}
			curNode = iterator.nextNode();
		}

		total = nodes.length;

		if (total == 0) {
			if (typeof callback == 'function') {
				callback($);
			}

			return;
		}

		$.each(nodes, function (i, curNode) {
			// comments.push(curNode.nodeValue);
			var node = $('<div ' + curNode.nodeValue + '></div>'),
				virtual = node.attr('virtual') || '';
			if (virtual != '') {
				$(curNode).after(node).remove();

				$.get(virtual, function (data) {
					var $e = $(data);

					node.before($e).remove();

					ajaxComplete();
				}).fail(function () {
					ajaxComplete();
				});
			}
		});
	}

	function imagesOnload(selector, callback) {
		if (typeof selector == 'undefined' || typeof callback == 'undefined') return;

		var p = $(selector),
			img_i = 0,
			complete = function () {
				if (++img_i >= p.length) {
					callback();
				}
			};

		if (p.length == 0) {
			return callback();
		}

		p.each(function () {
			if (this.complete) {
				complete();
			} else {
				this.onload = complete;
			}
		});
	}

	function ajaxComplete() {
		index++;

		if (index == total) {
			if (typeof callback == 'function') {
				callback($);
			}
		}
	}

	return getAllComments(document);	
})(function ($) {
	var prefix = 'pos_',
		currency = 'VNĐ',
		main_table_number = 0,
		user = {};

	if (account()) {
		$(document).ready(function ($) {
			table_stories();

			table_menu();

			if ($('body').hasClass('cart-page')) {
				table_cart();
			}

			$('.modal').on('hide.bs.modal', function () {
				$('form', this).each(function () {
					this.reset();
					$('.id', this).val(0);
				});
			});

			$('.menu [data-section]').on('click', function () {
				var s = $(this).data('section') || '';

				if (s != '') {
					show_section(s);
				}
			});

			$('.btn-close-cart').on('click', function () {
				var t = $('.section-cart');
				if (t.hasClass('step-cart')) {
					// show_section('table');
					redirect('table');
				} else {
					t.addClass('step-cart');
				}
				t.removeClass('step-payment').find('.quality').removeAttr('disabled');
			});

			$('.btn-cart-payment').on('click', function () {
				$('.section-cart').removeClass('step-cart').addClass('step-payment').find('.quality').attr('disabled', 'disabled');
			});

			$('.btn-cart-back').on('click', table_cart_back);

			$('.btn-cart-complete').on('click', function () {
				if (confirm('Bạn có chắc muốn hoàn thành đơn hàng của bàn số ' + main_table_number + ' không?')) {
					var list_cart = get_items('cart', {
							table: main_table_number,
							completed: 0
						}),
						t = get_time(),
						d = get_datetime();

					list_cart.forEach((item) => {
						item.completed = t;
						item.completed_at = d;

						update_item('cart', item);
					});

					table_cart_back();

					$('.card')
						.eq(main_table_number - 1)
						.removeClass('has-cart')
						.find('.fa-shopping-cart')
						.text('');

					// main_table_number = 0;

					update_value('table_number', 0);
					// show_section('table');
					redirect('table');
				}
			});

			$('.btn-logout').on('click', function () {
				delete user.logined;
				update_item('user', user);

				redirect('index');
			});
		});
	}

	function get_time() {
		return new Date().getTime();
	}

	function get_datetime(format) {
		if (typeof format != 'string') {
			return get_datetime('Y-m-d H:i:s');
		}

		var d = new Date(),
			values = {
				Y: d.getFullYear(),
				m: ('0' + (d.getMonth() + 1)).slice(-2),
				d: ('0' + d.getDate()).slice(-2),
				H: ('0' + d.getHours()).slice(-2),
				i: ('0' + d.getMinutes()).slice(-2),
				s: ('0' + d.getSeconds()).slice(-2),
			};

		var text = '';

		for (var i = 0; i < format.length; i++) {
			var v = format.substring(i, i + 1);

			if (typeof values[v] != 'undefined') {
				v = values[v];
			}

			text += v;
		}

		return text;
	}

	function number_format(number, after, before) {
		// Create our number formatter.
		var formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',

				// These options are needed to round to whole numbers if that's what you want.
				minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
				//maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
			}),
			value = formatter.format(number).replace('$', ''),
			text = [];

		if (typeof before != 'undefined') {
			text.push(before);
		}

		text.push(value);

		if (typeof after != 'undefined') {
			text.push(after);
		}

		return text.join(' ');
	}

	function get_items(name, where, cart) {
		var list = [],
			key = '',
			item = {},
			text = prefix + name;

		for (var i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			if (key.substring(0, text.length) === text) {
				item = JSON.parse(localStorage.getItem(key));

				list.push(item);
			}
		}

		if (typeof where == 'object') {
			var keys = Object.keys(where);
			for (i in keys) {
				var key = keys[i],
					value = where[key];

				list = list.filter((o) => o[key] === value);
			}
		}

		if (cart) {}

		return list;
	}

	function add_item(name, item) {
		var id = '';

		if (typeof item.id == 'undefined') {
			item['id'] = id = get_time();
		} else {
			id = item.id;
		}

		item['created'] = get_datetime();

		localStorage.setItem(prefix + name + '_' + id, JSON.stringify(item));

		return id;
	}

	function update_item(name, item) {
		var id = item.id,
			old = get_item(name, item.id);
		
		Object.keys(item).forEach( key => {
			if(typeof old[key] != 'undefined') {
				old[key] = item[key];
			}
		});
		
		old['updated'] = get_datetime();

		localStorage.setItem(prefix + name + '_' + id, JSON.stringify(old));

		return item;
	}

	function remove_item(name, id) {
		return localStorage.removeItem(prefix + name + '_' + id);
	}

	function get_item(name, id) {
		return JSON.parse(localStorage.getItem(prefix + name + '_' + id));
	}

	function update_value(name, value) {
		localStorage.setItem(prefix + name, value);
	}

	function get_value(name) {
		return localStorage.getItem(prefix + name);
	}

	function alert_info(text) {
		var e = $('<div class="alert alert-info" role="alert">' + text + '</div>');
		$('.p-alert').append(e);

		setTimeout(function () {
			e.remove();
		}, 5000);
	}

	function table_menu() {
		$('.table-menu').each(function () {
			var p = $(this),
				list = get_items('menu'),
				tbody = $('tbody', p);

			function add_menu_item(i, item) {
				var td = '<th class="name" scope="row">' + item.name + '</th>',
					buttons = [
						'<a href="#" class="btn btn-primary btn-edit-menu"><i class="fa fa-edit"></i></a>',
						'<a href="#" class="btn btn-danger btn-delete-menu"><i class="fa fa-trash"></i></a>',
						// '<a href="#" class="btn btn-info btn-down-menu"><i class="fa fa-chevron-down"></i></a>',
						// '<a href="#" class="btn btn-info btn-up-menu"><i class="fa fa-chevron-up"></i></a>',
					];

				td += '<td><span class="price">' + item.price + '</span> ' + currency + '</td>';
				td += '<td class="action">' + buttons.join('\n') + '</td>';
				tbody.append('<tr class="tr-menu-row menu-' + item.id + '" data-id="' + item.id + '">' + td + '</tr>');
			}

			$.each(list, add_menu_item);

			p.on('click', '.btn-edit-menu', function (e) {
				e.preventDefault();

				var row = $(this).parents('.tr-menu-row'),
					price = parseInt($('.price', row).text()) / 1000;

				$('#menu_name').val($('.name', row).text());
				$('#menu_price').val(price);
				$('#menu_id').val(row.data('id'));

				popup.modal('show');
			});

			p.on('click', '.btn-delete-menu', function (e) {
				e.preventDefault();

				var row = $(this).parents('.tr-menu-row'),
					id = row.data('id') || '';

				if (confirm('Bạn có chắc muốn tiếp tục xóa không?')) {
					row.remove();
					remove_item('menu', id);

					$('tr', tbody).each(function (i) {
						$('.number', this).text(i + 1);
					});
				}
			});

			var popup = $('#modal-menu').each(function () {
				var p = $(this);

				$('.btn-submit', p).on('click', function (e) {
					var name = $('#menu_name').val(),
						id = $('#menu_id').val(),
						price = $('#menu_price').val() * 1000,
						error = $('.error-message', popup),
						item = {};

					if (name != '' && price > 0) {
						if (id == 0) {
							item.id = add_item('menu', {
								name: name,
								price: price,
							});

							add_menu_item(tbody.find('tr').length, item);
						} else {
							update_item('menu', {
								id : id,
								price : price
							});

							$('tr.menu-' + id).each(function () {
								$('.name', this).text(name);
								$('.price', this).text(price);
							});
						}

						popup.modal('hide');
						error.addClass('hide');
					} else {
						error.removeClass('hide');
					}
				});
			});
		});
	}

	function table_stories() {
		$('.table-in-store').each(function () {
			var p = $(this),
				cart = $('.col-card:first', p),
				html = cart[0].outerHTML,
				total = get_value('table_count') || 0;

			if (total > 1) {
				for (i = 2; i <= total; i++) {
					var e = $(html).removeClass('hide');

					$('.card-title', e).html(i);

					$('.col-button', p).before(e);
				}
			}

			$('.card', p).each(function (i) {
				var e = $(this),
					number = i + 1,
					list_cart = get_items('cart', {
						table: number,
						completed: 0
					});

				if (list_cart.length > 0) {
					$('.fa-shopping-cart', e).text(list_cart.length);
					e.addClass('has-cart');
				}

				e.addClass('table-number-' + number);
			});

			$('.btn-add-card', p).on('click', function (e) {
				e.preventDefault();

				var card = $(html).removeClass('hide'),
					total = $('.col-card', p).length + 1;

				$('.card-title', card).html(total);

				$('.col-button', p).before(card);

				update_value('table_count', total);
			});

			p.on('click', '.card', function () {
				var card = $(this),
					number = parseInt($('.card-title', card).text());

				// console.log('number', number, 'choose cart');
				if (number > 0) {
					update_value('table_number', number);

					redirect('cart');
					// main_table_number = number;
					// table_cart(number);
				}
			});
		});
	}

	function table_cart() {
		main_table_number = parseInt(get_value('table_number') || 0);

		if (main_table_number == 0) {
			return redirect('table');
		}

		$('.carting-table-number').text(main_table_number);

		$('.table-cart').each(function () {
			var p = $(this),
				list_menu = get_items('menu'),
				list_cart = get_items('cart', {
					table: main_table_number,
					completed: 0
				}),
				tbody = $('tbody', p).empty();

			if (list_menu.length == 0) {
				$('#modal-noti')
					.each(function () {
						$('.message', this).text('Vui lòng tạo thực đơn.');
					})
					.modal('show');

				return false;
			}

			function update_total() {
				var total = 0,
					n = 0;

				$('.table-cart tbody tr').each(function () {
					var tr = $(this),
						price = parseInt($('.price', tr).text()),
						quality = parseInt($('.quality', tr).val()),
						subtotal = price * quality;

					$('.subtotal', tr).text(subtotal);

					if (quality > 0) {
						total += subtotal;
						n++;
					}
				});

				$('.table-cart .total').text(number_format(total, currency));

				$('.table-number-' + main_table_number)
					.find('.fa-shopping-cart')
					.text(n);

				var card = $('.card').eq(main_table_number - 1);
				if (n == 0) {
					card.removeClass('has-cart');
				} else {
					card.addClass('has-cart');
				}
			}

			function update_quality(element) {
				var self = $(element),
					row = self.parents('.tr-cart-row'),
					id = row.attr('data-id') || '',
					menu_item = get_item('menu', row.attr('data-menu-id')),
					quality = $('.quality', row),
					value = parseInt(quality.val()),
					item = {};

				if (self.hasClass('fa-plus')) {
					value++;

					quality.val(value);
				} else if (self.hasClass('fa-minus')) {
					value--;
					if (value < 0) {
						value = 0;
					}
					
					quality.val(value);
				}

				if (value == 0) {
					row.addClass('hide-print');
				} else {
					row.removeClass('hide-print');
				}

				if (id === '') {
					item = menu_item;
					item.menu_id = menu_item.id;
					item.table = main_table_number;
					item.completed = 0;

					delete item.id;
				} else {
					item = get_item('cart', id);
				}

				item.quality = value;

				if (id === '' && value > 0) {
					id = add_item('cart', item);
					row.attr('data-id', id);
				} else if (id != '' && value == 0) {
					remove_item('cart', id);
					row.attr('data-id', '');
				} else if (value > 0) {
					update_item('cart', item);
				}

				update_total();
			}

			list_menu.forEach((item) => {
				var cart = list_cart.find((o) => o.menu_id == item.id),
					id = '';

				item.quality = 0;

				if (typeof cart == 'object' && typeof cart.id != 'undefined') {
					item.quality = cart.quality;
					id = cart.id;
				}

				var td = '<th class="name" scope="row">' + item.name + '</th>',
					subtotal = item.quality * item.price,
					inputs = ['<div class="input-group">', '<i class="fa fa-minus input-group-text icon-quality"></i>', '<input type="number" class="form-control quality" value="' + item.quality + '">', '<i class="fa fa-plus input-group-text icon-quality"></i>', '</div>'];

				td += '<td class="col-price"><span class="price">' + item.price + '</span> VNĐ</td>';
				td += '<td>' + inputs.join('\n') + '</td>';
				td += '<td class="col-subtotal"><span class="subtotal">' + subtotal + '</span> ' + currency + '</td>';
				tbody.append('<tr class="tr-cart-row' + (id == '' ? ' hide-print' : '') + '" data-id="' + id + '" data-menu-id="' + item.id + '">' + td + '</tr>');
			});

			update_total();

			if (!p.hasClass('evented')) {
				p.on('click', '.icon-quality', function (e) {
					e.preventDefault();
					update_quality(this);
				}).on('change', '.quality', function () {
					update_quality(this);
				}).addClass('evented');
			}

			show_section('cart');
		});
	}

	function table_cart_back() {
		$('.section-cart').removeClass('step-payment').addClass('step-cart').find('.quality').removeAttr('disabled');
	}

	function show_section(name) {
		$('section').addClass('hide');
		$('.section-' + name).removeClass('hide');
	}

	function account() {
		if ($('body').hasClass('home-page')) {
			return false;
		}

		var value = get_value('user_1');
		user = JSON.parse(value || '{}');
		if (typeof user.logined == 'undefined') {
			return login(value);
		}

		return true;
	}

	function login(value) {
		if ($('body').hasClass('login-page')) {
			if (typeof MD5 != 'function') {
				$('.login-form .alert').html('Tính năng bảo mật chưa mở. Bạn vui lòng quay lại sau!').removeClass('hide');

				return;
			}

			if (value == null) {
				$('.btn-register')
					.removeClass('hide')
					.on('click', function () {
						submit_login('register');
					});
			} else {
				$('.btn-login')
					.removeClass('hide')
					.on('click', function () {
						submit_login('login');
					});
			}
		} else {
			redirect('login');
		}

		return false;
	}

	function login_alert() {
		var message = $('.login-form .alert').removeClass('hide');
		setTimeout(function () {
			message.addClass('hide');
		}, 30000);

		return false;
	}

	function submit_login(type) {
		var u = {
			email: $('#email').val() || '',
			pass: $('#pass').val() || '',
		};

		if (u.email == '' || u.pass == '') {
			return login_alert();
		}

		if (type == 'register') {
			u.pass = MD5(u.pass);
			u.id = 1;
			u.created = get_datetime();

			add_item('user', u);

			redirect('login');
		} else {
			var item = get_item('user', 1);

			if (item.email != u.email) {
				return login_alert();
			}

			if (item.pass != MD5(u.pass)) {
				return login_alert();
			}

			item.logined = get_time();
			item.lastLogin = get_datetime();

			update_item('user', item);

			redirect('table');
		}
	}

	function redirect(page) {
		location.href = './' + page + '.html';

		return;
	}
});
