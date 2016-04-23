var context = new AudioContext();

var makeBassNode = function () {
    var bass = context.createBiquadFilter();

    bass.type = 'allpass';
    bass.frequency.value = 440;
    bass.Q.value = 0;
    bass.gain.value = $('#bass').val();

    return bass;
}

var makeTrebleNode = function () {
    var treble = context.createBiquadFilter();

    treble.type = 'allpass';
    treble.frequency.value = 1700;
    treble.Q.value = 0;
    treble.gain.value = $('#treble').val();

    return treble;
}

var makeDelayNode = function (time) {
    //var delay = context.createDelayNode(10);
    var delay = context.createDelay ? context.createDelay(10) : context.createDelayNode(10);

    delay.delayTime.value = time;

    return delay;
}

var makeDistortionCurve = function (noOfSamples, amountOfDistortion) {
    if (typeof amountOfDistortion === 'undefined') {
        amountOfDistortion = 0.1;
    }
    var k = 2 * amountOfDistortion/ (1 - amountOfDistortion),
        curve = new Float32Array(noOfSamples);

    for (var i = 0; i < noOfSamples; i++) {
        var x = (i - 0) * (1 - (-1)) / (noOfSamples - 0) + (-1);
        curve[i] = (1 + k) * x / (1+ k * Math.abs(x));
    }

    return curve;
}

var volumeNode = context.createGain ? context.createGain() : context.createGainNode(),


    distortionNode = context.createWaveShaper(),
    bassNode = makeBassNode(),
    trebleNode = makeTrebleNode(),
    delayNode = makeDelayNode(0);

$('#bttf').change(function () {
    if ($(this).attr('checked') === 'checked') {
        delayNode.delayTime.value = 10;
    } else {
        delayNode.delayTime.value = 0;
    }
})

$(function () {

    $('#volume').dial({'change': function (v) {
        volumeNode.gain.value = v / 100;
    }});

    $('#distortion').dial({'change': function (v) {
        distortionNode.curve = makeDistortionCurve(context.sampleRate, v / 100);
    }});

    $('#bass').dial({'change': function (v) {
        bassNode.gain.value = v / 100;
    }});

    $('#treble').dial({'change': function (v) {
        trebleNode.gain.value = v / 100;
    }});
    
    $('#reverb').dial({'change': function (v) {
        //
    }});
})

function gotStream(stream) {
    var mic = context.createMediaStreamSource(stream);
    volumeNode.gain.value = $('#volume').val() / 100;
    distortionNode.curve = makeDistortionCurve(context.sampleRate)

    mic.connect(volumeNode); 
    distortionNode.connect(delayNode);
    bassNode.connect(trebleNode);
    trebleNode.connect(delayNode);
    delayNode.connect(volumeNode);
    volumeNode.connect(context.destination)

console.log(stream, mic, volumeNode, delayNode, trebleNode, bassNode, context)

}

navigator.getMedia = ( navigator.getUserMedia ||
           navigator.webkitGetUserMedia ||
           navigator.mozGetUserMedia ||
           navigator.msGetUserMedia);

navigator.getMedia (
   // constraints
    {
      audio: true
   },

   // successCallback
   gotStream
   ,
   // errorCallback
   function(err) {
    console.log("Ocurrió el siguiente error: " + err);
   }

);
