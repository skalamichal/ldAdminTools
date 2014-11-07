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
	var libConfig = {
		app: require('./bower.json').appPath || 'app',
		tmp: '.tmp',
		dist: 'dist',
		examples: 'examples',
		name: 'ldAdminTools'
	};

	function getHeader() {
		var fn = '; (function(angular){\n';
		fn += '\'use strict\';\n';
		fn += 'angular.module(\'' + libConfig.name + '\', [\'ui.bootstrap\', \'RecursionHelper\', \'LocalStorageModule\']); \n';

		return fn;
	}

	function getFooter() {
		return '})(angular);';
	}

	// Define the configuration for all the tasks
	grunt.initConfig({

			// Project settings
			library: libConfig,

			// Watches files for changes and runs tasks based on the changed files
			watch: {
				js: {
					files: ['<%= library.app %>/scripts/{,*/}*.js'],
					tasks: ['newer:jshint:all', 'concat:serve', 'ngAnnotate:serve'],
					options: {
						livereload: '<%= connect.options.livereload %>'
					}
				},
				styles: {
					files: ['<%= library.app%>/styles/**/*.less'],
					tasks: ['less:serve'],
					options: {
						nospawn: true,
						livereload: '<%= connect.options.livereload %>'
					}
				},
				html: {
					files: ['<%= library.app %>/partials/{,*/}*.html', '<%= library.examples %>/*.html'],
					tasks: ['ngtemplates', 'concat:serve', 'ngAnnotate:serve'],
					options: {
						livereload: '<%= connect.options.livereload %>'
					}
				}
			},

			// The actual grunt server settings
			connect: {
				options: {
					port: 9010,
					// Change this to '0.0.0.0' to access the server from outside.
					hostname: 'localhost',
					livereload: 35739
				}
				,
				serve: {
					options: {
						open: true,
						middleware: function (connect) {
							return [
								connect.static('examples'),
								connect().use(
									'/bower_components',
									connect.static('./bower_components')
								)
							];
						}
					}
				}
				,
				test: {
					options: {
						middleware: function (connect) {
							return [
								connect.static('.')
							];
						}
					}
				}
			}
			,

			// Make sure code styles are up to par and there are no obvious mistakes
			jshint: {
				options: {
					jshintrc: '.jshintrc',
					reporter: require('jshint-stylish')
				}
				,
				all: {
					src: [
						'<%= library.app %>/scripts/{,*/}*.js'
					]
				}
				,
				test: {
					options: {
						jshintrc: 'test/.jshintrc'
					}
					,
					src: ['test/spec/{,*/}*.js']
				}
			}
			,

			// Empties folders to start fresh
			clean: {
				dist: {
					files: [
						{
							dot: true,
							src: [
								'<%= library.tmp %>',
								'<%= library.dist %>/{,*/}*',
								'!<%= library.dist %>/.git*'
							]
						}
					]
				}
			}
			,

			concat: {
				js: {
					src: [
						'<%= library.app %>/scripts/**/*.js',
						'<%= library.tmp %>/scripts/**/*.js'
					],
					options: {
						banner: getHeader(),
						footer: getFooter()
					}
					,
					dest: '<%= library.dist %>/<%= library.name %>.js'
				}
				,
				serve: {
					src: [
						'<%= library.app %>/scripts/**/*.js',
						'<%= library.tmp %>/scripts/**/*.js'
					],
					options: {
						banner: getHeader(),
						footer: getFooter()
					}
					,
					dest: '<%= library.examples %>/<%= library.name %>.js'
				}
			}
			,

			ngAnnotate: {
				dist: {
					options: {
						singleQuotes: true
					}
					,
					files: [
						{
							expand: true,
							cwd: '<%= library.dist %>',
							src: '*.js',
							dest: '<%= library.dist %>'
						}
					]
				}
				,
				serve: {
					options: {
						singleQuotes: true
					}
					,
					files: [
						{
							expand: true,
							cwd: '<%= library.examples %>',
							src: '*.js',
							dest: '<%= library.examples %>'
						}
					]
				}
			}
			,

			ngtemplates: {
				'ldAdminTools': {
					cwd: "<%= library.app %>",
					src: "partials/**/*.html",
					dest: "<%= library.tmp %>/scripts/partials.js"
				}
				,
				options: {
					module: '<%= library.name %>',
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
			}
			,

			// Copies remaining files to places other tasks can use
			copy: {
				dist: {
					expand: true,
					cwd: '<%= library.app %>/styles',
					dest: '<%= library.dist %>',
					src: '{,*/}*.css'
				}
				,
				serve: {
					expand: true,
					cwd: '<%= library.app %>/styles',
					dest: '<%= library.examples %>',
					src: '{,*/}*.css'
				}
			}
			,

			cssmin: {
				css: {
					files: {
						'<%= library.dist %>/ldAdminTools.min.css': '<%= library.dist %>/<%= library.name %>.css'
					}
				}
			}
			,

			uglify: {
				js: {
					src: '<%= library.dist %>/<%= library.name %>.js',
					dest: '<%= library.dist %>/<%= library.name %>.min.js',
					options: {
						sourceMap: function (fileName) {
							return fileName.replace(/\.min\.js$/, '.map');
						}
					}
				}
			}
			,

			// Test settings
			karma: {
				unit: {
					configFile: 'test/karma.conf.js',
					singleRun: true
				}
			}
			,

			less: {
				build: {
					options: {
						paths: 'bower_components/bootstrap/less/**/*',
						cleancss: true,
						sourceMap: true,
						sourceMapFilename: '<%= library.dist %>/ldAdminTools.css.map',
						sourceMapBasepath: '<%= library.dist %>/styles/'
					},
					files: {
						'<%= library.dist %>/ldAdminTools.css': '<%= library.app %>/styles/ldAdminTools.less'
					}
				},
				serve: {
					options: {
						paths: ['bower_components/bootstrap/less/', 'bower_components/bootstrap/less/mixins/'],
						//cleancss: true,
						sourceMap: true,
						sourceMapFilename: '<%= library.dist %>/ldAdminTools.css.map',
						sourceMapBasepath: '<%= library.dist %>/styles/'
					},
					files: {
						'<%= library.examples %>/ldAdminTools.css': '<%= library.app %>/styles/ldAdminTools.less'
					}
				}
			}
		}
	)
	;

	grunt.registerTask('serve', 'Watch changes', function (target) {
		grunt.task.run([
			'ngtemplates',
			'concat:serve',
			'ngAnnotate:serve',
			'less:serve',
			'connect:serve',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'connect:test',
		'karma'
	]);

	grunt.registerTask('build', [
		'clean',
		'ngtemplates',
		'concat:js',
		'ngAnnotate:dist',
		'less:build',
		'uglify'
	]);

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);
}
;
