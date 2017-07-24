// ----------------------
// Setup
// ----------------------

// Load the Gif
var sup1 = new SuperGif({ gif: document.getElementById('exampleimg') } );
sup1.load();


var instructions = document.getElementById('instructions');

// ----------------------
// Text to speech GUI
// ----------------------

// Code for the voice select element
var voiceSelecter = document.getElementById('voiceSelecter');
function getVoices() {
	voiceSelecter.innerHTML = "";
	var voices = speechSynthesis.getVoices();
	// iOS returns voices it doesn't let you use.
	var bIsiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	var iOSVoiceSet = {};
	if( bIsiOS ){ 
		var array = ["Maged","Zuzana","Sara","Anna","Melina","Karen","Serena","Moira","Tessa","Samantha","Monica","Paulina","Satu","Amelie","Thomas","Carmit","Lekha","Mariska","Damayanti","Alice","Kyoko","Yuna","Ellen","Xander","Nora","Zosia","Luciana","Joana","Ioana","Milena","Laura","Alva","Kanya","Yelda","Ting-Ting","Sin-Ji","Mei-Jia"];
		array.forEach(function(val){
			iOSVoiceSet[val] = true;
		});
	}
	voices.forEach(function(voice, i) {
		// only some iOS voices are working, but they are all returned.
		if( !bIsiOS || voice.name in iOSVoiceSet ){
			var option = document.createElement('option');
			option.value = voice.name;
			option.innerHTML = voice.name;
			if( voice.lang.substring(0,2) == "en" ){
				voiceSelecter.insertBefore(option, voiceSelecter.firstChild);
			}	else {
				voiceSelecter.appendChild(option);
			}
		}
	});
}
getVoices();
// Update the voices when they change (chrome loads asynchronously)
window.speechSynthesis.onvoiceschanged = function(e) {
  getVoices();
};


// ----------------------
// Load new GIFs
// ----------------------
var gifurlinput = document.getElementById('gifurlinput')
function loadNewGif(){
		var gifURL = gifurlinput.value;
    	if (gifURL.toLowerCase().indexOf(".gif") == -1) {
    		document.getElementById('giferrormessage').innerHTML = "Specify a gif file.";
    		return;
    	}
        function doesFileExist(urlToFile, success) {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', urlToFile, true);
            xhr.onload = function(e) {
                if (xhr.status != "404") {
                    if (success) success(urlToFile);
                } else document.getElementById('giferrormessage').innerHTML = "That file was not found.";
            }
            xhr.onerror = function() {
                document.getElementById('giferrormessage').innerHTML  = "Error loading gif. Make sure the resource exists and has Access-Control-Allow-Origin headers.";
            };
            xhr.send();
        };

        function onFileExists() {
        	var imagecontainer = document.getElementById('imagecontainer')
        	imagecontainer.innerHTML = "";
            imgElement = document.createElement('img');
            imgElement.src = gifURL;
            imgElement.animatedSrc = gifURL;
            imgElement.setAttribute('rel:animated_src',gifURL);
            imgElement.setAttribute('rel:auto_play', 0);
            imagecontainer.appendChild(imgElement);
            instructions.innerHTML = "Please wait..."
            sup1 = new SuperGif({ gif: imgElement });
            sup1.load(function(){
            	instructions.innerHTML = "Click on the image below to hear the message."
            });
            document.getElementById('giferrormessage').innerHTML = "";
        }
        doesFileExist(gifURL, onFileExists)
}
gifurlinput.addEventListener('input', loadNewGif) 

var imgurgifs = ["http://i.imgur.com/nIYJ3hf.gif", // lily
    "http://i.imgur.com/GTlEMHn.gif", // dog2
    "http://i.imgur.com/S740Je4.gif", // brunette
    "http://i.imgur.com/LfxwrCM.gif", // trump
    "http://i.imgur.com/JhrwKQb.gif", // bear
    "http://i.imgur.com/sgE5CCo.gif", //guerilla
    "http://i.imgur.com/DWKjljE.gif", // washington     
    "http://i.imgur.com/kIrODoK.gif", // kiera
    "http://i.imgur.com/3LgL03O.gif", // dog1                   
    "http://i.imgur.com/YH5W9pN.gif", //taylor
    "http://i.imgur.com/Evu5uVy.gif", // beiber
    "http://i.imgur.com/GXkh6d4.gif", // portman
    "http://i.imgur.com/bRNJlO9.gif", // white walker
]
var imgurgifindex = 0;
document.getElementById("newgifbutton").addEventListener("click", function(){
    imgurgifindex += 1;
    imgurgifindex = imgurgifindex % imgurgifs.length;
    gifurlinput.value = imgurgifs[imgurgifindex];  
    loadNewGif();
})

// ---------------------
// Playing TTS in sync
// ---------------------

// play the specified text 
function playsyncronized(){


	if(!'speechSynthesis' in window){
		instructions.innerHTML = "Speech synthesis is not supported in this browser.  Sorry.";
		document.getElementById('ttsoptions').style.visibility = "hidden";
	}
	else {
		document.getElementById('ttsoptions').style.visibility = "visible";
		if(speechSynthesis.speaking){
			return;
		}
		var text = document.getElementById('texttospeakinput').value;
		// get the selected voice
		var voice = speechSynthesis.getVoices().filter(function(voice){
				return voice.name == voiceSelecter.value;
			})[0];

	    // Splitting each utterance up using punctuation is important.  Intra-utterance
	    // punctuation will add silence to the tts which looks bad unless the mouth stops moving
	    // correctly. Better to split it into separate utterances so play_for_duration will move when
	    // talking, and be on frame 0 when not. 

	    // split everything betwen deliminators [.?,!], but include the deliminator.
	    var substrings = text.match(/[^.?,!]+[.?,!]?/g);
	    for (var i = 0, l = substrings.length; i < l; ++i) {
	        var str = substrings[i].trim();

	        // Make sure there is something to say other than the deliminator
	        var numpunc = (str.match(/[.?,!]/g) || []).length;
	        if (str.length - numpunc > 0) {

	        	// suprisingly decent approximation for multiple languages.

	       		// if you change the rate, you would have to adjust
	            var speakingDurationEstimate = str.length * 50;
	            // Chinese needs a different calculation.  Haven't tried other Asian languages.
	            if (str.match(/[\u3400-\u9FBF]/)) {
	                speakingDurationEstimate = str.length * 200;
	            }

	            var msg = new SpeechSynthesisUtterance();

	            (function(dur){
                	msg.addEventListener('start', function(){
                		sup1.play_for_duration(dur);
                		})
	            })(speakingDurationEstimate);

	            // The end event is too inacurate to use for animation,
	            // but perhaps it could be used elsewhere.  You might need to push 
	            // the msg to an array or aggressive garbage collection fill prevent the callback
	            // from firing.
	            //msg.addEventListener('end', function (){console.log("too late")}			                
	            
	            msg.text = str;
	            //change voice here
	            msg.voice = voice;

	            window.speechSynthesis.speak(msg);
	        }
	    }
	}
}
document.addEventListener("keypress", function(e) {
    if (e.which == 13) {
        playsyncronized();
    }
});