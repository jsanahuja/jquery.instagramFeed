module.exports = function(grunt) {
    grunt.initConfig({
        qunit: {
            files: ['test.html']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.registerTask('test', 'qunit');
};
