module.exports = {
    "models":{
        "account":{
            "name":"account",
            "tpl_override":{
                "schema":"lib/model/account.default.js"
            },
            "default":true,
            "fields":{
                "email":"email",
                "name":"string",
                "namespace":"namespace"
            }
        },
        "application":{
            "name":"application",
            "uri_prefix":"/apps",
            "default":true,
            "fields":{
                "namespace":"namespace",
                "name":"string",
                "desc":"md",
                "url":"string",
                "secret":"string",
                "level":"level",
                "owner":{
                    "type":"ref",
                    "ref":"account"
                }
            }
        },
        "accessToken":{
            "uri_prefix":"/access_tokens",
            "name":"accessToken",
            "default":true,
            "fields":{
                "perms":"array",
                "token":"string",
                "application":{
                    "type":"ref",
                    "ref":"application"
                },
                "account":{
                    "type":"ref",
                    "ref":"account"
                }
            }
        },
        "requestCode":{
            "uri_prefix":"/request_codes",
            "name":"requestCode",
            "default":true,
            "fields":{
                "code":"string",
                "application":{
                    "type":"ref",
                    "ref":"application"
                }
            }
        }
    },
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
            "aws-sdk":"*",
            "socket.io":"*",
            "mkdirp":"*",
            "njax": "git+ssh://git@github.com:schematical/njax.git#master",
            "njax-bootstrap": "git+ssh://git@github.com:schematical/njax-bootstrap.git#master"
        }
    },
    cordova:{

    }
}