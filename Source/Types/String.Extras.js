/*
---

script: String.Extras.js

name: String.Extras

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Christopher Pitt

requires:
  - Core/String
  - Core/Array
  - MooTools.More

provides: [String.Extras]

...
*/

(function(){

var special = {
	'a': /[àáâãäåăą]/g,
	'A': /[ÀÁÂÃÄÅĂĄ]/g,
	'c': /[ćčç]/g,
	'C': /[ĆČÇ]/g,
	'd': /[ďđ]/g,
	'D': /[ĎÐ]/g,
	'e': /[èéêëěę]/g,
	'E': /[ÈÉÊËĚĘ]/g,
	'g': /[ğ]/g,
	'G': /[Ğ]/g,
	'i': /[ìíîï]/g,
	'I': /[ÌÍÎÏ]/g,
	'l': /[ĺľł]/g,
	'L': /[ĹĽŁ]/g,
	'n': /[ñňń]/g,
	'N': /[ÑŇŃ]/g,
	'o': /[òóôõöøő]/g,
	'O': /[ÒÓÔÕÖØ]/g,
	'r': /[řŕ]/g,
	'R': /[ŘŔ]/g,
	's': /[ššş]/g,
	'S': /[ŠŞŚ]/g,
	't': /[ťţ]/g,
	'T': /[ŤŢ]/g,
	'u': /[ùúûůüµ]/g,
	'U': /[ÙÚÛŮÜ]/g,
	'y': /[ÿý]/g,
	'Y': /[ŸÝ]/g,
	'z': /[žźż]/g,
	'Z': /[ŽŹŻ]/g,
	'th': /[þ]/g,
	'TH': /[Þ]/g,
	'dh': /[ð]/g,
	'DH': /[Ð]/g,
	'ss': /[ß]/g,
	'oe': /[œ]/g,
	'OE': /[Œ]/g,
	'ae': /[æ]/g,
	'AE': /[Æ]/g
},

tidy = {
	' ': /[\xa0\u2002\u2003\u2009]/g,
	'*': /[\xb7]/g,
	'\'': /[\u2018\u2019]/g,
	'"': /[\u201c\u201d]/g,
	'...': /[\u2026]/g,
	'-': /[\u2013]/g,
//	'--': /[\u2014]/g,
	'&raquo;': /[\uFFFD]/g
},

conversions = {
	ms: 1,
	s: 1000,
	m: 6e4,
	h: 36e5
},

findUnits = /(\d*.?\d+)([msh]+)/;

var walk = function(string, replacements){
	var result = string, key;
	for (key in replacements) result = result.replace(replacements[key], key);
	return result;
};

var isSelfClosingTag = function (tag) {
    var selfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    return~selfClosingTags.indexOf(tag) ? true : false;
};
var cleanTag = new RegExp('([<>\/])', 'g');
var getRegexForTag = function (tag, contents) {

    tag = tag || '';
    var regstr = {}, reg = [], isSCT = isSelfClosingTag(tag);

    if (!tag || isSCT) regstr.isSelfClosingTag = tag ? "(<\\s?" + tag + "[^>]*>)" : "(<(?!\\s)[\\/a-z]*[^>]+>)";
    if (tag && !isSCT) regstr.closingTag = contents ? "(<" + tag + ".*\/" + tag + ">)" : "<\/?" + tag + "([^>]+)?>";
    if (!tag) regstr.closingTag = "(<[^\\/]*\\/[a-z]{1,}>)";

    if (regstr.closingTag) reg.push(new RegExp(regstr.closingTag, "gi"));
    if (regstr.isSelfClosingTag) reg.push(new RegExp(regstr.isSelfClosingTag, "gi"));

    return reg;
};

String.implement({

	standardize: function(){
		return walk(this, special);
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, direction){
		if (this.length >= length) return this;

		var pad = (str == null ? ' ' : '' + str)
			.repeat(length - this.length)
			.substr(0, length - this.length);

		if (!direction || direction == 'right') return this + pad;
		if (direction == 'left') return pad + this;

		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	getTags: function(tag, contents){
		return this.match(getRegexForTag(tag, contents)) || [];
	},

    stripTags: function (tag, contents) {
		// TODO getTags and stripTags do the same when contents is true. Maybe remove the contents from stripTags and use it only in getTags. Also change the docs.
        var string = String.from(this);
        var regex = getRegexForTag(tag, contents);

        if (!contents) return string.replace((regex[1] || regex[0]), '');

        var matches = [];
        if (regex.length > 1) {

            // first pass for self-closing tags
            var firstMatches = string.match(regex[1]);
            if (firstMatches) {

                firstMatches = firstMatches.filter(function (m) {
                    var cleanMatch = m.replace(cleanTag, '');
                    cleanMatch = cleanMatch.split(' ').filter(function(m){ return m != ''});
                    return isSelfClosingTag(cleanMatch[0]);
                });

                if (firstMatches.length) matches.push(firstMatches);
                var tempString = string;
                firstMatches.each(function (m) {
                    tempString = tempString.replace(m, '');
                });

                // second pass for normal tags and content inside them
                matches.push(tempString.match(regex[0]));
            }
        } else {
            matches.push(string.match(regex[0]));
        }
        return matches.flatten();
    },

	tidy: function(){
		return walk(this, tidy);
	},

	truncate: function(max, trail, atChar){
		var string = this;
		if (trail == null && arguments.length == 1) trail = '…';
		if (string.length > max){
			string = string.substring(0, max);
			if (atChar){
				var index = string.lastIndexOf(atChar);
				if (index != -1) string = string.substr(0, index);
			}
			if (trail) string += trail;
		}
		return string;
	},

	ms: function(){
	  // "Borrowed" from https://gist.github.com/1503944
		var units = findUnits.exec(this);
		if (units == null) return Number(this);
		return Number(units[1]) * conversions[units[2]];
	}

});

})();
