/*
 * jQuery ProgressiveProfiler Plugin
 * Author: Ryan Schwartz
 * Version: 1.0.5 (21-MAY-2015)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 */

(function($){
	
	// Set methods
	var methods = {
		
		// Initialize
		init : function(options){
			return this.each(function() {
				
				// Set defaults
				var settings = {
					'debug'			: 'false', // [true/false] Enable debugging
					'groupReferenceIndicator' : '', // [string] The #id or .class of the base group reference indicator.  e.g. .progressive_profiler_ (so each group in the HTML has a class of progressive_profiler_0, progressive_profiler_1, etc.)
					'elementFieldGroups'	: '', // Nested array of element groups with group id and element ids. e.g. [['company','title'], ['gender','hobbies'], ['subscription_status']]
					'cookieLifetime': '60' // [integer] number of days of cookie lifetime
				};

				// Check for options
				if(options){ 
					$.extend(settings,options);
				}
				
				// Save settings
				$(this).data('PPSettings', settings);

				// Bind form elements for process
				$(this).bind('submit', function() {
					$(this).ProgressiveProfiler('process');
				});
				
				
				// Alert if debugging
				if(settings.debug == "true"){
					alert('elementFieldGroups =>' + settings.elementFieldGroups.toSource());
				}
				
				// Update form
				$(this).ProgressiveProfiler('load');
				
				// Return this for chainability
				return this;			
			});
		},
		
		// Process form
		process : function(){
		
			return this.each(function(){				
				
				// Get settings
				var settings = $(this).data('PPSettings');

				// Set cookie expiration
				var lifetime = settings.cookieLifetime;
				var today = new Date();
				var exp   = new Date(today.getTime()+lifetime*24*60*60*1000);
				
				// Alert if debugging
				if(settings.debug == "true"){
					alert("Cookie expiration: " + exp);
				}
				
				var shown_group = $(this).data('pp_shown_group');

				// Check if shown group is false
				if(shown_group === false){
					return this;
				}				
					
				// Loop through form elements for group
				for(var i = 0; i < settings.elementFieldGroups[shown_group].length; i++){
					
					// Get element
					var e = $('#'+settings.elementFieldGroups[shown_group][i]).get(0);
					
					// Always skip buttons, hiddens, and submits
					if(e.type == "button" || e.type == "submit" || e.type == "hidden"){
						continue;
					}
					
					// Determine value
					if(e.type == "text" || e.type == "select-one" || e.type == "textarea" || e.type == "password" || e.type == "select-multiple"){
						var setVal = $(e).val();
					}else if(e.type == "checkbox" || e.type == "radio"){
						var setVal = e.checked;
					}
					
					// Skip if value is blank
					if(setVal == ""){
						continue;
					}
					
					// Alert if debugging
					if(settings.debug == "true"){
						alert("Saving value: " + "(" + e.type + ") " + e.id + ": " + setVal);
					}
					
					// Save the cookie of current form value
					SFSetCookie("ProgressiveProfiler_" + e.id, this.id + "||" + e.type + "||" + e.id + "||" + setVal, exp); 
				}
				
				// Return this for chainability
				return this;
				
				// Set cookie
				function SFSetCookie(name, value, expires) {
					document.cookie = name + "=" + escape(value) + "; path=/" + ((expires == null) ? "" : "; expires=" + expires.toGMTString());
				}
			});
		},
		
		// Load form
		load : function(){
		
			return this.each(function() {
				
				// Get settings
				var settings = $(this).data('PPSettings');
				
				// Group tracking
				current_group = 0;
				shown_group = false;
				
				// Loop through element groups
				for(var g = 0; g < settings.elementFieldGroups.length;g++){
				
					// Update current group
					current_group = g;
					
					// Loop through form elements and load cookies (if found)
					for(var i = 0; i < settings.elementFieldGroups[g].length; i++){
						
						// Hide all progressive fields
						if(shown_group === false || (shown_group !== false && shown_group !== current_group)){
							$(settings.groupReferenceIndicator + g).hide();
						}
					
						// Skip if shown group is different from current group
						if(shown_group !== false && shown_group !== current_group){
							continue;
						}
						
						// Get element
						var e = $('#'+settings.elementFieldGroups[g][i]);
					
						// Get cookie
						var c = PPGetCookie("ProgressiveProfiler_" + settings.elementFieldGroups[g][i]);
						if(c != null){
							var split = c.split("||");
							var form = split[0];
							var elementID = split[1];
							var val = split[2];
							
							// Check if all elements in the group are populated
							if(val == "" && shown_group == g){
								shown_group = g;
								$(settings.groupReferenceIndicator + g).show();
							}
						}else if(shown_group === false || shown_group == g){
							shown_group = g;
							$(settings.groupReferenceIndicator + g).show();
						}
					}
				}
				
				// Assign variable to 
				$(this).data('pp_shown_group',shown_group);
				
				
				// Return this for chainability
				return this;
				
				// Get the cookie
				function PPGetCookie(name){
					var cname = name + "=";               
					var dc = document.cookie;             
					    if (dc.length > 0) {              
					    begin = dc.indexOf(cname);       
					        if (begin != -1) {           
					        begin += cname.length;       
					        end = dc.indexOf(";", begin);
					            if (end == -1) end = dc.length;
					            return unescape(dc.substring(begin, end));
					        } 
					    }
					return null;
				}
				
			});
		}
	};
	
	// Declare plugin
	$.fn.ProgressiveProfiler = function(method){  
		
		if (methods[method]) {
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method === 'object' || ! method) {
			return methods.init.apply(this,arguments);
		}else{
			$.error('Method ' + method + ' does not exist on jQuery.ProgressiveProfiler');
		}

	};
})(jQuery);

