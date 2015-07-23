'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        concat: {
            js: {
                options: {
                    banner:
                    'angular.module(\'ng-swagger\', [\'ng-swagger.directives\',' +
                    '\'ng-swagger.controllers\',' +
                    '\'ng-swagger.services\',' +
                    '\'ng-swagger.filters\',' +
                    '\'ng-swagger.templates\']);\n'
                },
                src: ['./src/scripts/*.js'],
                dest: './dist/angular-swagger.js'
            },
            css: {
                src: ['./src/styles/*.css'],
                dest: './dist/angular-swagger.css'
            }
        },
        htmlangular: {
            options: {
                customtags: [
                    'api-docs',
                    'api-path',
                    'api-param',
                    'api-model'
                ],

            },
            files: {
                src: ['src/views/templates/*.html'],
            }
        },
        html2js: {
            app: {
                options: {
                    base: './src/views/templates/',
                    useStrict: true,
                    quoteChar: '\'',
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
                },
                src: ['./src/views/{,*/}*.html'],
                dest: './src/scripts/templates.js',
                module: 'ng-swagger.templates'
            }
        },
        uglify: {
            js: {
                src: ['./dist/angular-swagger.js'],
                dest: './dist/angular-swagger.min.js'
            }
        },
        cssmin: {
            target: {
                files: {
                    './dist/angular-swagger.min.css': ['./dist/angular-swagger.css']
                }
            }
        },
        watch: {
            files: [
                './src/views/{,*/}*.html',
                './src/scripts/*.js',
                './src/styles/*.css'
            ],
            tasks: 'quick'
        }
    });

    grunt.registerTask('default', [
        'htmlangular',
        'html2js',
        'concat',
        'uglify',
        'cssmin'
    ]);

    grunt.registerTask('quick', [
        'html2js',
        'concat',
        'uglify',
        'cssmin'
    ]) ;

};