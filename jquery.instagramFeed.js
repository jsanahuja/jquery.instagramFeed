/*!
 * jquery.instagramFeed
 *
 * @version 1.3.2
 *
 * @author Javier Sanahuja Liebana <bannss1@gmail.com>
 * @contributor csanahuja <csanahuja10@gmail.com>
 *
 * https://github.com/jsanahuja/jquery.instagramFeed
 *
 */
(function ($) {
    var defaults = {
        'host': "https://www.instagram.com/",
        'username': '',
        'tag': '',
        'container': '',
        'display_profile': true,
        'display_biography': true,
        'display_gallery': true,
        'display_igtv': false,
        'callback': null,
        'styling': true,
        'items': 8,
        'items_per_row': 4,
        'margin': 0.5,
        'image_size': 640,
        'lazy_load': false,
        'on_error': console.error
    };
    var image_sizes = {
        "150": 0,
        "240": 1,
        "320": 2,
        "480": 3,
        "640": 4
    };
    var escape_map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    function escape_string(str) {
        return str.replace(/[&<>"'`=\/]/g, function (char) {
            return escape_map[char];
        });
    }

    $.instagramFeed = function (opts) {
        var options = $.fn.extend({}, defaults, opts);
        if (options.username == "" && options.tag == "") {
            options.on_error("Instagram Feed: Error, no username nor tag defined.", 1);
            return false;
        }
        if (typeof options.get_data !== "undefined") {
            console.warn("Instagram Feed: options.get_data is deprecated, options.callback is always called if defined");
        }
        if (options.callback == null && options.container == "") {
            options.on_error("Instagram Feed: Error, neither container found nor callback defined.", 2);
            return false;
        }

        var is_tag = options.username == "",
            url = is_tag ? options.host + "explore/tags/" + options.tag + "/" : options.host + options.username + "/";

        $.get(url, function (data) {
            try {
                data = data.split("window._sharedData = ")[1].split("<\/script>")[0];
            } catch (e) {
                options.on_error("Instagram Feed: It looks like the profile you are trying to fetch is age restricted. See https://github.com/jsanahuja/InstagramFeed/issues/26", 3);
                return;
            }
            data = JSON.parse(data.substr(0, data.length - 1));
            data = data.entry_data.ProfilePage || data.entry_data.TagPage;
            if (typeof data === "undefined") {
                options.on_error("Instagram Feed: It looks like YOUR network has been temporary banned because of too many requests. See https://github.com/jsanahuja/jquery.instagramFeed/issues/25", 4);
                return;
            }
            data = data[0].graphql.user || data[0].graphql.hashtag;

            if (options.container != "") {
                //Setting styles
                var styles = {
                    'profile_container': "",
                    'profile_image': "",
                    'profile_name': "",
                    'profile_biography': "",
                    'gallery_image': ""
                };
                if (options.styling) {
                    styles.profile_container = " style='text-align:center;'";
                    styles.profile_image = " style='border-radius:10em;width:15%;max-width:125px;min-width:50px;'";
                    styles.profile_name = " style='font-size:1.2em;'";
                    styles.profile_biography = " style='font-size:1em;'";
                    var width = (100 - options.margin * 2 * options.items_per_row) / options.items_per_row;
                    styles.gallery_image = " style='margin:" + options.margin + "% " + options.margin + "%;width:" + width + "%;float:left;'";
                }

                var html = "";
                //Displaying profile
                if (options.display_profile) {
                    html += "<div class='instagram_profile'" + styles.profile_container + ">";
                    html += "<img class='instagram_profile_image' src='" + data.profile_pic_url  + "' alt='"+ (is_tag ? data.name + " tag pic" : data.username + " profile pic") + "'" + styles.profile_image + (options.lazy_load ? " loading='lazy'" : '') + " />";
                    if (is_tag)
                        html += "<p class='instagram_tag'" + styles.profile_name + "><a href='https://www.instagram.com/explore/tags/" + options.tag + "' rel='noopener' target='_blank'>#" + options.tag + "</a></p>";
                    else
                        html += "<p class='instagram_username'" + styles.profile_name + ">@" + data.full_name + " (<a href='https://www.instagram.com/" + options.username + "' rel='noopener' target='_blank'>@" + options.username + "</a>)</p>";

                    if (!is_tag && options.display_biography)
                        html += "<p class='instagram_biography'" + styles.profile_biography + ">" + data.biography + "</p>";

                    html += "</div>";
                }

                //image size
                var image_index = typeof image_sizes[options.image_size] !== "undefined" ? image_sizes[options.image_size] : image_sizes[640];

                if (options.display_gallery) {
                    if (typeof data.is_private !== "undefined" && data.is_private === true) {
                        html += "<p class='instagram_private'><strong>This profile is private</strong></p>";
                    } else {
                        var imgs = (data.edge_owner_to_timeline_media || data.edge_hashtag_to_media).edges;
                        max = (imgs.length > options.items) ? options.items : imgs.length;

                        html += "<div class='instagram_gallery'>";
                        for (var i = 0; i < max; i++) {
                            var url = "https://www.instagram.com/p/" + imgs[i].node.shortcode,
                                image, type_resource, caption;

                            switch (imgs[i].node.__typename) {
                                case "GraphSidecar":
                                    type_resource = "sidecar"
                                    image = imgs[i].node.thumbnail_resources[image_index].src;
                                    break;
                                case "GraphVideo":
                                    type_resource = "video";
                                    image = imgs[i].node.thumbnail_src
                                    break;
                                default:
                                    type_resource = "image";
                                    image = imgs[i].node.thumbnail_resources[image_index].src;
                            }

                            if (
                                typeof imgs[i].node.edge_media_to_caption.edges[0] !== "undefined" &&
                                typeof imgs[i].node.edge_media_to_caption.edges[0].node !== "undefined" &&
                                typeof imgs[i].node.edge_media_to_caption.edges[0].node.text !== "undefined" &&
                                imgs[i].node.edge_media_to_caption.edges[0].node.text !== null
                            ) {
                                caption = imgs[i].node.edge_media_to_caption.edges[0].node.text;
                            } else if (
                                typeof imgs[i].node.accessibility_caption !== "undefined" &&
                                imgs[i].node.accessibility_caption !== null
                            ) {
                                caption = imgs[i].node.accessibility_caption;
                            } else {
                                caption = (is_tag ? data.name : data.username) + " image " + i;
                            }

                            html += "<a href='" + url + "' class='instagram-" + type_resource + "' rel='noopener' target='_blank'>";
                            html += "<img" + (options.lazy_load ? " loading='lazy'" : '')  + " src='" + image + "' alt='" + escape_string(caption) + "'" + styles.gallery_image +" />";
                            html += "</a>";
                        }
                        html += "</div>";
                    }
                }

                if (options.display_igtv && typeof data.edge_felix_video_timeline !== "undefined") {
                    var igtv = data.edge_felix_video_timeline.edges,
                        max = (igtv.length > options.items) ? options.items : igtv.length
                    if (igtv.length > 0) {
                        html += "<div class='instagram_igtv'>";
                        for (var i = 0; i < max; i++) {
                            html += "<a href='https://www.instagram.com/p/" + igtv[i].node.shortcode + "' rel='noopener' target='_blank'>";
                            html += "<img"+ (options.lazy_load ? " loading='lazy'" : '') + " src='"+ igtv[i].node.thumbnail_src +"' alt='"+ options.username +" instagram image "+ i+"'"+styles.gallery_image+" />";
                            html += "</a>";
                        }
                        html += "</div>";
                    }
                }

                $(options.container).html(html);
            }

            if (options.callback != null) {
                options.callback(data);
            }

        }).fail(function (e) {
            options.on_error("Instagram Feed: Unable to fetch the given user/tag. Instagram responded with the status code: " + e.status, 5);
        });

        return true;
    };

})(jQuery);
