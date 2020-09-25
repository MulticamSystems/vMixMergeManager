

//fetch('http://' + ip + ':' + port + '/api/?Function=Audio&Input=' + (parseInt(input) + 1));

var callers = [];
var callersHidden = false;
var activeCallers = 0;
var previousMixInput = 0;
var dualCallerIndex = 0;

var IPAddress = "127.0.0.1";
var port = "8088";
var numberOfCallers = 4;
var maximumCallers = 2;
var mixInputs = [0,0];
var mixHiddenInputs = [0,0];
var callerStart = 1;
var callerMVStart = 2;
var singleCallerMV = 10;
var dualCallerMV = [8,9];
var splitInput = 12;
var activePair = 0;
var pairs = [
    {
        name: "Inputs visible",
        input1: 8,
        input2: 9
    },
    {
        name: "Inputs hidden",
        input1: 10,
        input2: 11
    }
];

function addPair(){
    pairObject = {
        name: "New Pair",
        input1: 0,
        input2: 0
    }
    pairs.push(pairObject);
    refresh()
}

function refresh(){
    $(".pairContainer").html("")
    $(".pairButtons").html("")
    $(".addCallers").html("")
    $(".removeCallers").html("")
    for(var i = 0; i < pairs.length; i++){
    $(".pairContainer").append(`<div class="row">
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Name:</label>
            <input onchange="setPairValue(${i}, 'name', this.value)" class="form-control" type="text" id="pair1Name" value="${pairs[i].name}">
        </div>
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Pair ${i + 1} Input 1:</label>
            <input onchange="setPairValue(${i}, 'input1', this.value)" class="form-control" type="number" id="pair1Input1" value="${pairs[i].input1}">
        </div>
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Pair ${i + 1} Input 2:</label>
            <input onchange="setPairValue(${i}, 'input2', this.value)" class="form-control" type="number" id="pair1Input2" value="${pairs[i].input2}">
        </div>
        <button type="button" class="btn btn-success deleteBtn" onclick="deletePair(${i})">Delete</button>
    </div>`)
    $(".pairButtons").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="changePair(${i})">${pairs[i].name}</button>`);
}
for(var i = 0; i < numberOfCallers; i++){
    $(".addCallers").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="addCaller(${i + 1})">Add Input ${callerStart + i}</button>`);
    $(".removeCallers").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="removeCaller(${i + 1})">Remove Input ${callerStart + i}</button>`);

    }
}

function deletePair(index){
    pairs.splice(index, 1);
    refresh();
}

refresh();

function changePair(pair){
    if(pair != activePair){
        activePair = pair;
        vMixCommand("Function=Merge&Input=" + selectInput());
        setTimeout(function(){sendvMix();}, 200)
    }
}

function setPairValue(pair,index,value){
    console.log("fire");
    pairs[pair][index] = value;
    refresh();
}

function setIP(input){
    IPAddress = input.value;
    refresh();
}

function setPort(input){
    port = input.value;
    refresh();
}

function setNumberOfInputs(input){
    numberOfCallers = input.value;
    refresh();
}

function setInputStart(input){
    callerStart = input.value;
    refresh();
}

function setSingleInputMultiview(input){
    singleCallerMV = input.value;
    refresh();
}

function setDualMultiview1(input){
    dualCallerMV[0] = input.value;
    refresh();
}

function setDualMultiview2(input){
    dualCallerMV[1] = input.value;
    refresh();
}

function setIP(input){
    IPAddress = input.value;
    refresh();
}


console.log("Server started with " + numberOfCallers + " callers.")

for (var i = 0; i < numberOfCallers; i++){
    var callerObject = {
        active: false
    }
    callers.push(callerObject);
}

function addCaller(id){
    if(activeCallers < maximumCallers){
        callers[(id-1)].active = true;
    }
    sendvMix();
}

function removeCaller(id){
    callers[(id-1)].active = false;
    sendvMix();
}

function sendvMix(){
    dualCallerIndex = 0;
    activeCallers = 0;
    for(var i = 0; i < callers.length; i++){
        if(callers[i].active == true){
            activeCallers++
        }
    }
    for(var i = 0; i < callers.length; i++){
        if(callers[i].active == false){
            setMultiView(callerMVStart + i,callerStart + i);
            console.log("Added input " + callerStart + i + " as Multiview layer " + callerMVStart + i + " on vMix input " + mixInputs[1 - previousMixInput])
        }
        else if(callers[i].active == true){
            setMultiView(callerMVStart + i,-2);
            if(activeCallers == 1){
                setMultiView(singleCallerMV,callerStart + i);
            }
            if(activeCallers == 2){
                setMultiView(dualCallerMV[dualCallerIndex],callerStart + i);
                dualCallerIndex++;  
            }
            console.log("Removed input " + callerStart + i + " as Multiview layer " + callerMVStart + i + " on vMix input " + mixInputs[1 - previousMixInput])
        }
    }
    if(activeCallers == 0){
        setMultiView(singleCallerMV,-2);
        setMultiView(dualCallerMV[0],-2);
        setMultiView(dualCallerMV[1],-2);
        console.log("Empty preset")
    }
    if(activeCallers == 1){
        setMultiView(dualCallerMV[0],-2);
        setMultiView(dualCallerMV[1],-2);
    }
    if(activeCallers == 2){
        setMultiView(singleCallerMV,-2);
        dualCallerIndex = 1 - dualCallerIndex;  
    }

    console.table(callers);
    console.log("Active Callers: " + activeCallers);
    setTimeout(function(){
        vMixCommand("Function=Merge&Input=" + selectInput());
        console.log("Merge to input " + selectInput())
        previousMixInput = 1 - previousMixInput;
    },300);
}

function selectInput(){
    return pairs[activePair]["input" + (2 - previousMixInput)]
}

function setMultiView(layer, layerInput){
    for(var i = 0; i < pairs.length; i++){
        if(i == activePair){
            vMixCommand(`Function=SetMultiViewOverlay&Input=${pairs[i]["input" + (2 - previousMixInput)]}&Value=${layer},${layerInput}`);
        }
        else{
            vMixCommand(`Function=SetMultiViewOverlay&Input=${pairs[i]["input1"]}&Value=${layer},${layerInput}`);
            vMixCommand(`Function=SetMultiViewOverlay&Input=${pairs[i]["input2"]}&Value=${layer},${layerInput}`);
        }
    }

}

function vMixCommand(command){
    httpRequest(IPAddress, "8088", "/api/?" + command).then(function(str){
        console.log(str)
    })
}

function httpRequest(host, port, path){
    return new Promise(function(resolve, reject) {
        fetch(`http://${host}:${port}${path}`).then(function(res){
            resolve(res.status);
        })
    })
}

function downloadPreset(){
    var downloadObject = {
        IPAddress,
        port,
        numberOfCallers,
        callerStart,
        callerMVStart,
        pairs

    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadObject));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "MergePreset.json");
    dlAnchorElem.click();
}

window.addEventListener('load', function() {
    console.log("trigger");
    var upload = document.getElementById('customFile');
    
    // Make sure the DOM element exists
    if (upload) 
    {
      upload.addEventListener('change', function() {
        // Make sure a file was selected
        if (upload.files.length > 0) 
        {
          var reader = new FileReader(); // File reader to read the file 
          
          // This event listener will happen when the reader has read the file
          reader.addEventListener('load', function() {
            var result = JSON.parse(reader.result); // Parse the result into an object 
            IPAddress,
            port,
            numberOfCallers,
            callerStart,
            callerMVStart,
            pairs
            IPAddress = result.IPAddress;
            $("#vMixIP").val(IPAddress);
            port = result.port;
            $("#vMixPort").val(port);
            numberOfCallers = result.numberOfCallers;
            $("#numberOfInputs").val(numberOfCallers);
            callerStart = result.callerStart;
            $("#inputStart").val(callerStart);
            callerMVStart = result.callerMVStart;
            $("#multiViewStart").val(callerMVStart);
            pairs = result.pairs;
            $("#pairs").val(pairs);

            refresh();

          });
          
          reader.readAsText(upload.files[0]); // Read the uploaded file
        }
      });
    }
  });