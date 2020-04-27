class Log{

    constructor(socketId) {
        this.socketId = socketId;
        this.messages = [];
        this.mousePositions = [];
        this.isActive = true;
      }

    getSocketId(){
        return this.socketId;
    }
    updateActive(){
        this.isActive = false;
    }
    appendMessages(msg){
        console.log("message pushed",msg)
        this.messages.push(msg)
    }

    appendMousePositions(data){
        this.mousePositions.push(data)
    }
}

module.exports = {Log};