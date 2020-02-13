module.exports = function(grunt) {
    grunt.initConfig({
        'node-minify': {
            gcc: {
                files: {
                    'jquery.instagramFeed.min.js': ['jquery.instagramFeed.js']
                }
            }
        },
        qunit: {
            files: ['test.html'],
			options: {
				puppeteer: {
					ignoreDefaultArgs: true,
					args: [
						"--headless",
						"--disable-web-security",
						"--allow-file-access-from-files"
					]
				},
				timeout: 10000
			},
        }
    });
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask('test', 'qunit');

    grunt.loadNpmTasks('grunt-node-minify');
    grunt.registerTask('build', 'node-minify');
};
