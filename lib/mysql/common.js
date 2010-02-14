exports.scope = function(target, func) {
    return function(){ func.apply(target, arguments); }
}