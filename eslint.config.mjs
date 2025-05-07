import globals from "globals";
import pluginJs from "@eslint/js";

export default [{
        languageOptions: {
            globals: globals.node
        }
    },
    pluginJs.configs.recommended,
    {
        "rules": {
            "quotes": [
                "error",
                "double"
            ],
            "semi": [
                "error",
                "always"
            ],
            "no-unused-vars": "off",
            "no-useless-escape": "off",
            "no-constant-condition": "off",
            "no-var": "error",
            "no-implicit-globals": "error",
            "no-use-before-define": [
                "error",
                {
                    "functions": false
                }
            ],
            "no-duplicate-imports": "error",
            "no-invalid-this": "error",
            "no-shadow": "error",
            "import/no-absolute-path": "error",
            "import/no-self-import": "error",
            "import/extensions": [
                "error",
                "ignorePackages",
                {
                    "js": "always",
                    "ts": "never"
                }
            ],
            "import/no-unresolved": "off"
        }

    }
];