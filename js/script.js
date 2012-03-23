/* ==========================================================================
   Copyright 2012 syssgx (http://github.com/syssgx)
 
   Code licensed under CC BY 3.0 licence
   http://creativecommons.org/licenses/by/3.0/
   ========================================================================== */
 
$(document).ready(function() {
	"use strict";

	(function () {
		if (window.validateXML) {
			$(".console1").val("xmllint loaded");
			$(".console2").val("xmllint loaded");			
		} else {
			$(".console1").val("xmllint not loaded");
			$(".console2").val("xmllint not loaded");
		}
		window.prettyPrint && prettyPrint();
	})();
	
	var xmlData = 0, schemaData = 0,
		xmlFileName, schemaFileName;
	
	function handleFile(e) {
		
		var fileObject = e.originalEvent.dataTransfer,
			files = fileObject.files,
		    outputdiv, filestring;
			
		outputdiv = "#" + $(this).attr("id");
		
		ignoreDrag(e);
		
		for (var i = 0; i<files.length; i++) {
			var f = files[i];
			var filereader = new FileReader();

			filestring = "<strong>" + escape(f.name) + 
							"</strong> (" + (f.type || "n/a") + "): " + f.size + " bytes - " + 
							"<strong>last modified:</strong> " + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a");
			filereader.readAsText(f);
			filereader.onload = (function(theFile) {
				return function(e) {
					if (outputdiv.substr(1,3) === "xml") {
						xmlData = e.target.result;
						xmlFileName = f.name;
					} else {
						schemaData = e.target.result;
						schemaFileName = f.name;
					}
				};
			})(f);
		}

		$(outputdiv).html(filestring).css("background", "#B9B9F4").css("border", "2px solid #2222D3");
	}
	
	function ignoreDrag(e) {
		e.originalEvent.stopPropagation();
		e.originalEvent.preventDefault();
	}
	
	$(".close").alert();
	$('#xml_file').bind('dragenter', ignoreDrag).bind('dragover', ignoreDrag).bind('drop', handleFile);
	$('#schema_file').bind('dragenter', ignoreDrag).bind('dragover', ignoreDrag).bind('drop', handleFile);
	
	$("#fileBtn").click(function() {
		if (!xmlData) { $(".valfiletext").text("Set XML file"); return; }
		if (!schemaData) { $(".valfiletext").text("Set Schema file"); return; }
		if (schemaFileName === xmlFileName) { 
			$(".valfileoutput").removeClass("valColor2").removeClass("valColor1");
			$(".valfiletext").text("Filenames match"); 
			return; 
		}
		$(".console1").val("");
		$(".valfiletext").text("Validating...");

		var Module = {
			xml: xmlData,
			schema: schemaData,
			arguments: ["--noout", "--schema", schemaFileName, xmlFileName]
		};
		var result = validateXML(Module);
		xmlInfo(result, ".valfileoutput", ".valfiletext", ".console1");
	});
	
	$("#textBtn").click(function() {
		if (editor1.getValue().length < 10) {
			$(".valoutput").removeClass("valColor1").removeClass("valColor2");
			$(".valtext").text("Enter XML Data"); 
			return;
		}
		if (editor2.getValue().length < 10) { 
			$(".valoutput").removeClass("valColor1").removeClass("valColor2");
			$(".valtext").text("Enter Schema Data"); 
			return;
		}
		$(".console2").val("");		
		$(".valtext").text("Validating...");
		
		var Module = {
			xml: editor1.getValue(),
			schema: editor2.getValue(),
			arguments: ["--noout", "--schema", "file.xsd", "file.xml"]
		};
		var result = validateXML(Module);
		xmlInfo(result, ".valoutput", ".valtext", ".console2");
	});
	
	function xmlInfo(result, output1, output2, consoleprint) {
		var cval = $(consoleprint).val();
		if (result.search("xml validates") > 0) {
			$(output1).removeClass("valColor2").addClass("valColor1");
			$(output2).text("Document validates against the schema!");
			$(consoleprint).val(cval + result);
		} else {
			$(output1).removeClass("valColor1").addClass("valColor2");
			$(output2).text("Document does not validate. Output recorded in console.");
			$(consoleprint).val(cval + result);
		}
	}
	
	var editor1 = CodeMirror.fromTextArea($("#xml_data")[0], {
	  mode: "application/xml",
	  lineNumbers: true,
	  lineWrapping: true,
	  theme: "night",
	  onCursorActivity: function() {
		editor1.setLineClass(hlLine1, null);
		hlLine1 = editor1.setLineClass(editor1.getCursor().line, "activeline");
		editor1.matchHighlight("CodeMirror-matchhighlight");
	  },
	  extraKeys: {
            "F11": function() {
			  var curPos = editor1.getCursor();
			  editor1.setCursor(0,0);
              var scroller = editor1.getScrollerElement();
              if (scroller.className.search(/\bCodeMirror-fullscreen\b/) === -1) {
                scroller.className += " CodeMirror-fullscreen";
                scroller.style.height = "100%";
                scroller.style.width = "100%";
                editor1.refresh();
				editor1.setCursor(curPos.line,curPos.ch);
              } else {
                scroller.className = scroller.className.replace(" CodeMirror-fullscreen", "");
                scroller.style.height = '';
                scroller.style.width = '';
                editor1.refresh();
				editor1.setCursor(curPos.line,curPos.ch);
              }
            },
            "Esc": function() {
			  var curPos = editor1.getCursor();
			  editor1.setCursor(0,0);
              var scroller = editor1.getScrollerElement();
              if (scroller.className.search(/\bCodeMirror-fullscreen\b/) !== -1) {
                scroller.className = scroller.className.replace(" CodeMirror-fullscreen", "");
                scroller.style.height = '';
                scroller.style.width = '';
                editor1.refresh();
				editor1.setCursor(curPos.line,curPos.ch);
              }
            }
        }
	});
	var hlLine1 = editor1.setLineClass(0, "activeline");
	editor1.setValue(" ");
	
	var editor2 = CodeMirror.fromTextArea($("#schema_data")[0], {
	  mode: "application/xml",
	  lineNumbers: true,
	  lineWrapping: true,
	  theme: "night",
	  onCursorActivity: function() {
		editor2.setLineClass(hlLine2, null);
		hlLine2 = editor2.setLineClass(editor2.getCursor().line, "activeline");
		editor2.matchHighlight("CodeMirror-matchhighlight");
	  },
	  extraKeys: {
            "F11": function() {
			  var curPos = editor2.getCursor();
			  editor2.setCursor(0,0);
              var scroller = editor2.getScrollerElement();
              if (scroller.className.search(/\bCodeMirror-fullscreen\b/) === -1) {
                scroller.className += " CodeMirror-fullscreen";
                scroller.style.height = "100%";
                scroller.style.width = "100%";
                editor2.refresh();
				editor2.setCursor(curPos.line,curPos.ch);
              } else {
                scroller.className = scroller.className.replace(" CodeMirror-fullscreen", "");
                scroller.style.height = '';
                scroller.style.width = '';
                editor2.refresh();
				editor2.setCursor(curPos.line,curPos.ch);
              }
            },
            "Esc": function() {
			  var curPos = editor2.getCursor();
			  editor2.setCursor(0,0);
              var scroller = editor2.getScrollerElement();
              if (scroller.className.search(/\bCodeMirror-fullscreen\b/) !== -1) {
                scroller.className = scroller.className.replace(" CodeMirror-fullscreen", "");
                scroller.style.height = '';
                scroller.style.width = '';
                editor2.refresh();
				editor2.setCursor(curPos.line,curPos.ch);
              }
            }
        }
	});
	var hlLine2 = editor2.setLineClass(0, "activeline");
	editor2.setValue(" ");
	
	var xmllintInfo = "xmllint using libxml version 20708\n  compiled with: Tree Output Push Reader Patterns Writer " +
					  "SAXv1 DTDValid HTML Legacy C14N Catalog XPath XPointer XInclude Iconv ISO8859X " + 
					  "Unicode Regexps Automata Expr Schemas Schematron Modules Debug Zlib \n";
	
	$(".xmllint-info1").click(function() {
		var cval = $(".console1").val();
		$(".console1").val(cval + "\n" + xmllintInfo);
	});

	$(".xmllint-info2").click(function() {
		var cval = $(".console2").val();
		$(".console2").val(cval + "\n" + xmllintInfo);
	});
	
	$(".tltp").tooltip({
		placement: "right",
		delay: { show: 100, hide: 120 },
		title: "F11 in editor toggles mode"
	});
	
	$(".t-right1").click(function() {
		if (!xmlData) { $(".valtext").text("Set XML file"); return; }
		editor1.setValue(xmlData);
	});
	
	$(".t-right2").click(function() {
		if (!schemaData) { $(".valtext").text("Set Schema file"); return; }
		editor2.setValue(schemaData);		
	});	

});