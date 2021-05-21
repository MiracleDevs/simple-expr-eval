/*
 * Simple expression parser and evaluator
 * https://github.com/MiracleDevs/simple-expr-eval
 * 
 * Copyright (c) 2018 Miracle Devs
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 */

(function (global) {
    var TokenType = {
        Unknown: 'Unknown',
        Integer: 'Integer',
        String: 'String',
        Bool: 'Bool',
        Null: 'Null',
        Variable: 'Variable',
        Equals: 'Equals',
        NotEquals: 'NotEquals',
        Lt: 'Lt',
        Lte: 'Lte',
        Gt: 'Gt',
        Gte: 'Gte',
        And: 'And',
        Or: 'Or',
        Group: 'Group'
    };

    function Token(value, type)
    {
        if (!TokenType[type])
            throw new Error("Token " + type + " is not defined");

        this.value = value;

        this.type = type;
    }

    function tokenize(expr)
    {
        var t = [];
        for (var i = 0; i < expr.length; i++)
        {
            if (expr[i].trim() == '')
                continue;

            var tokentype = TokenType.Unknown; 
            var tokenval = "";

            if (expr[i] == "(")
            {
                // -- Take index of both matched parentheses
                var openIndex = i;
                // -- Count of inner parenthesis
                var innerParenthesisCount = 0;
                // -- Start with next character after open parenthesis
                var pIndex = openIndex + 1;
                // -- Index of close pharenthesis;
                var closeIndex
                while (pIndex < expr.length) {
                    var currentChar = expr[pIndex];
                    // -- If we found an open parethesis
                    if (currentChar == "(") {
                        // -- Increase
                        innerParenthesisCount++;
                    }
                    else if (currentChar == ")") {
                        // -- If the count is 0, group's closed parenthesis found
                        if (innerParenthesisCount == 0) {
                            closeIndex = pIndex;
                            break;
                        }
                        else {
                            // -- Decrease
                            innerParenthesisCount--;
                        }
                    }
                    pIndex++;
                }


                //var closeIndex = expr.lastIndexOf(")");
                // -- tokenval is the set of inner expressions
                tokenval = tokenize(expr.substring(openIndex + 1, closeIndex));
                // -- Group type
                tokentype = TokenType.Group;
                // -- Move i to after close parentheses
                i = closeIndex;
            }
            else if (/^\d+$/.test(expr[i]))
            {
                tokentype = TokenType.Integer;
                tokenval += expr[i];
                while (i + 1 < expr.length && /^\d+$/.test(expr[i+1]))
                {
                    tokenval += expr[++i];
                }
            }
            else if (expr[i] === "'" || expr[i] === '"')
            {
                var quotetype = expr[i];
                tokentype = TokenType.String;
                while (i + 1 < expr.length && expr[i + 1] != quotetype)
                {
                    tokenval += expr[++i];
                }
                i++; // Last ' or "
            }
            else if (expr[i] == '$')
            {
                tokentype = TokenType.Variable;
                tokenval += "$";
                while (i + 1 < expr.length && /[a-zA-Z0-9_]/.test(expr[i + 1]))
                {
                    tokenval += expr[++i];
                }
            }
            else if (expr[i] == '!' && i + 1 < expr.length && expr[i + 1] == '=')
            {
                tokentype = TokenType.NotEquals;
                tokenval = "!=";
                i++;
            }
            else if (expr[i] == '=' && i + 1 < expr.length && expr[i + 1] == '=')
            {
                tokentype = TokenType.Equals;
                tokenval = "==";
                i++;
            }
            else if (expr[i] == '<')
            {
                if (i + 1 < expr.length && expr[i + 1] == '=')
                {
                    tokentype = TokenType.Lte;
                    tokenval = "<=";
                    i++;
                }
                else
                {
                    tokentype = TokenType.Lt;
                    tokenval = "<";
                }
            }
            else if (expr[i] == '>')
            {
                if (i + 1 < expr.length && expr[i + 1] == '=')
                {
                    tokentype = TokenType.Gte;
                    tokenval = ">=";
                    i++;
                }
                else
                {
                    tokentype = TokenType.Gt;
                    tokenval = ">";
                }
            }
            else if (expr[i] == '&' && i + 1 < expr.length && expr[i + 1] == '&')
            {
                tokentype = TokenType.And;
                tokenval = "&&";
                i++;
            }
            else if (expr[i] == '|' && i + 1 < expr.length && expr[i + 1] == '|')
            {
                tokentype = TokenType.Or;
                tokenval = "||";
                i++;
            }
            else
            {
                var str = expr[i];
                while (i + 1 < expr.length)
                {
                    str += expr[++i];

                    if (str == "true" || str == "false")
                    {
                        tokentype = TokenType.Bool;
                        tokenval = str;
                        break;
                    }
                    else if (str == "null")
                    {
                        tokentype = TokenType.Null;
                        tokenval = "null";
                        break;
                    }
                }
            }

            if (tokentype == TokenType.Unknown)
                throw new Error("Unknown token " + tokenval);

            t.push(new Token(tokenval, tokentype));
        }

        return t;
    }

    function BinaryExpression(operator, left, right) // : Expression
    {
        this.operator = operator;  /* Token */
        this.left = left;  /* Expression */
        this.right = right;  /* Expression */
    }

    function OrExpression(operator, left, right) /*BinaryExpression*/
    {
        BinaryExpression.call(this, operator, left, right);
    }

    OrExpression.prototype = Object.create(BinaryExpression.prototype);
    OrExpression.prototype.constructor = OrExpression;

    function AndExpression(operator, left, right) /*BinaryExpression*/
    {
        BinaryExpression.call(this, operator, left, right);
    }

    AndExpression.prototype = Object.create(BinaryExpression.prototype);
    AndExpression.prototype.constructor = AndExpression;

    function EqualityExpression(operator, left, right) /*BinaryExpression*/
    {
        BinaryExpression.call(this, operator, left, right);
    }

    EqualityExpression.prototype = Object.create(BinaryExpression.prototype);
    EqualityExpression.prototype.constructor = EqualityExpression;

    function ComparisonExpression(operator, left, right) /*BinaryExpression*/
    {
        BinaryExpression.call(this, operator, left, right);
    }

    ComparisonExpression.prototype = Object.create(BinaryExpression.prototype);
    ComparisonExpression.prototype.constructor = ComparisonExpression;

    function UnaryExpression(value) /*Expression*/
    {
        this.value = value; /*Token*/
    }

    function Variable(value) /*UnaryExpression*/
    {
        UnaryExpression.call(this, value);
    }

    Variable.prototype = Object.create(UnaryExpression.prototype);
    Variable.prototype.constructor = Variable;

    function Literal(value) /*UnaryExpression*/
    {
        UnaryExpression.call(this, value);
    }

    Literal.prototype = Object.create(UnaryExpression.prototype);
    Literal.prototype.constructor = Literal;

    function parse(tokens) {

        var index = 0;

        function process() {
            var expressions = [];

            var lastExpression = null;

            for (index = 0; index < tokens.length; index++) {
                // -- Takes current token
                var currentToken = tokens[index];
                
                if (currentToken.type == TokenType.Or) {
                    // -- Add last expression to the array
                    if (lastExpression != null) {
                        expressions.push(lastExpression);
                        lastExpression = null;
                    }
                    continue;
                }

                // -- Initialize current expression in null
                var currentExpression = null;

                // -- If group
                if (currentToken.type == TokenType.Group) {
                    currentExpression = parse(currentToken.value)
                }

                // -- If comparison
                if (currentToken.type == TokenType.Gt || currentToken.type == TokenType.Gte || currentToken.type == TokenType.Lt || currentToken.type == TokenType.Lte) {
                    // -- Current token is the operator
                    // -- Previuos and next token are the values/variable to compare
                    currentExpression = new ComparisonExpression(currentToken, primaryType(tokens[index - 1]), primaryType(tokens[index + 1]));
                }
                // -- If equality
                else if (currentToken.type == TokenType.Equals || currentToken.type == TokenType.NotEquals) {
                    // -- Current token is the operator
                    // -- Previuos and next token are the values/variable to compare
                    currentExpression = new EqualityExpression(currentToken, primaryType(tokens[index - 1]), primaryType(tokens[index + 1]));
                }
                
                if (currentExpression != null) {
                    // -- If last expression is not null we have to add an andexpression with last and current expression
                    lastExpression = lastExpression != null ? new AndExpression(new Token("&&", TokenType.And), lastExpression, currentExpression) : currentExpression;
                }
            }

            // -- Add last expression to the array
            if (lastExpression != null) {
                expressions.push(lastExpression);
                lastExpression = null;
            }

            var lastOrExpression = null;
            // -- Convert array of expression to a tree of ors
            for (var j = 0; j < expressions.length; j++) {
                lastOrExpression = lastOrExpression != null ? new OrExpression(new Token("||", TokenType.Or), lastOrExpression, expressions[j]) : expressions[j];
            }

            return lastOrExpression;
        }       


        function primaryType(token) {
            if (token.type == TokenType.Integer || token.type == TokenType.String || token.type == TokenType.Bool || token.type == TokenType.Null)
                return new Literal(token);

            if (token.type == TokenType.Variable)
                return new Variable(token);

            if (token.type == TokenType.Group) {
                return parseAux(token.tokens);
            }


            throw new Error("Unexpected token " + token.Value);
        }

        // -- Execute the function
        return process();
    }

    function run(root, symtable)
    {
        symtable = symtable || {};

        function evalBinary(node, symtable)
        {
            switch(node.operator.type)
            {
                case TokenType.Equals:
                    return run(node.left, symtable) === run(node.right, symtable);

                case TokenType.NotEquals:
                    return run(node.left, symtable) !== run(node.right, symtable);

                case TokenType.Lt:
                    return run(node.left, symtable) < run(node.right, symtable);

                case TokenType.Lte:
                    return run(node.left, symtable) <= run(node.right, symtable);

                case TokenType.Gt:
                    return run(node.left, symtable) > run(node.right, symtable);

                case TokenType.Gte:
                    return run(node.left, symtable) >= run(node.right, symtable);

                case TokenType.And:
                    var leftResult = run(node.left, symtable);
                    
                    // Short circuit
                    if (leftResult === false)
                        return false;

                    // Here left is true, it depends on the result of the right node
                    return run(node.right, symtable);

                case TokenType.Or:
                    var leftResult = run(node.left, symtable);

                    // Short circuit
                    if (leftResult === true)
                        return true;

                    // Here left is false, it depends on the result of the right node
                    return run(node.right, symtable);
            }

            throw new Error("Unhandled binary operand: " + node ? node.toString() : "(null)");
        }

        function evalUnary(node, symtable)
        {
            switch (node.value.type)
            {
                case TokenType.Integer:
                    return parseInt(node.value.value);

                case TokenType.String:
                    return node.value.value;

                case TokenType.Bool:
                    if (node.value.value === "true")
                        return true;
                    else if (node.value.value === "false")
                        return false;
                    else throw new Error("Invalid boolean value: " + node.value.value);

                case TokenType.Null:
                    return null;

                case TokenType.Variable:
                    var varval = symtable[node.value.value.substr(1)];
                    return varval === undefined ? null : varval;
            }

            throw new Error("Unhandled unary operand: " + node ? node.toString() : "(null)");
        }

        if (root instanceof BinaryExpression)
            return evalBinary(root, symtable);
        
        if (root instanceof UnaryExpression)
            return evalUnary(root, symtable);

        throw new Error("Unhandled operand: " + node ? node.toString() : "(null)");     
    }

    global["simpleExprEval"] = function (source, symtable) {
        var tokens = tokenize(source);
        var parsed = parse(tokens);
        return run(parsed, symtable);
    }
    
})(this);