/*!
 * Simple Age Verification (https://github.com/Herudea/age-verification))
 */

var ageVerify_modal_content,
ageVerify_modal_screen;

// Start Working ASAP.
$(document).ready(function() {
	av_legality_check();
});


av_legality_check = function() {
	if ($.cookie('is_legal') == "yes") {
		// legal!
		// Do nothing?
	} else {
		av_showmodal();

		// Make sure the prompt stays in the middle.
		$(window).on('resize', av_positionPrompt);
	}
};

av_showmodal = function() {
	ageVerify_modal_screen = $('<div id="ageVerify_modal_screen"></div>');
	ageVerify_modal_content = $('<div id="ageVerify_modal_content" style="display:none"></div>');
	var ageVerify_modal_landing_container_wrapper = $('<div id="ageVerify_modal_landing_container_wrapper" class="landing_container_wrapper"></div>');
	var modal_regret_wrapper = $('<div id="modal_regret_wrapper" class="landing_container_wrapper" style="display:none;"></div>');

	// Question Content
	//var content_heading = $('<h2>Are you 18 or older?</h2>');
	var content_heading = $(''); //var content_heading = $('<div class="popUp_Logo"><img src="img/logo.png" alt="" /></div>');
	var content_buttons = $('<nav class="popup_button_group"><div class="terms_acceptCheck_box"><label><input type="checkbox" value="" type="checkbox" name="" /> I have read and accept the terms and conditions listed here and in the <a href="#">Terms & Conditions</a> of Use.</label></div><ul><li><a href="#nothing" class="av_btn av_go" rel="yes">ENTER</a></li><li><a href="https://www.google.com" class="av_btn2 av_no" rel="no">LEAVE</a></li></nav>');
	var content_text = $('<p>You must verify that you are 18 years of age or older to enter this site.</p>');
	//var content_text = $('<div class="ageVerify_popContent_block">< div class= "model_imgBlock" ><img src="age-verification/img/model_img1.png" /></div > <div class="ageVerify_popup_ageNotice"><p><strong class="adult_text">THIS WEBSITE IS FOR ADULTS ONLY!</strong></p><p>This website is meant only for people who have reached the Age of majority in their jurisdiction. You should be at least eighteen (18) years of age or above to access this website. In jurisdictions where <strong><i>Age of majority</i></strong> is defined to be nineteen (19) years of age or twenty-one (21) years of age you should access this website only if you are 19 or 21 years of age or above.</p><p>When you access this website, you represent to us that you are an adult individual in your jurisdiction and <i>not a minor.</i></p><p>By accessing any portion of this website beyond this pop-up, you agree to our <strong>Terms & Conditions</strong>. Unauthorized access and use of this website may violate applicable law in your jurisdiction.</p><p>We do not create, edit, endorse or in any manner authenticate or promote any content that is shown on any of the advertisements. However, all content including text and images on all advertisements posted on this site must comply with our age and content-related policies and standards.</p><p>We have a zero-tolerance policy towards human trafficking, prostitution, and other forms of inappropriate and illegal acts and conduct. We cooperate with law enforcement pursuant to subpoenas and other appropriate legal processes.</p><p>Any conduct or activity on this site that violates our zero-tolerance policy may result in cancellation of that member’s membership and may also led to referral to appropriate law enforcement authorities. Any user of this site swears not to use this site in violation of the site’s policies and also swears to abide by all local, state, and federal law in their respective jurisdiction.</p><p>The user additionally agrees to <i><strong>report violations</strong></i> to appropriate local or federal authorities.</p><p>In addition, the user agrees to <i><strong>report suspected cases of exploitation of minors and/or human trafficking to appropriate authorities</strong></i>. German users of the site may contact the YPA <i><strong>here</strong></i>.</p><p>This site uses cookies and by continuing to browse and use this site you agree to our use of cookies.</p></div></div > ');
	// Regret Content
	var regret_heading = $('<h2>We\'re Sorry!</h2>');
	var regret_buttons = $('<nav><small>I hit the wrong button!</small> <ul><li><a href="#nothing" class="av_btn av_go" rel="yes">I\'M OLD ENOUGH!</a></li></ul></nav>');
	var regret_text = $('<p>You must be 18 years of age or older to enter this site.</p>');
	

	ageVerify_modal_landing_container_wrapper.append(content_heading, content_text, content_buttons);
	modal_regret_wrapper.append(regret_heading, regret_buttons, regret_text);
	ageVerify_modal_content.append(ageVerify_modal_landing_container_wrapper, modal_regret_wrapper);

	// Append the prompt to the end of the document
	$('body').append(ageVerify_modal_screen, ageVerify_modal_content);

	// Center the box
	av_positionPrompt();

	ageVerify_modal_content.find('a.av_btn').on('click', av_setCookie);
};

av_setCookie = function(e) {
	e.preventDefault();

	var is_legal = $(e.currentTarget).attr('rel');

	$.cookie('is_legal', is_legal, {
		expires: 30,
		path: '/'
	});

	if (is_legal == "yes") {
		av_closeModal();
		$(window).off('resize');
	} else {
		av_showRegret();
	}
};

av_closeModal = function() {
	ageVerify_modal_content.fadeOut();
	ageVerify_modal_screen.fadeOut();
};

av_showRegret = function() {
	ageVerify_modal_screen.addClass('nope');
	ageVerify_modal_content.find('#ageVerify_modal_landing_container_wrapper').hide();
	ageVerify_modal_content.find('#modal_regret_wrapper').show();
};

av_positionPrompt = function() {
	var top = ($(window).outerHeight() - $('#ageVerify_modal_content').outerHeight()) / 2;
	var left = ($(window).outerWidth() - $('#ageVerify_modal_content').outerWidth()) / 2;
	ageVerify_modal_content.css({
		'top': top,
		'left': left
	});

	if (ageVerify_modal_content.is(':hidden') && ($.cookie('is_legal') != "yes")) {
		ageVerify_modal_content.fadeIn('slow')
	}
};
