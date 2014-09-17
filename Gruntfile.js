// Generated on 2014-09-16 using generator-angular 0.9.5
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths for the application
	var appConfig = {
		app: require('./bower.json').appPath || 'app',
		tmp: '.tmp',
		dist: 'dist'
	};

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		yeoman: appConfig,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			js: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			html: {
				files: ['<%= yeoman.app %>/partials/{,*/}*.html'],
				tasks: [],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost',
				livereload: 35729
			},
			serve: {
				options: {
					middleware: function (connect) {
						return [
							connect.static('.')
						];
					}
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: {
				src: [
					'<%= yeoman.app %>/scripts/{,*/}*.js'
				]
			},
			test: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: ['test/spec/{,*/}*.js']
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: [
							'<%= yeoman.tmp %>',
							'<%= yeoman.dist %>/{,*/}*',
							'!<%= yeoman.dist %>/.git*'
						]
					}
				]
			}
		},

		concat: {
			js: {
				src: [
					'<%= yeoman.app %>/scripts/**/*.js',
					'<%= yeoman.tmp %>/scripts/**/*.js'
				],
				options: {
					banner: '; (function(angular){\'use strict\';\r\n',
					footer: '})(angular);'
				},
				dest: '<%= yeoman.dist %>/ldAdminTools.js'
			}
		},

		ngAnnotate: {
			dist: {
				options: {
					singleQuotes: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.dist %>',
						src: '*.js',
						dest: '<%= yeoman.dist %>'
					}
				]
			}
		},

		ngtemplates: {
			'ldAdminTools': {
				cwd: "<%= yeoman.app %>",
				src: "partials/**/*.html",
				dest: "<%= yeoman.tmp %>/scripts/partials.js"
			},
			options: {
				module: 'ldAdminTools',
				htmlmin: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					removeComments: true,
					removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '<%= yeoman.dist %>',
				src: '{,*/}*.css'
			}
		},

		cssmin: {
			css: {
				files: {
					'<%= yeoman.dist %>/ldAdminTools.min.css': '<%= yeoman.dist %>/ldAdminTools.css'
				}
			}
		},

		uglify: {
			js: {
				src: '<%= yeoman.dist %>/ldAdminTools.js',
				dest: '<%= yeoman.dist %>/ldAdminTools.min.js',
				options: {
					sourceMap: function (fileName) {
						return fileName.replace(/\.min\.js$/, '.map');
					}
				}
			}
		},

		// Test settings
		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
				singleRun: true
			}
		}
	});

	grunt.registerTask('serve', 'Watch changes', function (target) {
		grunt.task.run([
			'connect:serve',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean',
		'connect:serve',
		'karma'
	]);

	grunt.registerTask('build', [
		'clean',
		'ngtemplates',
		'concat',
		'ngAnnotate',
		'copy',
		'cssmin',
		'uglify'
	]);

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);
}
;
