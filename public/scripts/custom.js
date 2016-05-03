var username;

$(document).ready(function () {
	$('.available').hide();
	$('.unavailable').hide();

	username = $('#username').text();
	
	var servicesList = $('.loading');
	$.each(servicesList, function(service) {
		var $this = $(this);
		var svc = $this.data("svc");
		$.get( "/availability/" + svc + "?username=" + username, function (res) {
			$this.find(".loading-spinner").fadeOut(function () {
				if (res[svc]) {
					$this.find(".available").fadeIn();
				} else {
					$this.find(".unavailable").fadeIn();
				}
			});
		});
	});
});
