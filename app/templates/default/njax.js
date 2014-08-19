module.exports = {
    bower:{
        "name": "nde",
        "version": "1.0.0",
        "main": "path/to/main.css",
        "ignore": [
            ".jshintrc",
            "**/*.txt"
        ],
        "dependencies": {
            "jquery":"*",
            "angular": "*",
            "ace":"*",
            "underscore":"*",
            "async":"*"

        }
    },
    package:{
        "name": "?",
        "version": "0.0.1",
        "private": true,
        "scripts": {
            "start": "node app.js"
        },
        dependencies:{
            "async" : "*",
            "underscore" : "*",
            "mongoose":"*",
            "errorhandler":"*",
            "markdown":"*",
            "connect-multiparty":"*",
            "aws-lib":"*",
            "socket.io":"*",
            "njax": "git+ssh://git@github.com:schematical/njax.git#master",
            "njax-bootstrap": "git+ssh://git@github.com:schematical/njax-bootstrap.git#master"
        }
    },
    cordova:{

    }
}