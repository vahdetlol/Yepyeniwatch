$( document ).ready(function() {
	var ajax_url = users_list_ajax.ajax_url;
	$(".no_login").click(function(){
		alert("Sadece kayıtlı kullanıcılar bu özelliği kullanabilir.");
	});
	$(document).on("click","[role=add]",function() {
	var add_cat_id = $(this).attr("cat_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "add_fav_action",add_cat_id:add_cat_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('#add'+add_cat_id).attr("role", "rem");
			$('#add'+add_cat_id).html('<i class="fas fa-heart"></i> Favorilerden Kaldır');
		}
		});
	});
	$(document).on("click","[role=rem]",function() {
	var rem_cat_id = $(this).attr("cat_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "rem_fav_action",rem_cat_id:rem_cat_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('#add'+rem_cat_id).attr("role", "add");
			$('#add'+rem_cat_id).html('<i class="far fa-heart"></i> Favorilere Ekle');
		}
		});
	});
	$(document).on("click","[role=add_wl]",function() {
	var wl_add_post_id = $(this).attr("post_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "add_to_watchlater_action",wl_add_post_id:wl_add_post_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('.wl'+wl_add_post_id).attr("role", "rem_wl");
			$('.wl'+wl_add_post_id).addClass("wl_active"); 
		}
		});
	});
	$(document).on("click","[role=rem_wl]",function() {
	var wl_rem_post_id = $(this).attr("post_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "rem_from_watchlater_action",wl_rem_post_id:wl_rem_post_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('.wl'+wl_rem_post_id).attr("role", "add_wl");
			$('.wl'+wl_rem_post_id).removeClass("wl_active"); 
			$('.remove_wl_'+wl_rem_post_id).remove(); 
		}
		});
	});	
	$(document).on("click","[role=add_wh]",function() {
	var wh_add_post_id = $(this).attr("post_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "add_to_watched_action",wh_add_post_id:wh_add_post_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('.wh'+wh_add_post_id).attr("role", "rem_wh");
			$('.wh'+wh_add_post_id).html('<i class="far fa-check-square"></i> İzledim');
		}
		});
	});
	$(document).on("click","[role=rem_wh]",function() {
	var wh_rem_post_id = $(this).attr("post_id");
		$.ajax({
		url : ajax_url,
		method : 'post',
		data:{action: "rem_from_watched_action",wh_rem_post_id:wh_rem_post_id,_wpnonce: users_list_ajax.admin_ajax_nonce},
		success: function(response){
			$('.wh'+wh_rem_post_id).attr("role", "add_wh");
			$('.wh'+wh_rem_post_id).html('<i class="far fa-square"></i> İzledim'); 
			$('.remove_wh_'+wh_rem_post_id).remove(); 
		}
		});
	});
});