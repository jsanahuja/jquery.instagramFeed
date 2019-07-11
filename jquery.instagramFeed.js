/*!
 * jquery.instagramFeed
 *
 * @version 1.1.3
 *
 * @author Javier Sanahuja Liebana <bannss1@gmail.com>
 * @contributor csanahuja <csanahuja@gmail.com>
 *
 * https://github.com/jsanahuja/jquery.instagramFeed
 *
 */
(function($){
	var defaults = {
		'host': "https://www.instagram.com/",
		'username': '',
		'container': '',
		'display_profile': true,
		'display_biography': true,
		'display_gallery': true,
		'display_igtv': false,
		'get_raw_json': false,
		'callback': null,
		'styling': true,
		'items': 8,
		'items_per_row': 4,
		'margin': 0.5,
        'image_size': 640
	};

	$.instagramFeed = function(options){
		options = $.fn.extend({}, defaults, options);
		if(options.username == ""){
			console.error("Instagram Feed: Error, no username found.");
			return;
		}
		if(!options.get_raw_json && options.container == ""){
			console.error("Instagram Feed: Error, no container found.");
			return;
		}
		if(options.get_raw_json && options.callback == null){
			console.error("Instagram Feed: Error, no callback defined to get the raw json");
			return;
		}

		$.get(options.host + options.username, function(data){
				data = data.split("window._sharedData = ");
				data = data[1].split("<\/script>");
				data = data[0];
				data = data.substr(0, data.length - 1);
				data = JSON.parse(data);
				data = data.entry_data.ProfilePage[0].graphql.user;
				
				if(options.get_raw_json){
					options.callback(
						JSON.stringify({
							id: data.id,
							username: data.username,
							full_name: data.full_name,
							is_private: data.is_private,
							is_verified: data.is_verified,
							biography: data.biography,
							followed_by: data.edge_followed_by.count,
							following: data.edge_follow.count,
							images: data.edge_owner_to_timeline_media.edges,
							igtv: data.edge_felix_video_timeline.edges
						})
					);
					return;
				}
				
				var styles = {
					'profile_container': "",
					'profile_image': "",
					'profile_name': "",
					'profile_biography': "",
					'gallery_image': ""
				};
				if(options.styling){
					styles.profile_container = " style='text-align:center;'";
					styles.profile_image = " style='border-radius:10em;width:15%;max-width:125px;min-width:50px;'";
					styles.profile_name = " style='font-size:1.2em;'";
					styles.profile_biography = " style='font-size:1em;'";
					var width = (100 - options.margin * 2 * options.items_per_row)/options.items_per_row;
					styles.gallery_image = " style='margin:"+options.margin+"% "+options.margin+"%;width:"+width+"%;float:left;'";
					
				}
				
				var html = "";
				if(options.display_profile){
					html += "<div class='instagram_profile'" +styles.profile_container +">";
					html += "	<img class='instagram_profile_image' src='"+ data.profile_pic_url +"' alt='"+ options.username +" profile pic'"+ styles.profile_image +" />";
					html += "	<p class='instagram_username'"+ styles.profile_name +">@"+ data.full_name +" (<a href='https://www.instagram.com/"+ options.username +"'>@"+options.username+"</a>)</p>";
				}
				
				if(options.display_biography){
					html += "	<p class='instagram_biography'"+ styles.profile_biography +">"+ data.biography +"</p>";
				}
				
				if(options.display_profile){
					html += "</div>";
				}

                var image_index = 4
                if(options.image_size !== 640){
                    switch (options.image_size) {
                        case 150:
                            image_index = 0;
                            break;
                        case 240:
                            image_index = 1;
                            break;
                        case 320:
                            image_index = 2;                        
                            break;
                        case 480:
                            image_index = 3;
                            break;
                        default:
                            console.warn("Wrong image size. Getting default value. Accepted values are [150, 240, 320, 480, 640]");
                    }
                }

				if(options.display_gallery){
					if(data.is_private){
						html += "<p class='instagram_private'><strong>This profile is private</strong></p>";
					}else{
						var imgs = data.edge_owner_to_timeline_media.edges;
							max = (imgs.length > options.items) ? options.items : imgs.length;
						
						html += "<div class='instagram_gallery'>";
						for(var i = 0; i < max; i++){
							var url = "https://www.instagram.com/p/" + imgs[i].node.shortcode;
							var image = imgs[i].node.thumbnail_resources[image_index].src
							var type_resource = "image"

							switch(imgs[i].node.__typename){
								case "GraphSidecar":
									type_resource = "sidecar"
									break;
								case "GraphVideo":
									type_resource = "video";
									image = imgs[i].node.thumbnail_src
									break;
								default:
									type_resource = "image";
							}

							html += "<a href='" + url +"' class='instagram-" + type_resource + "' rel='noopener' target='_blank'>";
							html += "   <img src='" + image + "' alt='" + options.username + " instagram image "+ i + "'" + styles.gallery_image +" />";
							html += "</a>";
						}
						html += "</div>";
					}
				}
				
				if(options.display_igtv){
					if(data.is_private){
						html += "<p class='instagram_private'><strong>This profile is private</strong></p>";
					}else{
						var igtv = data.edge_felix_video_timeline.edges,
							max = (igtv.length > options.items) ? options.items : igtv.length
						html += "<div class='instagram_igtv'>";
						for(var i = 0; i < max; i++){
							var url = "https://www.instagram.com/p/"+ igtv[i].node.shortcode;
							html += "<a href='"+url+"' rel='noopener' target='_blank'>";
							html += "	<img src='"+ igtv[i].node.thumbnail_src +"' alt='"+ options.username +" instagram image "+ i+"'"+styles.gallery_image+" />";
							html += "</a>";
						}
						html += "</div>";
					}
				}
				$(options.container).html(html);
			}
		);
	};
	
})(jQuery);