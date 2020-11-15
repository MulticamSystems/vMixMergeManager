

//fetch('http://' + ip + ':' + port + '/api/?Function=Audio&Input=' + (parseInt(input) + 1));
let state = {}
class ClientConnection {
    constructor() {
        this.connect();
    }
    connect() {
        this.socket = io();
        this.socket.on("state", (st) => {
            console.log("Buenos dias?")
            state = st
            refresh();
        })
        this.socket.emit("get-state", "")
    }
    updateState(state) {
        this.socket.emit("set-state", JSON.stringify(state))
    }
}

let cm = new ClientConnection();


function addPair(){
    pairObject = {
        name: "New Pair",
        input1: 0,
        input2: 0
    }
    state.pairs.push(pairObject);
    cm.updateState(state)
}

function refresh(){
    $(".pairContainer").html("")
    $(".pairButtons").html("")
    $(".addCallers").html("")
    $(".removeCallers").html("")
    $("#vMixIP").val(state.vmix.address);
    $("#vMixPort").val(state.vmix.port);
    $("#numberOfInputs").val(state.numberOfCallers);
    $("#inputStart").val(state.callerStart);
    $("#multiViewStart").val(state.callerMVStart)
    $("#pairs").val(state.pairs);
    for(var i = 0; i < state.pairs.length; i++){
    $(".pairContainer").append(`<div class="row">
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Name:</label>
            <input onchange="setPairValue(${i}, 'name', this.value)" class="form-control" type="text" id="pair1Name" value="${state.pairs[i].name}">
        </div>
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Pair ${i + 1} Input 1:</label>
            <input onchange="setPairValue(${i}, 'input1', this.value)" class="form-control" type="number" id="pair1Input1" value="${state.pairs[i].input1}">
        </div>
        <div class="col-lg-2 col-md-3 col-sm-3 col-3">
            <label for="fontSize" class="col-form-label" id="fontSizeLabel">Pair ${i + 1} Input 2:</label>
            <input onchange="setPairValue(${i}, 'input2', this.value)" class="form-control" type="number" id="pair1Input2" value="${state.pairs[i].input2}">
        </div>
        <button type="button" class="btn btn-success deleteBtn" onclick="deletePair(${i})">Delete</button>
    </div>`)
    $(".pairButtons").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="changePair(${i})">${state.pairs[i].name}</button>`);
}
for(var i = 0; i < state.numberOfCallers; i++){
    $(".addCallers").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="addCaller(${i + 1})">Add Input ${state.callerStart + i}</button>`);
    $(".removeCallers").append(`<button type="button" class="btn btn-success col-lg-1 col-md-2 col-sm-2 col-2 callerBtn" onclick="removeCaller(${i + 1})">Remove Input ${state.callerStart + i}</button>`);

    }
}

function deletePair(index){
    state.pairs.splice(index, 1);
    cm.updateState(state);
}

function changePair(pair){
    apiPost("/api/pairs/" + pair + "/trigger")
}

function apiPost(path) {
    fetch("http://localhost:1501" + path, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache', 
        credentials: 'same-origin',
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: "VMM"
      });
}


function setPairValue(pair,index,value){
    console.log("fire");
    state.pairs[pair][index] = value;
    cm.updateState(state);
}

function setIP(input){
    state.vmix.address = input.value;
    cm.updateState(state);
}

function setPort(input){
    state.vmix.port = input.value;
    cm.updateState(state);
}

function setNumberOfInputs(input){
    state.numberOfCallers = input.value;
    cm.updateState(state);
}

function setInputStart(input){
    state.callerStart = input.value;
    cm.updateState(state);
}

function setSingleInputMultiview(input){
    state.singleCallerMV = input.value;
    cm.updateState(state);
}

function setDualMultiview1(input){
    state.dualCallerMV[0] = input.value;
    cm.updateState(state);
}

function setDualMultiview2(input){
    state.dualCallerMV[1] = input.value;
    cm.updateState(state);
}

console.log("Server started with " + state.numberOfCallers + " callers.")

function addCaller(id){
    apiPost("/api/inputs/" + id + "/add")
}

function removeCaller(id) {
    apiPost("/api/inputs/" + id + "/remove")
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
            state.vmix.address,
            state.vmix.port,
            state.numberOfCallers,
            state.callerStart,
            state.callerMVStart,
            state.pairs
            state.vmix.address = result.IPAddress;          
            state.vmix.port = result.port;           
            state.numberOfCallers = result.numberOfCallers;          
            state.callerStart = result.callerStart;      
            state.callerMVStart = result.callerMVStart;
            state.pairs = result.pairs;
            cm.updateState(state);

          });
          
          reader.readAsText(upload.files[0]); // Read the uploaded file
        }
      });
    }
  });