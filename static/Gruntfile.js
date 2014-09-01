'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    // Configure plugins.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        options: {
            public: 'public/',
            jsx_dir: 'assets/js/templates/',
            app_js: ['assets/js/*.js'],
            vendor_js: [
                'assets/vendor/jquery/dist/jquery.js',
                'assets/vendor/jquery-ui/ui/datepicker.js',
                'assets/vendor/jquery-ui/ui/i18n/datepicker-ru.js',
                'assets/vendor/jquery-cookie/jquery.cookie.js',
                'assets/vendor/underscore/underscore.js',
                'assets/vendor/backbone/backbone.js',
                'assets/vendor/react/react.min.js',
                'assets/vendor/backbone-react-component/lib/component.js',
            ],
        },

        react: {
            jsx: {
                files: [{
                    expand: true,
                    cwd: '<%= options.jsx_dir %>',
                    src: ['**/*.jsx'],
                    dest: '<%= options.public %>js/templates/',
                    ext: ".js",
                }]
            },
            options: {
                ignoreMTime: true,
            }
        },

        jshint: {
            options: {
                "bitwise": true,
                "browser": true,
                "curly": true,
                "eqeqeq": true,
                "eqnull": true,
                "esnext": true,
                "immed": true,
                "jquery": true,
                "latedef": true,
                "newcap": true,
                "noarg": true,
                "node": true,
                "strict": false,
                "trailing": true
            },
            all: ['Gruntfile.js', 'assets/js/*.js']
        },

        concat: {
            options: {
                separator: ';\n',
                stripBanners: {
                    options: {
                        line: true,
                        block: true,
                    }
                }
            },

            app: {
                src: '<%= options.app_js %>',
                dest: '<%= options.public %>js/app.js'
            },
            vendor: {
                src: '<%= options.vendor_js %>',
                dest: '<%= options.public %>js/vendor.js'
            },
            templates: {
                src: ['public/js/templates/*.js'],
                dest: '<%= options.public %>js/templates.js'
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },

            app: {
                src: '<%= concat.app.dest %>',
                dest: '<%= options.public %>js/app.min.js'
            },
            vendor: {
                src: '<%= concat.vendor.dest %>',
                dest: '<%= options.public %>js/vendor.min.js'
            },
            templates: {
                src: '<%= concat.templates.dest %>',
                dest: '<%= options.public %>js/templates.min.js'
            }
        },

        less: {
            build: {
                files: {
                    '<%= options.public %>css/main.min.css': 'assets/less/main.less'
                },
                options: {
                    compress: true
                }
            }
        },
        watch: {
            options: {livereload: true},
            less: {
                files: [
                    'assets/less/*.less',
                ],
                tasks: ['less:build'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['assets/js/*.js', 'Gruntfile.js'],
                tasks: ['jshint', 'concat'],
                options: {
                    livereload: true
                }
            },
            react: {
                files: ['assets/js/templates/*.jsx'],
                tasks: ['react', 'concat'],
                options: {
                    livereload: true
                }
            }
        },
        livereload: {
            options: {
                livereload: true
            },
            files: [
                '**/*.html',
                '*.html',
                '**/*.py'
            ]
        }
    });

    // Register tasks here.
    grunt.registerTask('default', ["watch"]);
    grunt.registerTask('build', ['less', 'jshint', 'concat', 'uglify']);
};
