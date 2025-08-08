# Example Cider MCP Session

This document shows an example session using the Cider MCP server with Claude Code.

## 1. Start Your Clojure REPL

First, start a Clojure REPL in your project directory:

```bash
# Using Clojure CLI (recommended)
clj -M:nrepl

# Or with inline dependencies
clj -Sdeps '{:deps {nrepl/nrepl {:mvn/version "1.0.0"} cider/cider-nrepl {:mvn/version "0.42.1"}}}' -M -e "(require '[nrepl.server :as server] '[cider.nrepl :as cider]) (server/start-server :port 7888 :handler (server/default-handler #'cider/cider-middleware))"

# Using Leiningen (if available)
lein repl :headless :host localhost :port 7888

# Or from your editor (CIDER, Calva, etc.)
```

## 2. Connect to the REPL

Ask Claude to connect to your REPL:

**You:** "Connect to the Clojure REPL at localhost:7888"

**Claude uses:** `cider_connect` with `host="localhost"` and `port=7888`

**Response:**
```
Successfully connected to Cider REPL at localhost:7888
Current namespace: user
Active sessions: 1
```

## 3. Evaluate Simple Expressions

**You:** "Evaluate (+ 1 2 3)"

**Claude uses:** `cider_eval` with `code="(+ 1 2 3)"`

**Response:**
```
Result: 6
Namespace: user
```

## 4. Define Functions

**You:** "Define a function that calculates the factorial of a number"

**Claude uses:** `cider_eval` with:
```clojure
code="(defn factorial [n]
        (if (<= n 1)
          1
          (* n (factorial (dec n)))))"
```

**Response:**
```
Result: #'user/factorial
Namespace: user
```

## 5. Test the Function

**You:** "Calculate the factorial of 5"

**Claude uses:** `cider_eval` with `code="(factorial 5)"`

**Response:**
```
Result: 120
Namespace: user
```

## 6. Load a File

**You:** "Load the core.clj file from my src directory"

**Claude uses:** `cider_load_file` with `path="src/core.clj"`

**Response:**
```
Successfully loaded file: src/core.clj
Result: nil
```

## 7. Explore Namespaces

**You:** "What namespaces are available?"

**Claude uses:** `cider_list_namespaces`

**Response:**
```
Available namespaces:
  - user
  - clojure.core
  - clojure.string
  - clojure.set
  - my-project.core
  - my-project.utils
```

**You:** "Tell me about the my-project.core namespace"

**Claude uses:** `cider_get_namespace_info` with `namespace="my-project.core"`

**Response:**
```
Namespace: my-project.core
Variables: 8
  main, process-data, validate-input, format-output, helper-fn, config, default-options, version
Aliases: 0
Imports: 0
```

## 8. Inspect Variables

**You:** "Get information about the process-data function"

**Claude uses:** `cider_get_var_info` with `var_name="process-data"` and `namespace="my-project.core"`

**Response:**
```
Variable: process-data
Namespace: my-project.core
Type: var
Documentation: No documentation available
Arguments: N/A
File: Unknown
Line: Unknown
```

## 9. Switch Namespaces

**You:** "Switch to the my-project.core namespace"

**Claude uses:** `cider_switch_namespace` with `namespace="my-project.core"`

**Response:**
```
Switched to namespace: my-project.core
```

## 10. Work with Data Structures

**You:** "Create a vector of numbers and transform it"

**Claude uses:** `cider_eval` with:
```clojure
code="(let [numbers [1 2 3 4 5]
            doubled (map #(* 2 %) numbers)
            filtered (filter even? doubled)]
        {:original numbers
         :doubled (vec doubled)
         :even-doubled (vec filtered)})"
```

**Response:**
```
Result: {:original [1 2 3 4 5], :doubled [2 4 6 8 10], :even-doubled [2 4 6 8 10]}
Namespace: my-project.core
```

## 11. Handle Errors

**You:** "Evaluate some invalid code"

**Claude uses:** `cider_eval` with `code="(invalid-function 123)"`

**Response:**
```
Error: java.lang.Exception: Unable to resolve symbol: invalid-function in this context
```

## 12. Get REPL Information

**You:** "What's the current state of the REPL?"

**Claude uses:** `cider_get_info`

**Response:**
```
REPL Info:
Host: localhost:7888
Connected: true
Current namespace: my-project.core
Active sessions: 1
```

## 13. Interrupt Long-Running Operations

If you have a long-running or infinite operation:

**You:** "Stop the current evaluation"

**Claude uses:** `cider_interrupt`

**Response:**
```
Interrupted current evaluation
```

## 14. Disconnect

**You:** "Disconnect from the REPL"

**Claude uses:** `cider_disconnect`

**Response:**
```
Disconnected from Cider REPL
```

## Tips for AI Agents

1. **Always connect first** - Use `cider_connect` before any other operations
2. **Handle errors gracefully** - REPL evaluations can fail, always check responses
3. **Provide context** - Use namespace, file, and line information when available
4. **Explore incrementally** - Use namespace and variable inspection to understand codebases
5. **Use appropriate scope** - Switch namespaces when working with different parts of the codebase
6. **Clean up** - Disconnect when done to free resources

## Common Use Cases

- **Interactive Development**: Evaluate code as you write it
- **Debugging**: Inspect variables and test fixes
- **Exploration**: Understand existing codebases by exploring namespaces
- **Testing**: Quick validation of functions and algorithms
- **Refactoring**: Test changes before committing to files