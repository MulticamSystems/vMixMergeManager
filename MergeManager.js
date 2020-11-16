const fetch = require("node-fetch");
class MergeManager {
    constructor(io) {
        this.io = io;
        this._state = {
            vmix: {
                address: "127.0.0.1",
                port: "8088"
            },
            callers: [],
            callersHidden: false,
            activeCallers: 0,
            previousMixInput: 0,
            dualCallerIndex: 0,
            numberOfCallers: 4,
            maximumCallers: 2,
            mixInputs: [0,0],
            mixHiddenInputs: [0,0],
            callerStart: 1,
            callerMVStart: 2,
            singleCallerMV: 10,
            dualCallerMV: [8,9],
            splitInput: 12,
            activePair: 0,
            pairs: [
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
            ]   
        }
        console.log("Run????")
        for (let i = 0; i < this._state.numberOfCallers; i++){
            var callerObject = {
                active: false
            }
            this._state.callers.push(callerObject);
        }
    }
    get state() {
        return this._state;
    }
    sendState() {
        this.io.sockets.emit("state", this.state)
    }
    setState(state) {
        this._state = state;
        this.sendvMix();
    }
    async triggerPair(pair) {
        if(pair != this._state.activePair){
            this._state.activePair = pair;
            await this.vMixCommand("Function=Merge&Input=" + this.selectInput());
            await this.sendvMix();
        }
        this.sendState();
    }
    addInput(id) {
        console.log(id);
        if(this._state.activeCallers < this._state.maximumCallers){
            this._state.callers[(id-1)].active = true;
        }
        this.sendvMix();
        this.sendState();
    }
    removeInput(id) {
        console.log(id);
        this._state.callers[(id-1)].active = false;
        this.sendvMix();
        this.sendState();
    }
    async sendvMix(){
        this._state.dualCallerIndex = 0;
        this._state.activeCallers = 0;
        for(var i = 0; i < this._state.callers.length; i++){
            if(this._state.callers[i].active == true){
                this._state.activeCallers++
            }
        }
        for(var i = 0; i < this._state.callers.length; i++){
            if(this._state.callers[i].active == false){
                await this.setMultiView(this._state.callerMVStart + i,this._state.callerStart + i);
                console.log("Added input " + this._state.callerStart + i + " as Multiview layer " + this._state.callerMVStart + i + " on vMix input " + this._state.mixInputs[1 - this._state.previousMixInput])
            }
            else if(this._state.callers[i].active == true){
                await this.setMultiView(this._state.callerMVStart + i,-2);
                if(this._state.activeCallers == 1){
                    await this.setMultiView(this._state.singleCallerMV,this._state.callerStart + i);
                }
                else if(this._state.activeCallers == 2){
                    await this.setMultiView(this._state.dualCallerMV[this._state.dualCallerIndex],this._state.callerStart + i);
                    this._state.dualCallerIndex++;  
                }
                console.log("Removed input " + this._state.callerStart + i + " as Multiview layer " + this._state.callerMVStart + i + " on vMix input " + this._state.mixInputs[1 - this._state.previousMixInput])
            }
        }
        if(this._state.activeCallers == 0){
            await this.setMultiView(this._state.singleCallerMV,-2);
            await this.setMultiView(this._state.dualCallerMV[0],-2);
            await this.setMultiView(this._state.dualCallerMV[1],-2);
            console.log("Empty preset")
        }
        if(this._state.activeCallers == 1){
            await this.setMultiView(this._state.dualCallerMV[0],-2);
            await this.setMultiView(this._state.dualCallerMV[1],-2);
        }
        if(this._state.activeCallers == 2){
            await this.setMultiView(this._state.singleCallerMV,-2);
            this._state.dualCallerIndex = 1 - this._state.dualCallerIndex;  
        }

        console.log("Active Callers: " + this._state.activeCallers);
        let self = this;
        await this.vMixCommand("Function=Merge&Input=" + self.selectInput());
        console.log("Merge to input " + self.selectInput())
        this._state.previousMixInput = 1 - this._state.previousMixInput;
    }
    selectInput(){
        return this._state.pairs[this._state.activePair]["input" + (2 - this._state.previousMixInput)]
    }
    async setMultiView(layer, layerInput){
        for(var i = 0; i < this._state.pairs.length; i++){
            if(i == this._state.activePair){
                await this.vMixCommand(`Function=SetMultiViewOverlay&Input=${this._state.pairs[i]["input" + (2 - this._state.previousMixInput)]}&Value=${layer},${layerInput}`);
            }
            else{
                await this.vMixCommand(`Function=SetMultiViewOverlay&Input=${this._state.pairs[i]["input1"]}&Value=${layer},${layerInput}`);
                await this.vMixCommand(`Function=SetMultiViewOverlay&Input=${this._state.pairs[i]["input2"]}&Value=${layer},${layerInput}`);
            }
        }
    
    }
    async vMixCommand(command){
        await this.httpRequest(this._state.vmix.address, this._state.vmix.port, "/api/?" + command).then(function(str){
            console.log(str)
        })
    }
    async httpRequest(host, port, path){
        return new Promise(function(resolve, reject) {
            fetch(`http://${host}:${port}${path}`).then(function(res){
                resolve(res.status);
            })
        })
    }
}

module.exports = MergeManager;